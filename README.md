   # Smart Meet – An Online Meeting Platform with Engagement Tracking and Automated Reports

# Project Description

Smart Meet is an online meeting platform that helps hosts understand how engaged participants are during virtual meetings.
It uses computer vision techniques such as head pose and gaze tracking to monitor attentiveness in real time. At the end of each session, the system generates automated reports showing individual participation and overall meeting productivity, allowing hosts to evaluate meeting effectiveness objectively.

## Features Implemented 

The following features are fully implemented in the current MVP:

## Core Platform Features

* User authentication (Sign Up / Login)
* Host role with ability to create organizations
* Host can add participants to organizations and meetings
* Meeting scheduling and listing for hosts
* other UI features
 
## Technologies Used

### Frontend

* Next.js
* Tailwind CSS

## Setup Instructions

### Prerequisites

* npm
  
### Frontend Setup

```terminal(run these commands on terminal)
# Navigate to frontend directory
npm install

# Start frontend development server
npm run dev
```

## Repository Structure & Branching

### Main Branches

* `master` – Production-ready code
* `develop` – Stable development branch

### Feature & Supporting Branches

* `feature/ui`
* `cv`
* `Smart-Meet-Server-only`
* `Backend`
* `server`
* `integration_b`

All Sprint 1 features were developed in feature-specific branches and merged into `develop` and `master` after integration.

## TODOs

The following items are planned for future sprints:

* Responsiveness
