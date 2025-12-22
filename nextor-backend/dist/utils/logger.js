"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Simple console-based logger wrapper
const isProd = process.env.NODE_ENV === "production";
const logger = {
    info: (...args) => console.log("[INFO]", ...args),
    warn: (...args) => console.warn("[WARN]", ...args),
    error: (...args) => console.error("[ERROR]", ...args),
    debug: (...args) => {
        if (!isProd) {
            // Use console.debug when available
            // eslint-disable-next-line no-console
            console.debug("[DEBUG]", ...args);
        }
    },
};
exports.default = logger;
