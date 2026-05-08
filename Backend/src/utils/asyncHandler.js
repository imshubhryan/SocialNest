// Express 5 has built-in support for async route handlers.
// It automatically catches rejected promises and forwards errors to the error handler.
// This wrapper is kept for backward compatibility but simply returns the handler as-is.
const asyncHandler = (fn) => fn;

module.exports = asyncHandler
