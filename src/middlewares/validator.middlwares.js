import { validationResult } from "express-validator"
import { ApiError } from "../utils/api-error.js"
export const validate = (req, res, next) => {
  const errors = validationResult(req) //Extract validation errors from the request 
  // Errors here is an object, jiske paas ek array hai jiska naam 'errors' hai which contains all the errors. It looks somewhat like this 
  /* [{
    type: 'field',
    msg: 'Invalid email',
    path: 'email',
    location: 'body'
}]
  */
  console.log(errors)

  if (errors.isEmpty())// Check if the error(object) is empty or not
    return next()

  const extractedError = []
  errors.array().map((err) => extractedError.push({
    [err.path]: err.msg
  })) // Taking the 'errors' array from the object, mapping to each error, taking the path & msg, pushing it like key-value in the extractedError array

  // Acche Errors = Achi Zindagi. Basically hum saja kar errors extractedError mein daal rhe hai & this will go to the Frontend

  throw new ApiError(408, "Received Data is invalid", extractedError)
}

export default validate 
