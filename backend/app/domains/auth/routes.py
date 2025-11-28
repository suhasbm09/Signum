"""
Auth routes - User authentication, profile management
"""
from fastapi import APIRouter, HTTPException, Response, Request
from firebase_admin import auth as firebase_auth, firestore
from app.services.firebase_admin import initialize_firebase
from app.repositories.user_repository import UserRepository
from app.domains.auth.models import ProfileUpdate, WalletUpdate
from app.domains.auth.account_deletion_service import AccountDeletionService
import secrets
import os

router = APIRouter()

initialize_firebase()
user_repo = UserRepository()
account_deletion_service = AccountDeletionService()
sessions = {}

def generate_session_token():
    return secrets.token_urlsafe(32)

def is_test_environment():
    """Check if running in test environment"""
    return os.getenv('PYTEST_CURRENT_TEST') is not None or os.getenv('TESTING') == 'true'


@router.post("/verify-firebase-token")
async def verify_firebase_token(request: Request, response: Response):
    """Verify Firebase ID token and create session with httpOnly cookie"""
    try:
        data = await request.json()
        id_token = data.get('idToken')
        
        if not id_token:
            raise HTTPException(status_code=400, detail="ID token required")
        
        decoded_token = firebase_auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        user_record = firebase_auth.get_user(uid)
        
        # Create or update user in database
        user_data = {
            'uid': user_record.uid,
            'email': user_record.email,
            'displayName': user_record.display_name or '',
            'photoURL': user_record.photo_url or '',
            'emailVerified': user_record.email_verified,
            'accountType': 'student',
            'coursesEnrolled': [],
            'certificatesEarned': [],
            'phantomWalletAddress': '',
            'isDeleted': False,
            'deletedAt': None,
            'profile': {
                'bio': '',
                'interests': [],
                'preferredLanguage': 'en',
                'timezone': 'UTC'
            }
        }
        
        user_repo.create_or_update_user(user_record.email, user_data)
        
        # Get saved user data
        saved_user = user_repo.get_by_email(user_record.email)
        saved_display_name = saved_user.get('displayName', user_record.display_name)
        courses_enrolled = saved_user.get('coursesEnrolled', [])
        
        # Create session
        session_token = generate_session_token()
        sessions[session_token] = {
            'uid': uid,
            'email': user_record.email,
            'displayName': saved_display_name,
            'photoURL': user_record.photo_url,
            'coursesEnrolled': courses_enrolled
        }
        
        # Set httpOnly secure cookie (protects against XSS attacks)
        is_production = os.getenv('ENV') == 'production'
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,  # JavaScript cannot access this cookie (XSS protection)
            secure=is_production,  # HTTPS only in production
            samesite="lax",  # CSRF protection (prevents cross-site requests except navigation)
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/",
            domain=None  # Will be set to current domain
        )
        
        # Debug logging for troubleshooting
        print(f"✅ Session created for {user_record.email}")
        print(f"   Session Token: {session_token[:20]}...")
        print(f"   Auth Method: httpOnly cookie (secure)")
        print(f"   Environment: {'production' if is_production else 'development'}")
        
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

@router.post("/logout")
async def logout(response: Response, request: Request):
    """Logout user and clear session and httpOnly cookie"""
    try:
        # Get token from httpOnly cookie
        session_token = request.cookies.get("session_token")
        
        if session_token and session_token in sessions:
            del sessions[session_token]
        
        # Clear the httpOnly cookie
        response.delete_cookie(
            key="session_token",
            path="/",
            domain=None
        )
        
        return {"success": True, "message": "Logged out successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")

@router.get("/me")
async def get_current_user(request: Request):
    """Get current authenticated user"""
    try:
        # Get token from httpOnly cookie
        session_token = request.cookies.get("session_token")
        
        # DEBUG: Log auth status for troubleshooting
        if not session_token:
            print(f"❌ /auth/me - No session cookie found")
            print(f"   Cookies: {request.cookies}")
            print(f"   User-Agent: {request.headers.get('user-agent', 'unknown')}")
        elif session_token not in sessions:
            print(f"⚠️ /auth/me - Invalid session token: {session_token[:20]}...")
            print(f"   Active sessions: {len(sessions)}")
        
        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        user_data = sessions[session_token]
        
        # Get fresh data from database
        saved_user = user_repo.get_by_email(user_data['email'])
        if saved_user:
            # Check if account is deleted
            if saved_user.get('isDeleted', False):
                raise HTTPException(status_code=403, detail="Account has been deleted")
            
            user_data.update({
                'coursesEnrolled': saved_user.get('coursesEnrolled', []),
                'certificatesEarned': saved_user.get('certificatesEarned', []),
                'phantomWalletAddress': saved_user.get('phantomWalletAddress', ''),
                'isDeleted': saved_user.get('isDeleted', False),
                'profile': saved_user.get('profile', {})
            })
        
        return {"user": user_data}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")

@router.get("/courses")
async def list_enrolled_courses(request: Request):
    """Get enrolled courses for current user"""
    try:
        # Get token from httpOnly cookie
        session_token = request.cookies.get("session_token")

        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")

        user_data = sessions[session_token]
        saved_user = user_repo.get_by_email(user_data['email'])
        
        courses = saved_user.get('coursesEnrolled', []) if saved_user else []
        sessions[session_token]['coursesEnrolled'] = courses

        return {"coursesEnrolled": courses}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch courses: {str(e)}")

@router.post("/courses/enroll")
async def enroll_course(request: Request):
    """Enroll user in a course"""
    try:
        # Get token from httpOnly cookie
        session_token = request.cookies.get("session_token")
        
        # DEBUG: Log enrollment auth failures
        if not session_token:
            print(f"❌ /courses/enroll - No session cookie")
            print(f"   Cookies: {request.cookies}")
            print(f"   Origin: {request.headers.get('origin', 'unknown')}")

        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")

        payload = await request.json()
        course_id = payload.get('courseId')

        if not course_id or not isinstance(course_id, str):
            raise HTTPException(status_code=400, detail="A valid courseId must be provided")

        user_data = sessions[session_token]
        user_repo.enroll_course(user_data['email'], course_id)
        
        # Get updated courses
        saved_user = user_repo.get_by_email(user_data['email'])
        updated_courses = saved_user.get('coursesEnrolled', []) if saved_user else []
        sessions[session_token]['coursesEnrolled'] = updated_courses

        return {
            "success": True,
            "coursesEnrolled": updated_courses
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to enroll in course: {str(e)}")

@router.put("/profile")
async def update_profile(request: Request):
    """Update user profile"""
    try:
        # Get token from httpOnly cookie
        session_token = request.cookies.get("session_token")
        
        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        user_data = sessions[session_token]
        data = await request.json()
        
        # Build profile updates
        profile_updates = {}
        if 'displayName' in data:
            profile_updates['displayName'] = data['displayName']
            sessions[session_token]['displayName'] = data['displayName']
        if 'bio' in data:
            profile_updates['profile.bio'] = data['bio']
        if 'interests' in data:
            profile_updates['profile.interests'] = data['interests']
        if 'preferredLanguage' in data:
            profile_updates['profile.preferredLanguage'] = data['preferredLanguage']
        if 'timezone' in data:
            profile_updates['profile.timezone'] = data['timezone']
        
        user_repo.update_profile(user_data['email'], profile_updates)
        
        return {"success": True, "message": "Profile updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.put("/phantom-wallet")
async def update_phantom_wallet(request: Request):
    """Update Phantom wallet address"""
    try:
        # Get token from httpOnly cookie
        session_token = request.cookies.get("session_token")
        
        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        user_data = sessions[session_token]
        data = await request.json()
        wallet_address = data.get('walletAddress', '')
        
        user_repo.update_wallet(user_data['email'], wallet_address)
        
        return {"success": True, "message": "Phantom wallet updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update wallet: {str(e)}")

@router.delete("/account")
async def delete_account(request: Request, response: Response):
    """Complete account deletion with full data cleanup"""
    try:
        # Get token from httpOnly cookie
        session_token = request.cookies.get("session_token")
        
        if not session_token or session_token not in sessions:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        user_data = sessions[session_token]
        user_id = user_data['uid']
        email = user_data['email']
        
        print(f"🗑️ Starting complete account deletion for user: {email} (UID: {user_id})")
        
        # Perform complete data deletion
        deletion_result = await account_deletion_service.delete_user_account(user_id, email)
        
        if not deletion_result.get('success'):
            raise HTTPException(
                status_code=500, 
                detail=f"Account deletion failed: {deletion_result.get('error', 'Unknown error')}"
            )
        
        print(f"✅ Account deletion complete: {deletion_result}")
        
        # Clear session
        if session_token in sessions:
            del sessions[session_token]
        
        return {
            "success": True, 
            "message": "Account and all associated data deleted successfully",
            "deletion_summary": deletion_result['data_deleted']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Account deletion error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")
