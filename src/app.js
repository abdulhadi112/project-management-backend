import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { errorHandler } from "./middlewares/error.middlewares.js"


const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: process.env.BASE_URL,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content - Type', 'Authorization']
}))
app.use(cookieParser())

// Route imports
import healthCheckRoute from "./routes/healthcheck.routes.js"
import authRoutes from "./routes/auth.routes.js"
import projectRoutes from "./routes/project.routes.js"
import noteRoutes from "./routes/note.routes.js"
import taskRoutes from "./routes/task.routes.js"


// HealthCheck route
app.use("/api/v1/healtcheck", healthCheckRoute)
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/project", projectRoutes)
app.use("/api/v1/project", noteRoutes)
app.use("/api/v1/project", taskRoutes)


// Note routes
// task routes

// Error Handler should always be after all the routes & middlewares
app.use(errorHandler)

export default app
