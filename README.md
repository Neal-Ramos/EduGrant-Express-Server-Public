# EduGrant Express Server

A backend server built with Express and TypeScript for the EduGrant application.

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Features](#features)  
3. [Tech Stack](#tech-stack)  
4. [Requirements](#requirements)  
5. [Setup & Installation](#setup--installation)  
6. [Usage](#usage)  
7. [API Endpoints](#api-endpoints)  
8. [Database / ORM](#database--orm)  
9. [Testing](#testing)  
10. [Deployment](#deployment)  
11. [Contributing](#contributing)  
12. [License](#license)

---

## Project Overview

EduGrant‑Express‑Server‑Public serves as the backend for EduGrant. It handles routing, authentication, data persistence, and business logic. 

---

## Features

- RESTful API endpoints to manage grant‑related data  
- Uses TypeScript for better type safety  
- Structured folder layout for maintainability  
- Integration with a database via ORM (Prisma)  
- Potential for middleware (authentication, validation, etc.)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime / Server | Node.js + Express |
| Language | TypeScript |
| ORM / Database | Prisma |
| Others | (You can add: e.g. JWT, validation libs, logger, etc.) |

---

## Requirements

Make sure you have:

- Node.js (version X or higher)  
- npm or Yarn  
- A supported database (e.g. PostgreSQL, MySQL, SQLite, etc.) depending on your Prisma setup  
- Environment variables configured (see below)

---

## Setup & Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Neal-Ramos/EduGrant-Express-Server-Public.git
   cd EduGrant-Express-Server-Public
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables. You might need a `.env` file. Example variables:

   ```
   DATABASE_URL=your_database_connection_string
   PORT=3000
   JWT_SECRET=your_jwt_secret
   ```

4. Run database migrations (if using Prisma):

   ```bash
   npx prisma migrate dev
   ```

5. Start the server:

   - For development:

     ```bash
     npm run dev
     ```

   - For production build:

     ```bash
     npm run build
     npm start
     ```

---

## Usage

Once the server is running, you can access it at `http://localhost:<PORT>` (default port if you set it up). Use an API client like Postman or curl to hit endpoints.

---

## API Endpoints

*(Fill these out based on your actual routes)*

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/auth/login` | Login a user |
| `POST` | `/auth/register` | Register a new user |
| `GET` | `/grants` | Get list of grants |
| `GET` | `/grants/:id` | Get details of a specific grant |
| `POST` | `/grants` | Create a new grant |
| `PUT` | `/grants/:id` | Update a grant |
| `DELETE` | `/grants/:id` | Delete a grant |

---

## Database / ORM

This project uses **Prisma** for database modeling.  

- Schema file can be found in the `prisma/` folder  
- Migrations are handled via Prisma CLI  
- Make sure your `DATABASE_URL` is correct in `.env`

---

## Testing

*(If you have tests; if not, you can remove or fill in later.)*

- Use `npm test` to run tests  
- Write unit tests for services & controllers  
- Use integration tests for checking end-to-end routes

---

## Deployment

To deploy:

- Build the app: `npm run build`  
- Host on a server (e.g. Heroku, AWS, DigitalOcean)  
- Set environment variables on the host  
- Use process manager (e.g. PM2) if needed

---

## Contributing

Contributions are welcome! Here’s how you can help:

1. Fork the repo  
2. Create a new branch: `git checkout -b feature/your-feature`  
3. Make your changes & add tests/documentation  
4. Commit your changes & push branch  
5. Create a Pull Request

Please follow the existing coding style. Ensure your code is well‑documented.

---

## License

Specify the license you want to use (e.g. MIT, Apache 2.0, etc.).
