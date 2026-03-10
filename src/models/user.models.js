import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { AvailableUserRole, UserRoleEnum } from "../utils/constant.js"

// const userSchema = new mongoose.Schema({}, { timestamps: true }) // Earlier we use to write it like this. There is another way too

const userSchema = new Schema({
  avatar: {
    type: {
      url: String,
      localpath: String, // Files will stored in public folder & its local path will given here
    },
    default: {
      // url : `https://ui-avatars.com/api/?name=${name}`,
      url: `https://i.pravatar.cc/300`,
      localpath: String
    }
  },
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
  },
  role: {
    type: String,
    enum: AvailableUserRole,
    default: UserRoleEnum.MEMBER,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  refreshToken: { type: String },
  forgotPasswordToken: {
    type: String
  },
  forgotPasswordExpiry: {
    type: Date
  },
  emailVerificationToken: { type: String },
  emailVerificationExpiry: { type: Date },

}, { timestamps: true })


// Hashing the password on modifying/ before saving 
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  next()
})



userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}// Jaise 'user' object par different methods hote hai (findOne, insertMany, create) ussi tarah yeh method bhi unhi k saath hoga. Yeh ek custom made method hai. Also yaha par easy access hai 'userSchema' ka bhi   

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' })
}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '10d' })
}


userSchema.methods.generateToken = async function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex")
  // Fun Exercise : Storing hashed email verification token in DB & sending normal token to the USER
  const hashedToken = crypto.createHash("sha512").update(unHashedToken).digest("hex")
  const tokenExpiry = Date.now() + (2 * 60 * 60 * 1000)

  return { unHashedToken, hashedToken, tokenExpiry }
}
const User = mongoose.model("User", userSchema)
export default User