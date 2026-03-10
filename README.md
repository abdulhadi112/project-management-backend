# Project Management System

A Project Management System built with Node.js and Express, designed to help teams and individuals manage projects, tasks, and collaboration efficiently.

## Features

- **User Authentication**
  - Registration with email verification
  - Login with JWT-based authentication
  - Password reset via email
  - Secure password hashing (bcrypt)
  - Role-based access control (e.g., MEMBER, ADMIN)
- **Project & Task Management**
  - Create, update, and delete projects
  - Assign and manage tasks within projects
  - Role assignment for users
- **Profile Management**
  - View and update user profiles
  - Upload and manage profile pictures (Cloudinary integration)
- **Email Notifications**
  - Email verification and password reset emails
- **File Uploads**
  - Multiple file uploads with support for avatars and attachments
- **API Structure**
  - Organized controllers, models, routes, and middlewares
  - Consistent API response structure
- **Security**
  - Environment variable management with `.env`
  - CORS configuration
  - Secure cookies for tokens
---

## Project Structure
```
├── .env.sample                   # Sample environment configuration
├── package.json                  # Project dependencies
├── project-log.md                # Development log
├── public/
│   └── images/                   # Uploaded images storage
├── src/
│   ├── app.js                    # Express app configuration
│   ├── index.js                  # Server entry point
│   ├── controllers/              # Request handlers
│   │   ├── auth.controllers.js   # Authentication logic
│   │   ├── project.controllers.js
│   │   ├── task.controllers.js
│   │   └── note.controllers.js
│   ├── db/
│   │   └── connect-db.js         # MongoDB connection
│   ├── middlewares/              # Custom middlewares
│   │   └── multer.middlewares.js # File upload handling
│   ├── models/                   # Mongoose schemas
│   ├── passport/                 # Passport.js strategies
│   ├── routes/                   # API routes
│   ├── utils/                    # Utility functions
│   │   ├── asyncHandler.js       # Async error handler
│   │   ├── api-error.js          # Custom error class
│   │   ├── api-response.js       # Standard response format
│   │   ├── cloudinary.js         # Cloudinary integration
│   │   └── sendMail.js           # Email service
│   └── validators/               # Request validation
└── multipleUploadCheck.js        # File upload testing
```
---
## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB

### Authentication
- **JWT** (jsonwebtoken) - Token-based authentication
- **bcryptjs** - Password hashing
- **Passport.js** - Authentication middleware
- **crypto** - Token generation

### File Management
- **Multer** - Multipart form data handling
- **Cloudinary** - Cloud-based image/file storage

### Email
- **Nodemailer** - Email sending
- **Mailgen** - Email template generation

### Utilities
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **express-validator** - Request validation

---
## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Email service credentials (Gmail, SendGrid, Mailtrap, etc.)

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd "Week 12 - Project Management System"
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.sample` to `.env` and fill in your credentials

4. **Start the server**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

---
## 🔑 API Endpoints

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |
| GET | `/verify/:token` | Verify email | No |
| POST | `/resend-verification` | Resend verification email | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password/:token` | Reset password | No |
| POST | `/change-password` | Change password | Yes |
| POST | `/refresh-token` | Refresh access token | No |
| GET | `/profile` | Get user profile | Yes |
| PATCH | `/assign-role/:userId` | Assign role to user | Yes (Admin) |

### Project Routes (`/api/v1/projects`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create project | Yes (Admin) |
| GET | `/` | Get all projects | Yes |
| GET | `/:id` | Get project by ID | Yes |
| PATCH | `/:id` | Update project | Yes |
| DELETE | `/:id` | Delete project | Yes (Admin) |

### Task Routes (`/api/v1/tasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create task | Yes |
| GET | `/` | Get all tasks | Yes |
| GET | `/:id` | Get task by ID | Yes |
| PATCH | `/:id` | Update task | Yes |
| DELETE | `/:id` | Delete task | Yes |

---
---

## 🔐 Authentication Flow

### 1. Registration Process
```
User Registration
    ↓
Email Verification Token Generated
    ↓
Verification Email Sent
    ↓
User Clicks Verification Link
    ↓
Email Verified → Account Activated
```

### 2. Login Process
```
User Login (email + password)
    ↓
Credentials Validated
    ↓
Email Verification Check
    ↓
Access Token (2h) + Refresh Token (30d) Generated
    ↓
Tokens Stored in HTTP-Only Cookies
    ↓
User Logged In
```

### 3. Password Reset Process
```
Forgot Password Request
    ↓
Reset Token Generated
    ↓
Reset Email Sent
    ↓
User Clicks Reset Link
    ↓
New Password Submitted
    ↓
Password Updated
```

---
## 🔒 Security Features

- ✅ **Password Hashing** with bcrypt 
- ✅ **JWT Tokens** with configurable expiration
- ✅ **HTTP-Only Cookies** for secure token storage
- ✅ **Token Validation** for all protected routes
- ✅ **Email Verification** before account access
- ✅ **Time-Limited Tokens** for password reset
- ✅ **Role-Based Access Control** (RBAC)
- ✅ **Secure File Upload** validation
- ✅ **Input Validation** using express-validator

---
## 🙏 Acknowledgments

- Cohort for the learning opportunity
- Express.js community
- MongoDB documentation
- Cloudinary for file storage solutions

---


Made with ❤️ by AbdulHadi Bavani
