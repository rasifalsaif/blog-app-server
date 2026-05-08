/**
 * 404 Not Found Middleware
 * 
 * Handles requests to undefined routes and returns a 404 error response.
 * This middleware should be registered as the last middleware in the application.
 */

import { Request, Response } from "express";

/**
 * Sends a 404 response for undefined routes
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const notFound = (req: Request, res: Response) => {
    res.status(404).json({
        message: "Route not found!",
        path: req.originalUrl,
        date: Date()
    })
}