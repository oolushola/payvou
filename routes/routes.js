const express = require('express')
const userRoutes = require('./userRoutes')
const voucherRoutes = require('./voucherRoutes')

const router = express.Router()

router.use(
  userRoutes,
  voucherRoutes
)

module.exports = router