require('dotenv').config()
const express = require('express')
const { connectDB, disconnectDB } = require('../mongo')
const Race = require('../models/Race')
const app = express()

connectDB().then(() => {
  app.use(express.json())

  app.get('/api/races', async (request, response) => {
    const races = await Race.find({}).sort('city, date')
    disconnectDB()
    response.json(races)
  })

  app.listen(process.env.API_PORT, () => {
    console.log(`Server running on PORT ${process.env.API_PORT}`)
  })
}).catch((err) => {
  console.log('No se ha podido conectar a la base de datos de mongoDB.')
  console.log(err)
})
