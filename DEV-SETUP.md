# Tutor Connect - Development Setup

This guide will help you set up and run both the frontend and backend applications for development.

## Prerequisites

- Node.js (version 18.0.0 or higher)
- npm (version 8.0.0 or higher)
- MySQL database

## Quick Start

### Option 1: Using npm scripts (Recommended)

1. **Start Backend Only:**
   ```bash
   npm run dev:backend
   ```
   This will start the backend server on `http://localhost:5000`

2. **Start Frontend Only:**
   ```bash
   npm run dev
   ```
   This will start the frontend server on `http://localhost:3000`

3. **Start Both Applications:**
   ```bash
   npm run dev:both
   ```
   This will start both backend and frontend simultaneously

### Option 2: Using convenience scripts

**Windows Batch File:**
```bash
start-dev.bat
```

**PowerShell Script:**
```powershell
.\start-dev.ps1
```

### Option 3: Manual setup

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup (in a new terminal):**
   ```bash
   npm install
   npm run dev
   ```

## Application URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

## Environment Configuration

### Backend Environment
The backend uses the `.env` file in the `backend/` directory. Make sure it's configured with:
- Database connection details
- JWT secret
- Email configuration (if needed)

### Frontend Environment
The frontend uses `.env.local` file in the root directory. It should contain:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`

## Available Scripts

### Root Directory Scripts
- `npm run dev` - Start frontend development server
- `npm run dev:backend` - Start backend development server
- `npm run dev:both` - Start both frontend and backend
- `npm run build` - Build frontend for production
- `npm run start` - Start frontend production server

### Backend Scripts (in backend/ directory)
- `npm run dev` - Start backend with nodemon (auto-restart)
- `npm start` - Start backend production server
- `npm run build` - Install production dependencies

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
1. Check what's running on the port: `netstat -ano | findstr :3000` (or :5000)
2. Kill the process using the PID: `taskkill /PID <PID> /F`

### Database Connection Issues
1. Ensure MySQL is running
2. Check the database configuration in `backend/.env`
3. Verify the database exists and is accessible

### Dependencies Issues
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. For frontend, use `npm install --legacy-peer-deps` if there are peer dependency conflicts

## Development Workflow

1. Start both applications using `npm run dev:both`
2. Make changes to the code
3. The frontend will hot-reload automatically
4. The backend will restart automatically with nodemon
5. Test your changes in the browser

## Project Structure

```
tutor-connect-wbs-14-main/
├── src/                    # Frontend source code (Next.js)
├── backend/               # Backend source code (Express.js)
├── public/                # Static assets
├── package.json           # Frontend dependencies and scripts
├── backend/package.json   # Backend dependencies and scripts
├── start-dev.bat         # Windows batch file to start both
├── start-dev.ps1         # PowerShell script to start both
└── DEV-SETUP.md          # This file
```

## Need Help?

If you encounter any issues:
1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure the database is running and accessible
4. Check the environment configuration files
