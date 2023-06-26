require('dotenv').config()
const express = require('express')
const { connectDB } = require('../mongo')
const Race = require('../models/Race')
const Time = require('../models/Time')
const app = express()
const cors = require('cors')

connectDB().then(() => {
  app.use(express.json({ limit: '50mb' }))
  app.use(cors())

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
    const { link } = request.query
    const filters = {}
    if (link) filters.link = link

    const races = await Race.find(filters).sort('city, date')
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
    response.json(newRace.toJSON())
  })

  app.put('/api/races', async (request, response) => {
    const { raceId, distance } = request.body
    const race = await Race.findOneAndUpdate({ _id: raceId }, { distance }, { new: true })
    response.json(race.toJSON())
  })

  app.post('/api/times', async (request, response) => {
    const { raceId, times } = request.body
    const race = await Race.findById(raceId)

    if (!race) {
      return response.status(400).json({
        error: 'No se ha encontrado la carrera donde guardar los tiempos.'
      })
    }

    const timesToInsert = times.map(time => {
      time.raceId = raceId
      return time
    })
    await Time.insertMany(timesToInsert).catch(error => {
      console.log({ msg: 'Ha ocurrido un error insertando tiempos.', error })
    })
  })

  app.listen(process.env.API_PORT, () => {
    console.log(`Server running on PORT ${process.env.API_PORT}`)
  })
}).catch(error => {
  console.log({ msg: 'No se ha podido conectar a la base de datos de mongoDB.', error })
})
