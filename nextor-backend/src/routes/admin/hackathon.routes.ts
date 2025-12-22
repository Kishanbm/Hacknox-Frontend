import { Router } from 'express';
import { 
    createHackathonController, 
    updateHackathonController,
    getMyHackathonsController,
    deleteHackathonController 
} from '../../controllers/admin/hackathon.controller';

// import { authenticateUser, requireAdmin } from '../../middlewares/authMiddleware';
import { requireHackathonOwner } from '../../middlewares/hackathon.middleware';

import { verifyAuthToken } from "../../middlewares/authMiddleware";
import { requireRole } from "../../middlewares/roleMiddleware";
// import {authenticateUser, requireAdmin} from "../../middlewares/authMiddleware";

const router = Router();

// All Admin routes must be authenticated and require the 'admin' role
router.use(verifyAuthToken);
router.use(requireRole(["admin"]));

// const router = Router();

// // Global Gates (Must be Logged In + Admin Role)
// router.use(authenticateUser);
// router.use(requireAdmin);

// 1. Create (Does NOT need owner check, because you are creating it)
router.post('/', createHackathonController);

// 2. List My Events (Does NOT need check, it fetches *your* events)
// Support both GET / and GET /my-hackathons for backward compatibility
router.get('/', getMyHackathonsController);
router.get('/my-hackathons', getMyHackathonsController);

// 3. Manage Specific Event (NEEDS OWNER CHECK)
// Any route with /:id needs protection so Admin A can't edit Admin B's event
router.patch('/:id', requireHackathonOwner, updateHackathonController); 
router.delete('/:id', requireHackathonOwner, deleteHackathonController);

export default router;