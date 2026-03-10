import mongoose from "mongoose";
// import dotenv from "dotenv"
// dotenv.config({
//   path: "../.env"
// })
import dotenv from "dotenv"
dotenv.config()
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log("Connected to MongoDB"))
    // .catch(() => console.log("Error connecting to DB"))
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

export default connectDB