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
