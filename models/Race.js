const { mongoose } = require('mongoose')

const timeSchema = new mongoose.Schema({
  name: String,
  surname: String,
  genClasif: Number,
  sexClasif: Number,
  catClasif: Number,
  cat: String,
  sex: String,
  de: Number,
  totalTime: String,
  mKm: String,
  kmH: Number,
  diffTimeToFirst: String,
  diffMettersToFirst: Number,
  club: String
})

const raceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: Date,
  city: String,
  link: {
    type: String,
    required: true,
    unique: true
  },
  distance: Number,
  times: [timeSchema]
})

const Race = mongoose.model('Race', raceSchema)

module.exports = Race
