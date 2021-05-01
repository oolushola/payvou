const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  photo: {
    type: String
  },
  status: {
    default: true,
    type: Boolean
  },
  vouchers: [
    {
      voucherName: {
        type: String,
      },
      amount: {
        type: Number,
      },
      dateCreated: {
        type: Date
      },
      verifiedBy: {
        type: String
      },
      approvedBy: {
        type: String,
      },
      paidBy: {
        type: String
      }
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)