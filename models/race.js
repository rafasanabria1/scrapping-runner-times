export const RaceModel = {

  createRace: async ({ city, name, date, link, provider }) => {
    const oldRaces = await RaceModel.getRaceByLink(encodeURI(link))
    const oldRace = oldRaces[0]
    if (oldRace) {
      return Promise.resolve(oldRace)
    }

    return await fetch(`${process.env.API_URL}/races`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ city, name, date, link, provider })
    }).catch(error => {
      console.log({ msg: 'Insert race error.', error })
    })
  },
  getAllRaces: async () => {
    return await fetch(`${process.env.API_URL}/races`).then(res => res.json()).catch(error => {
      console.log({ msg: 'Error getting races.', error })
    })
  },
  getRaceByLink: async (link) => {
    return await fetch(`${process.env.API_URL}/races?link=${link}`).then(res => res.json()).catch(error => {
      console.log({ msg: 'Error getting race by link.', error })
    })
  },
  updateRace: async ({ raceId, distance = '', imageURL = '' }) => {
    const body = {
      raceId
    }
    if (distance !== '') body.distance = distance
    if (imageURL !== '') body.imageURL = imageURL

    return await fetch(`${process.env.API_URL}/races`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).catch(error => {
      console.log({ msg: 'Update race error.', error })
    })
  }
}
