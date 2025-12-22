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
exports.FileService = void 0;
const supabaseClient_1 = require("../lib/supabaseClient");
const antivirus_service_1 = require("./antivirus.service"); // Use our new AV service
const logger_1 = __importDefault(require("../utils/logger"));
class FileService {
    static scanBuffer(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug("[FileService] Scanning buffer of size", buffer.length);
            const infected = yield antivirus_service_1.AntivirusService.isInfected(buffer);
            if (infected) {
                logger_1.default.error("[FileService] File is infected!");
                throw new Error("FileService: buffer flagged as infected");
            }
            logger_1.default.debug("[FileService] Buffer is clean");
        });
    }
    /**
     * Core direct upload pipeline: scan → upload → get public URL
     */
    static directUpload(bucket_1, key_1, buffer_1, mimeType_1) {
        return __awaiter(this, arguments, void 0, function* (bucket, key, buffer, mimeType, upsert = false) {
            // 1) virus scan
            yield this.scanBuffer(buffer);
            // 2) upload to bucket
            const { error } = yield supabaseClient_1.supabase.storage
                .from(bucket)
                .upload(key, buffer, {
                contentType: mimeType,
                cacheControl: "3600",
                upsert: upsert,
            });
            if (error) {
                logger_1.default.error("[directUpload] upload error=", error);
                throw new Error(`Upload failed: ${error.message}`);
            }
            // 3) get public URL
            const { data: urlData } = supabaseClient_1.supabase.storage.from(bucket).getPublicUrl(key);
            if (!(urlData === null || urlData === void 0 ? void 0 : urlData.publicUrl))
                throw new Error("Could not generate public URL");
            return urlData.publicUrl;
        });
    }
    /**
     * Dedicated function for Submissions ZIP upload.
     */
    static uploadSubmissionZip(teamId, filename, buffer, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
            // Path: hackonx-submissions/{teamId}/{filename}
            const key = `${teamId}/${filename}`;
            return this.directUpload(this.BUCKET_SUBMISSIONS, key, buffer, mimeType, true); // Use upsert: true for replacement
        });
    }
    // Placeholder for other file ops if needed later
    static downloadFile(bucket, key) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { data, error } = yield supabaseClient_1.supabase.storage.from(bucket).download(key);
            if (error || !data)
                throw new Error(`Download failed: ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : "no data"}`);
            const arr = yield data.arrayBuffer();
            return Buffer.from(arr);
        });
    }
}
exports.FileService = FileService;
// Bucket names (Adapted for Nextor - MUST be created in Supabase Storage)
FileService.BUCKET_SUBMISSIONS = "hackonx-submissions";
