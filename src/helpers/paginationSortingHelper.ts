/**
 * Pagination and Sorting Helper
 * 
 * Utility function to standardize pagination and sorting parameters
 * across the application. Converts query parameters to database-friendly values.
 */

/** Input options for pagination and sorting */
type IOptions = {
    page?: number | string,      // Current page number (1-based)
    limit?: number | string,     // Items per page
    sortBy?: string | undefined, // Field to sort by
    sortOrder?: string | undefined, // Sort direction (asc/desc)
}

/** Normalized output with calculated values ready for database query */
type IOptionsResult = {
    page: number,     // Validated page number
    limit: number,    // Validated limit
    skip: number,     // Records to skip (offset for database query)
    sortBy: string,   // Validated sort field
    sortOrder: string, // Validated sort direction
}

/**
 * Processes and validates pagination/sorting parameters
 * 
 * @param options - Raw query parameters from request
 * @returns Normalized pagination and sorting values
 * 
 * Default values:
 * - page: 1
 * - limit: 10
 * - sortBy: "createdAt"
 * - sortOrder: "desc"
 */
const paginationSortingHelper = (options: IOptions): IOptionsResult => {
    // Parse and validate page number
    const page: number = Number(options.page) || 1;
    
    // Parse and validate limit (items per page)
    const limit: number = Number(options.limit) || 10;
    
    // Calculate offset for database query: (page - 1) * limit
    const skip: number = (page - 1) * limit;
    
    // Default to sorting by creation date if not specified
    const sortBy: string = options.sortBy || "createdAt";
    
    // Default to descending order if not specified
    const sortOrder: string = options.sortOrder || "desc";
    
    return { page, limit, skip, sortBy, sortOrder };
}

export default paginationSortingHelper;