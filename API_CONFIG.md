# API Configuration Guide

## Environment Variables

To configure the API base URL professionally, create a `.env` file in the root directory with the following:

```env
# Development
VITE_API_BASE_URL=http://localhost:8000

# Production (replace with your actual production URL)
# VITE_API_BASE_URL=https://api.yourdomain.com

# Staging (replace with your actual staging URL)
# VITE_API_BASE_URL=https://staging-api.yourdomain.com
```

## Usage

The API configuration is now centralized in `src/config/api.ts`. All API calls should use the `API_ENDPOINTS` object:

```typescript
import { API_ENDPOINTS } from '../config/api';

// Instead of: fetch('http://localhost:8000/signup', ...)
// Use: fetch(API_ENDPOINTS.SIGNUP, ...)

// Instead of: fetch(`http://localhost:8000/quiz/${quizId}`, ...)
// Use: fetch(API_ENDPOINTS.GET_QUIZ(quizId), ...)
```

## Benefits

- ✅ **Environment-based configuration** - Different URLs for dev/staging/prod
- ✅ **Centralized management** - All endpoints in one place
- ✅ **Type safety** - TypeScript support for endpoints
- ✅ **Easy deployment** - No code changes needed for different environments
- ✅ **Professional approach** - Industry standard configuration 