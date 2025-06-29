// ==UserScript==
// @name AntiSoft - Otland money hunter
// @namespace http://tampermonkey.net/
// @version 1.0
// @description Показывает полную карту аута и местоположение сейфов
// @author Антисофт
// @match https://www.gwars.io/walk*
// @icon https://www.google.com/s2/favicons?domain=gwars.io
// @grant none
// ==/UserScript==

;(function () {
    'use strict'

    const drawMap = () => {
        if (document.getElementById('mapTable')) return

        const style = document.createElement('style')
        style.textContent = `
            #mapTable {
                border-collapse: collapse;
                position: fixed;
                top: 213px;
                left: 1043px;
                opacity: 0.7;
                z-index: 9999;
            }
            #mapTable td {
                width: 90px;
                height: 90px;
                border: 0px solid black;
                padding: 0;
                background-color: #9cc0f9;
                position: relative;
            }
            #mapTable img {
                width: 90px;
                height: 90px;
                display: block;
            }
        `
        document.head.appendChild(style)

        let safeSectors = []
        let sectorDots = {}

        try {
            const moneySectors = document
                .getElementById('js_autopickup')
                ?.parentElement?.parentElement?.parentElement?.innerText?.match(
                    /В секторе .+/g
                )

            if (moneySectors) {
                const parsed = moneySectors
                    .map((line) => {
                        const match = line.match(
                            /В секторе (.+?) \[(\d+),(\d+)\] лежит Сейф с ([\d,]+) Гб/
                        )
                        if (!match) return null
                        const [, sector, x, y, amount] = match
                        return {
                            sector: sector.trim(),
                            x: parseInt(x),
                            y: parseInt(y),
                            amount: amount,
                        }
                    })
                    .filter(Boolean)

                safeSectors = [...new Set(parsed.map((p) => p.sector))]

                for (const { sector, x, y, amount } of parsed) {
                    if (!sectorDots[sector]) sectorDots[sector] = []
                    sectorDots[sector].push({ x, y, amount })
                }

                // console.log('[GWars] Сектора с сейфами:', safeSectors)
                // console.log('[GWars] Точки сейфов:', sectorDots)
            }
        } catch (e) {
            console.warn('[GWars] Ошибка при парсинге сейфов:', e)
        }

        const mapMatrixData = {
            '168,167': { name: null, url: null },
            '168,168': { name: null, url: null },
            '168,169': { name: null, url: null },
            '168,170': {
                name: 'Nou Lake',
                url: 'https://images.gwars.io/img/mapsnavy/168-170.png',
            },
            '168,171': {
                name: 'Shoretale',
                url: 'https://images.gwars.io/img/mapsnavy/168-171.png',
            },
            '168,172': { name: null, url: null },
            '168,173': { name: null, url: null },

            '169,167': { name: null, url: null },
            '169,168': {
                name: 'Sector SA98',
                url: 'https://images.gwars.io/img/mapsnavy/169-168.png',
            },
            '169,169': {
                name: 'Ejection Point',
                url: 'https://images.gwars.io/img/mapsnavy/169-169.png',
            },
            '169,170': {
                name: 'Dangerous Xith',
                url: 'https://images.gwars.io/img/mapsnavy/169-170.png',
            },
            '169,171': {
                name: 'Second Path',
                url: 'https://images.gwars.io/img/mapsnavy/169-171.png',
            },
            '169,172': { name: null, url: null },
            '169,173': { name: null, url: null },

            '170,167': {
                name: 'West Cape',
                url: 'https://images.gwars.io/img/mapsnavy/170-167.png',
            },
            '170,168': {
                name: 'Raged Land',
                url: 'https://images.gwars.io/img/mapsnavy/170-168.png',
            },
            '170,169': {
                name: 'Spherix point',
                url: 'https://images.gwars.io/img/mapsnavy/170-169.png',
            },
            '170,170': {
                name: 'Eye of Glory',
                url: 'https://images.gwars.io/img/mapsnavy/170-170.png',
            },
            '170,171': {
                name: 'Chelby',
                url: 'https://images.gwars.io/img/mapsnavy/170-171.png',
            },
            '170,172': {
                name: 'Tiger Lairs',
                url: 'https://images.gwars.io/img/mapsnavy/170-172.png',
            },
            '170,173': {
                name: 'South Tibet',
                url: 'https://images.gwars.io/img/mapsnavy/170-173.png',
            },

            '171,167': {
                name: 'North Beach',
                url: 'https://images.gwars.io/img/mapsnavy/171-167.png',
            },
            '171,168': {
                name: 'Alpha Three',
                url: 'https://images.gwars.io/img/mapsnavy/171-168.png',
            },
            '171,169': {
                name: 'Aikon',
                url: 'https://images.gwars.io/img/mapsnavy/171-169.png',
            },
            '171,170': {
                name: 'Thordendal',
                url: 'https://images.gwars.io/img/mapsnavy/171-170.png',
            },
            '171,171': {
                name: 'Tracid Line',
                url: 'https://images.gwars.io/img/mapsnavy/171-171.png',
            },
            '171,172': {
                name: 'Hypercube',
                url: 'https://images.gwars.io/img/mapsnavy/171-172.png',
            },
            '171,173': { name: null, url: null },

            '172,167': {
                name: 'Abbey Road',
                url: 'https://images.gwars.io/img/mapsnavy/172-167.png',
            },
            '172,168': {
                name: 'Army Base',
                url: 'https://images.gwars.io/img/mapsnavy/172-168.png',
            },
            '172,169': {
                name: 'South Normand',
                url: 'https://images.gwars.io/img/mapsnavy/172-169.png',
            },
            '172,170': {
                name: 'Por Eso One',
                url: 'https://images.gwars.io/img/mapsnavy/172-170.png',
            },
            '172,171': {
                name: 'Freestates',
                url: 'https://images.gwars.io/img/mapsnavy/172-171.png',
            },
            '172,172': {
                name: 'World`s Corner',
                url: 'https://images.gwars.io/img/mapsnavy/172-172.png',
            },
            '172,173': { name: null, url: null },

            '173,167': {
                name: 'Threeforce',
                url: 'https://images.gwars.io/img/mapsnavy/173-167.png',
            },
            '173,168': {
                name: 'Overlord Point',
                url: 'https://images.gwars.io/img/mapsnavy/173-168.png',
            },
            '173,169': {
                name: 'East Cape',
                url: 'https://images.gwars.io/img/mapsnavy/173-169.png',
            },
            '173,170': { name: null, url: null },
            '173,171': { name: null, url: null },
            '173,172': { name: null, url: null },
            '173,173': { name: null, url: null },
        }

        const table = document.createElement('table')
        table.id = 'mapTable'
        document.body.appendChild(table)

        for (let y = 167; y <= 173; y++) {
            const row = document.createElement('tr')
            for (let x = 168; x <= 173; x++) {
                const key = `${x},${y}`
                const cell = document.createElement('td')
                const data = mapMatrixData[key]

                if (data?.url) {
                    const img = document.createElement('img')
                    img.src = data.url
                    img.alt = data.name || ''
                    cell.appendChild(img)
                }

                if (data?.name && safeSectors.includes(data.name.trim())) {
                    cell.style.border = '3px solid green'
                }

                if (
                    window.currentSectorName &&
                    data?.name &&
                    data.name.trim() === window.currentSectorName.trim()
                ) {
                    cell.style.border = '1px solid red'
                }

                if (data?.name && sectorDots[data.name]) {
                    for (const dot of sectorDots[data.name]) {
                        const dotEl = document.createElement('div')
                        dotEl.style.position = 'absolute'
                        dotEl.style.width = '6px'
                        dotEl.style.height = '6px'
                        dotEl.style.backgroundColor = 'green'
                        dotEl.style.border = '1px solid black'
                        dotEl.style.borderRadius = '2px'
                        dotEl.style.left = `${(dot.x / 96) * 90 - 3}px`
                        dotEl.style.top = `${(dot.y / 96) * 90 - 3}px`
                        cell.appendChild(dotEl)

                        const labelEl = document.createElement('div')
                        labelEl.textContent = dot.amount
                        labelEl.style.position = 'absolute'
                        labelEl.style.left = `${(dot.x / 96) * 90 + 6}px`
                        labelEl.style.top = `${(dot.y / 96) * 90 - 6}px`
                        labelEl.style.fontSize = '10px'
                        labelEl.style.color = 'black'
                        labelEl.style.backgroundColor = 'rgba(255,255,255,0.7)'
                        labelEl.style.padding = '0 2px'
                        labelEl.style.borderRadius = '2px'
                        labelEl.style.pointerEvents = 'none'
                        labelEl.style.zIndex = '999'
                        cell.appendChild(labelEl)
                    }
                }

                row.appendChild(cell)
            }
            table.appendChild(row)
        }
    }

    const observeSectorGPS = () => {
        try {
            const txt = document
                .getElementsByClassName('txt')[1]
                .getElementsByTagName('b')
            const sector = txt[0].innerText
            const gps = txt[2]
                .getElementsByClassName('bluefont')[0]
                .innerText.match(/\d+/g)
            const gps1 = +gps[0]
            const gps2 = +gps[1]

            window.currentLocation = { sector, gps1, gps2 }
            window.currentSectorName = sector
        } catch (e) {}
    }

    observeSectorGPS()
    drawMap()

    const gpsObserver = new MutationObserver(() => {
        observeSectorGPS()
    })
    gpsObserver.observe(document.body, { childList: true, subtree: true })

    const mapObserver = new MutationObserver(() => {
        if (!document.getElementById('mapTable')) {
            drawMap()
        }
    })
    mapObserver.observe(document.body, { childList: true, subtree: true })
})()
