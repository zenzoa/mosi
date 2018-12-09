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

        world.frameRate = 400
        world.wrapLeftRight = false
        world.wrapTopBottom = false

        world.showGrid = true
        world.randomSprites = true
        world.spritesCanStack = false

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
        return world
    }

    static copySprite(world, sprite) {
        let newSprite = Sprite.clone(sprite)
        if (newSprite.name) newSprite.name += ' copy'
        world.sprites.push(newSprite)
        return world
    }

    static delSprite(world, spriteId) {
        if (spriteId === world.avatarId) return world // can't delete avatar
        World.clearSprite(world, spriteId)
        world.sprites.splice(spriteId, 1)

        world.sprites = world.sprites.map(sprite => Sprite.bumpSpriteId(sprite, spriteId))
        world.rooms = world.rooms.map(room => Room.bumpSpriteId(room, spriteId))
        if (world.avatarId > spriteId) world.avatarId--
        
        return world
    }

    static clearSprite(world, spriteId) {
        world.rooms = world.rooms.map(room => Room.clearSprite(room, spriteId))
        return world
    }

    static setAvatar(world, spriteId) {
        World.clearSprite(world, spriteId)
        world.avatarId = spriteId
        return world
    }

    static addPalette(world) {
        let newPalette = Palette.new()
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
        return world
    }

    static clearPalette(world, paletteId) {
        world.rooms.forEach(room => {
            if (room.paletteId === paletteId) room.paletteId = 0
        })
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