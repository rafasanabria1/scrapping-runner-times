import { get } from 'http'
import { fs } from 'fs'

export const chunkArray = (arrayToChunk, chunkSize) => {
  const results = []
  while (arrayToChunk.length) {
    results.push(arrayToChunk.splice(0, chunkSize))
  }
  return results
}

export const downloadImage = async (url, filepath) => {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
          .on('error', reject)
          .once('close', () => resolve(filepath))
      } else {
        res.resume()
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`))
      }
    })
  })
}
