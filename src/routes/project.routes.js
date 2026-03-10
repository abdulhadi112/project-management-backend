import express from "express"
import { addMemberToProject, createProject, deleteMember, deleteProject, getProjectById, getProjectMembers, getProjects, updateMemberRole, updateProject } from "../controllers/project.controllers.js"
import { isLoggedIn, validatePermission } from "../middlewares/auth.middlewares.js"
import { validate } from "../middlewares/validator.middlwares.js"
import { createAndUpdateProjectValidator, addMemberToProjectValidator } from "../validators/validation.js"
import { UserRoleEnum } from "../utils/constant.js"

const router = express.Router()
router.use(isLoggedIn) // Ensures that 'isLoggedIn' middleware is applied to all the routes. Also ensure that only logged-in users can interact with these routes

router.route('/')
  .post(
    // validatePermission([UserRoleEnum.ADMIN]),
    createAndUpdateProjectValidator(),
    validate,
    createProject)
  .get(
    validatePermission([
      UserRoleEnum.ADMIN,
      UserRoleEnum.MEMBER,
      UserRoleEnum.PROJECT_ADMIN
    ]),
    getProjects)

router.route('/:projectId')
  .get(
    getProjectById)
  .put(
    validatePermission([UserRoleEnum.ADMIN]),
    createAndUpdateProjectValidator(),
    validate,
    updateProject
  )
  .delete(
    validatePermission([UserRoleEnum.ADMIN]),
    deleteProject
  )

// POSTMAN TESTING LEFT
router.route('/:projectId/team')
  .get(
    validatePermission([
      UserRoleEnum.ADMIN,
      UserRoleEnum.PROJECT_ADMIN,
      UserRoleEnum.PROJECT_MEMBER
    ]),
    getProjectMembers)
  .post(
    validatePermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    addMemberToProjectValidator(),
    validate,
    addMemberToProject)

router.route('/:projectId/t/:userId')
  .put(
    validatePermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    validate,
    updateMemberRole)
  .delete(
    validatePermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    validate,
    deleteMember)
export default router