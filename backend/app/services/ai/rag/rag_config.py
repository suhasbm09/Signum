import os
from dataclasses import dataclass


@dataclass(frozen=True)
class RagConfig:
    persist_dir: str
    collection_name: str

    # Chunking (approximate word-based)
    chunk_words: int
    chunk_overlap_words: int

    # Retrieval
    top_k: int

    # Scope gating (Chroma distances: lower is closer)
    in_scope_distance_threshold: float

    # Safety limits
    max_screen_chars: int
    max_context_chars: int


def get_rag_config() -> RagConfig:
    return RagConfig(
        # Default is relative to the backend root (so it works with `cd backend && ...`).
        persist_dir=os.getenv("RAG_PERSIST_DIR", "app/services/ai/rag_storage"),
        collection_name=os.getenv("RAG_COLLECTION", "signum_rag"),
        chunk_words=int(os.getenv("RAG_CHUNK_WORDS", "450")),
        chunk_overlap_words=int(os.getenv("RAG_CHUNK_OVERLAP_WORDS", "60")),
        top_k=int(os.getenv("RAG_TOP_K", "5")),
        in_scope_distance_threshold=float(os.getenv("RAG_IN_SCOPE_DISTANCE_THRESHOLD", "0.42")),
        max_screen_chars=int(os.getenv("RAG_MAX_SCREEN_CHARS", "1500")),
        max_context_chars=int(os.getenv("RAG_MAX_CONTEXT_CHARS", "6000")),
    )
