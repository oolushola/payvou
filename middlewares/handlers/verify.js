const jwt = require('jsonwebtoken')
const { errorResponse } = require('../responses')
const dotenv = require('dotenv').config()

const verifyToken = (req, res, next) => {
  const bearerToken = req.headers.authorization
  if(!bearerToken) {
    return errorResponse(
      403, res, 'missing token', {}
    )
  }
  const token = bearerToken.split(' ')[1]
  try {
    const verifyToken = jwt.verify(token, process.env.TOKEN_SECRET)
    if(!verifyToken) {
      errorResponse(
        403, res, 'invalid or expired token', {}
      )
    }
    req.email = verifyToken.email
    next()
  }
  catch(err) {
    errorResponse(
      500, res, 'internal server error', err
    )
  }
}

module.exports = verifyToken