/**
 * Prisma Database Client Configuration
 * 
 * This module sets up the Prisma ORM client with PostgreSQL adapter.
 * It provides a single instance for all database operations throughout the application.
 */

import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Database connection string from environment variables
const connectionString = `${process.env.DATABASE_URL}`

// Create PostgreSQL adapter for Prisma
const adapter = new PrismaPg({ connectionString })

// Initialize Prisma Client with PostgreSQL adapter
const prisma = new PrismaClient({ adapter })

export { prisma }