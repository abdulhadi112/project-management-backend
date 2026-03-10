import { Router } from "express"
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote
} from "../controllers/note.controllers.js"
import { isLoggedIn, validatePermission } from "../middlewares/auth.middlewares.js"
import validate from "../middlewares/validator.middlwares.js"
import { AvailableUserRole, UserRoleEnum } from "../utils/constant.js"
import { noteValidator } from "../validators/validation.js"

const router = Router()

router.use(isLoggedIn)

router.route('/:pid/notes')
  .get(validatePermission([
    UserRoleEnum.ADMIN,
    UserRoleEnum.PROJECT_ADMIN,
    UserRoleEnum.PROJECT_MEMBER
  ]),
    getNotes)

  .post(
    validatePermission([
      UserRoleEnum.ADMIN,
      UserRoleEnum.PROJECT_ADMIN,
    ]),
    noteValidator(),
    validate,
    createNote)

router.route('/:pid/n/:noteId')
  .get(
    validatePermission([
      UserRoleEnum.ADMIN,
      UserRoleEnum.PROJECT_ADMIN,
      UserRoleEnum.PROJECT_MEMBER
    ]),
    getNoteById)

  .patch(
    validatePermission([
      UserRoleEnum.ADMIN,
      UserRoleEnum.PROJECT_ADMIN,
    ]),
    noteValidator(),
    validate,
    updateNote)

  .delete(
    validatePermission([
      UserRoleEnum.ADMIN,
      UserRoleEnum.PROJECT_ADMIN,
    ]),
    deleteNote)

export default router