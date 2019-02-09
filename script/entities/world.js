class World {
    static new(w = 9, h = 9, rw = 9, rh = 9, sw = 9, sh = 9) {
        let world = {}

        world.version = 0.2

        world.name = ''

        world.worldWidth = w
        world.worldHeight = h

        world.roomWidth = rw
        world.roomHeight = rh
        world.rooms = Array(w * h).fill().map(() => Room.new(rw, rh))

        world.spriteWidth = sw
        world.spriteHeight = sh
        world.sprites = [Sprite.new(sw, sh, true)]
        world.avatarId = 0
        
        world.palettes = [Palette.new()]
        world.font = window.ASCII_4x5 ? Font.parse(window.ASCII_4x5) : null
        world.textScale = 1

        world.frameRate = 400
        world.wrapLeftRight = false
        world.wrapTopBottom = false

        // editor-only properties
        world.drawMode = ('ontouchstart' in window) ? 'drag' : 'draw'
        world.showGrid = true
        world.randomSprites = true
        world.currentSpriteId = 0
        world.recentSpriteIds = [0]

        return world
    }

    static placeholder() {
        let world = World.new()

        let avatarData = {
            name: 'avatar',
            w: 9,
            h: 9,
            frames: [
                { pixels: [0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,1,0,1,1,1,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0] },
                { pixels: [0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,1,0,1,1,1,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0] }
            ]
        }

        let blockData = {
            name: 'block',
            colorId: 3,
            wall: true,
            w: 9,
            h: 9,
            frames: [
                { pixels: [0,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,1,1,1,0,1,1,0,0,0,1,1,1,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0] },
            ]
        }

        let flowerData = {
            name: 'flower',
            colorId: 2,
            item: true,
            actions: [{
                trigger: { type: 'push'},
                event: { type: 'dialog', text: 'you got a flower!' }
            }],
            w: 9,
            h: 9,
            frames: [
                { pixels: [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,1,1,0,0,0,0,0,1,1,1,0,1,0,0,0,1,0,1,1,0,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,0,0,1,1,1,1,1,0,0] },
                { pixels: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,1,0,0,1,1,0,1,0,0,0,1,1,1,0,1,0,0,0,1,0,1,1,0,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,0,0,1,1,1,1,1,0,0] }
            ]
        }

        let roomData = {
            w: 9,
            h: 9,
            spriteLocations: [
                { spriteId: 0, x: 4, y: 4 },
                { spriteId: 1, x: 3, y: 2 },
                { spriteId: 1, x: 3, y: 1 },
                { spriteId: 1, x: 1, y: 3 },
                { spriteId: 1, x: 2, y: 3 },
                { spriteId: 1, x: 7, y: 3 },
                { spriteId: 1, x: 6, y: 3 },
                { spriteId: 1, x: 5, y: 2 },
                { spriteId: 1, x: 5, y: 1 },
                { spriteId: 1, x: 1, y: 5 },
                { spriteId: 1, x: 2, y: 5 },
                { spriteId: 1, x: 3, y: 6 },
                { spriteId: 1, x: 3, y: 7 },
                { spriteId: 1, x: 5, y: 6 },
                { spriteId: 1, x: 5, y: 7 },
                { spriteId: 1, x: 6, y: 5 },
                { spriteId: 1, x: 7, y: 5 },
                { spriteId: 2, x: 1, y: 7 },
                { spriteId: 2, x: 7, y: 7 },
                { spriteId: 2, x: 7, y: 1 },
                { spriteId: 2, x: 1, y: 1 }
            ]
        }

        world.sprites = [
            Sprite.import(avatarData, 9, 9, 0),
            Sprite.import(blockData, 9, 9, 1),
            Sprite.import(flowerData, 9, 9, 2)
        ]

        world.rooms[40] = Room.import(roomData, 9, 9)

        return world
    }

    static import(obj) {
        let w = isInt(obj.worldWidth) && obj.worldWidth
        let h = isInt(obj.worldHeight) && obj.worldHeight
        let rw = isInt(obj.roomWidth) && obj.roomWidth
        let rh = isInt(obj.roomHeight) && obj.roomHeight
        let sw = isInt(obj.spriteWidth) && obj.spriteWidth
        let sh = isInt(obj.spriteHeight) && obj.spriteHeight
        if (!(w && h && rw && rh && sw && sh)) {
            console.error('unable to import world: invalid dimensions')
            return
        }
        
        let world = World.new(w, h, rw, rh, sw, sh)

        if (isStr(obj.name)) world.name = obj.name
        if (isArr(obj.rooms) && obj.rooms.length === w * h) {
            world.rooms = obj.rooms.map(r => Room.import(r, rw, rh))
        }
        if (isArr(obj.sprites) && obj.sprites.length > 0) {
            world.sprites = obj.sprites.map(s => Sprite.import(s, sw, sh))
        }
        if (isArr(obj.palettes) && obj.palettes.length > 0) {
            world.palettes = obj.palettes.map(p => Palette.import(p))
        }
        if (isInt(obj.avatarId) && world.sprites[obj.avatarId]) world.avatarId = obj.avatarId
        if (isObj(obj.font)) world.font = clone(obj.font)
        if (isInt(obj.textScale)) world.textScale = obj.textScale
        if (isInt(obj.frameRate)) world.frameRate = obj.frameRate
        if (isBool(obj.wrapLeftRight)) world.wrapLeftRight = obj.wrapLeftRight
        if (isBool(obj.wrapTopBottom)) world.wrapTopBottom = obj.wrapTopBottom

        return world
    }

    static export(world) {
        return {
            version: 0.2,
            name: world.name,

            worldWidth: world.worldWidth,
            worldHeight: world.worldHeight,

            roomWidth: world.roomWidth,
            roomHeight: world.roomHeight,
            rooms: world.rooms.map(room => Room.export(room)),

            spriteWidth: world.spriteWidth,
            spriteHeight: world.spriteHeight,
            sprites: world.sprites.map(sprite => Sprite.export(sprite)),
            avatarId: world.avatarId,

            palettes: world.palettes.map(palette => Palette.export(palette)),
            font: world.font,
            textScale: world.textScale,

            frameRate: world.frameRate,
            wrapLeftRight: world.wrapLeftRight,
            wrapTopBottom: world.wrapTopBottom
        }
    }

    static clone(world) {
        return World.import(world)
    }

    static addSprite(world, random) {
        let newSprite = Sprite.new(world.spriteWidth, world.spriteHeight, random)
        world.sprites.push(newSprite)
        world.currentSpriteId = world.sprites.length - 1
        return world
    }

    static copySprite(world, sprite) {
        let newSprite = Sprite.clone(sprite)
        if (newSprite.name) newSprite.name += ' copy'
        world.sprites.push(newSprite)
        world.currentSpriteId = world.sprites.length - 1
        return world
    }

    static delSprite(world, spriteId) {
        if (spriteId === world.avatarId) return world // can't delete avatar
        world = World.clearSprite(world, spriteId)
        world.sprites.splice(spriteId, 1)

        world = World.changeSpriteIndex(world, spriteId + 1, world.sprites.length + 1, x => x - 1)

        world.recentSpriteIds = world.recentSpriteIds.filter(spriteId => spriteId !== spriteId)
        if (world.recentSpriteIds.length === 0) world.recentSpriteIds = [world.currentSpriteId]
        
        return world
    }

    static clearSprite(world, spriteId) {
        world.rooms = world.rooms.map(room => Room.clearSprite(room, spriteId))
        return world
    }

    static changeSpriteIndex(world, start, end, change) {
        world.sprites = world.sprites.map(sprite => Sprite.changeSpriteIndex(sprite, start, end, change))
        world.rooms = world.rooms.map(room => Room.changeSpriteIndex(room, start, end, change))
        
        if (world.avatarId >= start && world.avatarId < end) {
            world.avatarId = Math.min(Math.max(0, change(world.avatarId)), world.sprites.length - 1)
        }

        if (world.currentSpriteId >= start && world.currentSpriteId < end) {
            world.currentSpriteId = Math.min(Math.max(0, change(world.currentSpriteId)), world.sprites.length - 1)
        }

        world.recentSpriteIds = world.recentSpriteIds.map(spriteId => {
            if (spriteId >= start && spriteId < end) {
                return Math.min(Math.max(0, change(spriteId)), world.sprites.length - 1)
            }
            return spriteId
        })

        return world
    }

    static reorderSprites(world, spriteId, insertId) {
        insertId = Math.min(Math.max(0, insertId), world.sprites.length)
        world.sprites = reorderList(world.sprites, spriteId, insertId)

        if (insertId === 0) {
            world = World.changeSpriteIndex(
                world, 0, world.sprites.length,
                x => x === spriteId ? 0 : x + 1
            )
        } else if (insertId < spriteId) {
            world = World.changeSpriteIndex(
                world, insertId, spriteId + 1,
                x => x === spriteId ? insertId : x + 1
            )
        } else if (spriteId < insertId) {
            world = World.changeSpriteIndex(
                world, spriteId, insertId,
                x => x === spriteId ? insertId - 1 : x - 1
            )
        }

        return world
    }

    static setAvatar(world, spriteId) {
        World.clearSprite(world, spriteId)
        world.avatarId = spriteId
        return world
    }

    static addPalette(world) {
        let lastPalette = world.palettes[world.palettes.length - 1]
        let newPalette = Palette.clone(lastPalette)
        world.palettes.push(newPalette)
        return world
    }

    static copyPalette(world, palette) {
        let newPalette = Palette.clone(palette)
        if (newPalette.name) newPalette.name += ' copy'
        world.palettes.push(newPalette)
        return world
    }

    static delPalette(world, paletteId) {
        if (world.palettes.length === 1) return world // can't delete last palette
        World.clearPalette(world, paletteId)
        world.palettes.splice(paletteId, 1)

        world = World.changePaletteIndex(world, paletteId + 1, world.palettes.length + 1, x => x - 1)

        return world
    }

    static clearPalette(world, paletteId) {
        world.rooms.forEach(room => {
            if (room.paletteId === paletteId) room.paletteId = 0
        })
        return world
    }

    static changePaletteIndex(world, start, end, change) {
        world.rooms = world.rooms.map(room => Room.changePaletteIndex(room, start, end, change))
        return world
    }

    static reorderPalettes(world, paletteId, insertId) {
        insertId = Math.min(Math.max(0, insertId), world.palettes.length)
        world.palettes = reorderList(world.palettes, paletteId, insertId)

        if (insertId === 0) {
            world = World.changePaletteIndex(
                world, 0, world.palettes.length,
                x => x === paletteId ? 0 : x + 1
            )
        } else if (insertId < paletteId) {
            world = World.changePaletteIndex(
                world, insertId, paletteId + 1,
                x => x === paletteId ? insertId : x + 1
            )
        } else if (paletteId < insertId) {
            world = World.changePaletteIndex(
                world, paletteId, insertId,
                x => x === paletteId ? insertId - 1 : x - 1
            )
        }

        return world
    }

    static avatarRoom(world) {
        let roomId = world.rooms.findIndex(r => Room.isSpriteInRoom(r, world.avatarId))
        if (roomId !== -1) return roomId
        else return null
    }

    static changeSize(world, w, h, rw, rh, sw, sh) {
        world.worldWidth = w
        world.worldHeight = h

        world.roomWidth = rw
        world.roomHeight = rh
        world.rooms = Array(w * h).fill().map(() => Room.new(rw, rh))

        world.spriteWidth = sw
        world.spriteHeight = sh
        world.sprites = [Sprite.new(sw, sh, true)]
        world.avatarId = 0

        return world
    }

    static changePaletteSize(world, paletteSize) {
        world.palettes.forEach(palette => {
            if (palette.colors.length > paletteSize) {
                palette.colors = palette.colors.slice(0, paletteSize)
            } else {
                loopUpTo(paletteSize - palette.colors.length, () => {
                    let newColor = chroma.random().hex()
                    palette.colors.push(newColor)
                })
            }
        })
        return world
    }

    static draw(context, world) {
        loopUpTo(world.worldWidth, x => {
            loopUpTo(world.worldHeight, y => {
                let roomId = x + (y * world.worldWidth)
                let room = world.rooms[roomId]
                Room.drawSimple(context, {
                    world,
                    room,
                    x: x * world.roomWidth,
                    y: y * world.roomHeight
                })
            })
        })
    }
}