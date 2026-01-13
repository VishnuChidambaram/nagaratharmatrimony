# Deployment Guide

This guide covers the deployment process for the Nagarathar Matrimony application, split into frontend and backend components.

## Frontend (Next.js)

The frontend is optimized for deployment on [Vercel](https://vercel.com), the creators of Next.js.

### Vercel Deployment

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  Select the `frontend-nextjs` directory as the root directory.
4.  Configure Environment Variables in Vercel project settings:
    -   `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://api.yourdomain.com`).
5.  Click **Deploy**.

### Other Platforms

You can also deploy to any hosting provider that supports Node.js or Docker (e.g., Netlify, AWS Amplify, Railway).
Ensure you run `npm run build` to generate the production build and `npm start` to run it.

## Backend (Express.js)

The backend can be deployed to any Node.js hosting environment (e.g., Railway, Render, Heroku, AWS EC2, DigitalOcean).

### General Steps

1.  **Environment Variables**: Ensure all variables from `.env` are set in your hosting provider's configuration.
    -   `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`: Database connection details.
    -   `JWT_SECRET`: Secret key for signing tokens.
    -   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For image uploads.
    -   `EMAIL_USER`, `EMAIL_PASS`: For sending emails.
2.  **Database**:
    -   Ensure your database (TiDB/MySQL) is accessible from the deployment region.
    -   Run any necessary migration scripts if applicable.
3.  **Start Command**:
    -   The start command is usually `npm start` (which runs `node server.js`).

### Database (TiDB Cloud)

The application is configured to work with TiDB Cloud.
1.  Obtain your connection string from the TiDB Cloud console.
2.  Download the CA certificate (`isrgrootx1.pem`) if required for secure connections and place it in the root of the backend directory or ensure the path is correctly referenced in the environment variables/code.

## Verifying Deployment

1.  Check the backend logs to ensure it connected to the database successfully.
2.  Test the API root endpoint (e.g., `https://api.yourdomain.com/`) to see if it responds.
3.  Open the frontend URL and verify it loads and can communicate with the backend (e.g., try logging in).
