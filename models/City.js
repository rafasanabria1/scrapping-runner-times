const { Schema, model } = require('mongoose')

const citySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
})

const City = model('City', citySchema)

module.exports = City
