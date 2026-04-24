# Smart Meet – Online Meeting Platform with Engagement Tracking & Automated Reports

## Project Overview

Smart Meet is an intelligent online meeting platform designed to analyze participant engagement during online sessions. It uses computer vision techniques such as head pose estimation and gaze tracking to monitor attentiveness in real time.

After each meeting, the system generates automated engagement reports, helping hosts evaluate meeting effectiveness and participant involvement.

---

## Features

### Core Platform Features

* User authentication (Sign Up / Login)
* Role-based access (Host and Participants)
* Organization creation and management
* Participant management within organizations
* Meeting scheduling and listing
* Real-time meeting controls:

  * Join and leave meetings
  * Microphone mute/unmute
  * In-meeting chat
  * Screen sharing
* Cross-platform video communication
* Post-meeting engagement reports

### Engagement Tracking

* Real-time face-based attention detection
* Head pose estimation
* Gaze tracking
* Engagement scoring
* Automated report generation

---

## Tech Stack

### Frontend

* Next.js
* Tailwind CSS

### Backend

* Node.js
* Express.js
* REST APIs
* GraphQL

### Database

* PostgreSQL
* Prisma ORM

### Computer Vision Module

* Python
* OpenCV
* MediaPipe
* NumPy, Pandas

---

## Installation and Setup

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn
* PostgreSQL
* Python (v3.9 or higher)
* Git

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd <project-root>
```

---

## Backend Setup

```bash
cd <backend-folder>

npm install

cp .env.example .env
# Update environment variables inside .env

npx prisma generate
npx prisma migrate dev

npm run dev
# or
npm run start
```

---

## Frontend Setup

```bash
cd <frontend-folder>

npm install

npm run dev

# For production
npm run build
npm run start
```

---

## Environment Variables

Create `.env` files. Typical variables include:

* Database connection string
* Authentication secrets 
* Port configurations

---

## Running the Full System

1. Start PostgreSQL database
2. Start backend server
3. Start frontend server
4. Start computer vision module

Open the application in a browser using the configured frontend URL (for example: [http://localhost:3000](http://localhost:3000)).

---

## Usage Instructions

### For Hosts

1. Register or log in
2. Create an organization
3. Add participants
4. Schedule a meeting
5. Start the meeting and monitor engagement
6. View reports after the meeting

### For Participants

1. Join meetings using an invitation
2. Enable camera for engagement tracking
3. Participate using audio, video, and chat

---

## Reports and Analytics

After each meeting, the system provides:

* Individual engagement scores
* Attention tracking over time
* Participation summaries
* Overall meeting effectiveness

---

## Repository Structure and Branching

### Main Branches

* frontend – Frontend application
* backend – Backend services

### Supporting Branches

* `feature/ui`
* `cv`
* `Smart-Meet-Server-only`
* `Backend`
* `server`
* `integration_b`

---

## Authentication

* JWT-based authentication
* Secure session handling
* Role-based access control

---

## Deployment Overview

* Configure environment variables
* Build frontend and backend
* Deploy services to hosting platforms
* Use a production database
* Enable HTTPS

---

## Notes

* All services (database, backend, frontend) should run simultaneously
* Camera access is required for engagement tracking
* Performance may vary depending on system hardware

---

## License

This project is developed for academic and educational purposes.

