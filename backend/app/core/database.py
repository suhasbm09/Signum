"""
Database singleton and utilities
"""
from firebase_admin import firestore
from app.services.firebase_admin import initialize_firebase
from typing import Optional

_db_client: Optional[firestore.Client] = None

def get_db() -> firestore.Client:
    """Get Firestore database client singleton"""
    global _db_client
    if _db_client is None:
        initialize_firebase()
        _db_client = firestore.client()
    return _db_client
