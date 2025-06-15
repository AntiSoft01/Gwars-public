// ==UserScript==
// @name         AntiSoft - Killer NPC list
// @namespace    http://tampermonkey.net/
// @version      5.5
// @description  Создаёт таблицу целей из списка киллера, сканирует режим, владельца, добавляет кнопку на быстрое сообщение
// @match        https://www.gwars.io/info.php*
// @grant        none
// ==/UserScript==

;(function () {
    'use strict'

    function getStoredNpcUrls() {
        const saved = localStorage.getItem('npcTargetList')
        if (!saved) return []

        return saved
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((entry) => {
                if (/^\d+$/.test(entry)) {
                    return `https://www.gwars.io/info.php?id=${entry}&showattack=1`
                } else if (entry.includes('info.php?id=')) {
                    const idMatch = entry.match(/id=(\d+)/)
                    return idMatch
                        ? `https://www.gwars.io/info.php?id=${idMatch[1]}&showattack=1`
                        : null
                }
                return null
            })
            .filter(Boolean)
    }

    function createInputArea(onLoadCallback) {
        let existing = document.querySelector('#npc-input-wrapper')
        if (existing) {
            existing.style.display = 'block'
            return
        }

        const wrapper = document.createElement('div')
        wrapper.id = 'npc-input-wrapper'
        Object.assign(wrapper.style, {
            position: 'fixed',
            top: '50px',
            right: '10px',
            zIndex: 10000,
            background: '#f0fff0',
            padding: '10px',
            border: '1px solid green',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        })

        const textarea = document.createElement('textarea')
        Object.assign(textarea, {
            rows: 10,
            cols: 30,
            placeholder: 'Вставь ID или ссылки NPC, по одному в строку',
            value: localStorage.getItem('npcTargetList') || '',
        })
        textarea.style.width = '500px'
        textarea.style.zIndex = 10001

        const saveBtn = document.createElement('button')
        saveBtn.textContent = 'Сохранить'
        saveBtn.style.marginTop = '5px'
        saveBtn.onclick = () => {
            localStorage.setItem('npcTargetList', textarea.value.trim())
            alert('Список сохранён! Обнови страницу или нажми кнопку загрузки.')
        }

        const loadBtn = document.createElement('button')
        loadBtn.textContent = 'Загрузить NPC'
        loadBtn.style.marginLeft = '5px'
        loadBtn.onclick = () => {
            wrapper.style.display = 'none'
            onLoadCallback()
        }

        wrapper.appendChild(textarea)
        wrapper.appendChild(document.createElement('br'))
        wrapper.appendChild(saveBtn)
        wrapper.appendChild(loadBtn)
        document.body.appendChild(wrapper)
    }

    const toggleBtn = document.createElement('button')
    toggleBtn.innerText = 'Показать / скрыть список'
    Object.assign(toggleBtn.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 10000,
        display: 'none',
    })
    document.body.appendChild(toggleBtn)

    toggleBtn.onclick = () => {
        const wrapper = document.querySelector('#npc-input-wrapper')
        if (wrapper) {
            wrapper.style.display =
                wrapper.style.display === 'none' ? 'block' : 'none'
        }
    }

    const showBtn = document.createElement('button')
    showBtn.innerText = 'Показать список NPC'
    Object.assign(showBtn.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 10000,
    })
    document.body.appendChild(showBtn)

    showBtn.onclick = () => {
        showBtn.style.display = 'none'
        toggleBtn.style.display = 'inline-block'
        createInputArea(() => {
            const urls = getStoredNpcUrls()
            if (!urls.length) {
                alert('Список пуст. Сначала добавь NPC.')
                return
            }
            const table = new NPCTable(urls)
            table.loadAll()
        })
    }

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
            this.row.dataset.isFullHp = data.hpColor === 'green' ? '1' : '0'

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
                <td><a href="${data.url}" target="_blank">${data.level} — ${
                data.nick
            }</a></td>
                <td>${ownerStatusHTML}</td>
                <td style="${modeStyle}">${data.mode}</td>
                <td class="limited-text" style="${
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
                const aFullHp = a.dataset.isFullHp === '1'
                const bFullHp = b.dataset.isFullHp === '1'

                if (aFollow && aOnline && !(bFollow && bOnline)) return -1
                if (!(aFollow && aOnline) && bFollow && bOnline) return 1

                if (aOnline && !bOnline) return -1
                if (!aOnline && bOnline) return 1

                if (aFullHp && !bFullHp) return -1
                if (!aFullHp && bFullHp) return 1

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
                <style>
                    .limited-text {
                        max-width: 300px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                </style>
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
})()
