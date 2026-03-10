import { ApiError } from "../utils/api-error.js";
import { Project } from "../models/project.models.js"
import { ProjectMember } from "../models/project-member.models.js"
import { ApiResponse } from "../utils/api-response.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AvailableUserRole, UserRoleEnum } from "../utils/constant.js";
import User from "../models/user.models.js";

const createProject = asyncHandler(async (req, res) => {
  // Authenticated user can create a project

  // Get the name, description
  const { name, description } = req.body
  if (!name) {
    // return res.status(400).json({ success: false, message: "All fields are required" })
    throw new ApiError(400, "All fields are required")
  }

  // Check if the project already exist 
  const existingProject = await Project.findOne({ name })
  if (existingProject) {
    throw new ApiError(400, "Project already exist")
  }

  // Create the project
  try {
    const project = await Project.create({
      name,
      description,
      createdBy: new mongoose.Types.ObjectId(req.user.id)
    })
    await ProjectMember.create(
      {
        user: project.createdBy,
        project: project._id,
        role: UserRoleEnum.ADMIN
      }
    )
    if (!project) {
      throw new ApiError(400, "Project creation failed")
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            _id: project._id,
            name: project.name,
            description: project.description,
            createdBy: project.createdBy
          },
          "Project created successfully"
        )
      )
  } catch (error) {
    console.error("Error while creating project : ", error.message)
  }

  // return the json response

})
const getProjects = asyncHandler(async (req, res) => {
  // get all projects
  const projects = await Project.find().populate("createdBy", "fullname email")
  if (!projects) {
    throw new ApiError(404, "Projects not found")
  }
  //Extract the id from req.user - getting projects for specific user
  //Find the user from the id
  //Return all the projects 
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projects,
        "Projects found successfully"
      ))
})

const getProjectById = asyncHandler(async (req, res) => {
  // get project by id
  //Get id from the params
  const { projectId } = req.params
  if (!projectId) {
    throw new ApiError(400, "Invalid Project ID")
  }

  //Find the project based on the id
  const project = await Project.findOne({ _id: projectId }).populate("createdBy", "fullname email")
  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  //return the json
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        project,
        "Project Found Successfully"
      )
    )
})


const updateProject = asyncHandler(async (req, res) => {
  // WATCH THE PERMISSIONS VIDEO FROM THE COHORT
  // /:projectId will use this controller
  // update project (konse project ko update karna hai )
  // Check the role of the user. If ADMIN then allow to perform the action - DONE
  // Get the project by id from params -DONE
  // get the name & description from req.body -DONE
  // perform validation
  // update the project based on the new name & description
  const { name, description } = req.body
  const { projectId } = req.params

  if (!name)
    throw new ApiError(400, "Name is  required")
  if (!projectId) {
    throw new ApiError(400, "Invalid Project ID")
  }


  const updatedProject = await Project.findOneAndUpdate(
    { _id: projectId },
    { name, description },
    {
      new: true, // Returns the updated project
      runValidators: true
    })

  if (!updatedProject) {
    throw new ApiError(404, "Project Not found")
  }
  console.log("Update Project : ", updatedProject);

  res
    .status(200)
    .json(new ApiResponse(
      200,
      updatedProject,
      "Project updated successfully"
    ))
})

const deleteProject = asyncHandler(async (req, res) => {
  // delete project
  // /:projectId will use this controller
  // get the projectID from params
  // Find the project & delete it 
  // return success JSON response

  const { projectId } = req.params
  if (!projectId) {
    throw new ApiError(400, "Invalid Project ID")
  }

  const deletedProject = await Project.findByIdAndDelete(
    { _id: projectId }
  )
  const deletePrjMember = await ProjectMember.deleteOne(
    { project: projectId }
  )
  // If a document exists → it gets removed and returned
  // If no document exists → result is null
  console.log("Project member deleted : ", !deletePrjMember ? "YES" : "NO")
  if (!deletedProject) {
    throw new ApiError(404, "Project not found")
  }

  res
    .status(200)
    .json(new ApiResponse(
      200,
      { deletedProject }, // Change it to name, description, createdBy
      "Project deleted successfully"
    )
    )
})

const addMemberToProject = asyncHandler(async (req, res) => {
  // add member to project
  // Get the projectId from params, validate
  // Get email, role from body, validate
  // Get the user from the email
  // Check if existingMember in the prj or not
  // ProjectMember mein create, setting the userId, role, projectId
  // validate
  // return success response
  // CREATE A VALIDATOR FOR email & role -DONE
  const { projectId } = req.params
  const { email, role } = req.body

  if (!projectId) {
    throw new ApiError(400, "Invalid ProjectID")
  }
  if (!email)
    throw new ApiError(400, "Email is required")
  console.log(email);

  const user = await User.findOne({ email, isEmailVerified: true })
  console.log("User found : ", user ? "YES" : "NO")
  console.log(user)
  if (!user) {
    throw new ApiError(400, "Either member does not exist or not verified yet");
  }
  const userId = user._id

  // Check if the user is an existingMember 
  const existingMember = await ProjectMember.findOne({
    user: userId,
    project: projectId
  })

  if (existingMember) {
    throw new ApiError(400, "User is an existing member in the project")
  }

  const newMember = await ProjectMember.create({
    user: userId,
    role,
    project: projectId
  }).populate("project", "name")

  if (!newMember)
    throw new ApiError(401, "Error occured while adding the member")

  res
    .status(200)
    .json(new ApiResponse(
      200,
      { newMember },
      `Member added to project ${newMember.project} successfully!`
    ))
})

const getProjectMembers = asyncHandler(async (req, res) => {
  // get project members
  // Get projectId from params, validate
  // get project members - projectMember.find(projectId)
  // apply limit skip range - future features

  const { projectId } = req.params
  if (!projectId) {
    throw new ApiError(400, "Invalid ProjectID")
  }


  const projectMembers = await ProjectMember.find({ project: projectId }).populate("user", "fullname email")
  if (!projectMembers)
    throw new ApiError(404, "Project members not found")
  res
    .status(200)
    .json(new ApiResponse(
      200,
      // {
      //   _id: projectMembers._id,
      //   user: projectMembers.user,
      //   role: projectMembers.role
      // },
      projectMembers,
      "Project Members found successfully"
    ))
})


const deleteMember = asyncHandler(async (req, res) => {
  // delete member from project
  const { projectId, userId } = req.params
  if (!projectId || !userId) {
    throw new ApiError(400, "Invalid ProjectID or UserID")
  }

  const memberToDelete = await ProjectMember.findOneAndDelete({
    user: new mongoose.Types.ObjectId(userId),
    project: new mongoose.Types.ObjectId(projectId)
  },
    { new: true }, { runValidators: true }).populate("user", "fullname email")
  // Maine kisko delete kiya woh pata chalega mujhe

  if (!memberToDelete)
    throw new ApiError(400, "deleted Project member not found")

  res
    .status(200)
    .json(new ApiResponse(
      200,
      { memberToDelete },
      "Project member deleted successfully"
    ))

})

const updateMemberRole = asyncHandler(async (req, res) => {
  // update member role
  // Get projectId from params,validate
  // Get role, userId from body, validate
  // Find the projectMember from projectId & userId, traditional method
  // projectMember.role = role; await projectMember.save({})
  // findOneAndUpdate

  const { projectId, userId } = req.params
  if (!projectId || !userId) {
    throw new ApiError(400, "Invalid ProjectID or UserID")
  }

  const { newRole } = req.body
  if (!newRole || !AvailableUserRole.includes(newRole))
    throw new ApiError(400, "Invalid role passed")

  // const updateProjectMember = await ProjectMember.findOneAndUpdate(
  //   {
  //     user: new mongoose.Types.ObjectId(userId),
  //     project: new mongoose.Types.ObjectId(projectId)
  //   },
  //   { role: newRole },
  //   { new: true, runValidators: true }
  // )
  const updateProjectMember = await ProjectMember.findOne({
    user: new mongoose.Types.ObjectId(userId),
    project: new mongoose.Types.ObjectId(projectId)
  })

  if (!updateProjectMember)
    throw new ApiError(400, "Project member not found")

  updateProjectMember.role = newRole
  await updateProjectMember.save({ validateBeforeSave: false })
  console.log("Updated Role of Member : ", updateProjectMember.role)
  res
    .status(200)
    .json(new ApiResponse(
      200,
      { updateProjectMember },
      "Project member role updated successfully"
    ))
})

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
