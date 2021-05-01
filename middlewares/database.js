const mongoose = require('mongoose')

const databaseConnection = async (connectionParams, port, applicationObject) => {
  const connection = await mongoose.connect(connectionParams,
    { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }
  )
  try {
    applicationObject.listen(port, () => {
      console.log(`SERVER RUNNING ON PORT: ${port}`)
    })
  }
  catch(err) {
    console.log(err)
  }
}


module.exports = databaseConnection