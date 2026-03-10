import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js";
import { ProjectNote } from "../models/note.models.js"
import { Project } from "../models/project.models.js"
import mongoose from "mongoose";
// boilderplate code
// Notes are project based 
const getNotes = asyncHandler(async (req, res) => {
  // get all notes
  // get pid - params
  // Agar project hai toh hi toh notes hoge i.e find the project
  // find notes based on the pid

  const { pid } = req.params
  if (!pid) throw new ApiError(400, "Invalid ProjectID")

  const project = await Project.findById(pid)
  if (!project)
    throw new ApiError(404, "Project not found")

  const notes = await ProjectNote.findOne({
    project: new mongoose.Types.ObjectId(pid)
  }).populate("createdBy", "fullname email ")
  // populate - 'createdBy' ko refer karke hum 'User' model mein jaa kar inn fields ko access kar rhe hai. data mein 'createdBy' will be another obj jismein fullname & email hoga 
  if (!notes)
    throw new ApiError(404, "Notes not found")
  console.log("notes of the user : \n", notes)
  res
    .status(200)
    .json(new ApiResponse(
      200,
      notes,
      `Project Notes of ${notes.createdBy.fullname} fetched successfully`
    ))
})

const getNoteById = asyncHandler(async (req, res) => {
  // get note by id
  const { pid, noteId } = req.params
  if (!pid || !noteId) throw new ApiError(400, "Invalid ProjectID or NoteID")

  // const note = await ProjectNote.findOne({
  //   _id: new mongoose.Types.ObjectId(noteId),
  //   project: new mongoose.Types.ObjectId(pid),
  // }).populate("createdBy", "username fullname email")

  const note = await ProjectNote.findById(noteId).populate("createdBy", " fullname email")
  if (!note) {
    throw new ApiError(404, "Note not found")
  }
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      note,
      "Note fetched succesfully"
    ))

})

const createNote = asyncHandler(async (req, res) => {
  // create note
  // get the projectId - params, validate
  // get content - req.body, validate. Create contentValidator
  // 
  const { pid } = req.params
  if (!pid) throw new ApiError(400, "Invalid ProjectID")
  const { content } = req.body

  // Project hoga toh hi toh Notes bana payege
  const project = await Project.findById(pid)
  if (!project)
    throw new ApiError(404, "Project not found")

  // Creating notes
  const note = await ProjectNote.create({
    project: new mongoose.Types.ObjectId(pid),
    createdBy: new mongoose.Types.ObjectId(req.user?.id),
    content
  })
  if (!note) {
    throw new ApiError(400, "Error while creating notes")
  }
  const populatedNote = await ProjectNote.findById(note._id).populate(
    "createdBy",
    " fullname email"
  )


  return res
    .status(200)
    .json(new ApiResponse(
      200,
      populatedNote,
      `Note created successfully by ${populatedNote.createdBy.fullname}`
    ))
})

const updateNote = asyncHandler(async (req, res) => {
  // update note
  const { noteId } = req.params
  if (!noteId) throw new ApiError(400, "Invalid ProjectID or NoteID")
  const { content } = req.body

  // const existingNote = await ProjectNote.findById(noteId)
  // if (!existingNote)
  //   throw new ApiError(404, "Note not found")

  const updatedNote = await ProjectNote.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(noteId) },
    { content },
    { new: true }
  ).populate(
    "createdBy",
    " fullname email"
  )
  if (!updatedNote)
    throw new ApiError(400, "Note not found ")

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      updatedNote,
      "Note Updated successfully"
    ))
})

const deleteNote = asyncHandler(async (req, res) => {
  // delete note
  const { noteId } = req.params
  if (!noteId) throw new ApiError(400, "Invalid  NoteID")

  const deletedNote = await ProjectNote.findByIdAndDelete({ _id: noteId })
  if (!deletedNote)
    throw new ApiError(404, "Note not found or Error while deleting the note")
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      deletedNote,
      `Note deleted successfully`
    ))
})

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
