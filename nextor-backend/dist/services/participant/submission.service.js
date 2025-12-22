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
exports.updateSubmissionDetails = exports.getSubmissionById = exports.createSubmission = void 0;
const supabaseClient_1 = require("../../lib/supabaseClient");
// 1. CREATE SUBMISSION (Initial Draft)
// Creates the initial submission record for a team, setting the status to 'draft'.
const createSubmission = (data, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check if a submission already exists (optional, but prevents clutter)
    const { data: existingSubmission } = yield supabaseClient_1.supabase
        .from("Submissions")
        .select("id")
        .eq("team_id", data.teamId)
        .eq("hackathon_id", hackathonId)
        .eq("status", "draft")
        .maybeSingle();
    if (existingSubmission) {
        // If a draft exists, update it instead of creating a new one
        const { data: updatedSubmission, error: updateError } = yield supabaseClient_1.supabase
            .from("Submissions")
            .update({
            title: data.title,
            description: data.description,
            repo_url: data.repoUrl,
            zip_storage_path: data.zipStoragePath,
            created_at: new Date().toISOString() // update timestamp
        })
            .eq("id", existingSubmission.id)
            .eq("hackathon_id", hackathonId)
            .select()
            .single();
        if (updateError)
            throw updateError;
        return updatedSubmission;
    }
    // 2. Insert new submission record
    const { data: newSubmission, error: insertError } = yield supabaseClient_1.supabase
        .from("Submissions")
        .insert({
        team_id: data.teamId,
        hackathon_id: hackathonId,
        title: data.title,
        description: data.description,
        repo_url: data.repoUrl,
        zip_storage_path: data.zipStoragePath,
        status: 'draft'
    })
        .select()
        .single();
    if (insertError)
        throw insertError;
    return newSubmission;
});
exports.createSubmission = createSubmission;
// 2. GET SUBMISSION BY ID
// Retrieves a submission by its ID. Used by participants (to view) and judges/admins.
const getSubmissionById = (submissionId, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    const { data: submission, error } = yield supabaseClient_1.supabase
        .from("Submissions")
        .select(`
            *,
            team:Teams (
                id, name, leader_id,
                members:TeamMembers (
                    user:Users (
                        id, email, role,
                        Profiles (first_name, last_name)
                    )
                )
            )
        `)
        .eq("id", submissionId)
        .eq("hackathon_id", hackathonId)
        .maybeSingle();
    if (error) {
        console.error("Service Error [getSubmissionById]:", error.message);
        throw new Error("Failed to retrieve submission details.");
    }
    return submission;
});
exports.getSubmissionById = getSubmissionById;
const updateSubmissionDetails = (submissionId, teamId, updates, hackathonId) => __awaiter(void 0, void 0, void 0, function* () {
    // Prevent updating 'submitted_at' or 'status' via this general endpoint
    const validUpdates = {
        title: updates.title,
        description: updates.description,
        repo_url: updates.repoUrl,
        zip_storage_path: updates.zipStoragePath,
    };
    const { data: updatedSubmission, error } = yield supabaseClient_1.supabase
        .from("Submissions")
        .update(validUpdates)
        .eq("id", submissionId)
        .eq("team_id", teamId) // Ensure ownership
        .eq("hackathon_id", hackathonId)
        .select()
        .single();
    if (error) {
        console.error("Service Error [updateSubmissionDetails]:", error.message);
        throw new Error("Failed to update submission details.");
    }
    return updatedSubmission;
});
exports.updateSubmissionDetails = updateSubmissionDetails;
