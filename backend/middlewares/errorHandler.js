const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, statusCode);
};

module.exports = errorHandler;
