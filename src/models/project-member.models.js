import mongoose, { Schema } from "mongoose";
import { AvailableUserRole, UserRoleEnum } from "../utils/constant.js"

const projectMemberSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },

  role: {
    type: String,
    enum: AvailableUserRole, // Eg: enum : ["Admin", "User"]. AvailableUserRole returns an array which has the available roles
    default: UserRoleEnum.PROJECT_MEMBER // Giving the value from the UserRoleEnum object
    // This is where the "constant.js" comes into play
  }

}, { timestamps: true })

export const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema)