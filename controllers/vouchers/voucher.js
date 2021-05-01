const UserModel = require('../../models/user')
const { validationResult } = require('express-validator')
const { successResponse, errorResponse } = require('../../middlewares/responses')

class Voucher {
  static async getVouchers(req, res, next) {
    const perPage = +req.query.perPage || process.env.PER_PAGE
    const currentPage = +req.query.currentPage || process.env.CURRENT_PAGE
    try {
      const userVoucher = await UserModel
        .findOne({ email: req.email })
        .select('vouchers')
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        successResponse(
          200, res, userVoucher, 'vouchers resource'
        )
    }
    catch(err) {
      errorResponse(
        500, res, 'internal server error', err
      )
    }
    
  }

  static async addVoucher(req, res, next) {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return errorResponse(
        422, res, 'validation failed', errors.mapped()
      )
    }
    try {
      const user = await UserModel.findOne({ email: req.email }).select('vouchers')
      const userVoucher = [...user.vouchers]
      req.body.vouchers.map(voucher => {
      let vou = userVoucher.find(existingVoucher => voucher.voucherName !== existingVoucher.voucherName)
        if(!vou) {
          user.vouchers.push({...voucher, dateCreated: new Date()})
        }
      })
      const result = await user.save()
      successResponse(
        201, res, result, 'voucher updated'
      )
    } 
    catch(err) {
      errorResponse(
        500, res, 'internal server error', err
      )
    }
  }

  static async updateVoucher(req, res, next) {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return errorResponse(
        422, res, 'validation failed', errors.mapped()
      )
    }
    try {
      const user = await UserModel.findOne({ email: req.email }).select('vouchers')
      const userVouchers = [...user.vouchers]
      req.body.vouchers.map(voucher => {
        let getVoucherIndex = userVouchers.findIndex(
          payvou => payvou.voucherName === voucher.voucherName
        )
        if(getVoucherIndex >= 0) {
          userVouchers[getVoucherIndex].voucherName = voucher.voucherName
          userVouchers[getVoucherIndex].amount = voucher.amount
        }
      })
      user.vouchers = userVouchers
      const result = await user.save()
      successResponse(
        200, res, result, 'voucher updated  '
      )
    }
    catch(err) {
      errorResponse(
        500, res, 'internal server error', err
      )
    }
  }

  static async deleteVoucher(req, res, next) {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return errorResponse(
        422, res, 'validation failed', errors.mapped()
      )
    }
    try {
      const user = await UserModel.findOne({ email: req.email }).select('vouchers')
      const userVouchers = [...user.vouchers]
      req.body.vouchers.map(voucher => {
        let getVoucherIndex = userVouchers.findIndex(
          payvou => payvou.voucherName === voucher.voucherName
        )
        if(getVoucherIndex >= 0) {
          userVouchers.splice(getVoucherIndex, 1)
        }
      })
      user.vouchers = userVouchers
      const result = await user.save()
      successResponse(
        200, res, result, 'voucher removed '
      )
    }
    catch(err) {
      errorResponse(
        500, res, 'internal server error', err
      )
    }
  }
}

module.exports = Voucher