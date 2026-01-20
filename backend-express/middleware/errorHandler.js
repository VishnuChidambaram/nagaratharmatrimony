import { ZodError } from 'zod';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  try {
    console.error("Error caught in errorHandler:", err.name, err.constructor.name, err.message);
    if (err.errors) console.error("err.errors detected");
    logger.error(err);

    // Handle Zod Validation Errors
    if (err instanceof ZodError || err.name === 'ZodError') {
      const errors = [];
      const flattenError = (e) => {
        const msg = e.message || e;
        if (typeof msg === 'string') {
          if (msg.startsWith('[') || msg.startsWith('{')) {
            try {
              const parsed = JSON.parse(msg);
              if (Array.isArray(parsed)) {
                parsed.forEach(flattenError);
              } else if (parsed.message) {
                flattenError(parsed.message);
              } else {
                errors.push(msg);
              }
            } catch (ex) {
              errors.push(msg);
            }
          } else {
            errors.push(msg);
          }
        } else if (typeof msg === 'object') {
          errors.push(msg.message || JSON.stringify(msg));
        }
      };

      if (err.errors && Array.isArray(err.errors)) {
        err.errors.forEach(flattenError);
      } else {
        flattenError(err.message);
      }

      const errorResponse = {
        success: false,
        status: 'error',
        message: 'Validation failed',
        errors: [...new Set(errors)] // Deduplicate
      };
      return res.status(400).json(errorResponse);
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

    // Default Error Handler
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      status: 'error',
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack, name: err.name })
    });
  } catch (error) {
    console.error("CRITICAL ERROR IN ERROR HANDLER:", error);
    res.status(500).json({ success: false, message: "Error in error handler", originalError: err.message });
  }
};

export default errorHandler;
