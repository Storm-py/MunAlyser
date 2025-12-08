import jwt from 'jsonwebtoken'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {User} from "../models/user.model.js"
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js' 
import { PDFParse } from 'pdf-parse';







const generateAccessAndRefreshTokens= async (userId)=>{
    try{
        const user= await User.findById(userId)
        const accessToken=  user.generateRefreshToken()
        const refreshToken= user.generateAccessToken()

        user.refreshToken=refreshToken
        user.accessToken=accessToken
        await user.save({ validateBeforeSave:false })

        return{accessToken,refreshToken}
    }catch{
        throw new ApiError(500,"Something went wrong While generating Tokens")
    }
}



const registerUser=asyncHandler(async (req,res)=>{
    const {fullName,email,username,password}=req.body
    if(
        [fullName,email,username,password].some((field)=>{
            field?.trim()==""
        })
    ){
        throw new ApiError(400,"All fields are required")
    }

   const existedUser=await User.findOne({
        $or: [{ username },{ email }]
    })
    if(existedUser) throw new ApiError(409,"You have to register through a new Usernmae or Email")

    const avatarLocalPath= req.files?.avatar?.[0]?.path
    const cvLocalPath= req.files?.cv?.[0]?.path

    if(!avatarLocalPath) {throw new ApiError(400,"Avatar Required")}
    if(!cvLocalPath) {throw new ApiError(400,"CV Required")}

    const parser= new PDFParse({url:cvLocalPath});
    const result = await parser.getText()
    const rawText=result.text.replace(/\n\s*\n/g, '\n').trim();
    await parser.destroy();


    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const cv=await uploadOnCloudinary(cvLocalPath)

    if(!avatar) throw new ApiError('400',"Avatar not Uploaded")
    if(!cv) throw new ApiError('400',"Cv not Uploaded")

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        cv:cv.url,
        parsedCv:rawText,
        email,
        username:username.toLowerCase(),
        password,
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser) throw new ApiError(500,"Something went wrong while registering the user")
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created Successfully")
)
})

const loginUser=asyncHandler(async (req,res)=>{

    const {username,email,password}=req.body

    if(!username && !email) throw new ApiError(400,"Username or Email is required")

    const user=await User.findOne({
        $or:[{username},{email}]
     })

    if(!user) throw new ApiError(400,"User does not Exist")
    
    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid) throw new ApiError(400,"Your Password is not valid")
    
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

  const loggedInUser= await User.findById(user._id).select
    ("-password -refreshToken")
    const options={
        httpOnly:true,
        secure:false,
        sameSite: 'lax'
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },
        "User Logged In Successfully"
    )
    )
})

const logoutUser=asyncHandler(async (req,res)=>{
    const user=await req.user._id
    await User.findByIdAndUpdate(
        user,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword=asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect) throw new ApiError(400,"Invalid Old Password")
    user.password=newPassword
    user.save({validateBeforeSave:false})
    return res.status(200)
    .json(
        new ApiResponse(200,{},"Password Changed Successfully")
    )

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, username, linkedinCookie } = req.body;

    if (!fullName && !email && !username && !linkedinCookie) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const user = await User.findById(req.user._id);
    
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (username) user.username = username;
    
    if (linkedinCookie) {
        user.linkedinCookie = linkedinCookie;
    }

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    );
});

const updateUserCv=asyncHandler(async (req,res)=>{
    const user=await User.findById(req.user._id)
    let cv=user.cv
    
    await deleteFromCloudinary(cv) 
    const cvLocalPath=req.file?.path
    if(!cvLocalPath) throw new ApiError(400,"cv file is missing")
    cv=await uploadOnCloudinary(cvLocalPath)
    if(!cv) throw new ApiError(400,"file not found")
    user.cv=cv.url
    await user.save()
    return res.status(200).json(
        new ApiResponse(200,{cv},"cv changed Successfully")
)
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserCv,
    getCurrentUser
}