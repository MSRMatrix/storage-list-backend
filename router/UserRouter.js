import express from "express"
import { createUser, deleteAccount, editUser, getData, login, logout, twoFactor } from "../controller/UserController";
import { userUpdateValidator, userValidator, validateRequest } from "../middlewares/validator/validatorFunctions";


const router = express.Router()

router
.route("/").post(getData)

router
.route("/create").post(userValidator, validateRequest, createUser)

router
.route("/edit-user").post(userUpdateValidator, validateRequest, editUser)

router
.route("/login").post(login)

router
.route("/logout").post(logout)

router
.route("/two-factor").post(twoFactor)

router
.route("/delete-account").delete(deleteAccount)


export default router;