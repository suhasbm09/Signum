from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List


@dataclass(frozen=True)
class TextChunk:
    text: str
    chunk_index: int


def _tokenize_words(text: str) -> List[str]:
    # simple word tokenizer; good enough for consistent chunk sizing
    return [w for w in text.split() if w]


def chunk_text_words(text: str, chunk_words: int, overlap_words: int) -> Iterable[TextChunk]:
    words = _tokenize_words(text)
    if not words:
        return []

    if chunk_words <= 0:
        chunk_words = 400
    overlap_words = max(0, min(overlap_words, chunk_words // 2))

    chunks: List[TextChunk] = []
    start = 0
    idx = 0
    while start < len(words):
        end = min(len(words), start + chunk_words)
        chunk = " ".join(words[start:end]).strip()
        if chunk:
            chunks.append(TextChunk(text=chunk, chunk_index=idx))
            idx += 1

        if end == len(words):
            break
        start = max(0, end - overlap_words)

    return chunks
