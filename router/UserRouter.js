import express from "express"
import { createUser, getData, login, logout } from "../controller/UserController";
import { userValidator, validateRequest } from "../middlewares/validator/validatorFunctions";


const router = express.Router()

router
.route("/").post(getData)

router
.route("/create").post(userValidator, validateRequest, createUser)

router
.route("/login").post(login)

router
.route("/logout").post(logout)


export default router;