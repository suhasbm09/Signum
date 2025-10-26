import firebase_admin
from firebase_admin import credentials, firestore
import os

def initialize_firebase():
    if not firebase_admin._apps:
        service_account_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            'serviceAccountKey.json'
        )
        
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)

def get_firestore_client():
    """Get Firestore database client"""
    initialize_firebase()
    return firestore.client()