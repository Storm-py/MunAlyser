import { Router } from "express";
import {loginUser, registerUser, logoutUser, getCurrentUser, refreshAccessToken, changeCurrentPassword, updateAccountDetails, updateUserCv,} from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from '../middlewares/multer.middleware.js'


const router = Router();


router.route('/register').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"cv",
            maxCount:1
        }
    ]),
    registerUser)
router.route('/login').post(
    loginUser
)
router.route("/logout").get(verifyJWT,logoutUser)
router.route('/refreshToken').post(refreshAccessToken)
router.route("/changePassword").post(verifyJWT,changeCurrentPassword)
router.route('/updateDetails').patch(verifyJWT,updateAccountDetails)
router.route('/resume').patch(verifyJWT,upload.single('cv'),updateUserCv)
router.route('/getUser').get(verifyJWT,getCurrentUser)


export default router;