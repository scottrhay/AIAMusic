# SunoApp - Music Creation Management Platform

A modern web-based platform for managing music creation with Suno API integration.

## 🎵 What is SunoApp?

SunoApp replaces Excel-based music workflows with a professional, database-driven web application. Built for teams creating music with Suno API, it provides:

- **Song Management** - Track songs through creation lifecycle (Create → Submitted → Completed)
- **Style Library** - Manage reusable music style templates
- **Team Collaboration** - Multiple users working together
- **Search & Filter** - Find songs by status, style, lyrics, or vocal gender
- **Direct Suno API Integration** - Automatic music generation and webhook callbacks
- **Auto-Download** - Files automatically download when ready (expire after 15 days)
- **Star Rating System** - Rate and filter songs with 1-5 stars

## 🚀 Quick Start

**Choose your deployment method:**

### Option A: Docker (Recommended - Clean VPS)
✅ Keeps VPS clean
✅ Easy removal
✅ Portable

👉 **Follow:** `DOCKER_DEPLOYMENT_CHECKLIST.md`

### Option B: Direct Install
✅ Simpler
✅ Slightly better performance

👉 **Follow:** `DEPLOYMENT_CHECKLIST.md`

## 📋 What You Need

- **VPS**: Ubuntu 24.04 or similar Linux server
- **MySQL**: 8.0+ database
- **Suno API Key**: From Suno API service
- **Domain**: Pointing to your VPS (optional but recommended)
- **Time**: 30-45 minutes

## 🏗️ Architecture

```
Users → HTTPS → Nginx → SunoApp (Flask + React) → MySQL
                              ↕
                         Suno API (webhooks)
```

## 💻 Technology Stack

- **Backend**: Flask (Python 3.11)
- **Frontend**: React 18
- **Database**: MySQL 8.0
- **Server**: Gunicorn + Nginx
- **API Integration**: Direct Suno API with webhooks
- **Security**: JWT authentication, SSL/HTTPS

## 📁 Project Structure

```
SunoApp/
├── backend/              # Flask API
├── frontend/             # React UI
├── database/             # SQL schema
├── deploy/               # Deployment scripts
├── docs/                 # Documentation
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker orchestration
└── Makefile            # Convenience commands
```

## 🔒 Security & Environment Setup

**IMPORTANT:** Never commit secrets to Git!

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your actual values:
   - `SECRET_KEY` - Generate with: `openssl rand -hex 32`
   - `JWT_SECRET_KEY` - Generate with: `openssl rand -hex 32`
   - `DB_PASSWORD` - Your MySQL password
   - `SUNO_API_KEY` - Your Suno API key
   - Other configuration values

3. The `.env` file is already in `.gitignore` and will **not** be committed to GitHub

4. Share `.env.example` with your team (it's safe - contains no secrets)

## 📖 Documentation

### Getting Started
- **START_HERE.md** - Overview and quick links
- **DOCKER_DEPLOYMENT_CHECKLIST.md** - Docker deployment (recommended)
- **DEPLOYMENT_CHECKLIST.md** - Direct install deployment
- **PROJECT_SUMMARY.md** - What was built and why

### Detailed Guides
- **docs/DOCKER_DEPLOYMENT.md** - Complete Docker guide
- **docs/INSTALLATION.md** - Detailed installation
- **docs/QUICK_START.md** - Fast deployment path
- **docs/API.md** - API documentation
- **docs/DEVELOPMENT.md** - Local development

## 💰 Cost

**Minimal** - Uses your existing VPS and MySQL. Only cost is Suno API credits.

## 📜 License

Private project for AIA Copilot team use.

---

**Ready to deploy?**

Docker (recommended): Open `DOCKER_DEPLOYMENT_CHECKLIST.md`
Direct install: Open `DEPLOYMENT_CHECKLIST.md`

Let's create some music! 🎵🚀
