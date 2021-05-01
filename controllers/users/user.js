const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const transport = require('nodemailer-sendgrid-transport')
const dotenv = require('dotenv').config()
const { validationResult } = require('express-validator')
const { successResponse, errorResponse } = require('../../middlewares/responses')
const UserModel = require('../../models/user')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

const fileStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString()+'-'+file.originalname)
  },
  destination: (req, file, cb) => {
    cb(null, 'public/images')
  }
})

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png' ) {
    console.log('True')
    cb(null, true)
  }
  else {
    cb(null, false)
  }
}

const photoUpload = multer({ storage: fileStorage, fileFilter: fileFilter }).single('photo')

const transporter = nodemailer.createTransport(
  new transport({
    auth: {
      api_key:  process.env.SENDGRID_API_KEY
    }
  })
)

class userController {
  static async login(req, res, next) {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return errorResponse(
        422, res, 'validation failed', errors.mapped()
      )
    }

    try{
      const email = req.body.email
      const password = req.body.password
      const user = await UserModel.findOne({ email: email })
      if(user.status === false) {
        return errorResponse(
          400, res, 'account deactivated', null
        )
      }
      const passwordMatched = await bcrypt.compare(
        password, user.password
      )
      if(!passwordMatched) {
        return errorResponse(
          403, res, 'invalid username or password', null
        )
      }
      const token = jwt.sign({
        email: user.email, 
        id: user._id  
      }, process.env.TOKEN_SECRET, { expiresIn: '2h' })
      successResponse(
        200,
        res,
        { user, token },
        'login successful',
        token
      )
    }
    catch(err) {
      errorResponse(
        500, res, 'internal server error', err.message
      )
    }
  }

  static async signUp(req, res, next) {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return errorResponse(
        422,
        res,
        'validation failed',
        errors.mapped(),
      )
    }
    try {
      const email = req.body.email
      const password = req.body.password
      const hashedPassword = await bcrypt.hash(password, 16)
      const user = await new UserModel({
        email: email,
        password: hashedPassword
      })
      const result = await user.save()
      const token = jwt.sign({ email: email, id: result._id }, process.env.TOKEN_SECRET, { expiresIn: '2h' })

      successResponse(
        200,
        res, 
        {token, email: result.email, status: result.status},
        'account created successfully'
      )
    }
    catch (err) {
      errorResponse(
        500,
        res,
        'internal server error',
        err.message,
      )
    }
  }

  static async passwordResetTokenRequest(req, res, next) {
    const email = req.body.email
    const user = await UserModel.findOne({ email: email })
    if(!user) {
      return errorResponse(
        404, res, 'user not found', null
      )
    }
    try {
      const token = jwt.sign(
        { email: user.email }, 
        process.env.TOKEN_SECRET, 
        { expiresIn: '15m'
      })
      console.log(token)
      await transporter.sendMail({
        from: process.env.SENDGRID_SENDER,
        to: email,
        html: `
          <a href="http://localhost:3500${process.env.BASE_URL}/reset-password?q=${token}">RESET PASSWORD</a>
          <p>This link expires in 15 minuntes</p>
        `
      })
    }
    catch(err) {
      errorResponse(
        500, res, 'internal server error', err.message
      )
    }
  }

  static async resetPassword(req, res, next) {
    const getToken = req.query.token
    const password = req.body.password
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return errorResponse(
        422, res, 'validation failed', errors.mapped()
      )
    }
    if(!getToken) {
      return errorResponse(
        400, res, 'missing or invalid token', {}
      )
    }
    try {
      const verifyToken = await jwt.verify(getToken, process.env.TOKEN_SECRET)
      const user = await UserModel.findOne({ email: verifyToken.email })
      const hashedPassword = await bcrypt.hash(password, 10)
      user.password = hashedPassword
      const result = await user.save()
      successResponse(
        200, res, verifyToken.email, 'password reset successful'
      )
    }
    catch(err) {
      errorResponse(
        403, res, 'invalid token', err.message
      )
    }
  }

  static async updatePhoto(req, res, next) {
    console.log(req.file)
    const photo = req.file
    if(!photo) {
      return errorResponse(
        422, res, 'photo is required', {}
      )
    }
    try {
      const user = await UserModel.findOne({ email: req.email }).select('photo')
      if(user.photo) {
        removePhoto(user.photo)
      }
      user.photo = photo.path
      const result = await user.saves()
      successResponse(
        200, res, result, 'photo uploaded'
      )
    }
    catch(err) {
      errorResponse(
        500, res, 'internal server error', err.message
      )
    }
    
  }
}

const removePhoto = (photoPath) => {
  const photoDir = path.join(__dirname, '..', '..', photoPath)
  return fs.unlink(photoDir, (err, data) => {
    if(err) {
      console.log('ERROR DELETE PHOTO')
    }
    console.log('PHOTO UPDATED>...')
  })
}

module.exports = {
  userController,
  photoUpload
}