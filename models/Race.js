const { mongoose } = require('mongoose')

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
  distance: Number
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
  }
})

const Race = mongoose.model('Race', raceSchema)

module.exports = Race
