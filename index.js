require('dotenv').config()
const { connectDB, disconnectDB } = require('./mongo')
const { chromium } = require('playwright-chromium')
const City = require('./models/City')

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
        return { name: anchor.innerHTML.trim().replace(/\n\s+/, ' '), link: anchor.href }
      })

      saveCity({ name: city })
    }

    await newPage.close()
  }

  await browser.close()
}

const scrapRaces = async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  for (const race of bd.races) {
    await page.goto(race.link)
    const $pre = await page.$('pre')
    const txt = await $pre?.textContent().then(txt => txt.split('\n'))
  }
}

const saveCity = async ({ name }) => {
  const oldCity = await City.findOne({ name })
  if (oldCity) return oldCity

  try {
    const city = new City({ name })
    const result = city.save()
    return result
  } catch (error) {
    console.log({ msg: 'Error insertando una ciudad.', error })
  }
}

(async () => {
  await connectDB()
  await scrapHome()
  // await scrapRaces()
  await disconnectDB()
})()
