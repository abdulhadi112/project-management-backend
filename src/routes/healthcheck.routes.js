import express from "express"
import { healthCheck } from "../controllers/healthcheck.controllers.js"


const router = express.Router()
// const router = Router() //if import {Router} from "express" is done 

// router.get('/', healthCheck)
// Another way of writing routes
router.route('/').get(healthCheck)
export default router