import express from "express"
import { createPart, editPart, hardDelete, softDelete } from "../controller/PartController";


const router = express.Router()

router
.route("/create").post(createPart)

router
.route("/edit").patch(editPart)

router
.route("/soft-delete").delete(softDelete)

router
.route("/hard-delete").delete(hardDelete)


export default router;