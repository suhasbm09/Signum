from __future__ import annotations

import os
from typing import Any, Dict, Optional


def create_embedding_function() -> Any:
    """Return a Chroma embedding function.

    Preference order:
    1) fastembed (lightweight, no torch)
    2) sentence-transformers (heavier)

    If neither is available, raises ImportError.
    """

    # First choice: fastembed (lightweight, no torch).
    # We implement our own wrapper so we don't depend on Chroma exposing a specific helper.
    try:
        from fastembed import TextEmbedding

        model_name = os.getenv("RAG_EMBED_MODEL", "BAAI/bge-small-en-v1.5")

        class _FastEmbedFn:
            def __init__(self, model: str):
                self._model = TextEmbedding(model_name=model)
                self._model_name = model

            def name(self) -> str:
                return f"fastembed:{self._model_name}"

            def embed_documents(self, input):
                return self.__call__(input)

            def embed_query(self, input: str):
                if isinstance(input, (list, tuple)):
                    texts = list(input)
                else:
                    texts = [input]

                # Chroma's Rust client expects a batch (Sequence[Sequence[float]]).
                return self.__call__(texts)

            def __call__(self, input):
                # Chroma expects EmbeddingFunction.__call__(self, input)
                # fastembed returns an iterator of numpy arrays
                if isinstance(input, str):
                    texts = [input]
                else:
                    texts = list(input)

                return [vec.tolist() for vec in self._model.embed(texts)]

        return _FastEmbedFn(model_name)
    except Exception:
        pass

    # Fallback: sentence-transformers (heavier). Only used if installed.
    from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

    model_name = os.getenv("RAG_EMBED_MODEL", "all-MiniLM-L6-v2")
    return SentenceTransformerEmbeddingFunction(model_name=model_name)


def open_collection(persist_dir: str, collection_name: str):
    import chromadb

    os.makedirs(persist_dir, exist_ok=True)

    client = chromadb.PersistentClient(path=persist_dir)
    embedding_fn = create_embedding_function()

    return client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )


def safe_where_filter(course_id: Optional[str], module_id: Optional[str]) -> Optional[Dict[str, Any]]:
    where: Dict[str, Any] = {}
    if course_id:
        where["course_id"] = course_id
    if module_id:
        where["module_id"] = module_id
    return where or None
