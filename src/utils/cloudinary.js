// Creating a utility for file upload on cloud
/*
Plan
1. Taking the file from multer storing it on our server (i.e /public/images)
2. Using cloudinary we will take the file from our local storage & upload it on cloud

Reason for these 2 steps :
- In production grade settings temporarily user se file lekar khudke server par rakhi jaati hai, at least humare server par file aagyi hai & if reattempt required for uploading we can do it 

Goal : 
- Files humare paas File System ('fs') k through aayegi
- Joh files humare server par aa chuki hai uska path dega humein 
- Server se local path lekar hum usae Cloudinary par upload kardege
- After successful upload hum file ko server se remove kardege

*/
import dotenv from "dotenv"
dotenv.config()
import { v2 as cloudinary } from "cloudinary"
import fs from 'fs'


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log("File path in utils/cloudinary.js : ", localFilePath);

    if (!localFilePath) return null

    // Uploading the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto" // Cloudinary will figure out what is the resourceType
    })

    // file uploaded successfully
    console.log("File uploaded successfully \nResponse Data : ", response);
    fs.unlinkSync(localFilePath)
    return response

  } catch (error) {
    console.error("Cloudinary upload error: ", error)
    fs.unlinkSync(localFilePath) //removing the file from our server incase of failure as it might be a malicious/corrupt file
    // unlinkSync - yeh process hona hi chahiye phir hum aage badhege
    return null
  }

}

export { uploadOnCloudinary }