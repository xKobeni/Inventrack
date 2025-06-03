import { createAuditLog } from '../models/authModels/audit.models.js';

export const auditMiddleware = (action) => {
    return async (req, res, next) => {
        // Store the original res.json method
        const originalJson = res.json;

        // Override res.json method
        res.json = function(data) {
            // Restore the original method
            res.json = originalJson;

            // If the request was successful, create audit log
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const details = {
                    method: req.method,
                    path: req.path,
                    params: req.params,
                    query: req.query,
                    body: req.body,
                    response: data
                };

                // Create audit log asynchronously
                createAuditLog(req.user.id, action, details)
                    .catch(error => console.error('Audit logging failed:', error));
            }

            // Call the original res.json method
            return originalJson.call(this, data);
        };

        next();
    };
}; 