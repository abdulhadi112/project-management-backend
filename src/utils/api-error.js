class ApiError extends Error {
  constructor(
    statusCode, // First thing that is checked, all the work is done based on the statusCode. Most frontend cases mein first hum statusCode hi check karte hai 
    message, // Jitne acche message utna accha kaam
    error = [],
    stack = "" // Read about Errors in Node Docs
  ) {
    super(message);
    this.statusCode = statusCode
    this.message = message
    this.success = false
    this.error = error
    //read about captureStackTrace error

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
export { ApiError }