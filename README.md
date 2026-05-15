# Kleos AI Resume Optimizer

[Live Demo](https://kleos-orcin.vercel.app/)

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

## System Operations

### 1. Document Ingestion & Parsing
The system utilizes `pdf-parse` to convert binary document data into clean text streams. This text is then sanitized and normalized before being passed to the AI engine to prevent token waste and injection vulnerabilities.

### 2. Job Description (JD) Intelligence
When a JD is provided, the engine performs a "Requirement Extraction" pass. It identifies:
- **Hard Skills**: Mandatory technical competencies.
- **Soft Skills**: Cultural and behavioral indicators.
- **Experience Thresholds**: Seniority and specific industry exposure requirements.

### 3. Neural Gap Analysis
The system performs a high-dimensional comparison between the extracted resume data and the JD requirements. It calculates a "Professional Delta," highlighting critical missing keywords and areas where the candidate's impact metrics are under-represented.

### 4. Generative Optimization
Using the "Professional Delta," the LLM agents generate tailored suggestions for professional summaries and bullet points. It uses a "Constraint-Based Generation" approach to ensure the suggestions remain truthful to the original experience while maximizing ATS compatibility.

### 5. Scoring & Diagnostics
Finally, the system computes a multi-factor ATS score based on keyword density, structural compliance, and "readability" from an AI agent's perspective.


## Configuration

To run this project, you will need to add environment variables. See the `.env.example` file in the root directory for the required fields.

1. Clone the repository.
2. Create a `.env` file in the root directory.
3. Copy the contents of `.env.example` into `.env` and provide your actual credentials.

## Installation

### Backend
1. `npm install`
2. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`


## License

This project is licensed under the MIT License.

## Credits

Carved by Z35Tyyyy.
