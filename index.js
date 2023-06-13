require('dotenv').config()
const { connectDB, disconnectDB } = require('./mongo')
const { chromium } = require('playwright-chromium')
const City = require('./models/City')
const Race = require('./models/Race')

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
      const cityName = await data[1].textContent().then(city => city?.trim().replace(/\n\s+/, ' '))

      const { name, link } = await data[2].$eval('a', anchor => {
        return { name: anchor.innerHTML.trim().replace(/\n\s+/, ' '), link: anchor.href }
      })

      await saveRace({ name, date, link, cityName })
    }

    await newPage.close()
  }

  await browser.close()
}

const scrapRaces = async () => {
  // const browser = await chromium.launch({ headless: true })
  // const page = await browser.newPage()
  const races = await Race.find({}).populate('city').sort('date')
  for (const race of races) {
    console.log(race)
  }
}

const saveCity = async ({ name }) => {
  const oldCity = await City.findOne({ name })
  if (oldCity) return oldCity

  try {
    const city = new City({ name })
    return await city.save()
  } catch (error) {
    console.log({ msg: 'Error insertando una ciudad.', error })
    return null
  }
}

const saveRace = async ({ cityName, name, date, link }) => {
  const city = await saveCity({ name: cityName })

  const oldRace = await Race.findOne({ link })
  if (oldRace) return oldRace

  try {
    const race = new Race({ name, date, originalLink: link, city: city._id })
    return await race.save()
  } catch (error) {
    console.log({ msg: 'Errror insertando una carrera.', error })
    return null
  }
}

(async () => {
  await connectDB()
  // await scrapHome()
  await scrapRaces()
  await disconnectDB()
})()
