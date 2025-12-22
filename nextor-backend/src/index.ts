import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import { supabase } from './lib/supabaseClient';
import teamRoutes from './routes/participant/team.routes';
import submissionRoutes from './routes/participant/submission.routes';
import notificationRoutes from './routes/participant/notification.routes';
import dashboardRoutes from './routes/participant/dashboard.routes';
import judgeRoutes from './routes/judge/judge.routes';
import adminRoutes from './routes/admin/admin.routes';
import publicRoutes from './routes/public.routes';
import uploadsRoutes from './routes/uploads.routes';
// Scheduler will be loaded dynamically at runtime to avoid static import/type issues
import hackathonRoutes from './routes/admin/hackathon.routes';


// Initialize environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware Setup
// Configure Helmet to avoid overly-restrictive defaults for static asset embedding during local development
app.use(helmet({
    // Disable the default contentSecurityPolicy here (we set more specific rules in production configs)
    contentSecurityPolicy: false,
    // Allow cross-origin resource embedding for uploads (so images served from this server can be used by the frontend)
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true, // Allow cookies to be sent
}));
app.use(morgan('dev')); // Logging requests
app.use(express.json()); // Body parser for JSON requests
app.use(cookieParser()); // Cookie parser for JWT access

// Simple Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        message: 'HackOnX API is running!',
        environment: process.env.NODE_ENV,
        port: PORT 
    });
});

app.use('/api/auth', authRoutes);
// Team routes are mounted under plural and singular for compatibility
app.use('/api/teams', teamRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/notifications', notificationRoutes); 
app.use('/api/event', notificationRoutes);
app.use('/api/participant', dashboardRoutes);

// Judge Routes
app.use('/api/judge', judgeRoutes);

// Admin Routes**
app.use('/api/admin', adminRoutes);

app.use('/api/public', publicRoutes);

// Serve uploaded static files
import path from 'path';
// Serve uploaded static files and set permissive headers for cross-origin embedding
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res) => {
        // Allow the frontend to embed/consume these images from a different origin during development
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        // Mirror CORS for static assets as an extra precaution
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    }
}));

// Uploads API
app.use('/api/uploads', uploadsRoutes);

// Hackathon Management Routes
app.use('/api/admin/hackathons', hackathonRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`⚡️ [server]: Server is running at http://localhost:${PORT}`);
    console.log(`Frontend URL for CORS: ${process.env.FRONTEND_URL}`);
    (async () => {
        try {
            const mod: any = await import('./services/admin/admin.service');
            if (mod && typeof mod.startAnnouncementScheduler === 'function') {
                await mod.startAnnouncementScheduler();
            }
        } catch (e: any) {
            console.error('Failed to start announcement scheduler:', e?.message ?? String(e));
        }
    })();
});