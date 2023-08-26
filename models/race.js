export const RaceModel = {

  createRace: async ({ city, name, date, link, provider }) => {
    const oldRace = await RaceModel.getRaceByLink(link)[0]
    if (oldRace !== undefined) {
      console.log({ msg: 'Duplicate link in database.', oldRace })
      return Promise.resolve(oldRace)
    }

    return await fetch(`${process.env.API_URL}/races`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ city, name, date, link, provider })
    }).then(res => res.json()).then(res => {
      console.log({ msg: 'Race created', res })
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
  updateRace: async ({ raceId, distance }) => {
    return await fetch(`${process.env.API_URL}/races`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raceId, distance })
    }).then(res => res.json()).then(res => {
      console.log({ msg: 'Race updated', res })
    }).catch(error => {
      console.log({ msg: 'Update race error.', error })
    })
  }
}
