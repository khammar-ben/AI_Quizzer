# 🚀 Hosting Guide - Quizzer Genesis Forge

Your project is now **production-ready** with professional configuration! Here's what you need to do to host it:

## ✅ **What's Already Configured**

### **Frontend (React/Vite)**
- ✅ Environment-based API configuration
- ✅ Professional URL management
- ✅ Build optimization ready
- ✅ CORS handling

### **Backend (FastAPI)**
- ✅ Environment-based configuration
- ✅ Security settings
- ✅ Database connection management
- ✅ API key management

## 🔧 **Environment Variables Setup**

### **Frontend (.env file in root directory)**
```env
# Development
VITE_API_BASE_URL=http://localhost:8000

# Production (replace with your actual API URL)
VITE_API_BASE_URL=https://api.yourdomain.com
```

### **Backend (.env file in backend directory)**
```env
# Environment
ENVIRONMENT=production

# Security (CHANGE THESE!)
SECRET_KEY=your-super-secure-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here

# Database
MONGO_URI=mongodb://your-mongodb-connection-string
DATABASE_NAME=quizzer_db

# CORS (your frontend domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Server
HOST=0.0.0.0
PORT=8000
```

## 🌐 **Hosting Options**

### **Option 1: Vercel (Frontend) + Railway/Render (Backend)**
1. **Frontend**: Deploy to Vercel
   - Connect your GitHub repo
   - Set `VITE_API_BASE_URL` environment variable
   - Deploy automatically

2. **Backend**: Deploy to Railway/Render
   - Connect your GitHub repo
   - Set all backend environment variables
   - Deploy automatically

### **Option 2: Netlify (Frontend) + Heroku (Backend)**
1. **Frontend**: Deploy to Netlify
   - Connect your GitHub repo
   - Set environment variables
   - Deploy

2. **Backend**: Deploy to Heroku
   - Connect your GitHub repo
   - Set environment variables
   - Deploy

### **Option 3: AWS/GCP/Azure**
- Use EC2/Compute Engine/Virtual Machines
- Set up MongoDB Atlas for database
- Configure environment variables
- Set up reverse proxy (nginx)

## 📦 **Build Commands**

### **Frontend**
```bash
npm run build
```
This creates a `dist` folder ready for deployment.

### **Backend**
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🔒 **Security Checklist**

- [ ] Change `SECRET_KEY` to a secure random string
- [ ] Set proper `ALLOWED_ORIGINS` for CORS
- [ ] Use HTTPS in production
- [ ] Set up proper MongoDB authentication
- [ ] Secure your OpenAI API key
- [ ] Enable rate limiting (optional)

## 🗄️ **Database Setup**

### **MongoDB Atlas (Recommended)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Set `MONGO_URI` environment variable

### **Local MongoDB**
- Install MongoDB locally
- Use `mongodb://localhost:27017/`

## 🚀 **Quick Deploy Steps**

1. **Prepare Environment Variables**
   ```bash
   # Frontend
   echo "VITE_API_BASE_URL=https://your-api-domain.com" > .env
   
   # Backend
   echo "ENVIRONMENT=production" > backend/.env
   echo "SECRET_KEY=your-secret-key" >> backend/.env
   # ... add other variables
   ```

2. **Deploy Backend First**
   - Deploy to your chosen platform
   - Get the API URL

3. **Update Frontend API URL**
   - Set `VITE_API_BASE_URL` to your backend URL

4. **Deploy Frontend**
   - Deploy to your chosen platform

## 🎯 **Recommended Hosting Stack**

- **Frontend**: Vercel (free tier available)
- **Backend**: Railway (free tier available)
- **Database**: MongoDB Atlas (free tier available)
- **Domain**: Your own domain (optional)

## 🔍 **Testing After Deployment**

1. Test user registration/login
2. Test quiz creation
3. Test quiz taking
4. Test all features work with production URLs

## 📞 **Need Help?**

If you encounter issues:
1. Check environment variables are set correctly
2. Verify CORS settings match your domains
3. Check MongoDB connection
4. Review server logs for errors

Your project is now **enterprise-ready** with professional configuration management! 🎉 