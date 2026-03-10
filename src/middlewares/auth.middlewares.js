import jwt, { decode } from "jsonwebtoken"
import { ApiError } from "../utils/api-error.js"
import User from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ProjectMember } from "../models/project-member.models.js"
import mongoose from "mongoose"
const isLoggedIn = async (req, res, next) => {
  // access token ko cookie se lege
  // console.log("Request Object : \n", req);
  console.log("Request Cookies Available: ", req.cookies ? "YES" : "NO");
  console.log("Properties in Req cookies ", Object.keys(req.cookies))

  const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
  // Authorization: Bearer <token> is only present if the frontend explicitly sends it.

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  // jwt se verify karege
  try {

    const decodedData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    // const user = await User.findById(decodedData?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry") // Finding the user directly after getting decodedData

    // if (!user) {
    //   throw new ApiError(401, "Invalid access token")
    // }
    req.user = decodedData


  } catch (error) {
    console.error("Error : ", error)
  }

  // decoded data ko req.user mein daal dege
  console.log(req.user)
  next()
}

// Creating permission check middleware
const validatePermission = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params
    // const { id } = req.user?.id
    if (!req.user?.id) {
      throw new ApiError(401, "Unauthorized request")
    }
    // Pata karo ki user kis project ka member hai using 
    // projectId - params & userId - req.user?.id
    const userPrjMember = await ProjectMember.findOne({
      user: new mongoose.Types.ObjectId(req.user?.id),
      project: new mongoose.Types.ObjectId(projectId)
    })
    // if (!userPrjMember) {
    //   throw new ApiError(401, "User is not part of the project")
    // }

    console.log("Role of user in Project : ", userPrjMember?.role ? userPrjMember?.role : "NOT FOUND")
    console.log("Role of user  : ", req.user?.role)
    console.log("Roles received in array : ", roles)
    if (roles.includes(userPrjMember?.role) || roles.includes(req.user?.role))
      next()
    else {
      throw new ApiError(403, "You are not allowed to perform this action")
    }
  })

export { isLoggedIn, validatePermission }