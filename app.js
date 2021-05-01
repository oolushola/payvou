const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()
const connectDb = require('./middlewares/database')
const routes = require('./routes/routes')
const path = require('path')
const multer = require('multer')

const PORT = process.env.PORT || 3500
const BASEURL = process.env.BASE_URL

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/public/images', express.static(path.join(__dirname, 'public/images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, COPY')
  next()
})

app.use(`${BASEURL}`, routes)

app.use((error, req, res, next) => {
  const status = error.statusCode || 500
  const errorData = error.errorData
  const message = error.msg
  res.status(status).json({
    statusCode: status,
    errors: errorData,
    response: message
  })
})

app.use('*', (req, res, next) => {
  res.status(404).json({
    response: 'resource not found',
    statusCode: 404
  })
})


connectDb(process.env.CONNECTION_STRING, PORT, app)
