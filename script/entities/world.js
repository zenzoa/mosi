let World = {

    create: ({ worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight, randomStart }) => {
        let world = {
            version: VERSION,
            
            currentSpriteIndex: 0,
            spriteList: [],
            spriteWidth,
            spriteHeight,

            currentRoomIndex: 0,
            roomList: [],
            roomWidth,
            roomHeight,

            worldWidth,
            worldHeight,
            worldName: 'a new world',
            worldWrapHorizontal: false,
            worldWrapVertical: false,
            worldScriptList: {
                'on-start': '{position fullscreen}{world-name}{/position}'
            },

            currentPaletteIndex: 0,
            paletteList: [],

            currentMusicIndex: 0,
            musicList: [],

            fontResolution: 1,
            fontDirection: 'ltr',
            fontData: Font.parse(ASCII_TINY)
        }

        // create avatar
        world.spriteList.push(World.createAvatar(spriteWidth, spriteHeight))

        // create initial palette
        world.paletteList.push(Palette.create({}))

        // create initial music
        world.musicList.push(Music.create({ randomStart: true }))
 
        // initialize room list
        let defaultPaletteName = world.paletteList[0].name
        let defaultMusicName = world.musicList[0].name
        world.roomList = Array(worldWidth * worldHeight).fill(0).map((_, i) => {
            let x = Math.floor(i % worldWidth)
            let y = Math.floor(i / worldWidth)
            return Room.create(x, y, defaultPaletteName, defaultMusicName)
        })

        // place random tiles throughout world
        if (randomStart) {
            world.spriteList.push(Sprite.create({
                name: 'floor',
                spriteWidth,
                spriteHeight,
                randomStart: true
            }))
            world.spriteList.push(Sprite.create({
                name: 'wall',
                isWall: true,
                spriteWidth,
                spriteHeight,
                randomStart: true
            }))
            world.spriteList.push(Sprite.create({
                name: 'item',
                isItem: true,
                spriteWidth,
                spriteHeight,
                onPush: 'You have picked up {item-count {sprite-name}} {sprite-name}s!',
                randomStart: true
            }))
            world.roomList.forEach(room => {
                room.tileList = Room.randomTileList(roomWidth, roomHeight, world.spriteList)
            })
        }

        // place avatar
        world.roomList[0].tileList.push({
            spriteName: 'avatar',
            x: 0,
            y: 0
        })

        return world
    },

    createAvatar: (spriteWidth, spriteHeight) => {
        let avatar = Sprite.create({
            name: 'avatar',
            isAvatar: true,
            spriteWidth,
            spriteHeight,
            randomStart: true
        })

        if (spriteWidth === 8 && spriteHeight === 8) {
            avatar.frameList = [
                [0,0,0,0,1,0,0,1,0,1,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,1,0,0,1,0,0],
                [0,0,0,0,1,0,0,1,1,0,0,0,1,1,1,1,0,1,0,0,1,1,1,1,0,1,0,0,1,1,1,1,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,1,0,1,0,0,1,0]
            ]
        }

        return avatar
    },

    random: (that, world) => {
        let { roomWidth, roomHeight, spriteList, paletteList } = world
        let roomList = world.roomList.slice()
        roomList.forEach(room => {
            room.tileList = Room.randomTileList(roomWidth, roomHeight, spriteList)
            let paletteIndex = Math.floor(Math.random() * paletteList.length)
            let paletteName = paletteList[paletteIndex].name
            room.paletteName = paletteName
        })
        that.setState({ roomList: roomList })
    },

    clear: (that, world, passthrough) => {
        let { worldWidth, worldHeight, paletteList, musicList } = world
        let defaultPaletteName = paletteList[0].name
        let defaultMusicName = musicList[0].name
        let roomList = Array(worldWidth * worldHeight).fill(0).map((_, i) => {
            let x = Math.floor(i % worldWidth) + 1
            let y = Math.floor(i / worldWidth) + 1
            return Room.create(x, y, defaultPaletteName, defaultMusicName)
        })
        
        if (passthrough) return roomList

        that.setState({ roomList: roomList})
    },

    reset: (that) => {
        let newWorld = World.create({
            worldWidth: 3,
            worldHeight: 3,
            roomWidth: 16,
            roomHeight: 16,
            spriteWidth: 8,
            spriteHeight: 8,
            randomStart: true
        })
        that.setState(newWorld)
    },
    
    rename: (that, newName) => {
        that.setState({ worldName: newName })
    },

    resize: (that, world, props) => {
        let { roomList, spriteList, paletteList, musicList } = world
        let { worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight } = props

        let worldResized = world.worldWidth !== worldWidth || world.worldHeight !== worldHeight
        let roomResized = world.roomWidth !== roomWidth || world.roomHeight !== roomHeight
        let spriteResized = world.spriteWidth !== spriteWidth || world.spriteHeight !== spriteHeight

        if (worldResized || roomResized) {
            roomList = World.clear(that, { worldWidth, worldHeight, roomWidth, roomHeight, paletteList, musicList }, true)
        }

        if (spriteResized) {
            spriteList = spriteList.slice()
            spriteList.forEach(sprite => {
                sprite.frameList = [Array(spriteWidth * spriteHeight).fill(0)]
                sprite.width = spriteWidth
                sprite.height = spriteHeight
            })
        }

        let currentRoomIndex = 0

        that.setState({
            roomList,
            spriteList,
            worldWidth, worldHeight,
            roomWidth, roomHeight,
            spriteWidth, spriteHeight,
            currentRoomIndex
        })
    },

    import: (that, worldData) => {
        try {
            let world = typeof worldData === 'string' ? JSON.parse(worldData) : worldData

            // create at least one sprite
            if (!world.spriteList || world.spriteList.length < 1) {
                world.spriteList = []
                world.spriteList.push(World.createAvatar(spriteWidth, spriteHeight))
            }

            // create at least one palette
            if (!world.paletteList || world.paletteList.length < 1) {
                world.paletteList = []
                world.paletteList.push(Palette.create({}))
            }

            // create at least one music
            if (!world.musicList || world.musicList.length < 1) {
                world.musicList = []
                world.musicList.push(Music.create({ randomStart: true }))
            }

            // init world scripts
            if (!world.worldScriptList) {
                world.worldScriptList = {
                    'on-start': ''
                }
            }

            // init room scripts and regularize room names
            world.roomList.forEach(room => {
                if (!room.scriptList) {
                    room.scriptList = {
                        'on-enter': '',
                        'on-exit': ''
                    }
                }
            })

            // init sprite scripts and regularize sprite names
            world.spriteList.forEach(sprite => {
                if (!sprite.scriptList) {
                    sprite.scriptList = {
                        'on-push': '',
                        'on-message': ''
                    }
                }
            })

            // init fonts
            if (!world.fontResolution) world.fontResolution = 1
            if (!world.fontDirection) world.fontDirection = 'ltr'
            if (!world.fontData) world.fontData = Font.parse(ASCII_TINY)

            that.setState(world)
        }
        catch (e) {
            console.error('unable to import world!', e)
            that.setState({
                showErrorOverlay: true,
                errorMessage: isStr(e) ? e : 'unable to import world!'
            })
        }
    },

    export: (world) => {
        world = deepClone(world)

        // remove editor state
        delete world.currentTab
        delete world.tabVisibility
        delete world.tabHistory
        delete world.scriptTabType
        delete world.oneTabMode
        delete world.showErrorOverlay
        delete world.errorMessage

        let worldData = JSON.stringify(world)
        return worldData
    },

    setWrapHorizontal: (that, newValue) => {
        that.setState({ worldWrapHorizontal: newValue })
    },

    setWrapVertical: (that, newValue) => {
        that.setState({ worldWrapVertical: newValue })
    },

    updateScript: (that, _, event, script) => {
        if (!event) return
        let worldScriptList = that.state.worldScriptList
        worldScriptList[event] = script
        that.setState({ worldScriptList })
    }

}
