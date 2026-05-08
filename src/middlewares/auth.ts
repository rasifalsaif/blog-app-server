/**
 * Authentication Middleware
 * 
 * Verifies user authentication and manages role-based access control (RBAC).
 * Extracts session information and attaches user details to request object.
 */

import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import { success } from 'better-auth';

/** Enum for user roles in the system */
export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}

/**
 * Extend Express Request interface to include authenticated user information
 * This allows TypeScript to recognize req.user property in route handlers
 */
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
                emailVerified: boolean;
            }
        }
    }
}

/**
 * Authentication middleware factory
 * 
 * Creates a middleware function that:
 * 1. Verifies user session via Better-Auth
 * 2. Checks email verification status
 * 3. Validates user role permissions (if specified)
 * 4. Attaches user info to request object
 * 
 * @param roles - Optional array of allowed roles. If empty, any authenticated user is allowed.
 * @returns Express middleware function
 * 
 * @throws 401 Unauthorized - No valid session found
 * @throws 403 Forbidden - Email not verified or insufficient permissions
 */
const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log("Auth middleware called with roles:", roles);
            
            // Retrieve session from request headers using Better-Auth
            const session = await betterAuth.api.getSession({
                headers: req.headers as any,
            });

            // Check if session exists
            if (!session) {
                console.log("No session found");
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: No session found"
                });
            }
            
            // Verify email is confirmed
            if (!session.user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized: Email not verified"
                });
            }
            
            // Attach user information to request object for use in route handlers
            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                emailVerified: session.user.emailVerified
            }

            // Check role-based access control
            if (roles.length && !roles.includes(req.user.role as UserRole)) {
                console.log("User role not authorized:", req.user.role);
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: Insufficient permissions"
                });
            }

            console.log("Session:", session);

            // Proceed to next middleware/route handler
            next();
        } catch (error) {
            // Pass any errors to error handling middleware
            next(error);
        }
    }
}

export default auth;