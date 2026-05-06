# StoryStack — Blog Management System

A full-stack blogging platform built with **Spring Boot 4** and **Next.js 16**. Users can read stories publicly, create accounts, write rich-text posts with embedded images, and leave comments. Admins get a dedicated panel to manage users and moderate content.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start — Docker](#quick-start--docker)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Default Admin Account](#default-admin-account)

---

## Features

**Public (no account required)**
- Browse and read all published stories
- Slug-based URLs (`/post/my-story-title`)
- Reading progress bar and estimated read time

**Authenticated users**
- Sign up with email + OTP verification
- Sign in with email/password or Google OAuth2
- Create and publish rich-text posts (bold, headings, blockquotes, code, links, inline images)
- Upload images via Cloudinary
- Edit and delete your own posts
- Leave comments on any story

**Admin panel** (`/admin`)
- View and manage all users — assign roles, enable/disable accounts
- View all posts across every user and delete any post
- Paginated tables with search

**Security**
- JWT access tokens stored in memory (not localStorage)
- HttpOnly refresh token cookie — 7-day sliding session
- Automatic silent token refresh on page load
- Email verification required before first login
- OTP-based password reset

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Spring Boot 4, Java 21, Spring Security, Spring Data JPA |
| Database | MySQL 8 |
| Cache / Sessions | Redis 7 |
| Auth | JWT (JJWT), HttpOnly cookies, Google OAuth2 |
| Image storage | Cloudinary |
| Email | Gmail SMTP |
| API docs | SpringDoc OpenAPI (Swagger UI) |
| Containerisation | Docker, Docker Compose |

---

## Project Structure

```
.
├── backend/                  # Spring Boot API
│   ├── src/main/java/org/blog/backend/
│   │   ├── auth/             # Auth, users, roles, JWT, OAuth2
│   │   └── blog/             # Posts, comments, images
│   └── src/main/resources/
│       ├── application.yml
│       ├── application-dev.yml
│       └── application-docker.yml
├── frontend/                 # Next.js app
│   ├── app/
│   │   ├── (auth)/           # login, register, verify-otp, forgot/reset password
│   │   ├── (protected)/      # dashboard, profile (requires auth)
│   │   ├── (admin)/          # admin panel (requires ROLE_ADMIN)
│   │   └── post/[slug]/      # public post detail page
│   ├── components/
│   ├── context/              # AuthContext
│   └── lib/api/              # Axios API clients
├── docker-compose.yml
└── .env                      # Docker environment variables
```

---

## Quick Start — Docker

The fastest way to run the entire stack. Requires **Docker Desktop** (or Docker Engine + Compose plugin).

### 1. Clone the repository

```bash
git clone https://github.com/your-username/blog-management-system.git
cd blog-management-system
```

### 2. Create the root `.env` file

Copy the template below and fill in your own values:

```env
# ─── MySQL ────────────────────────────────────────────────────────────────────
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=blog_db
MYSQL_USER=bloguser
MYSQL_PASSWORD=blogpassword

# ─── JWT ──────────────────────────────────────────────────────────────────────
# Generate with: openssl rand -base64 64
JWT_SECRET=your_base64_jwt_secret
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# ─── OTP ──────────────────────────────────────────────────────────────────────
OTP_EXPIRATION=300000
OTP_LENGTH=6

# ─── Mail (Gmail SMTP) ────────────────────────────────────────────────────────
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_gmail_app_password

# ─── OAuth2 — Google ──────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ─── OAuth2 — GitHub (optional) ───────────────────────────────────────────────
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# ─── Admin seed (created on first boot) ───────────────────────────────────────
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@1234
ADMIN_FIRST_NAME=Super
ADMIN_LAST_NAME=Admin

# ─── Cloudinary ───────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Gmail App Password** — Go to your Google Account → Security → 2-Step Verification → App passwords. Generate one for "Mail".

### 3. Build and start

```bash
docker compose up --build
```

This builds both images from source and starts all four services (MySQL, Redis, backend, frontend). The first build takes a few minutes.

### 4. Open the app

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api/v1 |
| Swagger UI | http://localhost:5000/api/v1/swagger-ui.html |

### Stopping and cleaning up

```bash
# Stop containers (keep data)
docker compose down

# Stop and delete all data (fresh start)
docker compose down -v
```

---

## Local Development Setup

Run the backend and frontend separately for a faster dev loop with hot reload.

### Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 21+ |
| Maven | 3.9+ (or use the included `mvnw`) |
| Node.js | 20+ |
| pnpm | 10+ (`npm install -g pnpm`) |
| MySQL | 8.0 |
| Redis | 7+ |

### Backend

#### 1. Create the database

```sql
CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. Create `backend/.env`

```env
# Database
DB_URL=jdbc:mysql://localhost:3306/blog_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_base64_jwt_secret
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# OTP
OTP_EXPIRATION=300000
OTP_LENGTH=6

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# App URLs
APP_FRONTEND_URL=http://localhost:3000
APP_BASE_URL=http://localhost:5000

# Mail
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_gmail_app_password

# OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Admin seed
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@1234
ADMIN_FIRST_NAME=Super
ADMIN_LAST_NAME=Admin

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 3. Run the backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The API starts at `http://localhost:5000/api/v1`.

### Frontend

#### 1. Create `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=StoryStack
```

#### 2. Install dependencies and start

```bash
cd frontend
pnpm install
pnpm dev
```

The app starts at `http://localhost:3000`.

---

## Environment Variables

### Root `.env` (Docker only)

| Variable | Description |
|---|---|
| `MYSQL_ROOT_PASSWORD` | MySQL root password |
| `MYSQL_DATABASE` | Database name |
| `MYSQL_USER` / `MYSQL_PASSWORD` | App database user |
| `JWT_SECRET` | Base64-encoded HMAC-SHA256 key (min 32 bytes) |
| `JWT_EXPIRATION` | Access token lifetime in ms (default: 86400000 = 1 day) |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifetime in ms (default: 604800000 = 7 days) |
| `OTP_EXPIRATION` | OTP validity in ms (default: 300000 = 5 min) |
| `MAIL_USERNAME` | Gmail address for sending OTP emails |
| `MAIL_PASSWORD` | Gmail App Password (not your account password) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth2 credentials |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth2 credentials |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin account (created on first boot) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image upload credentials |

### Frontend `.env.local` (local dev only)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:5000/api/v1`) |
| `NEXT_PUBLIC_APP_NAME` | App display name |

---

## API Documentation

Swagger UI is available when the backend is running:

```
http://localhost:5000/api/v1/swagger-ui.html
```

Key endpoint groups:

| Group | Base path | Auth required |
|---|---|---|
| Authentication | `/auth/**` | No |
| Public posts | `/public/posts/**` | No |
| Public comments | `/comments/post/**` | No |
| User posts | `/posts/**` | Yes |
| User profile | `/user/**` | Yes |
| Admin | `/admin/**` | Yes — ROLE_ADMIN |

---

## Default Admin Account

On first boot, the application seeds a default admin user using the values from your environment:

```
Email:    ADMIN_EMAIL   (default: admin@blog.com)
Password: ADMIN_PASSWORD (default: Admin@1234)
```

**Change these values before any public deployment.**

The admin account has access to `/admin` where you can manage users, assign roles, and delete posts.

---

## Generating a JWT Secret

```bash
openssl rand -base64 64
```

Paste the output as the value of `JWT_SECRET`. The key must be at least 32 bytes (256 bits) after Base64 decoding.
