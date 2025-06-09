// ==UserScript==
// @name         AntiSoft - GWars Syndicate Week Stats
// @author       AntiSoft
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  GWars Syndicate Week Stats
// @match        https://www.gwars.io/srating.php?rid=1*
// @grant        none
// ==/UserScript==

;(function () {
    'use strict'

    const syndicateLinks = [
        ...document.querySelectorAll('a[href*="/syndicate.php?id="]'),
    ]
    const ids = [
        ...new Set(
            syndicateLinks
                .map((a) => {
                    const match = a.href.match(/id=(\d+)/)
                    return match ? match[1] : null
                })
                .filter(Boolean)
        ),
    ]

    const allRows = []
    let loadedCount = 0

    const resultContainer = document.createElement('div')
    resultContainer.style.margin = '20px'
    resultContainer.innerHTML = '<h3>Таблица бойцов</h3>'
    document.body.prepend(resultContainer)

    function renderFinalTable(rows) {
        rows.sort((a, b) => b[4] - a[4])

        const table = document.createElement('table')
        table.style.borderCollapse = 'collapse'
        table.style.border = '1px solid black'
        table.style.marginTop = '10px'

        const header = ['#', 'Боец', 'Боев', 'Убийств', 'Rp', 'Опыт']
        const thead = document.createElement('tr')
        header.forEach((text) => {
            const th = document.createElement('th')
            th.textContent = text
            th.style.border = '1px solid black'
            th.style.padding = '4px 8px'
            thead.appendChild(th)
        })
        table.appendChild(thead)

        rows.forEach((row, i) => {
            const tr = document.createElement('tr')
            const cells = [i + 1, ...row]
            cells.forEach((cell) => {
                const td = document.createElement('td')
                td.style.border = '1px solid black'
                td.style.padding = '4px 8px'
                td.innerHTML = cell
                tr.appendChild(td)
            })
            table.appendChild(tr)
        })

        resultContainer.appendChild(table)
    }

    ids.forEach((id) => {
        const iframe = document.createElement('iframe')
        iframe.src = `https://www.gwars.io/syndicate.php?id=${id}&page=stats&sp=2`
        iframe.style.width = '0'
        iframe.style.height = '0'
        iframe.style.position = 'absolute'
        iframe.style.visibility = 'hidden'
        document.body.appendChild(iframe)

        const tryParse = setInterval(() => {
            try {
                const doc =
                    iframe.contentDocument || iframe.contentWindow.document
                const statTable = [...doc.querySelectorAll('table')].find(
                    (t) => {
                        const firstRow = t.rows[0]
                        return (
                            firstRow &&
                            firstRow.textContent.includes('Боец') &&
                            firstRow.textContent.includes('Rp')
                        )
                    }
                )

                if (!statTable) return

                clearInterval(tryParse)

                for (let i = 1; i < statTable.rows.length; i++) {
                    const cells = statTable.rows[i].cells
                    if (cells.length >= 6) {
                        const row = [
                            (() => {
                                const a = cells[1].querySelector('a')
                                return a
                                    ? `<a href="${
                                          a.href
                                      }" target="_blank">${a.textContent.trim()}</a>`
                                    : cells[1].innerText.trim()
                            })(),
                            cells[2].innerText.trim(),
                            cells[3].innerText.trim(),
                            cells[4].innerText.trim(),
                            parseInt(
                                cells[5].innerText.trim().replace(/,/g, ''),
                                10
                            ),
                        ]
                        allRows.push(row)
                    }
                }

                loadedCount++
                if (loadedCount === ids.length) {
                    renderFinalTable(allRows)
                }
            } catch (err) {
                console.warn('Ошибка при чтении iframe', err)
            }
        }, 1e3)
    })
})()
