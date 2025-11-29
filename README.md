# Blinkfeed.

## Description

AI-powered news summarization platform for global tax and regulatory updates. Automatically aggregates articles from multiple sources, generates summaries, highlights impacted countries on an interactive map, and lets users save, organize, and listen to tax-related articles quickly without reading full blogs.

## Visuals

<p align="center">
  <img width="90%" src="https://github.com/user-attachments/assets/5567a6ee-1c9c-40cb-86eb-58b94e010ed5" alt="Blinkfeed - Home page"/>
  
  <img width="45%" src="https://github.com/user-attachments/assets/5f87935e-f803-4c8e-813a-82c1513d911d" alt="Blinkfeed - For you"/>
  
  <img width="45%" src="https://github.com/user-attachments/assets/c9e460f0-f880-44ea-ade7-95627118434f" alt="Blinkfeed - Explore"/>

  <img width="45%" src="https://github.com/user-attachments/assets/c9e460f0-f880-44ea-ade7-95627118434f" alt="Blinkfeed - Article details 1"/>

  <img width="45%" src="https://github.com/user-attachments/assets/c9e460f0-f880-44ea-ade7-95627118434f" alt="Blinkfeed - Article details 2"/>
</p>

## Attribution

**Created by:**

- Marin Juršić
- Luka Ivelić
- Antonio Brkić
- Nikola Greb
- Jakov Jakovac

**Created on SheepAI hackathon 29/11/2025**

## License [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-cyan.svg

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

## How to run

### Prerequisites

- Node.js 22.19.0+ (or latest LTS)
- npm
- MySQL (local or remote)

### Startup flow

- Start the backend first (so API is available), then start the frontend.

### Running the backend

1. Database (MySQL)

- Create database and user (example):
  sudo -u postgres psql -c "CREATE USER disccount WITH PASSWORD 'secret';"
  sudo -u postgres psql -c "CREATE DATABASE disccount OWNER disccount;"
- Adjust names/passwords as needed.

2. Backend setup

- Copy/configure environment variables (backend expects):
  - SPRING_DATASOURCE_URL (e.g. jdbc:postgresql://localhost:5432/disscount)
  - SPRING_DATASOURCE_USERNAME
  - SPRING_DATASOURCE_PASSWORD
  - JWT_SECRET (strong random string)
- You can copy `.env.example` to `.env` in the backend folder if present.
- Build and run:
  cd backend
  mvn clean install
  mvn spring-boot:run
- The backend starts on port 8080 by default. Open API docs at:
  http://localhost:8080/api-docs

### Running the frontend

3. Frontend setup

- Install and run:
  cd frontend
  npm install
  npm run dev
- The frontend runs on port 3000 by default: http://localhost:3000
