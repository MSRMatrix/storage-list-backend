import express from "express"
import { createPart } from "../controller/PartController";


const router = express.Router()

router
.route("/create").post(createPart)

export default router;