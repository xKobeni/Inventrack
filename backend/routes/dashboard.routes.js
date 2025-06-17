import { Router } from 'express';
import {
    getDashboardStats,
    getSystemStatistics,
    getRecentSystemActivities,
    getDepartmentStatistics,
    getInventoryStatistics,
    getProcurementStatistics,
    getUserActivityStatistics
} from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all dashboard statistics
router.get('/stats', getDashboardStats);

// Get individual statistics
router.get('/system',getSystemStatistics);
router.get('/activities', getRecentSystemActivities);
router.get('/departments',getDepartmentStatistics);
router.get('/inventory', getInventoryStatistics);
router.get('/procurement', getProcurementStatistics);
router.get('/user-activity', getUserActivityStatistics);

export default router;
