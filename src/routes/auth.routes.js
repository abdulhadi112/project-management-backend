import express from "express"
import { registerUser, resendVerificationEmail, verifyEmail, loginUser, logoutUser, forgotPassword, resetPassword, getProfile, changeCurrentPassword, assignRole, refreshAccessToken } from "../controllers/auth.controllers.js"
import { userRegistrationValidator, resendVerificationEmailValidator, loginValidator, forgotPasswordValidator } from "../validators/validation.js"
import { validate } from "../middlewares/validator.middlwares.js"
import { isLoggedIn } from "../middlewares/auth.middlewares.js"
const router = express.Router()

router.post('/register', userRegistrationValidator(), validate, registerUser)
router.get('/verify/:token', verifyEmail)
router.post('/resend-email', resendVerificationEmailValidator(), validate, resendVerificationEmail)
router.post('/login', loginValidator(), validate, loginUser)
router.post('/logout', isLoggedIn, logoutUser)
router.post('/resend-email', resendVerificationEmailValidator(), validate, resendVerificationEmail)
router.post('/forgot-password', forgotPasswordValidator(), validate, forgotPassword)
router.get('/reset-password/:token', resetPassword)
router.get('/profile', isLoggedIn, getProfile)
router.post('/change-password', isLoggedIn, changeCurrentPassword)
//  Testing Left
router.post('/assign-role/:userId', isLoggedIn, assignRole)
// Refresh access token route pending
router.post('/refreshToken', refreshAccessToken)

export default router