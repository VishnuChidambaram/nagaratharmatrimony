const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Replace req.body with validated data
    if (validatedData.body) req.body = validatedData.body;
    
    // For query and params, avoid direct assignment and use Object.assign or defineProperty
    if (validatedData.query && Object.keys(validatedData.query).length > 0) {
      try {
        Object.assign(req.query, validatedData.query);
      } catch (e) {
        Object.defineProperty(req, 'query', {
          value: validatedData.query,
          enumerable: true,
          configurable: true,
          writable: true
        });
      }
    }
    
    if (validatedData.params && Object.keys(validatedData.params).length > 0) {
      try {
        Object.assign(req.params, validatedData.params);
      } catch (e) {
        Object.defineProperty(req, 'params', {
          value: validatedData.params,
          enumerable: true,
          configurable: true,
          writable: true
        });
      }
    }
    
    next();
  } catch (error) {
    next(error); // Passes ZodError to the global errorHandler
  }
};

export default validate;
