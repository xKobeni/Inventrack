import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
    incidentReportValidation,
    incidentReportUpdateValidation,
    incidentReportIdValidation,
    userIdValidation,
    itemIdValidation
} from '../middleware/validation.js';
import {
    createReport,
    getAllReports,
    getReportById,
    updateReport,
    getReportsByUser,
    getReportsByItem
} from '../controllers/incidentReports.controller.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.post('/', incidentReportValidation, createReport);
router.get('/', getAllReports);
router.get('/:id', incidentReportIdValidation, getReportById);
router.put('/:id', [...incidentReportIdValidation, ...incidentReportUpdateValidation], updateReport);
router.get('/user/:userId', userIdValidation, getReportsByUser);
router.get('/item/:itemId', itemIdValidation, getReportsByItem);

export default router;
