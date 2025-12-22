"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hackathon_controller_1 = require("../../controllers/admin/hackathon.controller");
// import { authenticateUser, requireAdmin } from '../../middlewares/authMiddleware';
const hackathon_middleware_1 = require("../../middlewares/hackathon.middleware");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const roleMiddleware_1 = require("../../middlewares/roleMiddleware");
// import {authenticateUser, requireAdmin} from "../../middlewares/authMiddleware";
const router = (0, express_1.Router)();
// All Admin routes must be authenticated and require the 'admin' role
router.use(authMiddleware_1.verifyAuthToken);
router.use((0, roleMiddleware_1.requireRole)(["admin"]));
// const router = Router();
// // Global Gates (Must be Logged In + Admin Role)
// router.use(authenticateUser);
// router.use(requireAdmin);
// 1. Create (Does NOT need owner check, because you are creating it)
router.post('/', hackathon_controller_1.createHackathonController);
// 2. List My Events (Does NOT need check, it fetches *your* events)
// Support both GET / and GET /my-hackathons for backward compatibility
router.get('/', hackathon_controller_1.getMyHackathonsController);
router.get('/my-hackathons', hackathon_controller_1.getMyHackathonsController);
// 3. Manage Specific Event (NEEDS OWNER CHECK)
// Any route with /:id needs protection so Admin A can't edit Admin B's event
router.patch('/:id', hackathon_middleware_1.requireHackathonOwner, hackathon_controller_1.updateHackathonController);
router.delete('/:id', hackathon_middleware_1.requireHackathonOwner, hackathon_controller_1.deleteHackathonController);
exports.default = router;
