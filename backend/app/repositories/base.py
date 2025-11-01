"""
Base repository with generic CRUD operations
"""
from typing import Dict, Any, List, Optional, TypeVar, Generic
from app.core.database import get_db
from datetime import datetime

T = TypeVar('T')

class BaseRepository:
    """Base repository with common database operations"""
    
    def __init__(self, collection_name: str):
        self.db = get_db()
        self.collection_name = collection_name
        self.collection = self.db.collection(collection_name)
    
    def create(self, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new document"""
        data['created_at'] = datetime.now()
        data['updated_at'] = datetime.now()
        self.collection.document(doc_id).set(data)
        return data
    
    def get(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get a document by ID"""
        doc = self.collection.document(doc_id).get()
        return doc.to_dict() if doc.exists else None
    
    def update(self, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a document"""
        data['updated_at'] = datetime.now()
        self.collection.document(doc_id).update(data)
        return data
    
    def set(self, doc_id: str, data: Dict[str, Any], merge: bool = True) -> Dict[str, Any]:
        """Set (create or update) a document"""
        data['updated_at'] = datetime.now()
        if 'created_at' not in data:
            data['created_at'] = datetime.now()
        self.collection.document(doc_id).set(data, merge=merge)
        return data
    
    def delete(self, doc_id: str) -> bool:
        """Delete a document"""
        self.collection.document(doc_id).delete()
        return True
    
    def query(self, filters: List[tuple], order_by: Optional[str] = None, 
              limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Query documents with filters"""
        query = self.collection
        
        # Apply filters: [(field, operator, value), ...]
        for field, operator, value in filters:
            query = query.where(field, operator, value)
        
        # Apply ordering
        if order_by:
            query = query.order_by(order_by)
        
        # Apply limit
        if limit:
            query = query.limit(limit)
        
        docs = query.stream()
        return [{'id': doc.id, **doc.to_dict()} for doc in docs]
    
    def get_all(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all documents in collection"""
        query = self.collection
        if limit:
            query = query.limit(limit)
        
        docs = query.stream()
        return [{'id': doc.id, **doc.to_dict()} for doc in docs]
