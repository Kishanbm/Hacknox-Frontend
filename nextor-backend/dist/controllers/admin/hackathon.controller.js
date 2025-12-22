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
exports.deleteHackathonController = exports.updateHackathonController = exports.getMyHackathonsController = exports.createHackathonController = void 0;
const supabaseClient_1 = require("../../lib/supabaseClient");
// 1. Create a New Hackathon
const createHackathonController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Auth middleware populates this
        const { name, submission_deadline, max_team_size, event_info_json } = req.body;
        if (!name || !submission_deadline) {
            return res.status(400).json({ message: "Name and Deadline are required." });
        }
        // Normalize event_info_json: accept object or string. If string, try parse, otherwise wrap.
        let normalizedEventInfo = null;
        if (event_info_json !== undefined) {
            if (typeof event_info_json === 'string') {
                try {
                    normalizedEventInfo = JSON.parse(event_info_json);
                }
                catch (e) {
                    // Not valid JSON — store as simple text field
                    normalizedEventInfo = { text: event_info_json };
                }
            }
            else {
                normalizedEventInfo = event_info_json;
            }
        }
        // Call the RPC Transaction
        const { data, error } = yield supabaseClient_1.supabase.rpc('create_hackathon_transaction', {
            p_admin_id: adminId,
            p_name: name,
            p_deadline: submission_deadline,
            p_max_team_size: max_team_size || 4,
            p_event_info_json: normalizedEventInfo
        });
        if (error)
            throw error;
        return res.status(201).json({
            message: "Hackathon created successfully!",
            hackathon: data
        });
    }
    catch (error) {
        console.error("Create Hackathon Error:", error.message);
        return res.status(500).json({ message: "Failed to create hackathon", error: error.message });
    }
});
exports.createHackathonController = createHackathonController;
// 2. Get My Managed Hackathons
const getMyHackathonsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Fetch all hackathons this admin manages. This is an entry-point route
        // and should not require an x-hackathon-id header.
        const { data, error } = yield supabaseClient_1.supabase
            .from('HackathonAdmins')
            .select(`
        hackathon:Hackathons (
          id, name, status, submission_deadline, max_team_size, created_at
        )
      `)
            .eq('admin_id', adminId);
        if (error)
            throw error;
        // Flatten the response structure for the frontend
        const hackathons = data.map((entry) => entry.hackathon);
        return res.status(200).json({
            message: "Hackathons retrieved successfully.",
            hackathons: hackathons
        });
    }
    catch (error) {
        console.error("Get Hackathons Error:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getMyHackathonsController = getMyHackathonsController;
// 3. Update an Existing Hackathon
const updateHackathonController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // The Hackathon ID from the URL
        // The request will only contain fields the Admin wants to change
        const updatePayload = req.body;
        if (Object.keys(updatePayload).length === 0) {
            return res.status(400).json({ message: "No update fields provided." });
        }
        // Optimization: Prevent accidental slug changes via API
        if (updatePayload.slug) {
            delete updatePayload.slug;
        }
        // Perform the update
        const { data, error } = yield supabaseClient_1.supabase
            .from('Hackathons')
            .update(Object.assign(Object.assign({}, updatePayload), { updated_at: new Date().toISOString() }))
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        if (!data) {
            return res.status(404).json({ message: "Hackathon not found or update failed." });
        }
        return res.status(200).json({
            message: "Hackathon updated successfully.",
            hackathon: data
        });
    }
    catch (error) {
        console.error("Update Hackathon Error:", error.message);
        return res.status(500).json({ message: "Failed to update hackathon", error: error.message });
    }
});
exports.updateHackathonController = updateHackathonController;
// 4. Delete Hackathon (Hard Delete)
// NOTE: Due to CASCADE rules in SQL, this will delete ALL Teams, Submissions, 
// and Scores linked to this event. Use with caution!
// 4. Delete an Existing Hackathon
const deleteHackathonController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // The Hackathon ID from the URL
        // The ownership check is already done by the requireHackathonOwner middleware.
        // Perform the deletion
        const { error, count } = yield supabaseClient_1.supabase
            .from('Hackathons')
            .delete()
            .eq('id', id)
            // count will be the number of rows deleted (should be 1)
            .limit(1);
        if (error)
            throw error;
        if (count === 0) {
            return res.status(404).json({ message: "Hackathon not found or deletion failed." });
        }
        return res.status(200).json({
            message: `Hackathon with ID ${id} and all related data deleted successfully.`,
            deletedId: id
        });
    }
    catch (error) {
        console.error("Delete Hackathon Error:", error.message);
        return res.status(500).json({ message: "Failed to delete hackathon", error: error.message });
    }
});
exports.deleteHackathonController = deleteHackathonController;
