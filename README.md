# Nagarathar Matrimony

A full-stack matrimony application tailored for the Nagarathar community. This project consists of a Next.js frontend and an Express.js backend.

## Architecture

The project is divided into two main parts:

-   **Frontend (`frontend-nextjs`)**: Built with [Next.js](https://nextjs.org), utilizing React for UI components and Tailwind CSS for styling.
-   **Backend (`backend-express`)**: Built with [Express.js](https://expressjs.com), handling API requests, authentication, and database interactions.

## Prerequisites

-   Node.js (v18 or higher recommended)
-   npm or yarn
-   MySql/TiDB database

## Quick Start

To get the entire application running locally:

1.  **Backend Setup**:
    -   Navigate to `backend-express`: `cd backend-express`
    -   Install dependencies: `npm install`
    -   Configure `.env` (see `backend-express/README.md`)
    -   Start the server: `npm start` (Runs on port 5000 by default)

2.  **Frontend Setup**:
    -   Navigate to `frontend-nextjs`: `cd frontend-nextjs`
    -   Install dependencies: `npm install`
    -   Configure `.env` (see `frontend-nextjs/README.md`)
    -   Start the development server: `npm run dev` (Runs on port 3000 by default)

3.  Access the application at `http://localhost:3000`.

## Documentation

-   [Backend Documentation](./backend-express/README.md)
-   [Frontend Documentation](./frontend-nextjs/README.md)
-   [Deployment Guide](./DEPLOYMENT.md)
