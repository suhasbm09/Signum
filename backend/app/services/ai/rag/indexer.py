from __future__ import annotations

import hashlib
import os
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from .chunking import chunk_text_words
from .rag_config import RagConfig
from .sources import discover_source_files
from .text_extract import extract_file_text
from .chroma_store import open_collection


@dataclass(frozen=True)
class IndexedChunk:
    doc_id: str
    text: str
    metadata: Dict[str, str]


def _stable_chunk_id(source_path: str, chunk_index: int) -> str:
    h = hashlib.sha1(f"{source_path}::{chunk_index}".encode("utf-8")).hexdigest()
    return h


def _infer_course_id_from_path(path: str) -> Optional[str]:
    # e.g. frontend/src/courses/data-structures/components/OverviewContent.jsx
    normalized = path.replace("\\", "/")
    marker = "/frontend/src/courses/"
    if marker in normalized:
        rest = normalized.split(marker, 1)[1]
        parts = rest.split("/")
        if parts:
            return parts[0]
    return None


def build_chunks_for_file(path: str, raw: str, cfg: RagConfig) -> Tuple[List[IndexedChunk], Dict[str, str]]:
    extracted = extract_file_text(path, raw)

    course_id = extracted.course_id or _infer_course_id_from_path(path)
    module_id = extracted.module_id

    # Basic title hint for citations
    title_hint = extracted.title_hint or os.path.basename(path)

    chunks = []
    for chunk in chunk_text_words(extracted.text, cfg.chunk_words, cfg.chunk_overlap_words):
        doc_id = _stable_chunk_id(path, chunk.chunk_index)
        metadata: Dict[str, str] = {
            "source_path": path.replace("\\", "/"),
            "title": title_hint,
        }
        if course_id:
            metadata["course_id"] = course_id
        if module_id:
            metadata["module_id"] = module_id

        chunks.append(IndexedChunk(doc_id=doc_id, text=chunk.text, metadata=metadata))

    file_meta = {
        "course_id": course_id or "",
        "module_id": module_id or "",
        "title": title_hint,
    }
    return chunks, file_meta


def build_index(repo_root: str, cfg: RagConfig) -> Dict[str, int]:
    """Builds/updates the persistent Chroma index.

    Ids are stable, so re-running updates content deterministically.
    """

    collection = open_collection(cfg.persist_dir, cfg.collection_name)

    source_files = discover_source_files(repo_root)

    total_files = 0
    total_chunks = 0

    for f in source_files:
        try:
            with open(f.path, "r", encoding="utf-8", errors="ignore") as handle:
                raw = handle.read()
        except Exception:
            continue

        chunks, _ = build_chunks_for_file(f.path, raw, cfg)
        if not chunks:
            continue

        total_files += 1

        ids = [c.doc_id for c in chunks]
        documents = [c.text for c in chunks]
        metadatas = [c.metadata for c in chunks]

        collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
        total_chunks += len(chunks)

    return {"files": total_files, "chunks": total_chunks}
