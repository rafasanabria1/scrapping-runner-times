import { chromium } from 'playwright-core'
import { RaceModel } from '../models/race.js'
import { TimeModel } from '../models/time.js'
import { uploadToCloudinary } from '../utils.js'

export const ideain = {

  scrap: async () => {
    await ideain.scrapHome()
    await ideain.scrapRaces()
  },
  scrapHome: async () => {
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
          return new Date(parseInt('20' + year), parseInt(month - 1), parseInt(day))
        })
        const city = await data[1].textContent().then(city => city?.trim().replace(/\n\s+/, ' '))

        const { name, link } = await data[2].$eval('a', anchor => {
          return {
            name: anchor.innerHTML.trim().replace(/\n\s+/, ' '),
            link: anchor.href
          }
        })

        await RaceModel.createRace({ name, date, link, city, provider: 'ideain' })
      }
      await newPage.close()
    }
    await browser.close()
  },
  scrapRaces: async () => {
    const browser = await chromium.launch({ headless: true })
    const races = await RaceModel.getAllRaces()

    for (const race of races) {
      if (race.distance > 0 && race.timesCount > 0 && race.imageURL.toString() !== '') continue

      try {
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

          await RaceModel.updateRace({ raceId: race.id, distance })
        }

        if (race._count.times <= 0) {
          const preElements = await page.$$('pre')

          const firstPre = await preElements.shift().textContent()
          const preDataRaw = firstPre.split('\n')
          const primaryHeader = preDataRaw.shift().replaceAll(/\s+/g, ' ').trim()

          if (primaryHeader !== 'CATEG DIF 1º DIST 1º') {
            console.log({ msg: 'Clasificación no estándard: ', link: race.link })
            continue // TODO: CASO CONTRARIO A UNA CLASIFICACIÓN NORMAL
          }
          preDataRaw.shift()

          const timesToInsert = preDataRaw.filter(entry => {
            return !entry.startsWith('=')
          }).map(entry => {
            const entryRaw = entry.trim().replaceAll(/\s\s+/g, '||')

            const entrySplitted = entryRaw.split('||')
            const [generalClasif, sexClasif, categoryClasif, category, sex, , nameRaw, totalTime, mKm, , diffTimeToFirst, diffMettersToFirst, club] = entrySplitted

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

          await TimeModel.createAllTimes({ raceId: race.id, times: timesToInsert })
        }

        if (race.imageURL === null || race.imageURL === undefined || race.imageURL === '') {
          const src = await page.$$eval('img', imgs => {
            return imgs.map(img => img.getAttribute('src')).filter(src => {
              return src.startsWith('cartel')
            }).shift()
          })
          if (src !== undefined) {
            const url = new URL(src, page.url())
            const { url: imageURL } = await uploadToCloudinary(url.toString(), race.id)
            if (imageURL) {
              await RaceModel.updateRace({ raceId: race.id, imageURL })
            }
          }
        }
        await page.close()
      } catch (error) {
        console.log({ error })
      }
    }
    await browser.close()
  }
}
