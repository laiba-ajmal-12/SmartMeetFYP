# Smart Meet – An Online Meeting Platform with Engagement Tracking and Automated Reports

# Project Description

Smart Meet is an online meeting platform that helps hosts understand how engaged participants are during virtual meetings.
It uses computer vision techniques such as head pose and gaze tracking to monitor attentiveness in real time. At the end of each session, the system generates automated reports showing individual participation and overall meeting productivity, allowing hosts to evaluate meeting effectiveness objectively.

## Features Implemented 

The following features are fully implemented in the current MVP:

### Computer Vision & Engagement Tracking

* Face detection (face present or not)
* Head pose movement analysis (right or left)
* Eye gaze tracking
* Attention and attentiveness detection logic
* Computer vision preprocessing using OpenCV
* MediaPipe-based facial landmark extraction

### Reports & Analytics

* Automated post-meeting engagement reports

## Technologies Used

### Computer Vision / AI

* Python
* OpenCV
* MediaPipe

## Setup Instructions

### Prerequisites

* Python 3.8 or above installed
* Jupyter Notebook or JupyterLab installed
* Webcam access enabled
  
## Step 1: Create and Activate Virtual Environment (Recommended)
python -m venv cv_env
### Windows
cv_env\Scripts\activate
### Linux / macOS
source cv_env/bin/activate

## Step 2: Install Required Libraries
pip install opencv-python mediapipe numpy matplotlib jupyter

## Step 3: Launch Jupyter Notebook
jupyter notebook

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

## TODOs

The following items are planned for future sprints:
* Improvement and optimization of CV module
* Real-time warnings when participant attentiveness drops below a threshold
* Attendance calculation based on attention metrics
