import {
    createIncidentReport,
    getIncidentReportById,
    getAllIncidentReports,
    updateIncidentReport,
    getIncidentReportsByUser,
    getIncidentReportsByItem
} from '../models/incidentReports.js';

// Create a new incident report
export const createReport = async (req, res) => {
    try {
        const { item_id, type, description, custom_item } = req.body;
        
        // Get user information from auth middleware
        const reported_by = req.user.id; // Changed from user_id to id to match auth middleware

        // Validate that either item_id or custom_item is provided
        if (!item_id && !custom_item) {
            return res.status(400).json({
                success: false,
                message: 'Either item_id or custom_item must be provided'
            });
        }

        // Validate that reported_by is present
        if (!reported_by) {
            return res.status(400).json({
                success: false,
                message: 'User authentication required'
            });
        }

        const report = await createIncidentReport({
            reported_by,
            item_id,
            type,
            description,
            custom_item
        });

        res.status(201).json({
            success: true,
            message: 'Incident report created successfully',
            data: { 
                report: {
                    ...report,
                    reporter_name: req.user.name // Include reporter name from auth user
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating incident report',
            error: error.message
        });
    }
};

// Get all incident reports (admin only)
export const getAllReports = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const reports = await getAllIncidentReports();
        res.status(200).json({
            success: true,
            message: 'Incident reports retrieved successfully',
            data: { reports }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving incident reports',
            error: error.message
        });
    }
};

// Get incident report by ID
export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await getIncidentReportById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Incident report not found'
            });
        }

        // Check if user is admin or the reporter
        if (req.user.role !== 'admin' && report.reported_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own reports.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Incident report retrieved successfully',
            data: { report }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving incident report',
            error: error.message
        });
    }
};

// Update incident report status
export const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Only admin can update report status
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const updateData = {
            status,
            resolved_by: req.user.id,
            resolved_at: new Date()
        };

        const updatedReport = await updateIncidentReport(id, updateData);

        if (!updatedReport) {
            return res.status(404).json({
                success: false,
                message: 'Incident report not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Incident report updated successfully',
            data: { 
                report: {
                    ...updatedReport,
                    resolved_by_name: req.user.name // Include resolver's name
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating incident report',
            error: error.message
        });
    }
};

// Get incident reports by user
export const getReportsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Check if user is admin or requesting their own reports
        if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own reports.'
            });
        }

        const reports = await getIncidentReportsByUser(userId);
        res.status(200).json({
            success: true,
            message: 'User incident reports retrieved successfully',
            data: { reports }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user incident reports',
            error: error.message
        });
    }
};

// Get incident reports by item
export const getReportsByItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const reports = await getIncidentReportsByItem(itemId);
        res.status(200).json({
            success: true,
            message: 'Item incident reports retrieved successfully',
            data: { reports }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving item incident reports',
            error: error.message
        });
    }
};
