import express from "express"
import { createPart, softDelete } from "../controller/PartController";


const router = express.Router()

router
.route("/create").post(createPart)

router
.route("/soft-delete").post(softDelete)

export default router;