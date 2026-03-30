# Deployment Guide (Neon.tech + Render.com)

## 1. Database Setup (Neon.tech)
1. Sign up at [Neon.tech](https://neon.tech/).
2. Create a project and copy the **Connection String** (PostgreSQL).
3. Ensure it includes `sslmode=require`.

## 2. Backend Deployment (Render.com)
1. Push your code to GitHub.
2. Create a **Web Service** on Render.
3. Select the `backend` directory.
4. Set the **Runtime** to `Docker`.
5. Add these **Environment Variables**:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<your-neon-host>/neondb?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: `<your-neon-user>`
   - `SPRING_DATASOURCE_PASSWORD`: `<your-neon-password>`
   - `SPRING_DATASOURCE_DRIVER_CLASS_NAME`: `org.postgresql.Driver`
   - `JWT_SECRET`: `<a-long-random-string>`
   - `ALLOWED_ORIGINS`: `https://your-frontend-url.onrender.com` (Add this *after* deploying frontend)

## 3. Frontend Deployment (Render.com) 
1. Create a **Static Site** on Render.
2. Select the `frontend` directory.
3. **Build Command**: `npm run build`
4. **Publish Directory**: `dist`
5. Add these **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com/api`
   - `VITE_WS_URL`: `wss://your-backend-url.onrender.com/ws-workflow`

## 4. Final Step
Update the `ALLOWED_ORIGINS` in your Backend Render service with your actual Frontend URL to enable secure communication.
