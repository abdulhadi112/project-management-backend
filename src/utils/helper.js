import { ApiError } from "./api-error.js";
import mongoose from "mongoose";

export const validateObjectId = (id, entity) => {
  if (!mongoose.Types.ObjectId.isValid(id?.trim?.())) {
    throw new ApiError(400, `Invalid ${entity} ID`)
  }
}