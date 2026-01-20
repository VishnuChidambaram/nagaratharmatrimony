import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  console.error("Error caught in errorHandler:", err.name, err.constructor.name, err.message);
  if (err.errors) console.error("err.errors:", JSON.stringify(err.errors, null, 2));
  logger.error(err);

  // Handle Zod Validation Errors
  if (err.name === 'ZodError' || err.constructor.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      status: 'error',
      message: 'Validation failed',
      errors: err.errors.map(e => e.message)
    });
  }

  // Handle Sequelize Database Errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      status: 'error',
      message: 'Database validation failed',
      errors: err.errors.map(e => ({
        path: e.path,
        message: e.message
      }))
    });
  }

  // Handle Custom Errors (if any) or Default to 500
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
