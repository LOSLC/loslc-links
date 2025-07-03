# LOSLC Links - URL Shortener with Admin Panel

A full-stack URL shortener application with comprehensive admin panel for user, role, and permission management.

## 🚀 Features

### Core Features
- **URL Shortening**: Create short links with custom labels
- **Link Management**: View, edit, and delete your links
- **Public Redirects**: Fast redirects via short URLs
- **Responsive Design**: Works seamlessly on all devices

### Admin Features
- **User Management**: View, delete users, and manage their roles
- **Role & Permission System**: Granular role-based access control
- **Admin Dashboard**: Comprehensive admin interface
- **Security**: Session-based authentication with admin privileges

## 🛠 Tech Stack

### Backend
- **FastAPI**: High-performance async web framework
- **SQLModel**: Type-safe database operations with SQLAlchemy 2.0
- **Alembic**: Database migrations
- **Python 3.13+**: Modern Python with UV package manager

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Beautiful, accessible UI components
- **Ky**: Modern HTTP client for API requests

## 🚦 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.13+ (for local development)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd loslc-links

# Start the application
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Local Development

#### Backend Setup
```bash
cd backend

# Install dependencies
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
uv run alembic upgrade head

# Start the development server
uv run main.py
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
bun dev
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
ADMIN_EMAILS=admin@example.com;another@admin.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 👨‍💼 Admin Setup

To grant admin privileges to a user:

1. Add their email to the `ADMIN_EMAILS` environment variable in the backend
2. Restart the backend service
3. The user can now access the admin panel at `/admin`

## 📱 Usage

### Creating Short Links
1. Visit the homepage
2. Sign up or log in
3. Enter your URL and optional custom label
4. Share your short link!

### Admin Panel
1. Navigate to `/admin`
2. Log in with admin credentials
3. Manage users, roles, and permissions
4. View system statistics

## 🏗 Project Structure

```
loslc-links/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes and controllers
│   │   ├── core/           # Core application logic
│   │   └── utils/          # Utility functions
│   ├── migrations/         # Database migrations
│   └── Dockerfile
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and API client
│   └── Dockerfile
└── docker-compose.yml     # Docker orchestration
```

## 🔐 Security Features

- **Session-based Authentication**: HTTP-only cookies for security
- **Role-based Access Control**: Granular permission system
- **Admin-only Endpoints**: Protected admin functionality
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured cross-origin policies

## 🧪 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📦 Deployment

### Docker Production
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Or use existing images
docker-compose up -d
```

### Manual Deployment
1. Build the frontend: `bun run build`
2. Set production environment variables
3. Deploy backend and frontend to your preferred hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please create an issue on GitHub or contact the development team.
