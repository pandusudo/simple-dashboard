# Simple Dashboard

🚀 **Simple Dashboard API is a REST-API built with NodeJS (Typescript), Express, PostgreSQL database, and Prisma as the ORM.**

# Project Setup Guide

This guide will walk you through setting up a Simple Dashboard Project in your local.

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v10 or higher)

## Project Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/pandusudo/simple-dashboard.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd simple-dashboard
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Set up environment variables:**
   Execute the `setup-environment.sh` file to setup the environment variables. Change the permission of the sh file then execute the sh file:

   ```bash
   chmod +x setup-environment.sh
   ./setup-environment.sh
   ```

   **OR**

   Create a `.env` file in the root of your project and add the following variables:

   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/your-database-name
   ```

   Replace `username`, `password`, and `your-database-name` with your PostgreSQL credentials.

5. **Run database migrations:**

   ```bash
   npx prisma migrate dev
   ```

6. **Start the server:**

   ```bash
   npm run dev
   ```

   This will start the development server with automatic TypeScript compilation and nodemon for hot-reloading.

## Database Schema

![Database Schema](./docs/database-schema.png)

### User Table

Store data related to user.

- **Relationships:**
  - One-to-Many with `Session` table: A user can have multiple sessions.
  - One-to-Many with `UserToken` table: A user can have multiple tokens.

### Session Table

Store data related to user session to keep track of user session history.

- **Relationships:**
  - Many-to-One with `User` table: Many sessions belong to one user.

### UserToken Table

Store data related to email verification token including the active status and expiry date.

- **Relationships:**
  - Many-to-One with `User` table: Many tokens belong to one user.

## Postman Documentation

Explore the API using [Postman](https://www.postman.com/):

[![Run in Postman](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/8908403/2s9Ykrc1A8)

**NOTE: Please make sure to change the environment in Postman to Production**
