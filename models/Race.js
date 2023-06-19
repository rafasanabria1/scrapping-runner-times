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
}, {
  virtuals: {
    fullName: {
      get () {
        return `${this.name} ${this.surname}`
      }
    }
  }
})

raceSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.times
  }
})

const Race = mongoose.model('Race', raceSchema)

module.exports = Race
