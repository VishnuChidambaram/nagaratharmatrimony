# Backend - Nagarathar Matrimony

The backend for the Nagarathar Matrimony application, built with Express.js. It handles user authentication, profile management, and database interactions using Sequelize with MySQL/TiDB.

## Setup and Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root of the `backend-express` directory with the following variables:
    ```env
    PORT=5000
    NODE_ENV=development
    
    # Database Configuration (TiDB or MySQL)
    DB_HOST=your_db_host
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    DB_PORT=4000
    
    # JWT Secret
    JWT_SECRET=your_jwt_secret_key
    
    # Cloudinary (Image Uploads)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    
    # Email (Nodemailer)
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    
    # Frontend URL (CORS)
    FRONTEND_URL=http://localhost:3000,https://your-production-url.com
    ```

3.  **Run the Server**:
    ```bash
    npm start
    ```

## API Documentation

### Authentication (`/auth`)
-   `POST /register`: Register a new user.
-   `POST /login`: Log in an existing user.
-   `POST /logout`: Log out the current user.
-   `GET /check-auth`: Verify if the user is authenticated.

### User Management (`/user`)
-   `GET /admin/users`: Get all users (Admin only).
-   `GET /user/:id`: Get a specific user's profile.
-   `PUT /user/:id`: Update a user's profile.
-   `DELETE /user/:id`: Delete a user.

### Update Requests (`/update-request`)
-   `POST /update-request`: Submit a profile update request.
-   `GET /update-requests`: Get all pending update requests (Admin only).
-   `POST /update-request/:id/approve`: Approve an update request.
-   `POST /update-request/:id/reject`: Reject an update request.

### Notifications (`/notification`)
-   `GET /notifications`: Get notifications for the current user.
-   `PUT /notifications/mark-read`: Mark notifications as read.

### Uploads (`/upload`)
-   `POST /upload`: Upload an image (handled via Multer/Cloudinary).

## Testing

Run the automated test suite using Jest:
```bash
npm test
```
This will run unit and integration tests including authentication and user flows.
