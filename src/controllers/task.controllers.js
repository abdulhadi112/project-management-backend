import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import mongoose from "mongoose";
import { Task } from "../models/task.models.js";
import { AvailableTaskStatuses, TaskStatusEnum } from "../utils/constant.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/project-member.models.js";
import { SubTask } from "../models/subtask.models.js";
import { validateObjectId } from "../utils/helper.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getTasks = asyncHandler(async (req, res) => {
  // get all tasks
  // pid - params
  // Check if the project exist
  // Find the tasks from the pid
  const { projectId } = req.params
  if (!projectId)
    throw new ApiError(400, "Invalid projectID")

  validateObjectId(projectId, 'project')
  const project = await Project.findById(projectId)
  if (!project)
    throw new ApiError(404, "Project Not found")

  const tasks = await Task.find({
    project: projectId
  })
  if (!tasks)
    throw new ApiError(404, "Tasks of the projects not found")

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      tasks,
      "Tasks fetched successfully"
    ))
})

const getTaskById = asyncHandler(async (req, res) => {
  // get task by id
  // get the tasks using taskid
  const { projectId, taskId } = req.params
  validateObjectId(taskId, "task");

  const task = await Task
    .findById(taskId)
    .populate("project", "name description createdBy")
    .populate("assignedBy", "_id fullname email role")
    .populate("assignedTo", "_id fullname email role")

  if (!task) {
    throw new ApiError(400, "Task not found")
  }
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      task,
      "Task fetched successfully"
    ))
})

const createTask = asyncHandler(async (req, res) => {
  // create task
  // get pid - params
  // get title, description, assignedTo, status, priority 
  // Wont handle the attachments here, make a separate route for this
  const { projectId } = req.params
  console.log("Project ID : ", projectId)
  console.log("typeof Project ID : ", typeof projectId)
  validateObjectId(projectId, "project")
  const {
    title,
    description,
    assignedTo,
    status = "TODO",
    priority = "LOW"
  } = req.body // Create a validator for these

  const userId = req.user?.id

  const existingTask = await Task.findOne({ project: projectId, title })
  if (existingTask) {
    throw new ApiError(400, "Task with title already exists")
  }

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedBy: userId,
    assignedTo,
    status,
    priority: priority ?? TaskPriorityEnums.MEDIUM
  })
  if (!task) {
    throw new ApiError(400, "Error while creating task")
  }
  console.log("Task : \n", task)

  const populatedTask = await Task
    .findById(task._id)
    .populate("project", "name description createdBy")
    .populate("assignedBy", "fullname email ")
    .populate("assignedTo", "fullname email ")

  // uploading initial attachments if any
  try {
    const attachments = await Promise.all(
      req.files.map(async (file, index) => {
        const filePath = file.path
        console.log("File path in controller : ", filePath);

        const result = await uploadOnCloudinary(filePath)
        console.log(`Result at index ${index} : `, result)
        return {
          url: result.secure_url,
          mimetype: file.mimetype,
          size: file.size
        }
      })
    )
    console.log("Attachments : \n", attachments)
    // res.status(200).json(new ApiResponse(201, attachments, "File uploaded successfully"))
    console.log(`File Uploaded Successfully`);
    task.attachments = attachments
    await task.save()

  } catch (error) {
    console.error(`error while uploading file : `, error)
    throw new ApiError(500, "Error while uploading the file on cloudinary")
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      populatedTask,
      "Task created successfully"
    ))
})

const updateTask = asyncHandler(async (req, res) => {
  // update task
  // title, description, status, priority, attachments update kar sakte hai 
  // Check if the tasks exist, yes then continue

  // Attachments will taken from middleware where limit is 5
  const {
    title,
    description,
    status,
    priority,
  } = req.body // check through validator

  const { taskId } = req.params
  validateObjectId(taskId, "Task")
  // const task = await Task.findById(taskId)
  // if(!task){
  //   throw new ApiError(404, "Task not found")
  // }

  // My idea :
  const updatedTask = await Task.findByIdAndUpdate(
    { _id: taskId },
    {
      title,
      description,
      status,
      priority
    },
    { new: true, runValidators: true }
  )
  if (!updatedTask) {
    throw new ApiError(404, "Task not found & cannot be updated")
  }

  try {
    const attachments = await Promise.all(
      req.files.map(async (file, index) => {
        const filePath = file.path
        console.log("File path in controller : ", filePath);

        const result = await uploadOnCloudinary(filePath)
        console.log(`Result at index ${index} : `, result)
        return {
          url: result.secure_url,
          mimetype: file.mimetype,
          size: file.size
        }
      })
    )
    console.log("Attachments : \n", attachments)
    // res.status(200).json(new ApiResponse(201, attachments, "File uploaded successfully"))
    console.log(`File Uploaded Successfully`);
    updatedTask.attachments = attachments
    await updatedTask.save()

  } catch (error) {
    console.error(`error while uploading file : `, error)
    throw new ApiError(500, "Error while uploading the file on cloudinary")
  }
  console.log("Task updated successfully");

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      updatedTask,
      "Task updated successfully"
    ))
})

const deleteTask = asyncHandler(async (req, res) => {
  // delete task
  const taskId = req.params.taskId
  validateObjectId(taskId, 'Task')


  const taskToDelete = await Task
    .findByIdAndDelete({ _id: taskId })
    .select('-status -priority')
    .populate("project", "name")
  if (!taskToDelete) {
    throw new ApiError(400, "Error while deleting the task or Task not found")
  }
  console.log(`Task deleted : `, taskToDelete ? 'YES' : 'NO')

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      taskToDelete,
      "Task deleted successfully"
    ))
})

const createSubTask = asyncHandler(async (req, res) => {
  // create subtask
  const { title } = req.body
  const { projectId, taskId } = req.params
  validateObjectId(taskId, "Task")

  // Check if the task exist
  const existingTask = await Task.findById(taskId)
  if (!existingTask) {
    throw new ApiError(404, "Task not found")
  }
  const userId = req.user?.id
  // Create subtask
  const subtask = await SubTask.create({
    title,
    task: taskId,
    project: projectId,
    createdBy: userId,
  })
  if (!subtask) {
    throw new ApiError(400, "Error while creating subtask")
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      subtask,
      "Subtask created successfully"))
})

const updateSubTask = asyncHandler(async (req, res) => {
  // update subtask
  const { title, isCompleted } = req.body
  const { subtaskId } = req.params
  validateObjectId(subtaskId, 'Subtask')

  const updatedSubTask = await SubTask.findByIdAndUpdate(
    { _id: subtaskId },
    {
      title,
      isCompleted
    },
    { new: true, runValidators: false }
  ).populate("task", "title description assignedTo assignedBy status priority attachments ")
    .populate("project", "name")
    .populate("createdBy", "fullname email")

  if (!updatedSubTask) {
    throw new ApiError(400, "Subtask not found")
  }
  console.log('Subtasks updated successfully')

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      updatedSubTask,
      "Subtask updated successfully"
    ))
})

const deleteSubTask = asyncHandler(async (req, res) => {
  // delete subtask
  const { subtaskId } = req.params
  validateObjectId(subtaskId, 'Subtask')

  const subtaskToDelete = await SubTask.findByIdAndDelete(subtaskId)
  if (!subtaskToDelete) {
    throw new ApiError(404, 'Subtask not found')
  }
  console.log('Subtasks updated successfully')

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      subtaskToDelete,
      "Subtask deleted successfully"
    ))
})

const addAttachments = asyncHandler(async (req, res) => {
  // Add attachments
  // we didnt think through this case & just blindly copy pasted
  const { taskId, projectId } = req.params
  const attachments = req.files
  validateObjectId(projectId, 'Project')

  const task = await Task.findById(taskId)
  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  if (!attachments || attachments.length == 0) {
    throw new ApiError(400, 'Please add attachments')
  }

  const existingAttachments = task.attachments?.length || 0;
  const newAttachmentLength = attachments.length;
  if (existingAttachments + newAttachmentLength > 7) {
    attachments.forEach((file) => fs.unlinkSync(file.path));// Delete the uploaded attachments from the server
    throw new ApiError(
      400, `Attachment limit exceeded. You can upload only ${7 - existingAttachments} more.`
    );
  }

  // uploading new attachments on cloudinary
  const newAttachments = await Promise.all(
    attachments.map(async (file) => {
      const result = await uploadOnCloudinary(file.path)
      return {
        url: result?.secure_url,
        mimetype: file.mimetype,
        size: file.size
      }
    })
  )
  task.attachments.push(...newAttachments) // Adding the newAttachments array in the task.attachments
  await task.save()

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      task.attachments,
      "Attachments added successfully"
    ))
})
const deleteAttachments = asyncHandler(async (req, res) => {
  // delete attachments
  const { attachmentId, projectId } = req.params
  validateObjectId(projectId, 'Project')

})

export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
  addAttachments,
  deleteAttachments
};
