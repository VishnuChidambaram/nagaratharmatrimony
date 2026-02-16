const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Replace req.body with validated data
    if (validatedData.body) req.body = validatedData.body;
    
    // For query and params, we need to handle potential getter-only properties safely
    if (validatedData.query && Object.keys(validatedData.query).length > 0) {
      try {
        // Try to define/override the property directly on the request object
        Object.defineProperty(req, 'query', {
          value: validatedData.query,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } catch (e) {
        // If defining fails (e.g. non-configurable), try modifying the existing object
        try {
             Object.assign(req.query, validatedData.query);
        } catch (assignError) {
             console.error("Failed to update req.query in validation middleware:", assignError.message);
        }
      }
    }
    
    if (validatedData.params && Object.keys(validatedData.params).length > 0) {
      try {
        Object.defineProperty(req, 'params', {
          value: validatedData.params,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } catch (e) {
        try {
            Object.assign(req.params, validatedData.params);
        } catch (assignError) {
            console.error("Failed to update req.params in validation middleware:", assignError.message);
        }
      }
    }
    
    next();
  } catch (error) {
    next(error); // Passes ZodError to the global errorHandler
  }
};

export default validate;
