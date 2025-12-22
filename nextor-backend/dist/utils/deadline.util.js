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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDeadlinePassed = void 0;
const supabaseClient_1 = require("../lib/supabaseClient");
/**
 * Checks if the current time is past the event's submission deadline.
 * @returns {Promise<boolean>} True if the deadline has passed, false otherwise.
 */
const isDeadlinePassed = () => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Fetch the deadline from the Settings table (Singleton record)
    const { data: settings, error } = yield supabaseClient_1.supabase
        .from("Settings")
        .select("submission_deadline")
        .single();
    if (error) {
        // If we can't get the settings, assume deadline is open but log a warning.
        console.warn("WARNING: Could not fetch Settings for deadline check. Assuming open.");
        return false;
    }
    const deadline = settings === null || settings === void 0 ? void 0 : settings.submission_deadline;
    // 2. If no deadline is set, always allow submission (default to open)
    if (!deadline) {
        return false;
    }
    // 3. Compare current time vs deadline time
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return now > deadlineDate;
});
exports.isDeadlinePassed = isDeadlinePassed;
