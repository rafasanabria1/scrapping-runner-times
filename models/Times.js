const { mongoose, Schema } = require('mongoose')

const timeSchema = new mongoose.Schema({
  race: {
    type: Schema.Types.ObjectId,
    ref: 'Race',
    required: true
  },
  name: String,
  surname1: String,
  surname2: String,
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

const Time = mongoose.model('Time', timeSchema)

module.exports = Time
