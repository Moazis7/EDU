# 🌐 Ngrok Setup Guide for EduPlatform

## 📋 Prerequisites

1. **Install ngrok** from [ngrok.com](https://ngrok.com)
2. **Sign up** for a free ngrok account
3. **Authenticate** ngrok with your auth token

## 🚀 Quick Start

### Method 1: Using Batch Scripts (Recommended)

1. **Start Backend with Ngrok:**
   ```bash
   # Double click or run:
   start-ngrok.bat
   ```

2. **Start Frontend:**
   ```bash
   # In a new terminal, run:
   start-frontend.bat
   ```

### Method 2: Manual Setup

1. **Start Backend Server:**
   ```bash
   node server.js
   ```

2. **Start Ngrok Tunnel:**
   ```bash
   ngrok http 3009
   ```

3. **Start Frontend:**
   ```bash
   cd edu
   npm start
   ```

## ⚙️ Configuration

### Backend Configuration
The backend is already configured to accept ngrok URLs. CORS settings in `server.js` will automatically allow any `ngrok-free.app` domain.

### Frontend Configuration
Create a `.env` file in the `edu` directory:

```env
REACT_APP_API_BASE_URL=https://YOUR_NGROK_URL.ngrok-free.app/api
REACT_APP_NGROK_URL=https://YOUR_NGROK_URL.ngrok-free.app
```

## 🔄 Updating Ngrok URL

When you get a new ngrok URL:

1. **Copy the new URL** from ngrok terminal
2. **Update the `.env` file** in the `edu` directory
3. **Restart the frontend** if it's running

## 🌍 Accessing Your App

- **Frontend:** http://localhost:3007
- **Backend API:** https://your-ngrok-url.ngrok-free.app/api
- **Ngrok Dashboard:** http://localhost:4040

## 🔧 Troubleshooting

### CORS Errors
- ✅ Already fixed in `server.js`
- ✅ Any ngrok URL will be automatically allowed

### Port Already in Use
```bash
# Kill process on port 3009
netstat -ano | findstr :3009
taskkill /PID <PID> /F

# Kill process on port 3007
netstat -ano | findstr :3007
taskkill /PID <PID> /F
```

### Ngrok Not Working
1. Check if ngrok is authenticated
2. Verify your auth token: `ngrok config check`
3. Restart ngrok tunnel

## 📱 Testing on Mobile

1. Get your ngrok URL
2. Update frontend `.env` file
3. Access from mobile browser: `https://your-ngrok-url.ngrok-free.app`

## 🔒 Security Notes

- ⚠️ Ngrok URLs are public and accessible to anyone
- 🔐 Don't use ngrok for production
- 🛡️ Use only for development and testing

## 📞 Support

If you encounter issues:
1. Check the console logs
2. Verify all URLs are correct
3. Ensure both servers are running
4. Check ngrok status at http://localhost:4040 