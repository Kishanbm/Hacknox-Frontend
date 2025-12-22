"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const team_routes_1 = __importDefault(require("./routes/participant/team.routes"));
const submission_routes_1 = __importDefault(require("./routes/participant/submission.routes"));
const notification_routes_1 = __importDefault(require("./routes/participant/notification.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/participant/dashboard.routes"));
const judge_routes_1 = __importDefault(require("./routes/judge/judge.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin/admin.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
// Scheduler will be loaded dynamically at runtime to avoid static import/type issues
const hackathon_routes_1 = __importDefault(require("./routes/admin/hackathon.routes"));
// Initialize environment variables from .env
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middleware Setup
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allow cookies to be sent
}));
app.use((0, morgan_1.default)('dev')); // Logging requests
app.use(express_1.default.json()); // Body parser for JSON requests
app.use((0, cookie_parser_1.default)()); // Cookie parser for JWT access
// Simple Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        message: 'HackOnX API is running!',
        environment: process.env.NODE_ENV,
        port: PORT
    });
});
app.use('/api/auth', auth_routes_1.default);
// Team routes are mounted under plural and singular for compatibility
app.use('/api/teams', team_routes_1.default);
app.use('/api/team', team_routes_1.default);
app.use('/api/submissions', submission_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/event', notification_routes_1.default);
app.use('/api/participant', dashboard_routes_1.default);
// Judge Routes
app.use('/api/judge', judge_routes_1.default);
// Admin Routes**
app.use('/api/admin', admin_routes_1.default);
app.use('/api/public', public_routes_1.default);
// Hackathon Management Routes
app.use('/api/admin/hackathons', hackathon_routes_1.default);
// Start Server
app.listen(PORT, () => {
    console.log(`⚡️ [server]: Server is running at http://localhost:${PORT}`);
    console.log(`Frontend URL for CORS: ${process.env.FRONTEND_URL}`);
    (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const mod = yield Promise.resolve().then(() => __importStar(require('./services/admin/admin.service')));
            if (mod && typeof mod.startAnnouncementScheduler === 'function') {
                mod.startAnnouncementScheduler();
            }
        }
        catch (e) {
            console.warn('Announcement scheduler not started:', (_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : String(e));
        }
    }))();
});
