const express = require('express')
const { body } = require('express-validator')
const verifyToken = require('../middlewares/handlers/verify')
const voucherController = require('../controllers/vouchers/voucher')

const router = express.Router()

router.get(
  '/vouchers',
  verifyToken,
  voucherController.getVouchers
)

router.post(
  '/voucher',
  verifyToken,
  [
    body('vouchers.*.voucherName')
      .isString()
      .notEmpty()
      .trim()
      .toLowerCase()
      .notEmpty(),
    body('vouchers.*.amount')
      .isNumeric()
      .trim()
      .notEmpty()
  ],
  voucherController.addVoucher
)

router.patch(
  '/voucher',
  verifyToken,
  [
    body('vouchers.*.voucherName')
      .isString()
      .notEmpty()
      .trim()
      .toLowerCase()
      .notEmpty(),
    body('vouchers.*.amount')
      .isNumeric()
      .trim()
      .notEmpty()
  ],
  voucherController.updateVoucher
)

router.delete(
  '/voucher',
  verifyToken,
  [
    body('vouchers.*.voucherName')
      .isString()
      .notEmpty()
      .trim()
      .toLowerCase()
      .notEmpty(),
    body('vouchers.*.amount')
      .isNumeric()
      .trim()
      .notEmpty()
  ],
  voucherController.deleteVoucher
)

module.exports = router