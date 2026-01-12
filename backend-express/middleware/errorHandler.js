import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  // Handle Zod Validation Errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Handle Sequelize Database Errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
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
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
