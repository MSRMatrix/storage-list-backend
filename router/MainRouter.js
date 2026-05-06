import express from "express"
import PartRouter from "./PartRouter"
import UserRouter from "./UserRouter"

const router = express.Router()

router
.use("/part", PartRouter)

router
.use("/user", UserRouter)

export default router;