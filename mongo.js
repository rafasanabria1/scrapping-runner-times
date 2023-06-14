// @ts-check
const mongoose = require('mongoose')

const mongoDBConnectionString = `mongodb+srv://rafasanabria1:${process.env.MONGODB_PASSWORD}@primary.rsxwoba.mongodb.net/ideain-scrap`

const connectDB = () => {
  return mongoose.connect(mongoDBConnectionString)
}

const disconnectDB = () => {
  mongoose.disconnect()
    .then(() => console.log('Database disconnected'))
    .catch(e => console.log({ msg: 'Error disconnecting from database', e }))
}

module.exports = { connectDB, disconnectDB }
