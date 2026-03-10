// Constants varies from project to project

export const UserRoleEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  PROJECT_MEMBER: "project_member",
  MEMBER: "member"
}

export const AvailableUserRole = Object.values(UserRoleEnum) // Agar Frontend kabhi saare Roles ki list maange to we can send this, as it is an array so the Frontend can easily loop on it. Just to make things easy for frontend

export const TaskStatusEnum = {
  TODO: "todo",
  COMPLETED: "completed",
  IN_PROGRESS: "in_progress",
}

export const AvailableTaskStatuses = Object.values(TaskStatusEnum)

export const TaskPriorityEnums = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
};

export const AvailableTaskPriorities = Object.values(TaskPriorityEnums);

// export const TeamRoleEnum = {
//   LEADER: "leader",
//   MANAGER: "manager",
//   DEVELOPER: "developer",
//   DESIGNER: "designer",
//   QA: "qa",
//   ANALYST: "analyst",
//   TESTER: "tester",
//   INTERN: "intern",
//   CONTRIBUTOR: "contributor",
// }

// export const AvailableTeamRoles = Object.values(TeamRoleEnum)
export const allowedMimeType = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
  // docx - Microsoft Word
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // xlsx - MS Excel
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // csv -
  // ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',

]