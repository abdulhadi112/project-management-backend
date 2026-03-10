// Middleware for handling files
// User joh bhi file dega usko upload karke apne disk par rakhege
import multer from "multer";
import {allowedMimeType} from "../utils/constant.js"
import { ApiError } from "../utils/api-error.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images') // cb(_for error handling_, '_destination_')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix) // Changing the fileName using the combination of fieldName, current timestamp & random number for uniqueness
  }
})

const fileFilter = (req, file, cb) => {
  if(allowedMimeType.includes(file.mimetype)){
    cb(null,true)
  } else {
    cb(new ApiError(400,"Unsupported file type"))
  }
}
export const uploadFile = multer({
  storage,
  limits: {
    fileSize: 3 * 1000 * 1000 // 1MB. Files larger than 1MB will be rejected.
  },
  fileFilter
}) // we can directly use upload as middleware dont need to use    'upload.array(...)'. Yehi par hum .array('attachments' , 5) use kar sakte hai 
// We will use 'upload' as middlware. 
// Eg : app.post('/profile-pic, upload.single('avatar'), profilePicUpload)
/* 
req.file - contains the metadata of the uploaded file
Here is what it includes : 
{
  fieldname: 'fieldname',          // Name of the form field
  originalname: 'example.jpg',     // Original name of the uploaded file
  encoding: '7bit',                // Encoding type
  mimetype: 'image/jpeg',          // MIME type of the file
  destination: './public/images',  // Path where the file is stored
  filename: 'fieldname-123456789', // Generated filename (unique)
  path: 'public/images/fieldname-123456789', // Full path to the file
  size: 102400                     // Size of the file in bytes
}
*/ 
// req.body - additional text fields submitted with the form are added

/*
1. upload.single(_fieldname_). single file upload from a field (fieldname here means 'input' tag wiht name='fieldname')
   - req.file -> object for uploaded file
   - req.files -> undefined
   - req.body -> contains text fields (e.g., username)

2. upload.array(_fieldname_, maxCount). upload multiple files from a single input name
   - req.files -> array of file objects (may be empty)
   - req.file -> undefined
   - req.body -> text fields

3. upload.fields([{name, maxCount}]). multiple file fields with different names
   - req.files -> object: { avatar: [file], gallery: [file, ...] }
   - req.file -> undefined
   - req.body -> form text
*/
// memoryStorage comes in when you want file as buffer, e.g., to upload to cloud