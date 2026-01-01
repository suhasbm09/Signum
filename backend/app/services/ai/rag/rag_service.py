from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from .rag_config import RagConfig, get_rag_config
from .chroma_store import open_collection, safe_where_filter


@dataclass(frozen=True)
class RagSource:
    source_id: str
    title: str
    path: str
    distance: float


def _trim(s: str, n: int) -> str:
    s = s or ""
    return s[:n]


def infer_course_and_module(context: str, screen_content: str) -> Tuple[Optional[str], Optional[str]]:
    ctx = (context or "").lower()
    scr = (screen_content or "").lower()

    # Course inference from context strings used in UI
    if "data structures" in ctx or "data-structures" in ctx:
        return "data-structures", None

    # If the screen_content includes CompletionTracker props, prefer those
    course_match = re.search(r"courseId=\"([^\"]+)\"", screen_content or "")
    module_match = re.search(r"moduleId=\"([^\"]+)\"", screen_content or "")

    course_id = course_match.group(1) if course_match else None
    module_id = module_match.group(1) if module_match else None

    if course_id or module_id:
        return course_id, module_id

    # fallback: none
    return None, None


class RagService:
    def __init__(self, cfg: Optional[RagConfig] = None):
        self.cfg = cfg or get_rag_config()
        self._collection = None

    def _has_index(self) -> bool:
        # quick check: persistence dir exists and non-empty
        if not os.path.isdir(self.cfg.persist_dir):
            return False
        try:
            return any(os.scandir(self.cfg.persist_dir))
        except Exception:
            return False

    def _get_collection(self):
        if self._collection is None:
            self._collection = open_collection(self.cfg.persist_dir, self.cfg.collection_name)
        return self._collection

    def retrieve(
        self,
        question: str,
        context: str = "",
        screen_content: str = "",
    ) -> Tuple[str, List[RagSource], Optional[float]]:
        """Returns (context_text_for_llm, sources, best_distance).

        If index is missing/unavailable, returns empty context and sources.
        """

        if not question:
            return "", [], None

        if not self._has_index():
            return "", [], None

        course_id, module_id = infer_course_and_module(context=context, screen_content=screen_content)
        where = safe_where_filter(course_id=course_id, module_id=module_id)

        collection = self._get_collection()

        result = collection.query(
            query_texts=[question],
            n_results=self.cfg.top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        docs = (result.get("documents") or [[]])[0]
        metas = (result.get("metadatas") or [[]])[0]
        dists = (result.get("distances") or [[]])[0]

        sources: List[RagSource] = []
        blocks: List[str] = []

        best_distance: Optional[float] = None

        for i, (doc, meta, dist) in enumerate(zip(docs, metas, dists), start=1):
            if doc is None or meta is None:
                continue

            distance = float(dist) if dist is not None else 999.0
            if best_distance is None or distance < best_distance:
                best_distance = distance

            title = str(meta.get("title") or "Source")
            path = str(meta.get("source_path") or "")

            source_id = f"S{i}"
            sources.append(RagSource(source_id=source_id, title=title, path=path, distance=distance))

            blocks.append(
                f"[{source_id}] {title}\nPath: {path}\nContent:\n{doc}\n"
            )

        # Add screen content as local context first (bounded)
        screen_block = _trim(screen_content, self.cfg.max_screen_chars)
        if screen_block:
            blocks.insert(0, f"[SCREEN] Current screen context (may be partial):\n{screen_block}\n")

        context_text = "\n\n".join(blocks)
        context_text = _trim(context_text, self.cfg.max_context_chars)

        return context_text, sources, best_distance

    def in_scope(self, message: str, context: str = "", screen_content: str = "") -> Tuple[bool, str]:
        """Returns (is_in_scope, reason).

        This method is intentionally conservative: if the index is missing,
        it will not allow unrelated questions to reach Gemini.
        """

        msg = (message or "").strip().lower()
        if not msg:
            return True, "empty_message"

        screen = (screen_content or "").strip()

        # Copilot-style intent: user asks to describe/summarize the current page.
        # Allow if we actually have screen content (so the assistant stays grounded).
        page_intent_phrases = (
            "this page",
            "current page",
            "on this page",
            "this screen",
            "what does this page",
            "what is on this page",
            "what this page contain",
            "summarize this page",
            "summarise this page",
            "explain this page",
            "what am i seeing",
            "what is this about",
        )
        if screen and len(screen) >= 80 and any(p in msg for p in page_intent_phrases):
            return True, "screen_page_intent"

        platform_keywords = {
            "signum", "signum learning", "platform", "this platform", "website", "app",
            "dashboard", "module", "lesson", "progress",
            "quiz", "coding challenge", "certificate", "nft", "solana", "phantom", "devnet",
            "anti-cheat", "assessment",
            "data structure", "data structures", "array", "linked list", "stack", "queue", "tree", "bst",
            "big o", "time complexity", "space complexity",
        }

        if any(k in msg for k in platform_keywords):
            return True, "keyword_match"

        rag_context, _sources, best_distance = self.retrieve(
            question=message,
            context=context,
            screen_content=screen_content,
        )

        if best_distance is None:
            # No index (or no results) -> fail closed
            return False, "no_index_or_results"

        if best_distance <= self.cfg.in_scope_distance_threshold:
            return True, f"rag_distance_ok:{best_distance:.3f}"

        return False, f"rag_distance_low:{best_distance:.3f}"


rag_service = RagService()
