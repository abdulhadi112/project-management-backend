import mongoose, { Schema } from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Project name must be unique
    trim: true // Spaces joh start & end mein hoti hai unhe remove kar deta hai 
  },

  description: {
    type: String,
    // required: true,
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true })

export const Project = mongoose.model("Project", projectSchema)