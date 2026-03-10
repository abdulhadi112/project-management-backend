import { Router } from "express"
import { isLoggedIn, validatePermission } from "../middlewares/auth.middlewares.js"
import {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
} from "../controllers/task.controllers.js"
import { validate } from "../middlewares/validator.middlwares.js"
import { UserRoleEnum, AvailableUserRole } from "../utils/constant.js"
import { uploadFile } from "../middlewares/multer.middlewares.js"
const router = Router()

router.use(isLoggedIn)

// ====TASKS ROUTES====
router.route('/:projectId/tasks')
  .post(
    validatePermission([
      UserRoleEnum.ADMIN,
      UserRoleEnum.PROJECT_ADMIN,
    ]),
    uploadFile.array('attachments', 5),
    createTask)
  .get(getTasks)

router.route('/:projectId/tasks/:taskId')
  .get(getTaskById)
  .patch(updateTask)
  .delete(deleteTask)

// ==== SUBTASKS ROUTES ====
router.post('/:projectId/tasks/:taskId/subtask', createSubTask)

router.route('/:projectId/subtasks/:subtaskId')
  .patch(updateSubTask)
  .delete(deleteSubTask)

// ==== Attachments ===
// router.post('/:pid/tasks/:tasksId/attachments',)
// router.delete('/:pid/attachments/:attachmentId',)
export default router