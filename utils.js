import * as http from 'node:https'
import * as fs from 'node:fs'
import { v2 as cloudinary } from 'cloudinary'

export const chunkArray = (arrayToChunk, chunkSize) => {
  const results = []
  while (arrayToChunk.length) {
    results.push(arrayToChunk.splice(0, chunkSize))
  }
  return results
}

export const downloadImage = async (url, filepath) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
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

export const uploadToCloudinary = async (url, raceId) => {
  return await cloudinary.uploader.upload(url, {
    folder: 'runner-times/races',
    public_id: raceId
  }).catch(error => {
    console.log({ msg: 'Error uploading to cloudinary.', error })
  })
}
