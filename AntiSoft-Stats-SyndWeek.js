// ==UserScript==
// @name         AntiSoft - GWars Syndicate Week Stats
// @author       AntiSoft
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  GWars Syndicate Week Stats
// @match        https://www.gwars.io/srating.php?rid=1*
// @grant        none
// ==/UserScript==
;(function () {
    'use strict'

    const allRows = []
    let loadedCount = 0

    const resultContainer = document.createElement('div')
    resultContainer.style.margin = '20px'
    resultContainer.style.padding = '10px'
    resultContainer.style.border = '1px solid #888'
    resultContainer.style.background = '#f9f9f9'
    resultContainer.innerHTML = '<h3>Таблица бойцов</h3>'

    const generateButton = document.createElement('button')
    generateButton.textContent = 'Сгенерировать таблицу'
    generateButton.style.padding = '10px 20px'
    generateButton.style.fontSize = '14px'
    generateButton.style.cursor = 'pointer'
    generateButton.style.marginBottom = '10px'

    const loadingIndicator = document.createElement('div')
    loadingIndicator.style.fontWeight = 'bold'
    loadingIndicator.style.marginBottom = '10px'
    loadingIndicator.style.display = 'none'

    const progressWrapper = document.createElement('div')
    progressWrapper.style.width = '100%'
    progressWrapper.style.background = '#ddd'
    progressWrapper.style.borderRadius = '4px'
    progressWrapper.style.overflow = 'hidden'
    progressWrapper.style.marginBottom = '8px'
    progressWrapper.style.display = 'none'

    const progressBar = document.createElement('div')
    progressBar.style.height = '20px'
    progressBar.style.width = '0%'
    progressBar.style.background = '#4caf50'
    progressBar.style.transition = 'width 0.2s ease'
    progressBar.style.textAlign = 'center'
    progressBar.style.color = 'white'
    progressBar.style.fontWeight = 'bold'
    progressBar.style.fontSize = '12px'
    progressBar.textContent = '0%'

    progressWrapper.appendChild(progressBar)

    resultContainer.appendChild(generateButton)
    resultContainer.appendChild(loadingIndicator)
    resultContainer.appendChild(progressWrapper)
    document.body.prepend(resultContainer)

    generateButton.addEventListener('click', () => {
        generateButton.style.display = 'none'
        loadingIndicator.textContent = 'Загрузка... 0 / 0'
        loadingIndicator.style.display = 'block'
        progressWrapper.style.display = 'block'
        progressBar.style.width = '0%'
        progressBar.textContent = '0%'

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

        loadingIndicator.textContent = `Загрузка... 0 / ${ids.length}`
        allRows.length = 0
        loadedCount = 0

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
                            const fighterLink = cells[1].querySelector('a')
                            const fighterName = fighterLink
                                ? fighterLink.textContent.trim()
                                : cells[1].innerText.trim()
                            const fighterHref = fighterLink
                                ? fighterLink.href
                                : '#'

                            const syndId = id
                            const fighterHTML = `
                                <a href="/syndicate.php?id=${syndId}">
                                    <img src="https://images.gwars.io/img/synds_hd/${syndId}.gif" width="20" height="14" border="0" class="usersign" title="#${syndId}">
                                </a>
                                <a href="${fighterHref}" target="_blank" style="margin-left: 4px;">${fighterName}</a>
                            `

                            const row = [
                                fighterHTML,
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
                    const percent = Math.round((loadedCount / ids.length) * 100)
                    progressBar.style.width = `${percent}%`
                    progressBar.textContent = `${percent}%`
                    loadingIndicator.textContent = `Загрузка... ${loadedCount} / ${ids.length}`

                    if (loadedCount === ids.length) {
                        renderFinalTable(allRows)
                        progressBar.style.width = `100%`
                        progressBar.textContent = `100%`
                        loadingIndicator.textContent = `Готово: загружено ${loadedCount} синдикатов.`
                        generateButton.style.display = 'inline-block'
                        generateButton.disabled = false
                    }
                } catch (err) {
                    console.warn('Ошибка при чтении iframe', err)
                }
            }, 500)
        })
    })

    function renderFinalTable(rows) {
        const oldTables = resultContainer.querySelectorAll('table')
        oldTables.forEach((t) => t.remove())

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
})()
