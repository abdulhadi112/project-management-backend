import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import User from "../models/user.models.js"
import crypto from "crypto"
import { emailVerificationMailGenContent, resetPasswordMailGenContent, sendMail } from "../utils/sendMail.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

// Using Async handler
// Register User
const registerUser = asyncHandler(async (req, res) => {
  // For validation we will require express-validator & validation middleware

  // Get the user data
  const { fullname, username, email, password } = req.body
  if (!fullname || !username || !email || !password) {
    throw new ApiError(400, "All fields are required")
  }

  // Check if the user exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(401, "User already exists")
  }

  // Create a User
  const user = await User.create({
    fullname,
    username,
    email,
    password
  })
  console.log(user)

  if (!user) {
    throw new ApiError(401, "Error creating a User")
  }

  const { unHashedToken, hashedToken, tokenExpiry } = await user.generateToken()
  // Create a verification token for User to verfiy Email with time limit
  // const emailVerificationToken = crypto.randomBytes(25).toString('hex') //We have also created a method in User model for generatingToken. for more security hash the token.
  const emailVerificationToken = hashedToken
  // const emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000 // 24h from the time User Registered
  const emailVerificationExpiry = tokenExpiry
  const verificationURL = `${process.env.BASE_URL}/api/v1/auth/verify/${emailVerificationToken}`

  user.emailVerificationToken = emailVerificationToken
  user.emailVerificationExpiry = emailVerificationExpiry

  await user.save()

  // Sending the Email Verification mail
  const options = {
    email: user.email,
    subject: "Email Verification",
    mailGenContent: emailVerificationMailGenContent(user.fullname, verificationURL)
  }

  sendMail(options)
  console.log(`Mail sent to ${user.email}`)

  return res.status(200).json(
    new ApiResponse(
      200,
      { _id: user._id, fullname: user.fullname, username: user.username, email: user.email },
      `User registered Successfully & mail sent to ${user.email}`
    )
  )

})

// Verify Email : User verifies email
const verifyEmail = asyncHandler(async (req, res) => {
  // Get token from Params
  const { token } = req.params

  // Agar token nhi hua toh 
  if (!token) {
    throw new ApiError(404, "Invalid Token")
  }

  // Find the User on basis of Token & tokenExpiry (greater than current Date)
  const user = await User.findOne({
    emailVerificationToken: token,
    // emailVerificationExpiry: { $gt: Date.now() }
  }).select('-password')
  console.log(user)

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  if (user.emailVerificationExpiry < Date.now()) {
    // DOUBT : Since verificationToken is expired toh kya hum usae khaali nhi karege?
    throw new ApiError(404, "Token Expired. Verification link has expired, request a new one")
  } else {
    user.isEmailVerified = true
    user.emailVerificationToken = undefined // Null alag se dikhta hai jab print & DB mein check kiya, check why?
    user.emailVerificationExpiry = undefined
  }

  await user.save()
  console.log("User After saving :\n", user)

  // Sending the success response
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          isEmailVerified: user.isEmailVerified
        },
        "Email Verified Successfully")
    )
  // If User found, check if Date.now() >  emailVerificationExpiry then "Verification Link Expired"
  // Else isEmailVerified = true & empty the token & expiry
  // Else Resend Verifi Email -- Wrong Approach
  // Send User to resendVerifcation route
})

// Login User
const loginUser = asyncHandler(async (req, res) => {
  // Get email & password
  const { username, email, password } = req.body

  if (!(email || username)) {
    throw new ApiError(400, "Email or Username are required")
  }

  // Check if the User exists in the DB, also the check isEmailVerified
  const user = await User.findOne({
    $or: [{ username }, { email }] // '$ or is MongoDB Operator'agar user email se mila toh return it agar username se mila toh return it
  })
  if (!user) {
    throw new ApiError(400, "User not found")
  }
  console.log("CHECKING USER :\n", user)

  // If TRUE, compare the passwords
  const isMatched = await user.isPasswordCorrect(password)
  console.log("DO PASSWORD MATCH : ", isMatched ? "YES" : "NO")
  if (!isMatched) {
    throw new ApiError(400, "Invalid Credentials")
  }
  if (!user.isEmailVerified) {
    throw new ApiError(400, "Email not verified. Kindly verify your Email")
  }

  // Create a JWT(access & refresh) token. A function to generate access & refresh token is already made in the User model & is available to 'user'
  // Access & refresh Token - Backend Series P1 6:53:11(Just mentioning it in Models) P2 mein use kiya hai 
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })
  const createdUser = await User.findOne(user._id).select("-password -refreshToken") // This totally depends on us to create or not create

  // Access the user cookie, create the options
  const baseOptions = {
    httpOnly: true,
    secure: true,
  }

  // Store the Tokens in the User Cookie
  res
    .status(200)
    .cookie('accessToken', accessToken, { ...baseOptions, maxAge: 2 * 60 * 60 * 1000 })
    .cookie('refreshToken', refreshToken, { ...baseOptions, maxAge: 30 * 24 * 60 * 60 * 1000 })
    .json(
      new ApiResponse(
        200,
        {
          user: createdUser,
          refreshToken,
          accessToken
        },
        "User Logged in Successfully!"
      )
    )

  // After completion make 'isLoggedIn' middleware for Authorized routes i.e logoutUser & getProfile
})

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  // Make sure to make 'isLoggedIn' middleware before using this controller
  console.log(`INSIDE LOGOUT CONTROLLER`)
  // Clearing both the cookies from the browser. Thereby terminating their access
  res.clearCookie("accessToken", { httpOnly: true, secure: true })
  res.clearCookie("refreshToken", { httpOnly: true, secure: true })

  console.log(req.user)
  // Get the ID from req.user
  const id = req.user
  console.log(typeof id)

  // Find the User from the ID & Update the refresh token field in DB
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $unset: { refreshToken: "" } }, // $unset - completely remove the field from the document. Use this instead of setting it to null
    { new: true })
  // runValidators: true
  // Here it is not needed, Reason: we dont need to return updated document to user & since we are removing the 'refreshToken' so validators are not required
  // By default 'findByIdAndUpdate' returns the original document joh update se pehele tha.
  // 'new: true' will return the Updated document
  // By default Mongoose does not apply schema validators when updating, sirf create k time karta hai 
  // 'runValidators: true' se update karte waqt bhi validators apply honge.
  // ).select('-password')


  // await user.save({ validateBeforeSave: false })

  res
    .status(200)
    .json(new ApiResponse(
      200,
      {},
      "User logged Out successfully"
    ))
})


// Resend verification email
const resendVerificationEmail = asyncHandler(async (req, res) => {
  // Email Validation will be required here - Done
  // Get the email from body
  const { email } = req.body
  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  // Check if the user exists & checks isEmailVerified status
  const existingUser = await User.findOne({ email }).select('-password')
  if (!existingUser) {
    throw new ApiError(404, "User does not exist")
  }
  console.log("DOES USER EXIST :", existingUser ? "YES" : "NO")

  const { unHashedToken, hashedToken, tokenExpiry } = await existingUser.generateToken()

  if (!existingUser.isEmailVerified) {
    // Generate token & expiry 
    const token = hashedToken
    const verificationExpiry = tokenExpiry
    const verificationURL = `${process.env.BASE_URL}/api/v1/auth/verify/${token}`

    // Insert in DB
    existingUser.emailVerificationToken = token
    existingUser.emailVerificationExpiry = verificationExpiry

    await existingUser.save({ validateBeforeSave: false })
    // Jabh hum user.save() karte hai toh Mongoose schema ke validators (jaise required, minlength, match, custom validators) sab check karta hai.
    // Agar koi validator fail ho gaya → error throw karega, aur data save nahi hoga.
    // validateBeforeSave bolta hai Mongoose validators ko skip karo aur directly save karo.
    // Used when setting a state or reset token that usually dont require validation
    console.log(existingUser)
    // Resend the mail
    const options = {
      email: existingUser.email,
      subject: "Email Verification",
      mailGenContent: emailVerificationMailGenContent(existingUser.fullname, verificationURL)
    }
    sendMail(options)
    console.log(`Mail sent to ${existingUser.email} successfully`)

    // Sending the success response
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            email: existingUser.email,
            isEmailVerified: existingUser.isEmailVerified
          },
          `Mail sent to ${existingUser.email} successfully`)
      )
  }

  // User already has the email verified
  else {
    res.status(200).json(
      new ApiResponse(
        200,
        {
          email: existingUser.email,
          isEmailVerified: existingUser.isEmailVerified
        },
        "User email already verified")
    )
  }
})

// refresh Access token : Access Token ko refresh karna hai
const refreshAccessToken = asyncHandler(async (req, res) => {
  // I have to read about how this controller will be used, have no clue at the moment
  // Get the refresh token from the cookies or req.headers
  // Find the User from the refresh token
  // Generate a new access token
  // Send the access token in the response
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required")
  }
  const user = await User.findOne(refreshToken).select('-password')
  if (!user) {
    throw new ApiError(404, "Invalid Refresh Token")
  }
  const accessToken = user.generateAccessToken()
  const newRefreshToken = user.generateRefreshToken()

  user.refreshToken = newRefreshToken
  await user.save({ validateBeforeSave: false })
  const baseOptions = {
    httpOnly: true,
    secure: true,
  }

  res
    .status(200)
    .cookie('accessToken', accessToken, { ...baseOptions, maxAge: 2 * 60 * 60 * 1000 }) // 2H
    .cookie('refreshToken', refreshToken, { ...baseOptions, maxAge: 30 * 24 * 60 * 60 * 1000 })// 30Days
    .json(
      new ApiResponse(
        200,
        user,
        "Access Token Refreshed Successfully"
      )
    )
})

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  // Get Email from the Body
  // Find User from the email
  // Generate forgotPasswordToken & forgotPasswordExpiry
  // Create a reset-password link for user 
  // Send mail with the link (create resetPasswordMailGenContent)

  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "Invalid Email")
  }

  const { hashedToken, tokenExpiry } = await user.generateToken()
  const forgotPasswordToken = hashedToken
  const forgotPasswordExpiry = tokenExpiry
  const resetPasswordURL = `${process.env.BASE_URL}/api/v1/auth/reset-password/${forgotPasswordToken}`

  user.forgotPasswordToken = forgotPasswordToken
  user.forgotPasswordExpiry = forgotPasswordExpiry

  await user.save()
  console.log(`Fullname : ${user.fullname} \n email : ${user.email}`)
  const option = {
    email,
    subject: "Reset Password Link",
    mailGenContent: resetPasswordMailGenContent(user.fullname, resetPasswordURL)
  }
  sendMail(option)

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          _id: user._id,
          fullname: user.fullname,
          email: user.email
        },
        `Reset Passwork link sent to ${user.email}`))

})

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  // Get the token from the params
  const { token } = req.params

  // Validate the token
  if (!token) {
    throw new ApiError(404, "Invalid Token")
  }

  // Get the newPassword & confirmPassword from body
  const { password, confirmPassword } = req.body

  // match the password 
  if (password !== confirmPassword) {
    throw new ApiError(400, `Passwords do not match`)
  }

  // find the user based on the token
  const user = await User.findOne(
    {
      forgotPasswordToken: token,
      forgotPasswordExpiry: { $gt: Date.now() }// Expiry time is greater than current time.
    }
  )

  if (!user) {
    throw new ApiError(400, `User not Found`)
  }

  // Update the password of that User
  user.password = confirmPassword

  // empty the resetPassword token & expiry
  user.forgotPasswordToken = undefined
  user.forgotPasswordExpiry = undefined
  await user.save()
  console.log(`Password reseted!`) // I should log instead of printing it on the console

  // return the response
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          fullname: user.fullname,
          email: user.email,
          password: user.password
        },
        `Password reset successfully`
      )
    )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // logged in user can change the password
  const { id } = req.user

  // Get the old & new password from req.body
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old & New password are required")
  }

  // find the user from req.user.id
  const user = await User.findById(id)
  if (!user) {
    throw new ApiError(400, "User not found")
  }

  // match the old password with the password stored in DB
  const oldPasswordMatch = await bcrypt.compare(user.password, oldPassword)
  if (!oldPasswordMatch) {
    throw new ApiError(400, "Old password does not match")
  }

  // Old & new password must not be same 
  if (oldPassword === newPassword) {
    throw new ApiError(400, "Old & new Password cannot be the same")
  }

  // user.password = newPassword & user.save()
  user.password = newPassword
  await user.save()

  // retrun success response
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password changed successfully"
      )
    )
})

// Get current User/ Get Profile
const getProfile = asyncHandler(async (req, res) => {
  console.log(`INSIDE PROFILE CONTROLLER`)
  // Get the id from req.user
  const { id } = req.user

  // find the user based on the id
  const user = await User.findById(id).select('-password -avatar -refreshToken')
  if (!user) {
    throw new ApiError(400, "User not found")
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          isEmailVerified: user.isEmailVerified
        },
        "User found successfully"
      )
    )

})

const assignRole = asyncHandler(async (req, res) => {
  // Doubt : when will this controller come into work
  // Ans : when an authorized user (e.g., an admin or a user with elevated permissions) wants to assign or update the role of another user in the system.
  // DOUBT : If so then this should be handled by updateMemberRole

  // Get the id of the targetUser from the params
  // check if the role==ADMIN from the req.user i.e the one assigning the role is an authorized user or not
  // We can either check the permission here or make verfiyPermission & waha par UserRolesEnum mein ADMIN pass karde or create another middlware IsAdmin checking the role from the req.user

  // UPDATE : An existing ADMIN can assign the role to other users. By default every user is MEMBER, through this controller an existing admin will update the role of that member to ADMIN so he/she can create a project. The existing admin would created manually i.e updating DB directly or by special script or route

  const userId = req.params.userId
  const { role } = req.body

  if (!userId) {
    throw new ApiError(400, "Invalid ID")
  }
  // finding user through userId
  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError(404, "User not found")
  }
  if (!AvailableUserRole.includes(role)) {
    throw new ApiError(400, "Invalid Role passed")
  }
  user.role = role
  await user.save({ validateBeforeSave: false });
  // validateBeforeSave : false skips validation so the document will save even if required fields are missing.
  console.log(`Role changed for user ${user.fullname} to ${user.role}`)
  res
    .status(200)
    .json(new ApiResponse(
      200,
      {
        fullname: user.fullname,
        email: user.email,
        role: user.role
      },
      `Role change for user ${user.fullname}`
    ))
})

const handleSocialLogin = asyncHandler(async (req, res) => {

})
export {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getProfile,
  changeCurrentPassword,
  assignRole,
  handleSocialLogin
}