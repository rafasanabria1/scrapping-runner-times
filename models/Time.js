const { mongoose } = require('mongoose')

const timeSchema = new mongoose.Schema({
  raceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race'
  },
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

timeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Time = mongoose.model('Time', timeSchema)

module.exports = Time
