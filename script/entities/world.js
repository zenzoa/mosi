let World = {

    create: ({ worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight, randomStart }) => {
        let world = {
            version: 0.5,
            
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
            worldName: '',
            worldWrapHorizontal: false,
            worldWrapVertical: false,

            currentPaletteIndex: 0,
            paletteList: [],

            currentMusicIndex: 0,
            musicList: [],

            fontResolution: 1,
            fontDirection: 'ltr',
            fontData: Font.parse(ASCII_TINY)
        }
 
        // initialize room list
        world.roomList = Array(worldWidth * worldHeight).fill(0).map((_, i) => {
            let x = Math.floor(i % worldWidth) + 1
            let y = Math.floor(i / worldWidth) + 1
            return {
                name: 'room-' + x + '-' + y,
                paletteName: 'palette 1',
                musicName: 'song 1',
                tileList: []
            }
        })

        // create avatar
        world.spriteList.push(World.createAvatar(spriteWidth, spriteHeight))

        // create initial palette
        world.paletteList.push(Palette.create({}))

        // create initial music
        world.musicList.push(Music.create({}))

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
        let { worldWidth, worldHeight, paletteList } = world
        let defaultPaletteName = paletteList[0].name
        let roomList = Array(worldWidth * worldHeight).fill(0).map((_, i) => {
            let x = Math.floor(i % worldWidth) + 1
            let y = Math.floor(i / worldWidth) + 1
            return {
                name: 'room-' + x + '-' + y,
                paletteName: defaultPaletteName,
                tileList: []
            }
        })
        
        if (passthrough) return roomList

        that.setState({ roomList: roomList})
    },
    
    rename: (that, newName) => {
        that.setState({ worldName: newName })
    },

    resize: (that, world, props) => {
        let { roomList, spriteList, paletteList } = world
        let { worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight } = props

        let worldResized = world.worldWidth !== worldWidth || world.worldHeight !== worldHeight
        let roomResized = world.roomWidth !== roomWidth || world.roomHeight !== roomHeight
        let spriteResized = world.spriteWidth !== spriteWidth || world.spriteHeight !== spriteHeight

        if (worldResized || roomResized) {
            roomList = World.clear(that, { worldWidth, worldHeight, paletteList }, true)
        }

        if (spriteResized) {
            spriteList = spriteList.slice()
            spriteList.forEach(sprite => {
                sprite.frameList = [Array(spriteWidth * spriteHeight).fill(0)]
                sprite.width = spriteWidth
                sprite.height = spriteHeight
            })
        }

        that.setState({
            roomList,
            spriteList,
            worldWidth, worldHeight,
            roomWidth, roomHeight,
            spriteWidth, spriteHeight
        })
    },

    import: (that, worldData) => {
        try {
            let world = JSON.parse(worldData)
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
    }

}
