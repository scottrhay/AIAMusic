# AIASpeech - Speech Generation Management Platform

A modern web-based platform for managing speech generation with Azure Speech API integration.

## 🎵 What is AIASpeech?

AIASpeech replaces Excel-based speech workflows with a professional, database-driven web application. Built for teams creating audio content with Azure Speech API, it provides:

- **Audio Management** - Track audio through creation lifecycle (Create → Submitted → Completed)
- **Style Library** - Manage reusable speech style templates
- **Team Collaboration** - Multiple users working together
- **Search & Filter** - Find audio by status, style, text, or vocal gender
- **API Integration** - Automatic Azure Speech API submission and status updates
- **Download Tracking** - Organize generated audio files

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

- **VPS**: Ubuntu 24.04 (you have: Hostinger VPS)
- **MySQL**: 8.0+ (you have it)
- **Domain**: Pointing to your VPS (speech.aiacopilot.com)
- **Azure Speech API**: Azure Cognitive Services subscription
- **Time**: 30-45 minutes

## 🏗️ Architecture

```
Users → HTTPS → Nginx → AIASpeech (Flask + React) → MySQL
                                        ↕
                                  Azure Speech API
```

## 💻 Technology Stack

- **Backend**: Flask (Python 3.11)
- **Frontend**: React 18
- **Database**: MySQL 8.0
- **Server**: Gunicorn + Nginx
- **API**: Azure Cognitive Services Speech
- **Security**: JWT authentication, SSL/HTTPS

## 📁 Project Structure

```
AIASpeech/
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
   - `AZURE_SPEECH_KEY` - Your Azure Speech API key
   - `AZURE_SPEECH_REGION` - Your Azure region
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

**$0 per month** - Uses your existing VPS and MySQL. Azure Speech API costs based on usage.

## 📜 License

Private project for AIA Copilot team use.

---

**Ready to deploy?**

Docker (recommended): Open `DOCKER_DEPLOYMENT_CHECKLIST.md`
Direct install: Open `DEPLOYMENT_CHECKLIST.md`

Let's create some audio! 🎵🚀
