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
exports.AntivirusService = void 0;
const form_data_1 = __importDefault(require("form-data"));
const crypto_1 = require("crypto");
const jwt_1 = require("../utils/jwt"); // Use our existing helper
const logger_1 = __importDefault(require("../utils/logger"));
class AntivirusService {
    /**
     * Returns true if the buffer is definitely infected,
     * false otherwise (including any VT errors).
     */
    static isInfected(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.API_KEY) {
                logger_1.default.error("[AntivirusService] API key not set");
                throw new Error("VIRUS_TOTAL_API_KEY not set");
            }
            const headers = {
                "x-apikey": this.API_KEY,
                accept: "application/json",
            };
            // 1) Compute SHA256
            const sha256 = (0, crypto_1.createHash)("sha256").update(buffer).digest("hex");
            // 2) Check for an existing report
            try {
                const existing = yield fetch(`${this.VT_BASE}/files/${sha256}`, {
                    method: "GET",
                    headers,
                });
                if (existing.ok) {
                    logger_1.default.info("[AntivirusService] existing report found – assuming clean");
                    return false;
                }
                if (existing.status !== 404) {
                    logger_1.default.warn("[AntivirusService] unexpected status – treating as clean", { status: existing.status });
                    return false;
                }
            }
            catch (err) {
                logger_1.default.warn("[AntivirusService] error fetching existing report – treating as clean", { error: err.message });
                return false;
            }
            // 3) Upload buffer for analysis
            let analysisId;
            try {
                const form = new form_data_1.default();
                form.append("file", buffer, { filename: "submission.zip" });
                const upload = yield fetch(`${this.VT_BASE}/files`, {
                    method: "POST",
                    headers: Object.assign({ "x-apikey": this.API_KEY, accept: "application/json" }, form.getHeaders()),
                    body: form,
                });
                if (!upload.ok) {
                    logger_1.default.warn("[AntivirusService] upload failed – treating as clean", { status: upload.status });
                    return false;
                }
                const payload = (yield upload.json());
                analysisId = payload.data.id;
            }
            catch (err) {
                logger_1.default.warn("[AntivirusService] error uploading for analysis – treating as clean", { error: err.message });
                return false;
            }
            // 4) Poll until the scan completes
            for (let i = 0; i < this.MAX_POLL_RETRIES; i++) {
                try {
                    const poll = yield fetch(`${this.VT_BASE}/analyses/${analysisId}`, {
                        method: "GET",
                        headers,
                    });
                    if (!poll.ok) {
                        logger_1.default.warn("[AntivirusService] poll failed – treating as clean", { status: poll.status });
                        return false;
                    }
                    const body = (yield poll.json());
                    const status = (_b = (_a = body.data) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.status;
                    if (status === "completed") {
                        const stats = body.data.attributes.stats;
                        return stats.malicious > 0;
                    }
                }
                catch (err) {
                    logger_1.default.warn("[AntivirusService] error polling analysis – treating as clean", { error: err.message });
                    return false;
                }
                // not done yet → wait then retry
                yield new Promise((r) => setTimeout(r, 2000)); // Increased wait time for standard VT tier
            }
            // If polling times out, assume clean
            logger_1.default.warn("[AntivirusService] Polling timed out. Assuming clean.");
            return false;
        });
    }
}
exports.AntivirusService = AntivirusService;
AntivirusService.VT_BASE = "https://www.virustotal.com/api/v3";
AntivirusService.API_KEY = (0, jwt_1.getEnvVar)("VIRUS_TOTAL_API_KEY");
AntivirusService.MAX_POLL_RETRIES = 10;
