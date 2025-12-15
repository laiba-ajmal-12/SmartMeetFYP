# Smart Meet – An Online Meeting Platform with Engagement Tracking and Automated Reports

# Project Description

Smart Meet is an online meeting platform which is designed to help hosts understand how engaged participants are during online meetings. In traditional online meetings, hosts often struggle to know whether participants are actively listening or simply just physically present and mentally absent. Most users just join the meeting but don't listen it.

This platform addresses that problem by monitoring participant attentiveness and attention during meetings using computer vision techniques such as head pose estimation, and gaze tracking. At the end of each session, Smart Meet generates automated reports that summarize individual participant engagement as well as overall session productivity. This allows hosts to objectively evaluate how effective and engaging their meetings were.

## Features Implemented 

The following features are fully implemented in the current MVP:

## Core Platform Features

* User authentication (Sign Up / Login)
* Host role with ability to create organizations
* Host can add participants to organizations and meetings
* Meeting scheduling and listing for hosts
* Real-time meeting controls:
    * Join / Leave meeting
    * Microphone on/off
    * Audio mute/unmute
    * In-meeting chat
    * Screen sharing

### Computer Vision & Engagement Tracking

* Face detection (face present or not)
* Head pose movement analysis (right or left)
* Eye gaze tracking
* Attention and attentiveness detection logic
* Computer vision preprocessing using OpenCV
* MediaPipe-based facial landmark extraction

### Reports & Analytics

* Automated post-meeting engagement reports
* Participant-level attentiveness analysis
 
## Technologies Used

### Frontend

* Next.js
* Tailwind CSS

### Backend

* Node.js
* Express.js
* REST APIs (for create/update/delete operations)
* GraphQL (for data retrieval)

### Database

* PostgreSQL
* Prisma ORM

## Setup Instructions

### Prerequisites

* Node.js (v18 or above recommended)
* npm
* PostgreSQL

### Backend Setup

```termina(run these commands on terminal)
# First go to backend directory
npm install

# Generate Prisma client to develop the environment for prisma to run
npx prisma generate

# Run database migrations to apply all one by one
npx prisma migrate dev

# Start backend server
npm run dev
```

### Frontend Setup

```terminal(run these commands on terminal)
# Navigate to frontend directory
npm install

# Start frontend development server
npm run dev
```

### Environment Variables

A `.env` file is required for both frontend and backend. It typically includes:

. Database connection string
. Authentication secrets

## Repository Structure & Branching

### Main Branches

* `master` – Production-ready code
* `develop` – Stable development branch

### Feature & Supporting Branches (Sprint 1)

* `feature/ui`
* `cv`
* `Smart-Meet-Server-only`
* `Backend`
* `server`
* `integration_b`

All Sprint 1 features were developed in feature-specific branches and merged into `develop` and `master` after integration.

## TODOs

The following items are planned for future sprints:

* Video mode during meetings (participants cannot currently see each other)
* Improvement and optimization of CV module
* Real-time warnings when participant attentiveness drops below a threshold
* Attendance calculation based on attention metrics
