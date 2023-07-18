require('dotenv').config()
const { chromium } = require('playwright-chromium')
const { chunkArray } = require('./utils')

const scrapHome = async () => {
  const browser = await chromium.launch({ headless: true })

  const page = await browser.newPage()
  await page.goto('https://www.ideain.com/')
  const links = await page.$$eval('a', links => {
    return links.map(link => link.href).filter(link => {
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
      const dateRaw = link.match(/^https:\/\/www\.ideain\.com\/([a-z]+)([0-9]{4})\/([a-z]+)([0-9]{4})\.htm$/)
      return dateRaw && dateRaw[1] === dateRaw[3] && months.includes(dateRaw[1]) && dateRaw[2] === dateRaw[4]
    })
  })
  await page.close()

  for (const link of links) {
    const newPage = await browser.newPage()
    await newPage.goto(link)

    const rows = await newPage.$$('tbody > tr')

    for (const row of rows) {
      const data = await row.$$('td > p font')
      if (data.length !== 3) continue

      const date = await data[0].textContent().then(date => {
        if (!date) return null
        const [day, month, year] = date?.trim().split('-')
        return new Date(parseInt('20' + year), parseInt(month), parseInt(day))
      })
      const city = await data[1].textContent().then(city => city?.trim().replace(/\n\s+/, ' '))

      const { name, link } = await data[2].$eval('a', anchor => {
        return {
          name: anchor.innerHTML.trim().replace(/\n\s+/, ' '),
          link: anchor.href
        }
      })

      await saveRace({ name, date, link, city })
    }
    await newPage.close()
  }
  await browser.close()
}

const scrapRaces = async () => {
  const browser = await chromium.launch({ headless: true })
  const races = await fetch(`${process.env.API_URL}/races`).then(res => res.json()).catch(error => {
    console.log({ msg: 'Error recuperando las carreras.', error })
  })

  for (const race of races) {
    if (race.distance > 0 && race.hasTimes) continue

    const page = await browser.newPage()
    await page.goto(race.link)

    if (!race.distance) {
      const distanceElements = await page.$$('p > font > b')
      let distance = 0
      for (const el of distanceElements) {
        const txt = await el.textContent()
        const distanceRaw = txt.match(/(\d+\.\d+)[\s\n]metros$/)
        if (!distanceRaw) continue

        distance = parseFloat(distanceRaw[1]) * 1000
        break
      }

      await fetch(`${process.env.API_URL}/races`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raceId: race.id, distance })
      }).catch(error => {
        console.log({ msg: 'Error actualizando distancia de una carrera.', error })
      })
    }

    if (!race.hasTimes) {
      const preElements = await page.$$('pre')

      const firstPre = await preElements.shift().textContent()
      const preDataRaw = firstPre.split('\n')
      const primaryHeader = preDataRaw.shift().replaceAll(/\s+/g, ' ').trim()

      if (primaryHeader !== 'CATEG DIF 1º DIST 1º') {
        console.log({ msg: 'Clasificación no estándard: ', link: race.link })
        continue // TODO: CASO CONTRARIO A UNA CLASIFICACIÓN NORMAL
      }
      // const secondaryHeader = preDataRaw.shift().trim().replaceAll(/\s+/g, '||')
      preDataRaw.shift()

      const timesToInsert = preDataRaw.filter(entry => {
        return !entry.startsWith('=')
      }).map(entry => {
        const entryRaw = entry.trim().replaceAll(/\s\s+/g, '||')

        const entrySplitted = entryRaw.split('||')
        const [generalClasif, sexClasif, categoryClasif, category, sex, de, nameRaw, totalTime, mKm, kmH, diffTimeToFirst, diffMettersToFirst, club] = entrySplitted

        const [surname1, surname2, ...restName] = nameRaw.split(' ')

        return {
          name: restName.join(' '),
          surname: `${surname1} ${surname2}`,
          generalClasif: parseInt(generalClasif),
          sexClasif: parseInt(sexClasif),
          categoryClasif: parseInt(categoryClasif),
          category,
          sex,
          totalTime,
          mKm,
          diffTimeToFirst,
          diffMettersToFirst,
          club
        }
      })

      await saveTimes({ raceId: race.id, times: timesToInsert })
    }

    await page.close()
  }
  await browser.close()
}

const saveRace = async ({ city, name, date, link }) => {
  const oldRace = await fetch(`${process.env.API_URL}/races?link=${link}`).then(res => res.json())
  if (oldRace) return oldRace

  await fetch(`${process.env.API_URL}/races`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ city, name, date, link })
  }).catch(error => {
    console.log({ msg: 'Error insertando una carrera.', error })
  })
}

const saveTimes = ({ raceId, times }) => {
  const timesChunk = chunkArray(times, 100)
  timesChunk.forEach(async (times, index) => {
    fetch(`${process.env.API_URL}/times`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raceId, times })
    }).catch(error => console.log({ msg: 'Error en la petición al servidor para insertar tiempos.', error }))
  })
}

(async () => {
  console.log('Inicio scrapHome')
  await scrapHome()
  console.log('Fin scrapHome')
  console.log('Inicio scrapRaces')
  await scrapRaces()
  console.log('Fin scrapRaces')
})()
