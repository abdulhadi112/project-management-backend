import mongoose, { Schema } from "mongoose";

// const noteSchema = new mongoose.Schema({}, { timestamps: true })
const projectNoteSchema = new Schema({
  project: {
    type: Schema.Types.ObjectId, // To refer another document we use this. Document = Another Table (in SQL terms)
    ref: "Project",
    required: true // Yeh field chahiye hi chahiye
  },// Here we'll get the ID of the Project

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference is given from here "mongoose.model("User", userSchema)""
    required: true
  },

  content: {
    type: String,
    required: true,

  }
}, { timestamps: true })

export const ProjectNote = mongoose.model("ProjectNote", projectNoteSchema)