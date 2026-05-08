/**
 * Server Entry Point
 * 
 * This file is responsible for:
 * - Initializing the Express application
 * - Establishing database connection via Prisma
 * - Starting the HTTP server on the configured port
 * - Handling graceful shutdown on errors
 */

import app from "./app";
import { prisma } from "./lib/prisma";

// Server port - defaults to 5000 if not specified in environment variables
const port = process.env.PORT || 5000;

/**
 * Main server initialization function
 * 
 * Performs the following steps:
 * 1. Establishes connection to PostgreSQL database
 * 2. Starts Express server on configured port
 * 3. Logs connection status for monitoring
 * 4. Handles errors and performs graceful shutdown
 */
async function main() {
    try {
        // Establish database connection
        await prisma.$connect();
        console.log("Connected to the database successfully.");
        
        // Start HTTP server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("An error occurred:", error);
        // Gracefully disconnect from database on error
        await prisma.$disconnect();
        process.exit(1);
    }
}

// Execute main function
main();