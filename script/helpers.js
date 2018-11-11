let IDtoXY = (id, size) => {
    let y = Math.floor(id / size)
    let x = id - (y * size)
    return { x, y }
}

let XYtoID = (x, y, size) => {
    return x + (y * size)
}

let getDeepValue = (obj, path) => {
    let value = null
    let key = path.shift()
    if (path.length === 0 && typeof obj[key] !== 'undefined') {
        value = obj[key]
    } else if (typeof obj[key] === 'object') {
        value = getDeepValue(obj[key], path)
    }
    return value
}

let setDeepValue = (obj, path, value) => {
    let key = path.shift()
    if (path.length === 0) {
        obj[key] = value
    } else {
        if (obj[key] == null || typeof obj[key] !== 'object') {
            if (typeof path[0] === 'number') obj[key] = []
            else obj[key] = {}
        }
        setDeepValue(obj[key], path, value)
    }
}

let deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

let flipFrame = (frame, size, vertical) => {
    let rows = []
    for (let row = 0; row < size; row++) {
        let newRow = frame.slice(row * size, row * size + size)
        if (!vertical) newRow.reverse()
        rows.push(newRow)
    }
    if (vertical) rows.reverse()
    let newFrame = []
    rows.forEach((row) => newFrame = newFrame.concat(row))
    return newFrame
}

let clearCanvas = (canvas, backgroundColor) => {
    let context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)

    if (backgroundColor) {
        context.fillStyle = backgroundColor
        context.fillRect(0, 0, canvas.width, canvas.height)
    }
}

let renderFrame = (canvas, frame, options) => {
    let offsetX = options.offsetX || 0
    let offsetY = options.offsetY || 0
    let size = options.size || canvas.width
    let color = options.color || '#000'

    let context = canvas.getContext('2d')
    context.fillStyle = color

    for (let y = 0; y < size; y++) {
        for(let x = 0; x < size; x++) {
            let frameId = XYtoID(x, y, size)
            if (frame[frameId]) context.fillRect(x + offsetX, y + offsetY, 1, 1)
        }
    }
}

let renderRoom = (canvas, tiles, sprites, options) => {
    let spriteFrames = options.spriteFrames || []
    let roomSize = options.roomSize || 0
    let spriteSize = options.spriteSize || 0
    let offsetX = options.offsetX || 0
    let offsetY = options.offsetY || 0
    let colors = options.colors || []

    for (let y = 0; y < roomSize; y++) {
        for(let x = 0; x < roomSize; x++) {
            let tileOffsetX = offsetX + (x * spriteSize)
            let tileOffsetY = offsetY + (y * spriteSize)
            let tileId = XYtoID(x, y, roomSize)
            let tile = tiles[tileId] || []
            tile.forEach((spriteId) => {
                let sprite = sprites[spriteId] || {}
                let frame = spriteFrames[spriteId] || 0
                let frameData = sprite.frames && sprite.frames[frame]
                if (frameData) {
                    renderFrame(canvas, frameData, {
                        size: spriteSize,
                        offsetX: tileOffsetX,
                        offsetY: tileOffsetY,
                        color: colors[sprite.colorId] || colors[colors.length - 1]
                    })
                }
            })
        }
    }
}

let renderCharacter = (context, charCode, font, options) => {
    let offsetX = options.offsetX || 0
    let offsetY = options.offsetY || 0
    let width = font.size.width
    let height = font.size.height
    let data = font.characters[charCode]
    if (!data) return
    for (let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            let pixel = data[y * width + x]
            if (pixel) context.fillRect(x + offsetX, y + offsetY, 1, 1)
        }
    }
}

let renderTextLine = (context, text, font, options) => {
    options.offsetX = options.offsetX || 0
    let width = font.size.width
    for (let i = 0; i < text.length; i++) {
        let charCode = text.charCodeAt(i)
        renderCharacter(context, charCode, font, options)
        options.offsetX += width
    }
}

let divideText = (text, charWidth, width) => {
    let pages = []

    let lines = []
    let lineSoFar = ''
    let lineWidthSoFar = 0

    let newPage = () => {
        pages.push(lines)
        lines = []
    }

    let newLine = () => {
        lines.push(lineSoFar)
        lineSoFar = ''
        lineWidthSoFar = 0
        if (lines.length === 2) newPage()
    }

    let addText = (word) => {
        if (lineSoFar) lineSoFar += ' '
        lineSoFar += ' ' + word
        lineWidthSoFar += charWidth * (word.length + 1)
    }

    let linebreaks = text.split(/\n/g)
    text = linebreaks.join(' {br} ')
    text = text.replace(/{.+?}/g, ' $& ')
    let words = text.split(/\s/g)

    words.forEach(word => {
        if (word.toLowerCase() === '{br}') {
            newLine()
        }
        else if (word.toLowerCase() === '{p}') {
            newLine()
            newPage()
        }
        else if (lineWidthSoFar + charWidth * (word.length + 1) > width) {
            newLine()
            addText(word)
        }
        else {
            addText(word)
        }
    })

    if (lineSoFar) newLine()
    if (lines.length > 0) newPage()

    return pages
}

let renderText = (canvas, text, font, page, options) => {
    let context = canvas.getContext('2d')
    let bgColor = options.bgColor || '#000'
    let color = options.color || '#fff'
    let displayTime = options.displayTime || 30
    let dt = options.dt || 0

    let width = font.size.width
    let height = font.size.height
    let lineHeight = height + 2

    let linesPerScreen = options.linesPerScreen || 2
    let margin = options.margin || 2
    let padding = options.padding || 4
    let textboxWidth = canvas.width
    let textboxHeight = (lineHeight * (linesPerScreen - 1) + height) + (padding * 2)
    let offsetX = margin
    let offsetY = options.position === 'top' ? margin : canvas.height - textboxHeight - margin

    // prepare text
    let pages = divideText(text, font.size.width, textboxWidth - (padding * 2))
    if (page > pages.length - 1) page = pages.length - 1
    let lines = pages[page]

    // draw background
    context.fillStyle = bgColor
    context.fillRect(0, offsetY, textboxWidth, textboxHeight)

    // draw text
    let charactersToShow = Math.floor(dt / displayTime)
    if (charactersToShow > lines.join('').length) options.done && options.done()

    context.fillStyle = color
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]
        let partialLine = line.slice(0, charactersToShow)
        renderTextLine(context, partialLine, font, {
            offsetX: offsetX + padding,
            offsetY: offsetY + padding + (i * lineHeight),
            lineHeight: lineHeight
        })
        charactersToShow = Math.max(0, charactersToShow - line.length)
    }

    return pages.length
}

let findSpriteInWorld = (spriteId, rooms) => {
    let locations = []
    rooms.forEach((room, roomId) => {
        if (!room || !room.tiles) return
        let tiles = room.tiles
        tiles.forEach((tile, tileId) => {
            if (tile && tile.includes(spriteId)) {
                locations.push({ room: roomId, tile: tileId })
            }
        })
    })
    return locations
}

let removeSpriteFromWorld = (spriteId, rooms) => {
    return rooms.map((room) => {
        if (!room || !room.tiles) return
        let newRoom = deepClone(room)
        newRoom.tiles = room.tiles.map((tile) => {
            if (tile) return tile.filter((thisSpriteId) => thisSpriteId !== spriteId)
        })
        return newRoom
    })
}

let parseFont = (text) => {
    let size
    let characters = {}
    let lines = text.split('\n')
    let i = 0
    while (i < lines.length) {
        let line = lines[i].toLowerCase()
        let parts = line.split(' ')

        if (parts[0] === 'size' && parts.length === 3) {
            let width = parseInt(parts[1])
            let height = parseInt(parts[2])
            if (!isNaN(width) && !isNaN(height)) {
                size = { width, height }
            }

        } else if (parts[0] === 'char' && parts.length === 2 && size) {
            let char = parts[1]
            let data = Array(size.width * size.height).fill(0)
            for (let y = 0; y < size.height; y++) {
                i++
                let row = lines[i]
                for (let x = 0; x < size.width; x++) {
                    let pixel = parseInt(row && row[x])
                    if (pixel) data[y * size.width + x] = 1
                }
            }
            characters[char] = data
        }

        i++
    }
    return { size, characters }
}