# GoAround

A full-stack travel planning and community platform that helps users discover places, plan trips, and share experiences.

## 🌟 Features

- **Place Discovery**: Browse and search for travel destinations with detailed information
- **Trip Planning**: Create, customize, and manage your travel itineraries
- **AI-Powered Recommendations**: Get personalized travel suggestions using Google Gemini AI
- **Community Forums**: Engage with other travelers, share experiences, and ask questions
- **Reviews & Ratings**: Read and write reviews for places you've visited
- **Saved Lists**: Organize your favorite places into custom lists
- **Admin Panel**: Moderation tools for content management and user verification
- **User Profiles**: Personalized profiles with trip history and saved content

## 🛠️ Tech Stack

### Backend

- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **Supabase**: PostgreSQL database and authentication
- **Alembic**: Database migrations
- **Google Gemini AI**: AI-powered trip generation and recommendations
- **JWT**: Token-based authentication

### Frontend

- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Pinia**: State management
- **Vue Router**: Client-side routing
- **Axios**: HTTP client
- **shadcn-vue**: UI component library
- **OpenRouteService**: Route planning

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+** and **npm/yarn**
- **uv** (Python package manager): [Installation guide](https://docs.astral.sh/uv/)
- **Docker** (optional, for containerized deployment)
- **Supabase Account** (for database and authentication)
- **Google Cloud Account** (for Gemini AI)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GoAround
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
uv sync
```

#### Activate Virtual Environment

**Windows (PowerShell):**

```powershell
.venv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

#### Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# --- Project Configuration ---
PROJECT_NAME=GoAround
ENVIRONMENT=local

# --- Database Connection (Supabase) ---
# Get these from your Supabase project settings -> Database -> Connection Pooling
POSTGRES_SERVER=your-project.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_USER=postgres.your-project-ref
POSTGRES_PASSWORD=your-database-password
POSTGRES_DB=postgres

# --- Authentication ---
# Get these from Supabase project settings -> API -> JWT Secret
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_JWT_ISSUER=https://your-project-ref.supabase.co/auth/v1

# --- CORS (Cross-Origin Resource Sharing) ---
BACKEND_CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]

# --- Google Gemini AI ---
# Get from Google AI Studio: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key
```

#### Run Database Migrations

```bash
alembic upgrade head
```

#### Start the Backend Server

```bash
fastapi dev app/main.py
```

The API will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# --- Supabase Configuration ---
# Get from Supabase project settings -> API
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# --- OpenRouteService ---
# Get from https://openrouteservice.org/dev/#/signup
VITE_OPENROUTESERVICE_API_KEY=your-openrouteservice-api-key

# --- Backend API URL ---
VITE_API_URL=http://localhost:8000/api/v1
```

#### Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
GoAround/
├── backend/
│   ├── app/
│   │   ├── api/              # API routes and endpoints
│   │   ├── core/             # Core configurations (DB, security)
│   │   ├── service/          # Business logic services
│   │   ├── alembic/          # Database migrations
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   └── crud.py           # Database operations
│   ├── tests/                # Backend tests
│   ├── .env                  # Environment variables (not in git)
│   └── run.py                # Application entry point
│
└── frontend/
    ├── src/
    │   ├── components/       # Vue components
    │   ├── composables/      # Composition API logic
    │   ├── pages/            # Page components
    │   ├── router/           # Vue Router configuration
    │   ├── services/         # API services
    │   ├── stores/           # Pinia state stores
    │   ├── utils/            # Utility functions and types
    │   └── config/           # Configuration files
    ├── public/               # Static assets
    └── .env.local            # Environment variables (not in git)
```

## 🔑 Getting API Keys

### Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to Project Settings → API to get:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Navigate to Project Settings → Database → Connection Pooling for database credentials
4. Navigate to Project Settings → API → JWT Settings for `SUPABASE_JWT_SECRET`

### Google Gemini AI

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key for `GEMINI_API_KEY`

### OpenRouteService

1. Sign up at [openrouteservice.org](https://openrouteservice.org/dev/#/signup)
2. Get your API key for `VITE_OPENROUTESERVICE_API_KEY`

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 🐳 Docker Deployment

```bash
cd backend
docker build -t goaround-backend .
docker run -p 8000:8000 goaround-backend
```

## 📝 API Documentation

Once the backend is running, visit:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is part of CS300 - Elements of Software Engineering coursework.

## 👥 Team

Developed as a university project for CS300.

## 📞 Support

For issues and questions, please use the GitHub issue tracker.
