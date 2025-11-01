# Docker Usage Guide

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- `.env` file configured in `backend/` directory
- `serviceAccountKey.json` (Firebase Admin SDK) in `backend/` directory

---

## Quick Start

### 1. Build the Docker Image

```bash
cd backend
docker build -t signum-backend .
```

### 2. Run the Container

```bash
docker run -d \
  --name signum-backend \
  -p 8000:8000 \
  --env-file .env \
  signum-backend
```

### 3. Verify It's Running

```bash
# Check container status
docker ps

# Check health
curl http://localhost:8000/health

# View API documentation
# Open: http://localhost:8000/docs
```

---

## Environment Variables

Create `backend/.env` file with:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PINATA_API_KEY=your_pinata_api_key          # Optional
PINATA_SECRET_KEY=your_pinata_secret        # Optional
```

**Note:** The Dockerfile copies `serviceAccountKey.json` automatically during build.

---

## Common Commands

### View Logs

```bash
# Follow logs in real-time
docker logs -f signum-backend

# Last 100 lines
docker logs --tail 100 signum-backend
```

### Stop Container

```bash
docker stop signum-backend
```

### Start Container

```bash
docker start signum-backend
```

### Restart Container

```bash
docker restart signum-backend
```

### Remove Container

```bash
docker rm -f signum-backend
```

### Remove Image

```bash
docker rmi signum-backend
```

---

## Development Mode with Hot Reload

For development, mount your code as a volume:

```bash
docker run -d \
  --name signum-backend-dev \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/app:/app/app \
  -v $(pwd)/serviceAccountKey.json:/app/serviceAccountKey.json \
  signum-backend \
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Docker Compose (Optional)

Create `docker-compose.yml` in `backend/`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    container_name: signum-backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

**Usage:**

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker logs signum-backend

# Verify .env file exists
ls -la .env

# Verify serviceAccountKey.json exists
ls -la serviceAccountKey.json

# Check if port 8000 is already in use
lsof -i :8000
```

### Environment variables not loading

```bash
# Verify .env file is in backend/ directory
cat .env | grep GEMINI_API_KEY

# Rebuild image after changing .env
docker build -t signum-backend . --no-cache
docker run -d --name signum-backend -p 8000:8000 --env-file .env signum-backend
```

### Permission denied errors

```bash
# Ensure serviceAccountKey.json has correct permissions
chmod 644 serviceAccountKey.json

# Rebuild with proper ownership
docker build -t signum-backend .
```

---

## Production Deployment

### Build for Production

```bash
docker build -t signum-backend:1.0.0 .
docker tag signum-backend:1.0.0 signum-backend:latest
```

### Run with Production Settings

```bash
docker run -d \
  --name signum-backend-prod \
  -p 8000:8000 \
  --env-file .env.production \
  --restart unless-stopped \
  --memory="512m" \
  --cpus="1.0" \
  signum-backend:1.0.0
```

### Health Monitoring

The Dockerfile includes a health check that runs every 30 seconds:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' signum-backend

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' signum-backend
```

---

## Security Best Practices

1. **Never commit `.env` or `serviceAccountKey.json`** - Already in `.gitignore`
2. **Use non-root user** - Dockerfile creates and uses `signum` user
3. **Minimal base image** - Uses `python:3.11-slim` for smaller attack surface
4. **No cache for pip** - `--no-cache-dir` reduces image size
5. **Health checks** - Built-in health monitoring for production

---

## Image Information

```bash
# View image size
docker images signum-backend

# View image layers
docker history signum-backend

# Inspect image
docker inspect signum-backend
```

---

## Cleanup

### Remove all stopped containers

```bash
docker container prune
```

### Remove unused images

```bash
docker image prune
```

### Complete cleanup

```bash
docker system prune -a
```

---

## Dockerfile Explanation

```dockerfile
FROM python:3.11-slim              # Minimal Python 3.11 image
WORKDIR /app                       # Set working directory
COPY requirements.txt .            # Copy dependencies first (better caching)
RUN pip install --no-cache-dir -r requirements.txt  # Install dependencies
COPY app/ ./app/                   # Copy application code
COPY serviceAccountKey.json .      # Copy Firebase credentials
RUN useradd -m -u 1000 signum && chown -R signum:signum /app  # Security: non-root user
USER signum                        # Switch to non-root user
EXPOSE 8000                        # Document exposed port
HEALTHCHECK ...                    # Automatic health monitoring
CMD ["uvicorn", ...]              # Start application
```

---

## API Endpoints

Once running, access:

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Root Info**: http://localhost:8000/

**Available Routes:**
- `/auth` - Authentication
- `/progress` - User progress tracking
- `/assessment` - Quizzes and coding challenges
- `/certification` - NFT certificate minting
- `/ai` - AI assistant chat

---

**Last Updated:** 2025-01-01
