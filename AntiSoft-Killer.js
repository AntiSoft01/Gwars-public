// ==UserScript==
// @name         AntiSoft - Killer NPC list
// @namespace    http://tampermonkey.net/
// @version      5.1
// @description  Создаёт таблицу целей из списка киллера, сканирует режим, владельца, добавляет кнопку на быстрое сообщение
// @match        https://www.gwars.io/info.php*
// @grant        none
// ==/UserScript==

;(function () {
    'use strict'

    const npcUrls = [
        'https://www.gwars.io/info.php?id=2401000&showattack=1',
        'https://www.gwars.io/info.php?id=2319818&showattack=1',
        'https://www.gwars.io/info.php?id=2376894&showattack=1',
        'https://www.gwars.io/info.php?id=2408664&showattack=1',
        'https://www.gwars.io/info.php?id=2368141&showattack=1',
        'https://www.gwars.io/info.php?id=2409085&showattack=1',
        'https://www.gwars.io/info.php?id=2410886&showattack=1',
        'https://www.gwars.io/info.php?id=2410386&showattack=1',
        'https://www.gwars.io/info.php?id=2405451&showattack=1',
        'https://www.gwars.io/info.php?id=2402675&showattack=1',
        'https://www.gwars.io/info.php?id=2319822&showattack=1',
        'https://www.gwars.io/info.php?id=2334503&showattack=1',
        'https://www.gwars.io/info.php?id=2410211&showattack=1',
        'https://www.gwars.io/info.php?id=2408618&showattack=1',
        'https://www.gwars.io/info.php?id=2407910&showattack=1',
        'https://www.gwars.io/info.php?id=2410755&showattack=1',
        'https://www.gwars.io/info.php?id=2318032&showattack=1',
        'https://www.gwars.io/info.php?id=2410469&showattack=1',
        'https://www.gwars.io/info.php?id=2403265&showattack=1',
        'https://www.gwars.io/info.php?id=2397036&showattack=1',
        'https://www.gwars.io/info.php?id=2405731&showattack=1',
        'https://www.gwars.io/info.php?id=2315209&showattack=1',
        'https://www.gwars.io/info.php?id=2407752&showattack=1',
        'https://www.gwars.io/info.php?id=2402818&showattack=1',
        'https://www.gwars.io/info.php?id=2393944&showattack=1',
        'https://www.gwars.io/info.php?id=2411319&showattack=1',

        // new Dominance
        'https://www.gwars.io/info.php?id=2407164&showattack=1',
        'https://www.gwars.io/info.php?id=2410265&showattack=1',
        'https://www.gwars.io/info.php?id=2410390&showattack=1',
        'https://www.gwars.io/info.php?id=2398777&showattack=1',

        //
        'https://www.gwars.io/info.php?id=2400862&showattack=1',
        'https://www.gwars.io/info.php?id=2404734&showattack=1',
        'https://www.gwars.io/info.php?id=2314768&showattack=1',
        'https://www.gwars.io/info.php?id=2315317&showattack=1',
        'https://www.gwars.io/info.php?id=2318179&showattack=1',
        'https://www.gwars.io/info.php?id=2374157&showattack=1',
        'https://www.gwars.io/info.php?id=2376663&showattack=1',
        'https://www.gwars.io/info.php?id=2376889&showattack=1',
        'https://www.gwars.io/info.php?id=2377293&showattack=1',
        'https://www.gwars.io/info.php?id=2378495&showattack=1',
        'https://www.gwars.io/info.php?id=2388143&showattack=1',
        'https://www.gwars.io/info.php?id=2393941&showattack=1',
        'https://www.gwars.io/info.php?id=2394530&showattack=1',
        'https://www.gwars.io/info.php?id=2395037&showattack=1',
        'https://www.gwars.io/info.php?id=2396322&showattack=1',
        'https://www.gwars.io/info.php?id=2397522&showattack=1',
        'https://www.gwars.io/info.php?id=2398717&showattack=1',
        'https://www.gwars.io/info.php?id=2399929&showattack=1',
        'https://www.gwars.io/info.php?id=2399966&showattack=1',

        'https://www.gwars.io/info.php?id=2401338&showattack=1',
        'https://www.gwars.io/info.php?id=2402814&showattack=1',
        'https://www.gwars.io/info.php?id=2403295&showattack=1',
        'https://www.gwars.io/info.php?id=2404442&showattack=1',
        'https://www.gwars.io/info.php?id=2404663&showattack=1',
        'https://www.gwars.io/info.php?id=2405022&showattack=1',
        'https://www.gwars.io/info.php?id=2405288&showattack=1',
        'https://www.gwars.io/info.php?id=2405844&showattack=1',
        'https://www.gwars.io/info.php?id=2406866&showattack=1',
        'https://www.gwars.io/info.php?id=2407170&showattack=1',
        'https://www.gwars.io/info.php?id=2408301&showattack=1',
        'https://www.gwars.io/info.php?id=2408471&showattack=1',
        'https://www.gwars.io/info.php?id=2408598&showattack=1',
        'https://www.gwars.io/info.php?id=2408454&showattack=1',
        'https://www.gwars.io/info.php?id=2409260&showattack=1',

        'https://www.gwars.io/info.php?id=2402453&showattack=1',
        'https://www.gwars.io/info.php?id=2407801&showattack=1',
        'https://www.gwars.io/info.php?id=2405067&showattack=1',
        'https://www.gwars.io/info.php?id=2410763&showattack=1',
        'https://www.gwars.io/info.php?id=2408478&showattack=1',
        'https://www.gwars.io/info.php?id=2410731&showattack=1',
        'https://www.gwars.io/info.php?id=2410477&showattack=1',
        'https://www.gwars.io/info.php?id=2411319&showattack=1',
        'https://www.gwars.io/info.php?id=2407125&showattack=1',
        'https://www.gwars.io/info.php?id=2407834&showattack=1',
        'https://www.gwars.io/info.php?id=2315185&showattack=1',
        'https://www.gwars.io/info.php?id=2404184&showattack=1',
        'https://www.gwars.io/info.php?id=2401129&showattack=1',
        'https://www.gwars.io/info.php?id=2402151&showattack=1',
        'https://www.gwars.io/info.php?id=2315063&showattack=1',
        'https://www.gwars.io/info.php?id=2396475&showattack=1',
    ]

    class NPCEntry {
        constructor(url, tableBody) {
            this.url = url
            this.tableBody = tableBody
            this.row = document.createElement('tr')
            this.row.innerHTML = `<td colspan="7">Загрузка...</td>`
            this.tableBody.appendChild(this.row)
            this.data = null
            this.row.dataset.isFollowing = 'false'
        }

        async load() {
            const data = await this.fetchData()
            if (!data) {
                this.row.innerHTML = `<td colspan="7" style="color:red">Ошибка загрузки</td>`
                return
            }
            if (data.ownerId) {
                data.ownerStatus = await this.fetchOwnerStatus(data.ownerId)
            }
            this.updateRow(data)
        }

        async reload() {
            const data = await this.fetchData()
            if (data && data.ownerId) {
                data.ownerStatus = await this.fetchOwnerStatus(data.ownerId)
            }
            if (data) this.updateRow(data)
        }

        updateRow(data) {
            const isFollowing = data.mode.includes('Следует за')
            const isOnline = data.ownerStatus === 'в игре'
            this.row.dataset.isFollowing = isFollowing
            this.row.dataset.ownerStatus = isOnline ? '1' : '0'
            this.data = data

            const modeStyle =
                isFollowing && isOnline ? 'color:red;font-weight:bold;' : ''

            const ownerStatusHTML = data.ownerId
                ? `<div style="text-align:right;">
                    <a href="https://www.gwars.io/info.php?id=${
                        data.ownerId
                    }" target="_blank">
                        ${data.ownerId}${
                      data.ownerStatus ? ' — ' + data.ownerStatus : ''
                  }
                    </a>
                    ${
                        data.ownerStatus === 'в игре'
                            ? `<a href="https://www.gwars.io/sms-chat.php?id=${data.ownerId}" target="_blank">
                                    <img src="https://images.gwars.io/i/letter.svg" width="25" style="vertical-align:middle;">
                                </a>`
                            : ''
                    }
                </div>`
                : '—'

            this.row.innerHTML = `
                <td>${data.weapon}</td>
                <td>${data.region}</td>
                <td style="color:${data.hpColor}">${data.hp}</td>
                <td><a href="${data.url}" target="_blank">${data.level} — ${data.nick}</a></td>
                <td>${ownerStatusHTML}</td>
                <td style="${modeStyle}">${data.mode}</td>
                <td style="$ {
                    data.message.includes('Вы находитесь в другом секторе')
                        ? 'color:red;font-weight:bold;'
                        : data.message.includes('Владелец NPC не в игре')
                        ? 'color:gray;'
                        : ''
                }">${data.message}</td>
            `

            this.sortRows()
        }

        sortRows() {
            const rows = Array.from(this.tableBody.querySelectorAll('tr'))

            rows.sort((a, b) => {
                const aFollow = a.dataset.isFollowing === 'true'
                const bFollow = b.dataset.isFollowing === 'true'
                const aOnline = parseInt(a.dataset.ownerStatus || '0')
                const bOnline = parseInt(b.dataset.ownerStatus || '0')

                if (aFollow && aOnline && !(bFollow && bOnline)) return -1
                if (!(aFollow && aOnline) && bFollow && bOnline) return 1

                if (aOnline && !bOnline) return -1
                if (!aOnline && bOnline) return 1

                return 0
            })

            rows.forEach((row) => this.tableBody.appendChild(row))
        }

        fetchData() {
            return new Promise((resolve) => {
                const iframe = document.createElement('iframe')
                iframe.style.width = '0'
                iframe.style.height = '0'
                iframe.style.border = 'none'
                iframe.src = this.url
                document.body.appendChild(iframe)

                iframe.onload = () => {
                    try {
                        const doc = iframe.contentDocument
                        const nick = doc
                            .querySelector('#namespan')
                            ?.innerText.trim()
                        if (!nick) return resolve(null)

                        const ctrl = doc.getElementById('npc_control_div')
                        const mode =
                            ctrl?.parentElement?.previousElementSibling?.previousSibling?.textContent.trim() ||
                            '—'

                        let message = '—'
                        try {
                            const trs =
                                doc.getElementById('info_php_page').children[3]
                                    .children[0].children
                            const fourthFromEnd = trs[trs.length - 4]
                            if (fourthFromEnd?.innerText.trim()) {
                                message = fourthFromEnd.innerText.trim()
                            }
                        } catch {}

                        let level = ''
                        const levelRow = [...doc.querySelectorAll('tr')].find(
                            (tr) =>
                                tr.children[0]?.innerText.trim() === 'Боевой:'
                        )
                        if (levelRow) {
                            const match = levelRow.children[1]?.innerText
                                .trim()
                                .match(/^\d+/)
                            level = match ? match[0] : ''
                        }

                        const hpRaw = doc
                            .querySelector('#namespan')
                            ?.parentElement?.innerText.match(
                                /\[-?\d+ \/ \d+\]/
                            )?.[0]
                        let hpColor = 'gray'
                        if (hpRaw) {
                            const [cur, max] = hpRaw.match(/-?\d+/g).map(Number)
                            hpColor = cur === max ? 'green' : 'gray'
                        }

                        let weapon = 'отсутствует'
                        const armTables = [
                            ...doc.querySelectorAll('div'),
                        ].filter((div) => div.innerText.includes('Вооружение'))
                        for (const div of armTables) {
                            const trs = div.querySelectorAll('tr')
                            for (const tr of trs) {
                                const td1 = tr.children[0]?.innerText.trim()
                                if (td1 === 'Правая рука:') {
                                    weapon =
                                        tr.children[1]?.innerText.trim() ||
                                        'отсутствует'
                                    break
                                }
                            }
                            if (weapon !== 'отсутствует') break
                        }

                        let regionHTML = '-'
                        const regionDiv = [...doc.querySelectorAll('div')].find(
                            (div) => div.innerText.includes('Район:')
                        )
                        const regionLink = doc.querySelector('a.movetoxy')
                        if (regionDiv && regionLink) {
                            const textMatch =
                                regionDiv.innerText.match(/Район:\s*(.*)/)
                            const regionText = textMatch
                                ? textMatch[1].trim()
                                : regionLink.innerText.trim()
                            regionHTML = `<a href="${regionLink.href}" target="_blank">${regionText}</a>`
                        }

                        let ownerId = null
                        try {
                            const ownerBlock =
                                doc.getElementsByClassName('greenbrightbg')[0]
                            const ownerLink = ownerBlock?.querySelector(
                                'a[href*="/info.php?id="]'
                            )
                            if (ownerLink) {
                                const idMatch = ownerLink.href.match(/id=(\d+)/)
                                if (idMatch) ownerId = idMatch[1]
                            }
                        } catch {}

                        resolve({
                            url: this.url,
                            nick,
                            level,
                            hp: hpRaw,
                            hpColor,
                            weapon,
                            region: regionHTML,
                            mode,
                            message,
                            ownerId,
                        })
                    } catch (err) {
                        console.error('Ошибка при обработке:', this.url, err)
                        resolve(null)
                    } finally {
                        iframe.remove()
                    }
                }
            })
        }

        fetchOwnerStatus(ownerId) {
            return new Promise((resolve) => {
                const iframe = document.createElement('iframe')
                iframe.style.width = '0'
                iframe.style.height = '0'
                iframe.style.border = 'none'
                iframe.src = `https://www.gwars.io/info.php?id=${ownerId}`
                document.body.appendChild(iframe)

                iframe.onload = () => {
                    try {
                        const doc = iframe.contentDocument
                        const block =
                            doc.getElementsByClassName('withborders')[0]
                        const text = block?.innerText || ''
                        resolve(/Персонаж сейчас в/.test(text) ? 'в игре' : '')
                    } catch (e) {
                        resolve('')
                    } finally {
                        iframe.remove()
                    }
                }
            })
        }
    }
    class NPCTable {
        constructor(urls) {
            this.urls = urls
            this.tbody = this.createTable()
            this.entries = []
            this.updateQueue = []
        }

        createTable() {
            let oldTable = document.querySelector('#npc-html-table')
            if (oldTable) oldTable.remove()

            const table = document.createElement('table')
            table.id = 'npc-html-table'
            table.border = '1'
            table.style.borderCollapse = 'collapse'
            table.style.backgroundColor = '#e9ffe9'
            table.innerHTML = `
            <thead style="background-color:#d0eed0;">
            <tr>
                <th>Правое оружие</th>
                <th>Район</th>
                <th>ХП</th>
                <th>Уровень — Ник</th>
                <th>Владелец Статус</th>
                <th>Режим</th>
                <th>Сообщение</th>
            </tr>
            </thead>
            <tbody></tbody>
        `

            document.body.prepend(table)
            return table.querySelector('tbody')
        }

        loadAll() {
            let index = 0
            const loadNext = () => {
                if (index >= this.urls.length) return
                const entry = new NPCEntry(this.urls[index], this.tbody)
                entry.load()
                this.entries.push(entry)
                index++
                setTimeout(loadNext, 1000)
            }
            loadNext()

            setInterval(() => {
                this.updateQueue.push(...this.entries)
            }, 15000)

            this.scheduleUpdates()
        }

        scheduleUpdates() {
            const batchSize = 4
            const interval = 4000
            setInterval(() => {
                const batch = this.updateQueue.splice(0, batchSize)
                batch.forEach((entry) => entry.reload())
            }, interval)
        }
    }

    const button = document.createElement('button')
    button.innerText = 'Загрузить NPC'
    button.style.position = 'fixed'
    button.style.top = '30px'
    button.style.right = '10px'
    button.style.zIndex = 1000
    document.body.appendChild(button)

    button.onclick = () => {
        const table = new NPCTable(npcUrls)
        table.loadAll()
    }
})()
