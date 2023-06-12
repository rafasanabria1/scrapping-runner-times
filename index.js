// @ts-check
const { chromium } = require('playwright')

;(async () => {
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

  for (const link of links) {
    const newPage = await browser.newPage()
    await newPage.goto(link)

    const rows = await newPage.$$('tbody > tr')

    console.log({ filas: rows.length })

    // eslint-disable-next-line no-unreachable-loop
    for (const row of rows) {
      const data = await row.$$('td > p font')

      console.log({ link, elementosFila: data.length })
    }

    newPage.close()
  }

  page.close()
  await browser.close()
})()
