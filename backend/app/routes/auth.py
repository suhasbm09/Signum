from fastapi import APIRouter, HTTPException, Response, Request
import firebase_admin
from firebase_admin import auth as firebase_auth, firestore
from app.services.firebase_admin import initialize_firebase
import secrets
from typing import Optional

router = APIRouter()

initialize_firebase()
db = firestore.client()
sessions = {}

def generate_session_token():
    return secrets.token_urlsafe(32)

@router.post("/verify-firebase-token")
async def verify_firebase_token(request: Request, response: Response):
    try:
        data = await request.json()
        id_token = data.get('idToken')
        
        if not id_token:
            raise HTTPException(status_code=400, detail="ID token required")
        
        decoded_token = firebase_auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        
        user_record = firebase_auth.get_user(uid)
        
        await save_user_to_firestore(user_record)
        
        # Get the saved user data from Firestore to use the custom display name
        user_ref = db.collection('users').document(user_record.email)
        user_doc = user_ref.get()
        saved_display_name = user_record.display_name  # Default to Google name
        
        courses_enrolled = []
        if user_doc.exists:
            firestore_data = user_doc.to_dict()
            # Use saved display name if it exists, otherwise use Google's
            if 'displayName' in firestore_data and firestore_data['displayName']:
                saved_display_name = firestore_data['displayName']
            courses_enrolled = firestore_data.get('coursesEnrolled', [])
        
        session_token = generate_session_token()
        sessions[session_token] = {
            'uid': uid,
            'email': user_record.email,
            'displayName': saved_display_name,
            'photoURL': user_record.photo_url,
            'coursesEnrolled': courses_enrolled
        }
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )
        
        return {
            "success": True,
            "user": {
                "uid": uid,
                "email": user_record.email,
                "displayName": saved_display_name,
                "photoURL": user_record.photo_url,
                "coursesEnrolled": courses_enrolled
            }
        }
        
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid ID token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token verification failed: {str(e)}")

async def save_user_to_firestore(user_record):
    try:
        user_data = {
            'uid': user_record.uid,
            'email': user_record.email,
            'displayName': user_record.display_name or '',
            'photoURL': user_record.photo_url or '',
            'emailVerified': user_record.email_verified,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'lastLoginAt': firestore.SERVER_TIMESTAMP,
            'accountType': 'student',
            'coursesEnrolled': [],
            'certificatesEarned': [],
            'phantomWalletAddress': '',  # For future Solana integration
            'isDeleted': False,  # Soft delete flag
            'deletedAt': None,
            'profile': {
                'bio': '',
                'interests': [],
                'preferredLanguage': 'en',
                'timezone': 'UTC'
            }
        }
        
        user_ref = db.collection('users').document(user_record.email)
        
        user_doc = user_ref.get()
        if user_doc.exists:
            # Update existing user but preserve profile, display name, and wallet data
            existing_data = user_doc.to_dict()
            update_data = {
                'lastLoginAt': firestore.SERVER_TIMESTAMP,
                'photoURL': user_record.photo_url or ''  # Only update photo, not display name
            }
            # Preserve existing profile and wallet data
            if 'phantomWalletAddress' in existing_data and existing_data['phantomWalletAddress']:
                update_data['phantomWalletAddress'] = existing_data['phantomWalletAddress']
            if 'profile' in existing_data:
                update_data['profile'] = existing_data['profile']
            # Preserve custom display name if it exists
            if 'displayName' in existing_data and existing_data['displayName']:
                update_data['displayName'] = existing_data['displayName']
            
            user_ref.update(update_data)
        else:
            user_ref.set(user_data)
            
    except Exception as e:
        pass

@router.post("/logout")
async def logout(response: Response, request: Request):
    try:
        session_token = request.cookies.get("session_token")
        
        if session_token and session_token in sessions:
            del sessions[session_token]
        
        response.delete_cookie("session_token")
        
        return {"success": True, "message": "Logged out successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")

@router.get("/me")
async def get_current_user(request: Request):
    try:
        session_token = request.cookies.get("session_token")
        
        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        user_data = sessions[session_token]
        
        try:
            user_ref = db.collection('users').document(user_data['email'])
            user_doc = user_ref.get()
            if user_doc.exists:
                firestore_data = user_doc.to_dict()
                # Check if account is deleted
                if firestore_data.get('isDeleted', False):
                    raise HTTPException(status_code=403, detail="Account has been deleted")
                
                user_data.update({
                    'coursesEnrolled': firestore_data.get('coursesEnrolled', []),
                    'certificatesEarned': firestore_data.get('certificatesEarned', []),
                    'phantomWalletAddress': firestore_data.get('phantomWalletAddress', ''),
                    'isDeleted': firestore_data.get('isDeleted', False),
                    'profile': firestore_data.get('profile', {})
                })
        except Exception:
            pass
        
        return {"user": user_data}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")

@router.get("/courses")
async def list_enrolled_courses(request: Request):
    try:
        session_token = request.cookies.get("session_token")

        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")

        user_data = sessions[session_token]
        user_ref = db.collection('users').document(user_data['email'])
        user_doc = user_ref.get()

        courses = []
        if user_doc.exists:
            doc_data = user_doc.to_dict()
            courses = doc_data.get('coursesEnrolled', [])

        sessions[session_token]['coursesEnrolled'] = courses

        return {"coursesEnrolled": courses}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch courses: {str(e)}")

@router.post("/courses/enroll")
async def enroll_course(request: Request):
    try:
        session_token = request.cookies.get("session_token")

        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")

        payload = await request.json()
        course_id = payload.get('courseId')

        if not course_id or not isinstance(course_id, str):
            raise HTTPException(status_code=400, detail="A valid courseId must be provided")

        user_data = sessions[session_token]
        user_ref = db.collection('users').document(user_data['email'])
        user_doc = user_ref.get()

        if user_doc.exists:
            user_ref.update({
                'coursesEnrolled': firestore.ArrayUnion([course_id]),
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
        else:
            user_ref.set({
                'coursesEnrolled': [course_id],
                'updatedAt': firestore.SERVER_TIMESTAMP
            }, merge=True)

        user_doc = user_ref.get()
        updated_courses = []
        if user_doc.exists:
            updated_courses = user_doc.to_dict().get('coursesEnrolled', [])

        sessions[session_token]['coursesEnrolled'] = updated_courses

        return {
            "success": True,
            "coursesEnrolled": updated_courses
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to enroll in course: {str(e)}")

@router.put("/user/{email}")
async def update_user_profile(email: str, request: Request):
    try:
        session_token = request.cookies.get("session_token")
        
        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        data = await request.json()
        
        user_ref = db.collection('users').document(email)
        user_ref.update({
            **data,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        return {"success": True, "message": "Profile updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.put("/profile")
async def update_profile(request: Request):
    try:
        session_token = request.cookies.get("session_token")
        
        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        user_data = sessions[session_token]
        data = await request.json()
        
        # Extract profile data
        profile_updates = {}
        if 'displayName' in data:
            profile_updates['displayName'] = data['displayName']
        if 'bio' in data:
            profile_updates['profile.bio'] = data['bio']
        if 'interests' in data:
            profile_updates['profile.interests'] = data['interests']
        if 'preferredLanguage' in data:
            profile_updates['profile.preferredLanguage'] = data['preferredLanguage']
        if 'timezone' in data:
            profile_updates['profile.timezone'] = data['timezone']
        
        # Add update timestamp
        profile_updates['updatedAt'] = firestore.SERVER_TIMESTAMP
        
        # Update user in Firestore
        user_ref = db.collection('users').document(user_data['email'])
        user_ref.update(profile_updates)
        
        # Update session data if displayName was changed
        if 'displayName' in data:
            sessions[session_token]['displayName'] = data['displayName']
        
        return {"success": True, "message": "Profile updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.put("/phantom-wallet")
async def update_phantom_wallet(request: Request):
    try:
        session_token = request.cookies.get("session_token")
        
        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        user_data = sessions[session_token]
        data = await request.json()
        wallet_address = data.get('walletAddress', '')
        
        user_ref = db.collection('users').document(user_data['email'])
        user_ref.update({
            'phantomWalletAddress': wallet_address,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        return {"success": True, "message": "Phantom wallet updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update wallet: {str(e)}")

@router.delete("/account")
async def delete_account(request: Request, response: Response):
    try:
        session_token = request.cookies.get("session_token")
        
        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        user_data = sessions[session_token]
        
        # Soft delete - mark as deleted instead of actually deleting
        user_ref = db.collection('users').document(user_data['email'])
        user_ref.update({
            'isDeleted': True,
            'deletedAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        # Clear session
        if session_token in sessions:
            del sessions[session_token]
        
        response.delete_cookie("session_token")
        
        return {"success": True, "message": "Account deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")
