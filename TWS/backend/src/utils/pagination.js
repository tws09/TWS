/**
 * Pagination Utility
 * Provides consistent pagination for API endpoints
 */

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Request query object
 * @param {Object} options - Options with defaults
 * @returns {Object} Pagination parameters
 */
const parsePagination = (query, options = {}) => {
  const {
    defaultPage = 1,
    defaultLimit = 20,
    maxLimit = 100
  } = options;

  const page = Math.max(1, parseInt(query.page) || defaultPage);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Create paginated response
 * @param {Array} data - Array of results
 * @param {Number} total - Total count of documents
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} Paginated response object
 */
const createPaginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Apply pagination to Mongoose query
 * @param {Object} query - Mongoose query object
 * @param {Object} pagination - Pagination parameters { page, limit, skip }
 * @returns {Object} Modified query
 */
const applyPagination = (query, pagination) => {
  return query
    .skip(pagination.skip)
    .limit(pagination.limit);
};

module.exports = {
  parsePagination,
  createPaginatedResponse,
  applyPagination
};

