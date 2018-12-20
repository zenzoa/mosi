class Room {
    static new(w, h) {
        return {
            w: w,
            h: h,

            name: '',
            paletteId: 0,
            spriteLocations: []
        }
    }

    static import(obj, w, h, sprites) {
        if (obj.w !== w || obj.h !== h) throw 'room is the wrong size'

        let room = Room.new(w, h)

        let codeMap
        if (isArr(obj.relatedSprites) && sprites) {
            let nextId = sprites.length
            codeMap = {}
            obj.relatedSprites.forEach((_, index) => {
                codeMap[index] = nextId
                nextId++
            })
            room.relatedSprites = obj.relatedSprites.map(s => Sprite.import(s, sprites[0].w, sprites[0].h, null, null, codeMap))
        }

        if (isStr(obj.name)) room.name = obj.name
        if (isArr(obj.spriteLocations)) {
            if (codeMap) room.spriteLocations = obj.spriteLocations.map(({ spriteId, x, y }) => ({ spriteId: codeMap[spriteId], x, y }))
            else room.spriteLocations = obj.spriteLocations
        }

        return room
    }

    static export(room, sprites) {
        let spriteLocations = room.spriteLocations
        let relatedSprites

        if (sprites) {
            relatedSprites = []
            let codeMap = {}
            let relatedSpriteIds = Room.relatedSpriteIds(room, sprites)
            relatedSpriteIds.forEach((id, index) => {
                codeMap[id] = index
            })
            relatedSprites = relatedSpriteIds.map(id =>
                Sprite.export(sprites[id], null, null, codeMap)
            )
            spriteLocations = room.spriteLocations.map(({ spriteId, x, y }) => ({ spriteId: codeMap[spriteId], x, y }))
        }

        return {
            type: 'room',
            w: room.w,
            h: room.h,
            name: room.name,
            spriteLocations,
            relatedSprites
        }
    }

    static clone(room) {
        return Room.import(room, room.w, room.h)
    }

    static addSpriteLocation(room, spriteId, x, y) {
        room.spriteLocations.push({ spriteId, x, y })
        return room
    }

    static moveSpriteLocation(room, x, y, newX, newY) {
        let location, locationId
        room.spriteLocations.forEach((l, id) => {
            if (l.x === x && l.y === y) {
                location = l
                locationId = id
            }
        })
        room.spriteLocations.splice(locationId, 1)
        room.spriteLocations.push({ spriteId: location.spriteId, x: newX, y: newY })
        return room
    }

    static isSpriteInRoom(room, spriteId) {
        let index = room.spriteLocations.findIndex(l => l.spriteId === spriteId)
        return index !== -1
    }

    static isSpriteAtLocation(room, spriteId, x, y) {
        let locations = room.spriteLocations.filter(l => l.spriteId === spriteId && l.x === x && l.y === y)
        return locations.length > 0
    }
    
    static isTileEmpty(room, x, y) {
        let locations = room.spriteLocations.filter(l => l.x === x && l.y === y)
        return locations.length === 0
    }

    static lastSpriteAtLocation(room, x, y) {
        let locations = room.spriteLocations.filter(l => l.x === x && l.y === y)
        if (locations.length > 0) return locations[locations.length - 1].spriteId
        else return null
    }

    static changeSpriteIndex(room, start, end, change) {
        room.spriteLocations.forEach(l => {
            if (l.spriteId >= start && l.spriteId < end) l.spriteId = change(l.spriteId)
        })
        return room
    }

    static clear(room) {
        room.spriteLocations = []
        return room
    }

    static clearTile(room, x, y) {
        room.spriteLocations = room.spriteLocations.filter(l => !(l.x === x && l.y === y))
        return room
    }

    static clearTopSprite(room, x, y) {
        let ids = []
        room.spriteLocations.forEach((l, id) => {
            if (l.x === x && l.y === y) ids.push(id)
        })
        if (ids.length) {
            let lastId = ids[ids.length - 1]
            room.spriteLocations.splice(lastId, 1)
        }
        return room
    }

    static clearSprite(room, spriteId) {
        room.spriteLocations = room.spriteLocations.filter(l => !(l.spriteId === spriteId))
        return room
    }

    static relatedSpriteIds(room, sprites) {
        let ids = []
        room.spriteLocations.forEach(l => {
            ids.push(l.spriteId)
            ids = ids.concat(
                Sprite.relatedSpriteIds(sprites[l.spriteId], l.spriteId, sprites)
            )
        })
        return uniqueList(ids)
    }
    
    static draw(context, { world, room, x, y }) {
        x = x || 0
        y = y || 0

        let palette = world.palettes[room.paletteId]

        context.fillStyle = palette.colors[0]
        context.fillRect(x, y, world.roomWidth * world.spriteWidth, world.roomWidth * world.spriteHeight)

        room.spriteLocations.forEach(l => {
            let sprite = world.sprites[l.spriteId]
            Sprite.draw(sprite, context, {
                x: x + (l.x * world.spriteWidth),
                y: y + (l.y * world.spriteHeight),
                palette
            })
        })
    }
    
    static drawSimple(context, { world, room, x, y }) {
        x = x || 0
        y = y || 0

        let palette = world.palettes[room.paletteId]

        context.fillStyle = palette.colors[0]
        context.fillRect(x, y, world.roomWidth, world.roomWidth)

        room.spriteLocations.forEach(l => {
            let sprite = world.sprites[l.spriteId]
            context.fillStyle = palette.colors[sprite.colorId] || palette.colors[1] || '#000'
            context.fillRect(x + l.x, y + l.y, 1, 1)
        })
    }
}