import express from "express"
import { createUser } from "../controller/UserController";
import { userValidator, validateRequest } from "../middlewares/validator/validatorFunctions";


const router = express.Router()

router
.route("/create").post(userValidator, validateRequest, createUser)

export default router;