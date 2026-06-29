import express from "express"
import { createPart, editPart, softDelete } from "../controller/PartController";


const router = express.Router()

router
.route("/create").post(createPart)

router
.route("/edit").patch(editPart)

router
.route("/soft-delete").post(softDelete)

export default router;