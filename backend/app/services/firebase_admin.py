import firebase_admin
from firebase_admin import credentials, firestore
import os

def initialize_firebase():
    if not firebase_admin._apps:
        # Check multiple possible locations for serviceAccountKey.json
        possible_paths = [
            # Render secret file mount path (set in Render dashboard)
            os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH', ''),
            '/etc/secrets/serviceAccountKey.json',  # Render default secret path
            # Local development path
            os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                'serviceAccountKey.json'
            ),
        ]
        
        service_account_path = None
        for path in possible_paths:
            if path and os.path.exists(path):
                service_account_path = path
                break
        
        if not service_account_path:
            raise FileNotFoundError(
                "serviceAccountKey.json not found. "
                "Set FIREBASE_SERVICE_ACCOUNT_PATH env var or mount at /etc/secrets/"
            )
        
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)

def get_firestore_client():
    """Get Firestore database client"""
    initialize_firebase()
    return firestore.client()