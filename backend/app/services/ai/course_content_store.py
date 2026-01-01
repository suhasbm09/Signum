"""Legacy Course Content Store.

This file previously powered a keyword-based "RAG".
The production RAG now lives in `app.services.ai.rag` (Chroma + chunking).

Kept for backward compatibility / emergency fallback.
"""

from typing import List, Dict
import os

class CourseContentStore:
    """Simple in-memory course content storage"""
    
    def __init__(self):
        self.courses = {
            "Data Structures": {
                "Arrays": """
Arrays are linear data structures that store elements in contiguous memory.
- Fixed size allocation
- O(1) random access by index
- O(n) insertion/deletion in middle
Common operations: access, insert, delete, search
Use cases: storing sequential data, implementing other structures
                """,
                "Linked Lists": """
Linked Lists are linear structures with nodes connected by pointers.
- Dynamic size
- O(1) insertion/deletion at head
- O(n) access by index
Types: Singly, Doubly, Circular
Use cases: dynamic memory allocation, implementing stacks/queues
                """,
                "Stacks": """
Stack is LIFO (Last In First Out) data structure.
- push() - add element
- pop() - remove element
- peek() - view top element
- O(1) for all operations
Use cases: function calls, undo operations, expression evaluation
                """,
                "Queues": """
Queue is FIFO (First In First Out) data structure.
- enqueue() - add at rear
- dequeue() - remove from front
- O(1) for both operations
Types: Simple, Circular, Priority, Deque
Use cases: task scheduling, breadth-first search, buffering
                """
            }
        }
    
    def get_relevant_content(self, query: str, context: str = "") -> str:
        """
        Simple keyword-based content retrieval
        Later can be upgraded to vector search with ChromaDB
        """
        query_lower = query.lower()
        relevant_content = []
        
        # Search in current course/topic
        for course, topics in self.courses.items():
            if context and course.lower() in context.lower():
                for topic, content in topics.items():
                    if topic.lower() in query_lower or any(word in content.lower() for word in query_lower.split()):
                        relevant_content.append(f"**{topic}:**\n{content}")
        
        # If no specific context, search all
        if not relevant_content:
            for course, topics in self.courses.items():
                for topic, content in topics.items():
                    if topic.lower() in query_lower:
                        relevant_content.append(f"**{topic}:**\n{content}")
        
        return "\n\n".join(relevant_content[:2]) if relevant_content else ""
    
    def add_course_content(self, course: str, topic: str, content: str):
        """Add new course content dynamically"""
        if course not in self.courses:
            self.courses[course] = {}
        self.courses[course][topic] = content


# Singleton instance
course_store = CourseContentStore()
