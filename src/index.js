import app from "./app.js"
import dotenv from "dotenv"
import connectDB from "./db/connect-db.js"
import { sendMail, emailVerificationMailGenContent } from "./utils/sendMail.js"

// dotenv.config({
//   path: "../.env"
//   // './.env' This caused the MongooseError: The `uri` parameter to `openUri()` must be a string, got "undefined". Make sure the first parameter to `mongoose.connect()` or `mongoose.createConnection()` is a string.
//   // Fix: Give the path '../.env' - known as Relative Path. Iske liye 'path' package bhi aata hai 
// }) // Verbose code is always good. Anyone who read this code will know that dotenv is loading .env from the path
dotenv.config()

const port = process.env.PORT || 3000

// Connecting to DB
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  })
  .catch((error) => console.log(error))

