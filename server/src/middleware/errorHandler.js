const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || 'Server Error' });
};

export default errorHandler;
