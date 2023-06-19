require('dotenv').config()
const express = require('express')
const { connectDB } = require('../mongo')
const Race = require('../models/Race')
const app = express()

connectDB().then(() => {
  app.use(express.json())

  app.get('/api/races/:id', async (request, response) => {
    try {
      const race = await Race.findById(request.params.id)
      response.json(race.toJSON())
    } catch (e) {
      response.status(404).json({
        error: 'No se ha encontrado la carrera.'
      })
    }
  })

  app.get('/api/races', async (request, response) => {
    const races = await Race.find().sort('city, date')
    response.json(races.map(race => race.toJSON()))
  })

  app.post('/api/races', async (request, response) => {
    const { name, date, link, city } = request.body

    if (!name) {
      return response.status(400).json({
        error: 'El nombre de la carrera es obligatorio.'
      })
    }

    if (!link) {
      return response.status(400).json({
        error: 'El link de la carrera es obligatorio.'
      })
    }

    const newRace = new Race({ name, date, link, city })
    await newRace.save()
    response.json(newRace.toJSON)
  })

  app.listen(process.env.API_PORT, () => {
    console.log(`Server running on PORT ${process.env.API_PORT}`)
  })
}).catch((err) => {
  console.log('No se ha podido conectar a la base de datos de mongoDB.')
  console.log(err)
})
