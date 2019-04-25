let Room = {

    select: (that, roomIndex) => {
        let currentRoomIndex = roomIndex
        that.setCurrentTab('room')
        that.setState({ currentRoomIndex })
    },

    rename: (that, roomIndex, newName) => {
        let roomList = that.state.roomList.slice()
        let room = roomList[roomIndex]
        let oldName = room.name
        if (newName === '') {
            that.setState({ showErrorOverlay: true, errorMessage: `a room's name can't be empty!` })
        } else if (roomList.find(r => r.name === newName)) {
            that.setState({ showErrorOverlay: true, errorMessage: `another room is already named "${newName}"!` })
        } else {
            // TODO: replace references to room
            room.name = newName
            that.setState({ roomList })
        }
    },

    import: (that, roomIndex, roomData) => {
        try {
            let room = JSON.parse(roomData)
            let roomList = that.state.roomList.slice()
            let spriteList = that.state.spriteList

            // check room and sprite sizes
            if (room.width !== that.state.roomWidth || room.height !== that.state.roomHeight) {
                throw('this room is the wrong size for your world!')
            }
            if (room.spriteWidth !== that.state.spriteWidth || room.spriteHeight !== that.state.spriteHeight) {
                throw('sprites in this room are the wrong size for your world!')
            }
            delete room.width
            delete room.height
            delete room.spriteWidth
            delete room.spriteHeight

            // add related sprites
            if (room.spriteList) {
                spriteList = spriteList.slice()
                room.spriteList.forEach(sprite => {
                    let spriteAlreadyExists = spriteList.find(s => s.name === sprite.name)
                    if (!spriteAlreadyExists) {
                        spriteList.push(sprite)
                    }
                })
                delete room.spriteList
            }

            roomList[roomIndex] = room
            that.setState({ roomList, spriteList })
        }
        catch (e) {
            console.error('unable to import room!', e)
            that.setState({
                showErrorOverlay: true,
                errorMessage: isStr(e) ? e : 'unable to import room!'
            })
        }
    },

    export: (that, roomIndex) => {
        let room = deepClone(that.state.roomList[roomIndex])
        room.width = that.state.roomWidth
        room.height = that.state.roomHeight
        room.spriteWidth = that.state.spriteWidth
        room.spriteHeight = that.state.spriteHeight

        // get related sprites
        let spriteNames = []
        room.tileList.forEach(tile => {
            if (!spriteNames.includes(tile.spriteName)) {
                spriteNames.push(tile.spriteName)
            }
        })
        room.spriteList = spriteNames.map(spriteName =>
            that.state.spriteList.find(sprite =>
                sprite.name === spriteName
            )
        )

        let roomData = JSON.stringify(room)
        return roomData
    },

    clear: (that, roomIndex) => {
        let roomList = that.state.roomList.slice()
        let room = roomList[roomIndex]
        room.tileList = []
        that.setState({ roomList })
    },

    randomTileList: (width, height, spriteList) => {
        let tileList = []
        let spriteNames = spriteList.filter(s => !s.isAvatar).map(s => s.name)

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (Math.random() < 0.1) {
                    let spriteNameIndex = Math.floor(Math.random() * spriteNames.length)
                    let spriteName = spriteNames[spriteNameIndex]
                    tileList.push({
                        spriteName,
                        x,
                        y
                    })
                }
            }
        }

        return tileList
    },

    random: (that, roomIndex) => {
        let { roomWidth, roomHeight, spriteList } = that.state
        let roomList = that.state.roomList.slice()
        let room = roomList[roomIndex]
        room.tileList = Room.randomTileList(roomWidth, roomHeight, spriteList)
        that.setState({ roomList })
    },

    addTile: (that, roomIndex, x, y, spriteIndex) => {
        let { roomWidth, roomHeight, spriteList } = that.state
        let inBounds = x >= 0 && y >= 0 && x < roomWidth && y < roomHeight
        let roomList = that.state.roomList.slice()
        let room = roomList[roomIndex]
        room.tileList = room.tileList.slice()
        let sprite = spriteList[spriteIndex]

        // if placing avatar, remove it from everywhere else first
        if (sprite.isAvatar) {
            let avatarName = sprite.name
            roomList.forEach(room => {
                if (room.tileList.find(t => t.spriteName === avatarName)) {
                    room.tileList = room.tileList.filter(t => t.spriteName !== avatarName)
                }
            })
        }

        // place sprite in room
        if (sprite && inBounds) {
            room.tileList.push({
                spriteName: sprite.name,
                x,
                y
            })
            that.setState({ roomList })
        }
    },

    clearTile: (that, roomIndex, x, y) => {
        let roomList = that.state.roomList.slice()
        let room = roomList[roomIndex]
        room.tileList = room.tileList.filter(l => l.x !== x || l.y !== y)
        that.setState({ roomList })
    },

    setPaletteName: (that, roomIndex, newPaletteName) => {
        let roomList = that.state.roomList.slice()
        let room = roomList[roomIndex]
        room.paletteName = newPaletteName
        that.setState({ roomList })
    },

    createGif: (that, roomIndex, scale, colorList, onComplete) => {
        let { spriteList, spriteWidth, spriteHeight, roomList, roomWidth, roomHeight } = that.state
        let room = roomList[roomIndex]

        let width = spriteWidth * roomWidth * scale
        let height = spriteHeight * roomHeight * scale

        let frameCount = 12
        let frames = Array(frameCount).fill(0).map(() =>
            Array(width * height).fill(0)
        )

        frames.forEach((frame, i) => {
            room.tileList.forEach(tile => {
                let sprite = spriteList.find(s => s.name === tile.spriteName)
                let frameIndex = i % sprite.frameList.length
                let spriteFrame = sprite.frameList[frameIndex]

                let xOffset = tile.x * spriteWidth * scale
                let yOffset = tile.y * spriteHeight * scale

                let colorIndex = sprite.colorIndex
                while (colorIndex > 0 && !colorList[colorIndex]) colorIndex--

                spriteFrame.forEach((pixel, j) => {
                    if (!pixel) return
                    let pxOffset = Math.floor(j % spriteWidth) * scale + xOffset
                    let pyOffset = Math.floor(j / spriteWidth) * scale + yOffset
                    for (let x = 0; x < scale; x++) {
                        for (let y = 0; y < scale; y++) {
                            let pixelIndex = x + pxOffset + ((y + pyOffset) * width)
                            frame[pixelIndex] = colorIndex
                        }
                    }
                })
            })
        })

        GIF.encode(width, height, frames, FRAME_RATE, colorList, onComplete)
    },

    roomWithAvatar: (that) => {
        let { roomList, spriteList } = that.state
        let roomIndex = 0
        let avatarSprite = spriteList.find(sprite => sprite.isAvatar)
        if (avatarSprite) {
            roomList.forEach((room, i) => {
                room.tileList.forEach(tile => {
                    if (tile.spriteName === avatarSprite.name) {
                        roomIndex = i
                    }
                })
            })
        }
        return roomIndex
    }

}
