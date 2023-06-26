const chunkArray = (arrayToChunk, chunkSize) => {
  const results = []
  while (arrayToChunk.length) {
    results.push(arrayToChunk.splice(0, chunkSize))
  }
  return results
}

module.exports = { chunkArray }
