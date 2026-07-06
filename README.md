# Workforce Management System

Workforce Management System is a full-stack MERN application that helps businesses manage employees, shift scheduling, attendance, leave requests, and public holidays through a single web-based platform. The system is based on a real retail and food-service environment using Domino's as the case study. Employees are created by the Store Manager, and access to the system is controlled through secure role-based authentication and authorisation.

**Live Demo:** https://workforce-management-system-1.onrender.com

---

# Tech Stack

The application is built using the MERN stack (MongoDB, Express.js, React, and Node.js).

### Frontend
- React (Vite)
- React Router
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas (Mongoose)
 
### Authentication
- JSON Web Tokens (JWT)
- bcrypt

### Deployment
- Frontend: Render Static Site
- Backend: Render Web Service
- Database: MongoDB Atlas

The backend is organised using Mongoose models, Express routes, and middleware to keep the code modular and maintainable..

---

# User Roles

## Crew

Crew members can:

- Log in securely
- View their dashboard
- View the full team shift roster
- Submit leave requests
- View their own leave history

## Training Manager

Training Managers have all Crew permissions and can also:

- Manage employee records
- Clock employees in and out
- View daily attendance records

## Store Manager

Store Managers have full access and can:

- Create employee accounts
- Manage employee records
- Create and manage shift schedules
- Review leave requests
- Approve or reject leave requests
- Manage attendance records
- View public holidays

---

# API Endpoints

## Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| POST | `/login` | Login and receive JWT | Employees |
| GET | `/me` | Get logged-in user profile | Authenticated |
| POST | `/logout` | Logout | Authenticated |

---

## Employees (`/api/employees`)

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/` | Get all employees | Authenticated |
| GET | `/:id` | Get employee details | Authenticated |
| POST | `/` | Add employee | Store Manager |
| PUT | `/:id` | Update employee | Store Manager |
| DELETE | `/:id` | Delete employee | Store Manager |

---

## Shifts (`/api/shifts`)

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/` | View shift roster | Authenticated |
| POST | `/` | Create a shift | Store Manager |
| PUT | `/:id` | Update a shift | Store Manager |
| DELETE | `/:id` | Delete a shift | Store Manager |

---

## Attendance (`/api/attendance`)

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/` | View attendance records | Authenticated |
| POST | `/clock-in` | Clock in an employee | Store Manager, Training Manager |
| PUT | `/clock-out` | Clock out an employee | Store Manager, Training Manager |

---

## Leave Requests (`/api/leaves`)

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/` | View leave requests | Authenticated |
| POST | `/` | Submit a leave request | Authenticated |
| PUT | `/:id/review` | Approve or reject a leave request | Store Manager |

---

## Holidays (`/api/holidays`)

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/:countryCode/:year` | Retrieve public holidays using the Nager.Date API | Authenticated |

---

# Security Features

The application includes several security measures to protect user accounts and application data.

### Authentication and Authorisation (JWT)

Every protected route verifies the user's JSON Web Token before granting access. Role-based middleware then ensures users can only access features that match their assigned role.

### Password Security (bcrypt)

Passwords are securely hashed before being stored in the database, ensuring that plain text passwords are never saved.

### Role-Based Access Control

Different user roles are enforced across both the frontend and backend to prevent unauthorised access to restricted features.

### Input Validation

Incoming data is validated before reaching the database to ensure required fields are present and contain valid values.

### Input Sanitisation

User input such as employee names, notes, and leave reasons is sanitised before being stored to reduce the risk of malicious input.

---

# Project Structure

```text
workforce-management-system/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        └── App.jsx
```

---

# How to Run This Project Locally

## Prerequisites

- Node.js v18 or later
- MongoDB Atlas account

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/sangeethashankar03/workforce-management-system.git
cd workforce-management-system
```

---

## Step 2: Configure Backend Environment Variables

Create a `.env` file inside the `backend` folder.

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

---

## Step 3: Install Backend Dependencies

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```
http://localhost:5000
```

---

## Step 4: Configure Frontend Environment Variables

Create a `.env` file inside the `frontend` folder.

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Step 5: Install Frontend Dependencies

Open a new terminal.

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```
http://localhost:5173
```

---

## Step 6: Open the Application

Visit:

```
http://localhost:5173
```

Employees must first be created by the Store Manager before they can access the system. Once an employee account has been created, they can log in using their assigned credentials.

---

# Deployment

The application is deployed using **Render**.

### Frontend

The React application is hosted as a Render Static Site. The production build communicates with the backend using the `VITE_API_URL` environment variable.

### Backend

The Express API is deployed as a Render Web Service. Environment variables are configured securely through the Render dashboard, allowing the application to connect to MongoDB Atlas without exposing sensitive information.

### Database

MongoDB Atlas is used as the cloud-hosted database.

---

# Challenges and Solutions

### API Requests Returning 404

The frontend initially sent requests to the backend root URL instead of the `/api` endpoint, causing every request to fail. This was resolved by updating the Axios base URL and the `VITE_API_URL` environment variable.

### React Routes Returning 404

Refreshing pages such as `/dashboard` or `/shifts` returned a 404 error because Render searched for physical files instead of allowing React Router to handle navigation. This was fixed by adding a rewrite rule that redirects all requests to `index.html`.

### Incorrect Shift Action

The shift management page originally labelled a delete action as "Edit." The interface was updated to accurately reflect its behaviour, while a dedicated edit feature has been planned for a future release.

### Shift Visibility

Crew members initially received only their own shifts from the backend, making the roster appear incomplete. The API was updated so all employees can view the full shift roster while only managers can create, edit, or delete shifts.

---

# Limitations

- CORS currently accepts requests from any origin and can be further restricted using the `CLIENT_URL` environment variable in production.
- A dedicated edit shift feature has not yet been implemented. Managers currently delete and recreate shifts when changes are required.

---

# Key Learnings

Developing this project strengthened my understanding of full-stack web development using the MERN stack. It provided practical experience implementing role-based authentication, connecting a React frontend with an Express backend, working with MongoDB Atlas, and deploying both frontend and backend services on Render. Solving deployment issues involving routing, API configuration, and environment variables also improved my understanding of how web applications behave in a production environment.

---

# Future Improvements

- Implement a dedicated edit shift feature.
- Restrict CORS to trusted origins only.
- Add email notifications for leave approvals.
- Generate attendance and leave reports.
- Improve dashboard analytics with charts and summaries.

---

# Conclusion

Workforce Management System is a secure, role-based staff management platform developed using the MERN stack. The application provides employee management, shift scheduling, attendance tracking, leave management, and public holiday integration within a single system. Building and deploying the project provided valuable practical experience in developing, securing, and deploying a full-stack web application while solving real-world development and deployment challenges.
