# Signum Backend - Production Ready
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code only
COPY app/ ./app/
COPY scripts/ ./scripts/

# Create non-root user for security
RUN useradd -m -u 1000 signum && chown -R signum:signum /app
USER signum

# Expose port
EXPOSE 8000

# Start API directly (RAG index should be pre-built or persisted on disk)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
