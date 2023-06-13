const { mongoose, Schema } = require('mongoose')

const raceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: Date,
  city: {
    type: Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  originalLink: String
})

const Race = mongoose.model('Race', raceSchema)

module.exports = Race
