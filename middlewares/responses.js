class response {
  static errorResponse(status, res, errorMessage, errorData) {
    res.status(status).json({
      statusCode: status,
      errors: errorData,
      message: errorMessage
    })
  }

  static successResponse(status, res, data, message) {
    res.status(status).json({
      data: data,
      message: message,
      statusCode: status
    })
  }
}

module.exports = response