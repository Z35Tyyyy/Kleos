# Kleos AI Resume Optimizer

Kleos is a production-grade AI-powered resume optimization platform designed to bridge the gap between candidates and Applicant Tracking Systems (ATS). By utilizing advanced Large Language Models (LLMs) including Google Gemini and Groq, Kleos provides deep structural analysis, keyword calibration, and real-time career health diagnostics.

## Core Features

### Neural Resume Analysis
The platform utilizes specialized AI agents to parse raw resume text or PDF documents into structured data. It identifies key professional pillars including skills, experience metrics, and educational background with high precision.

### Dual-Mode Optimization
- **Targeted Optimization**: Users can provide a specific Job Description to receive a precise Gap Analysis and ATS score tailored to that role.
- **General Health Check**: If no Job Description is provided, the system pivots to a general professional audit, evaluating the resume against industry best practices and general readiness.

### Intelligent Gap Analysis
Kleos identifies missing critical keywords, weak action verbs, and areas where quantifiable metrics are needed. It provides actionable suggestions to improve the candidate's narrative impact.

### Dynamic System Telemetry
A real-time monitoring dashboard tracks the health of the MongoDB database and AI API nodes (Gemini and Groq), ensuring transparency regarding system availability and performance.

### Premium User Experience
The frontend features a cinematic 3D neural-field background powered by Three.js and React Three Fiber, complemented by fluid entrance animations via Framer Motion.

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **AI Integration**: Google Generative AI (Gemini), Groq SDK
- **Security**: JWT Authentication, Passport.js (Google OAuth 2.0), Bcrypt.js, Helmet, Express Rate Limit
- **Utilities**: PDF-Parse, Winston Logger, Morgan

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, Vanilla CSS
- **Animations**: Framer Motion, Three.js, React Three Fiber
- **State Management**: React Context API
- **Routing**: React Router DOM

## Project Architecture

The system follows a modular service-oriented architecture:
- **Controllers**: Handle request routing and business logic orchestration.
- **Services**: Specialized modules for JD analysis, gap detection, resume parsing, and scoring.
- **Models**: MongoDB schemas for users and optimization results.
- **Utils**: Reusable helpers for PDF parsing, prompt loading, and LLM communication.
- **Prompts**: Centralized YAML-based prompt management for AI agents.

## Installation and Setup

### Prerequisites
- Node.js (version 20.x or higher)
- MongoDB instance (Local or Atlas)
- Google Cloud Console credentials (for Google OAuth)
- Gemini API Key
- Groq API Key

### Backend Setup
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file in the root and configure the variables (see Environment Variables section).
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend Variables (.env)
- PORT: Port for the Express server (default: 3000)
- MONGODB_URI: MongoDB connection string
- JWT_SECRET: Secret for signing JSON Web Tokens
- GOOGLE_CLIENT_ID: Google OAuth Client ID
- GOOGLE_CLIENT_SECRET: Google OAuth Client Secret
- GEMINI_API_KEY: Primary AI API key
- GROQ_API_KEY: Fallback AI API key
- FRONTEND_URL: URL of the frontend application (for CORS)

### Frontend Variables (frontend/.env)
- VITE_API_URL: URL of the running backend API

## Deployment

Kleos is designed for a split-stack deployment:
- **Backend**: Recommended for Render or Heroku. Ensure all environment variables are populated in the dashboard.
- **Frontend**: Recommended for Vercel or Netlify. Set the VITE_API_URL to point to your deployed backend.

## License

This project is licensed under the MIT License.

## Credits

Carved by Z35Tyyyy.
