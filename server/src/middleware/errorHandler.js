const errorHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err.stack || err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Server Error' });
};

export default errorHandler;