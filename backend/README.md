# Task Tracker Backend (Express + Sequelize + MySQL)

## Overview
Backend for a collaborative task-tracker (teams, tasks, comments) built with Node.js, Express and Sequelize (MySQL).

## Quickstart (local development)

1. Clone this repo (or copy files to `backend/`).
2. Install dependencies:
   ```bash
   cd backend
   npm install

    Create a .env based on .env.example and fill values (DB connection, JWT secret).

    Ensure you have a MySQL server running and database created:

CREATE DATABASE task_tracker_db;

Or use Amazon RDS. Configure .env accordingly.

Seed sample data (creates a user + a team):

npm run seed

The seed script uses your .env DB settings.

Start the server:

    Dev:

npm run dev

Production:

        npm start

    API base: http://localhost:4000/api

Endpoints (summary)

    Auth:

        POST /api/auth/register — register {name,email,password}

        POST /api/auth/login — login {email,password}

        GET /api/auth/me — get current user (requires Authorization)

    Teams:

        POST /api/teams — create team {name}

        POST /api/teams/join — join existing team {code}

        GET /api/teams — list teams the user belongs to

        GET /api/teams/:id — team details + members

    Tasks:

        POST /api/teams/:teamId/tasks — create task

        GET /api/teams/:teamId/tasks — list team tasks

        GET /api/tasks/:id — task detail

        PATCH /api/tasks/:id — update

        DELETE /api/tasks/:id — delete

    Comments:

        POST /api/tasks/:taskId/comments — add comment

        GET /api/tasks/:taskId/comments — list comments

Notes

    This project uses sequelize.sync() to create tables. For production, switch to migrations with sequelize-cli.

    Use a strong JWT_SECRET in production and do not commit .env.

    For AWS: use Amazon RDS for DB, EC2 for backend (or Elastic Beanstalk), S3 + CloudFront for frontend.