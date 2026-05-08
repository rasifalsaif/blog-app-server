/**
 * Global Error Handler Middleware
 * 
 * Centralized error handling for the entire application.
 * Catches and formats various error types from Prisma and application logic,
 * returning appropriate HTTP status codes and messages to clients.
 * 
 * This middleware should be registered last in the application.
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express"

/**
 * Global error handler middleware
 * 
 * Handles different types of errors:
 * - Prisma validation errors (400)
 * - Prisma database errors with specific error codes (400-404)
 * - Database connection errors (400-401)
 * - Generic server errors (500)
 * 
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    let statusCode = 500;
    let errorMessage = "Internal server error";
    let errorDetails = err;

    // Handle Prisma validation errors (incorrect or missing fields)
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        errorMessage = "You provided incorrect field or missing fields!";
        errorDetails = err;
    }
    // Handle Prisma known request errors (database constraint violations, etc.)
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025: Record not found
        if (err.code === "P2025") {
            statusCode = 404;
            errorMessage = "Record not found!"
        }
        // P2002: Unique constraint violation (duplicate key)
        else if (err.code === "P2002") {
            statusCode = 400;
            errorMessage = "Duplicate key error"
        }
        // P2003: Foreign key constraint failed
        else if (err.code === "P2003") {
            statusCode = 400;
            errorMessage = "Foreign key constraint failed"
        }
    }
    // Handle unknown request errors
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 500;
        errorMessage = "Error occurred during query execution";
        errorDetails = err;
    }
    // Handle database initialization and connection errors
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        // P1000: Authentication failed
        if (err.errorCode === "P1000") {
            statusCode = 401;
            errorMessage = "Authentication failed. Please check your creditials!"
        }
        // P1001: Cannot reach database server
        else if (err.errorCode === "P1001") {
            statusCode = 400;
            errorMessage = "Can't reach database server"
        }
    }
    // Handle database engine crashes
    else if (err instanceof Prisma.PrismaClientRustPanicError) {
        statusCode = 500;
        errorMessage = "Database engine crashed";
        errorDetails = err;
    }

    // Send error response to client
    res.status(statusCode)
    res.json({
        success: false,
        message: errorMessage,
        error: errorDetails
    })
}

export default errorHandler;

