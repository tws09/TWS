/**
 * Pagination Middleware
 * Adds pagination support to API routes
 */

/**
 * Parse pagination parameters from request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const paginate = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20)); // Max 100 per page
  const skip = (page - 1) * limit;
  
  req.pagination = {
    page,
    limit,
    skip
  };
  
  next();
};

/**
 * Format paginated response
 * @param {object} req - Express request object
 * @param {array} data - Data array
 * @param {number} total - Total count
 * @returns {object} Paginated response object
 */
const paginateResponse = (req, data, total) => {
  const { page, limit } = req.pagination;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  };
};

/**
 * Add filtering support
 * @param {object} req - Express request object
 * @param {object} baseQuery - Base MongoDB query
 * @returns {object} Enhanced query with filters
 */
const applyFilters = (req, baseQuery) => {
  const query = { ...baseQuery };
  
  // Date range filtering
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      query.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.createdAt.$lte = new Date(req.query.endDate);
    }
  }
  
  // Status filtering
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Search filtering (text search)
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // Sort
  const sortField = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  req.sort = { [sortField]: sortOrder };
  
  return query;
};

module.exports = {
  paginate,
  paginateResponse,
  applyFilters
};
