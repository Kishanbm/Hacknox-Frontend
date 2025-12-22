"use strict";
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
exports.verifyRecaptcha = void 0;
const axios_1 = __importDefault(require("axios"));
const jwt_1 = require("../utils/jwt"); // Reusing JWT utility for env var access
const RECAPTCHA_SECRET = (0, jwt_1.getEnvVar)("RECAPTCHA_SECRET_KEY");
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const MIN_SCORE = 0.5; // Threshold for V3: adjust as needed
/**
 * Middleware to verify the reCAPTCHA token sent from the frontend.
 */
const verifyRecaptcha = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { recaptchaToken } = req.body;
    if (!RECAPTCHA_SECRET) {
        console.warn("RECAPTCHA_SECRET_KEY is missing. Bypassing reCAPTCHA check.");
        return next(); // Bypass in dev if key is missing, but required for production
    }
    if (!recaptchaToken) {
        return res.status(400).json({ message: "reCAPTCHA token is required." });
    }
    try {
        const response = yield axios_1.default.post(RECAPTCHA_VERIFY_URL, null, {
            params: {
                secret: RECAPTCHA_SECRET,
                response: recaptchaToken,
            },
        });
        const { success, score } = response.data;
        const scoreVal = typeof score === 'number' ? score : 0;
        if (!success || scoreVal < MIN_SCORE) {
            console.warn(`reCAPTCHA failed: Score=${score}, IP=${req.ip}`);
            return res.status(403).json({
                message: "Bot verification failed. Please try again.",
                code: "RECAPTCHA_FAILED"
            });
        }
        console.log(`reCAPTCHA verified. Score: ${score}`);
        next();
    }
    catch (error) {
        console.error("reCAPTCHA verification API error:", error.message);
        return res.status(500).json({ message: "Internal verification service failed." });
    }
});
exports.verifyRecaptcha = verifyRecaptcha;
