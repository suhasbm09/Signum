#!/usr/bin/env python3

import os
import sys

# Allow running from backend/ directory or repo root
# This file lives at: <repo>/backend/scripts/build_rag_index.py
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

sys.path.insert(0, os.path.join(REPO_ROOT, "backend"))

from app.services.ai.rag.indexer import build_index  # noqa: E402
from app.services.ai.rag.rag_config import get_rag_config  # noqa: E402


def main() -> int:
    cfg = get_rag_config()
    result = build_index(repo_root=REPO_ROOT, cfg=cfg)
    print(f"✅ RAG index built: {result['files']} files, {result['chunks']} chunks")
    print(f"Persisted at: {cfg.persist_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
