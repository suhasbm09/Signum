#!/usr/bin/env sh
set -eu

# Render disk is mounted at /var/data (configured in render.yaml)
RAG_DIR="${RAG_PERSIST_DIR:-/var/data/rag_storage}"

# Build RAG index if missing/empty (first deploy or after disk reset)
if [ ! -d "$RAG_DIR" ] || [ -z "$(ls -A "$RAG_DIR" 2>/dev/null || true)" ]; then
  echo "[render_start] RAG index not found at $RAG_DIR. Building now..."
  python scripts/build_rag_index.py
  echo "[render_start] RAG index build complete."
else
  echo "[render_start] RAG index found at $RAG_DIR. Skipping build."
fi

# Start API
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
