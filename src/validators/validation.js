// Yaha par hum different purposes ki hisaab se function mein validation perform kar sakte hai. eg : register, login 

import { body, param } from "express-validator" // iske through req.body is directly accessible
import { AvailableUserRole } from "../utils/constant.js"

const userRegistrationValidator = () => {
  return [
    // yaha par humne joh body ke baad different function use kiya hai iss cheez ko 'chaining' bolte hai
    body('email')
      .trim()
      .notEmpty()
      .isEmail().withMessage("Invalid Email"), //'.withMessage() - agar validation false aata hai toh yeh message jayega'
    body('username')
      .toLowerCase()
      .trim()
      .notEmpty().withMessage("Username required")
      .isLength({ min: 4 }).withMessage("Username must be atleast 4 char long")
      .isLength({ max: 30 }).withMessage("Username cannot be more than 16 char"),
    body('password')
      .trim()
      // .isLength({ min: 6 }).withMessage("Password must be atleast 6 char long")
      .isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }).withMessage("Password must be strong") // Password should be like : R@jUnO1
      .notEmpty(),
    body('fullname')
      .trim()
      .notEmpty().withMessage("Fullname required")
      .isLength({ min: 4 }).withMessage("Fullname must be atleast 4 char long")
      .isLength({ max: 55 }).withMessage("Fullname cannot be more than 16 char"),
  ]
}


const resendVerificationEmailValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .isEmail().withMessage("Invalid Email")
  ]
}

const loginValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .isEmail().withMessage("Invalid Email"),
    body('password')
      .trim()
      .notEmpty()
      .isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }).withMessage("Password must include 1 Uppercase, 1 Lowercase, 1 Number")
  ]
}

const forgotPasswordValidator = () => {
  return [
    body('email')
      .notEmpty()
      .isEmail().withMessage("Invalid Email")
      .normalizeEmail({ gmail_remove_dots: false })
  ]
}

const createAndUpdateProjectValidator = () => {
  return [
    body('name')
      .trim()
      .isString()
      .notEmpty(),
    body('description')
      .trim()
      .isString()
      .isLength({ max: 300 })
      .optional()
  ]
}

const addMemberToProjectValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Invalid Email")
      .normalizeEmail({ gmail_remove_dots: false }),
    body('role')
      .trim()
      .isString()
      // .isIn(["project_admin", "member"]).withMessage("Roles must be either PROJECT_ADMIN or MEMBER") // Figure this out 
      .optional(),
    // Trying params validation

  ]
}

const noteValidator = () => {
  return [
    body('content')
      .trim()
      .notEmpty().withMessage("Content is required")
      .isLength({ max: 200 })


  ]
}
export {
  userRegistrationValidator,
  resendVerificationEmailValidator,
  loginValidator,
  forgotPasswordValidator,
  createAndUpdateProjectValidator,
  addMemberToProjectValidator,
  noteValidator
}