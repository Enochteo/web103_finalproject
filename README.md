# ServiceLink: Campus Maintenance Request System

CodePath WEB103 Final Project

Designed and developed by: Enoch Owoade, Jesse Rosenthal, Joshua Holguin

🔗 Link to deployed app:

## About

### Description and Purpose

ServiceLink is a web application that allows students, faculty, and staff to report maintenance or IT issues around campus (e.g., broken lights, Wi-Fi outages, faulty lab equipment).
Administrators and technicians can review, prioritize, assign, and resolve these requests efficiently.
The platform improves communication between the campus community and the facilities department by providing real-time status tracking and automated updates.

### Inspiration

The inspiration for ServiceLink came from observing the inefficiency of traditional maintenance request systems on many campuses.
At most universities, students must email or physically report issues like broken AC units, malfunctioning projectors, or water leaks often without any way to track their request status.
This results in frustration, miscommunication, and redundant work for both students and staff.

By combining these ideas into a student-friendly, web-based platform, ServiceLink makes it easier for everyone on campus to “see a problem, report it, and track it.”

## Tech Stack

Frontend: React, React Router, Axios, Tailwind

Backend: Express.js, Node.js, PostgreSQL

## Features

### Request Submission Form

Users can submit maintenance or IT requests through a simple online form that captures key details such as title, description, location, category, urgency, and optional image upload.
This replaces paper or email-based reporting with a more efficient digital workflow.

[gif goes here]

### Request Tracking Dashboard

Each user has access to a personal dashboard displaying all submitted requests along with their current status (Pending, In Progress, or Resolved).
This feature promotes transparency and accountability, ensuring users can easily follow up on issues.

[gif goes here]

### Admin & Technician Panel

Administrators and technicians can log in to view, filter, and manage all maintenance requests.
They can assign tasks, update request statuses, and add resolution notes once the issue is resolved.

[gif goes here]

### Filtering and Sorting

Admins and technicians can filter requests by category, urgency, or status, and sort them by date or priority.
This feature helps prioritize high-impact issues and maintain organized workflows.

[gif goes here]

### Resolution Management (One-to-One Relationship)

Each request has a corresponding resolution record that stores details about how the issue was fixed, who resolved it, and when.
This ensures proper documentation and allows staff to maintain a history of completed work.

[gif goes here]

### Real-Time Notifications & Feedback

Users receive confirmation messages or toast alerts when submitting, updating, or resolving a request.
This immediate feedback improves user experience and ensures communication between reporters and maintenance staff remains seamless.

[gif goes here]

### [ADDITIONAL FEATURES GO HERE - ADD ALL FEATURES HERE IN THE FORMAT ABOVE; you will check these off and add gifs as you complete them]

## Installation Instructions

[instructions go here]
