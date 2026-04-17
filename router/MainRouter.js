import express from "express"
import PartRouter from "./PartRouter"

const router = express.Router()

router
.use("/part", PartRouter)

export default router;