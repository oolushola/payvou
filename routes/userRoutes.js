const express = require('express')
const { body } = require('express-validator')
const { userController, photoUpload } = require('../controllers/users/user')
const verifyToken = require('../middlewares/handlers/verify')
const userModel = require('../models/user')
const router = express.Router()

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .notEmpty()
      .trim()
      .toLowerCase()
      .custom((value, { req }) => {
        return userModel.findOne({ 
          email : value 
        })
        .then(user => {
          if(!user) {
            return Promise.reject('user does not exist')
          }
        })
      })
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6, max: 30 })
      .notEmpty()
      .trim()
  ],
  userController.login
)

router.post(
  '/sign-up',
  [
    body('email')
    .isEmail()
    .notEmpty()
    .trim()
    .toLowerCase()
    .custom((value, { req }) => {
      return userModel.findOne({ email: value })
        .then(user => {
          if(user) {
            return Promise.reject('email account exists')
          }
        })
    })
    .normalizeEmail(),
    body('password')
      .isLength({ min: 6, max: 30 })
      .notEmpty()
      .trim()
  ],
  userController.signUp
)

router.post(
  '/password-reset',
  [
    body('email')
      .isEmail()
      .notEmpty()
      .trim()
      .toLowerCase()
      .normalizeEmail()
  ],
  userController.passwordResetTokenRequest
)

router.patch(
  '/update-password',
  [
    body('password')
    .isLength({ min: 6, max: 30 })
    .notEmpty()
    .trim()
  ],
  userController.resetPassword
)

router.patch(
  '/photo-upload',
  verifyToken,
  photoUpload,
  userController.updatePhoto
)


module.exports = router
