# Signum Backend - Production Ready
FROM python:3.11-slim

# Set working directory (repo root inside container)
WORKDIR /app

# Install dependencies first (better caching)
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code (API + RAG scripts)
COPY backend/app/ ./backend/app/
COPY backend/scripts/ ./backend/scripts/

# Copy Signum content sources needed for RAG indexing
COPY frontend/src/courses/ ./frontend/src/courses/
COPY README.md ./README.md
COPY AI_IMPLEMENTATION.md ./AI_IMPLEMENTATION.md
COPY BACKEND.md ./BACKEND.md
COPY FRONTEND.md ./FRONTEND.md
COPY ANTI_CHEAT_SYSTEM.md ./ANTI_CHEAT_SYSTEM.md
COPY BLOCKCHAIN_CERTIFICATE_SYSTEM.md ./BLOCKCHAIN_CERTIFICATE_SYSTEM.md
COPY DATABASE_SCHEMA.md ./DATABASE_SCHEMA.md
COPY INTERACTIVE_LEARNING.md ./INTERACTIVE_LEARNING.md

# Copy Firebase service account key (if you rely on file-based creds)
COPY backend/serviceAccountKey.json ./backend/serviceAccountKey.json

# Create non-root user for security
RUN useradd -m -u 1000 signum && chown -R signum:signum /app
USER signum

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Render entry: build RAG (if needed) then start API
WORKDIR /app/backend
RUN chmod +x /app/backend/scripts/render_start.sh
CMD ["/app/backend/scripts/render_start.sh"]
