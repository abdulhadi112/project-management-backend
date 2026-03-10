const errorHandler = (err, req, res, next) => {
  console.error(`Error : ${err.message}`)// printing it for us
  console.error(err.stack);
  const status = err.statusCode || 500
  return res.status(status).json({
    success: false,
    message: err.message || "Internal Server error" // Sending the error message or the generic message to the client
  })
}// iski wajah se CLient gets a proper Error response

export { errorHandler }