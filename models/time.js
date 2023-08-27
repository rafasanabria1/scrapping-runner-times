import { chunkArray } from '../utils.js'

export const TimeModel = {

  createAllTimes: async ({ raceId, times }) => {
    const promises = []
    const timesChunk = chunkArray(times, 100)
    timesChunk.forEach(async times => {
      promises.push(TimeModel.createTimes({ raceId, times }))
    })
    return await Promise.all(promises)
  },
  createTimes: async ({ raceId, times }) => {
    return await fetch(`${process.env.API_URL}/times`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raceId, times })
    }).catch(error => console.log({ msg: 'Insert time error.', error }))
  }
}
