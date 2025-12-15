# Smart Meet – An Online Meeting Platform with Engagement Tracking and Automated Reports

# Project Description

Smart Meet is an online meeting platform which is designed to help hosts understand how engaged participants are during online meetings. In traditional online meetings, hosts often struggle to know whether participants are actively listening or simply just physically present and mentally absent. Most users just join the meeting but don't listen it.

This platform addresses that problem by monitoring participant attentiveness and attention during meetings using computer vision techniques such as head pose estimation, and gaze tracking. At the end of each session, Smart Meet generates automated reports that summarize individual participant engagement as well as overall session productivity. This allows hosts to objectively evaluate how effective and engaging their meetings were.

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
