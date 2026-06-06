const errorHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err.stack || err);

  // Multer upload errors (bad file type / too large) → 400
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Server Error';
  if (err.name === 'MulterError') {
    status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'Image is too large (max 5 MB)';
  } else if (/images are allowed/i.test(message)) {
    status = 400;
  }

  res.status(status).json({ success: false, message });
};

export default errorHandler;