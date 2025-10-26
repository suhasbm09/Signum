# 🐳 Backend Docker Usage

## Quick Start

```bash
cd backend

# Build
docker build -t signum-backend .

# Run with .env file
docker run -d -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/serviceAccountKey.json:/app/serviceAccountKey.json:ro \
  signum-backend
```

## Environment Variables (.env)

Create `backend/.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret
PINATA_JWT=your_pinata_jwt
```

**Important**: The `.env` file is loaded by Python's `load_dotenv()` in your services.

## Health Check

```bash
curl http://localhost:8000/health
```

## View Logs

```bash
docker logs -f signum-backend
```

## How It Works

1. **Build**: `docker build` copies your code and installs dependencies
2. **Run**: `--env-file .env` passes environment variables to container
3. **Runtime**: Python `load_dotenv()` reads the environment variables
4. **Services**: AI service, metadata service use these variables
