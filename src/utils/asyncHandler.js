// To make error handling more efficient by replacing try..catch
// Benefit : try..catch har jagah nhi laga na padhta hai 

export const asyncHandler = (requestHandler) => {
  return function (req, res, next) {
    Promise
      .resolve(requestHandler(req, res, next))
      .catch((err) => next(err))
  }
}

// Using try..catch method
/*
const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(res, req, next)
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message
    })
  }
}
*/