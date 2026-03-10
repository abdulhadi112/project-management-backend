import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatuses, TaskStatusEnum, AvailableTaskPriorities, TaskPriorityEnums } from "../utils/constant.js"
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    // required: true
    required: [true, "Project reference is required"] // Agar True nhi hai toh yeh message jayega

  },

  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: AvailableTaskStatuses,
    default: TaskStatusEnum.TODO
  },

  priority: {
    type: String,
    enum: AvailableTaskPriorities,
    default: TaskPriorityEnums.LOW
  },
  attachments: {
    // Attachements can be PDF, Video, Audio
    // We never store files on DB.
    // Humesha Files jayegi kisi Files Service par. That File Service gives us an URL. This URL is stored in the DB
    // Services can be : S3. Azure Buckets, Cloudinary, Imagekit etc. Koi na koi object storage lagta hai 
    // Humara data kaise dikhega yeh bata rhe hai hum yaha. Type = Array of Objects (ek object ka example bhi dediya)

    type: [
      {
        url: String,
        mimetype: String, // jpeg, jpg, png, mp4, webp etc
        size: Number
      }
    ],
    default: []
  }
}, { timestamps: true })

export const Task = mongoose.model("Task", taskSchema)