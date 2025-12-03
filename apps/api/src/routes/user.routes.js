import { Router } from "express";
import {loginUser, registerUser, logoutUser, refreshAccessToken, changeCurrentPassword, updateAccountDetails, updateUserAvatar,} from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from '../middlewares/multer.middleware.js'


const router = Router();


router.route('/register').post(
    upload.single('avatar'),
    registerUser)
router.route('/login').post(
    loginUser
)
router.route("/logout").post(verifyJWT,logoutUser)
router.route('/refreshToken').post(refreshAccessToken)
router.route("/changePassword").post(verifyJWT,changeCurrentPassword)
router.route('updateDetails').patch(verifyJWT,updateAccountDetails)
router.route('/avatar').patch(verifyJWT,upload.single('avatar'),updateUserAvatar)


export default router;