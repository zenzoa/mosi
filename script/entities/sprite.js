let Sprite = {

    create: ({ name, isAvatar, isWall, isItem, isTransparent, spriteWidth, spriteHeight, onPush, onMessage, randomStart }) => {
        let newSprite = {
            name: name || '',
            isAvatar: isAvatar || false,
            isWall: isWall || false,
            isItem: isItem || false,
            isTransparent: isTransparent || false,
            colorIndex: 1,
            width: spriteWidth,
            height: spriteHeight,
            frameList: [Array(spriteWidth * spriteHeight).fill(0)],
            scriptList: {
                'on-push': onPush || '',
                'on-message': onMessage || ''
            }
        }
        if (randomStart) {
            newSprite.frameList = [
                Sprite.randomFrame(spriteWidth, spriteHeight)
            ]
        }
        return newSprite
    },

    select: (that, spriteIndex, nextTab) => {
        let currentSpriteIndex = spriteIndex
        let scriptTabType = 'sprite'
        if (nextTab) that.setCurrentTab(nextTab)
        that.setState({ currentSpriteIndex, scriptTabType })
    },

    add: (that, sprite) => {
        let { spriteWidth, spriteHeight } = that.state
        let spriteList = that.state.spriteList.slice()
        sprite = !(sprite instanceof MouseEvent) ? deepClone(sprite) :
            Sprite.create({
                name: 'sprite-1',
                spriteWidth,
                spriteHeight
            })
        sprite.isAvatar = false

        // get a unique name
        let baseName = sprite.name
        let number = parseInt(baseName.split('-').slice(-1)[0])
        if (isInt(number)) {
            let numberLength = (number).toString().length + 1
            baseName = baseName.slice(0, -numberLength)
        } else {
            number = 2
        }
        while (spriteList.find(s => s.name === sprite.name)) {
            sprite.name = baseName + '-' + number
            number++
        }

        spriteList.push(sprite)
        let currentSpriteIndex = spriteList.length - 1
        that.setCurrentTab('sprite')
        that.setState({ spriteList, currentSpriteIndex })
    },

    import: (that, spriteData) => {
        try {
            let sprite = JSON.parse(spriteData)

            // check sprite size
            if (sprite.width !== that.state.spriteWidth || sprite.height !== that.state.spriteHeight) {
                throw('this sprite is the wrong size for your world!')
            }

            Sprite.add(that, sprite)
        }
        catch (e) {
            console.error('unable to import sprite!', e)
            that.setState({ showErrorOverlay: true, errorMessage: 'unable to import sprite!' })
        }
    },

    export: (that, spriteIndex) => {
        let sprite = deepClone(that.state.spriteList[spriteIndex])
        delete sprite.isAvatar
        let spriteData = JSON.stringify(sprite)
        return spriteData
    },

    setIsWall: (that, spriteIndex, newValue) => {
        let spriteList = that.state.spriteList.slice()
        spriteList[spriteIndex].isWall = newValue
        that.setState({ spriteList })
    },

    setIsItem: (that, spriteIndex, newValue) => {
        let spriteList = that.state.spriteList.slice()
        spriteList[spriteIndex].isItem = newValue
        that.setState({ spriteList })
    },

    setIsTransparent: (that, spriteIndex, newValue) => {
        let spriteList = that.state.spriteList.slice()
        spriteList[spriteIndex].isTransparent = newValue
        that.setState({ spriteList })
    },

    setColorIndex: (that, spriteIndex, newValue) => {
        let spriteList = that.state.spriteList.slice()
        spriteList[spriteIndex].colorIndex = newValue
        that.setState({ spriteList })
    },

    rename: (that, spriteIndex, newName) => {
        let spriteList = that.state.spriteList.slice()
        let roomList = that.state.roomList.slice()
        let sprite = spriteList[spriteIndex]
        let oldName = sprite.name
        
        if (newName === '') {
            that.setState({
                showErrorOverlay: true,
                errorMessage: `a sprite's name can't be empty!`
            })
        } else if (spriteList.find(s => s.name === newName)) {
            that.setState({
                showErrorOverlay: true,
                errorMessage: `another sprite is already named "${newName}"!`
            })
        } else {

            // rename room references
            roomList.forEach(room => {
                room.tileList.forEach(tile => {
                    if (tile.spriteName === oldName) {
                        tile.spriteName = newName
                    }
                })
            })

            sprite.name = newName
            that.setState({ spriteList, roomList })
        }
    },

    remove: (that, spriteIndex) => {
        let { currentSpriteIndex, oneTabMode } = that.state
        let roomList = that.state.roomList.slice()
        let spriteList = that.state.spriteList.slice()
        let sprite = spriteList[spriteIndex]

        // remove sprite from rooms
        roomList.forEach(room =>
            room.tileList = room.tileList.filter(tile =>
                tile.spriteName !== sprite.name
            )
        )

        // update current sprite index
        if (currentSpriteIndex >= spriteIndex && currentSpriteIndex > 0) {
            currentSpriteIndex--
        }

        // remove sprite from list
        spriteList.splice(spriteIndex, 1)

        if (oneTabMode) that.closeTab('sprite')

        that.setState({ spriteList, roomList, currentSpriteIndex })
    },

    addFrame: (that, spriteIndex, newFrame) => {
        let spriteList = that.state.spriteList.slice()
        let sprite = spriteList[spriteIndex]
        sprite.frameList = sprite.frameList.slice()
        sprite.frameList.push(newFrame)
        that.setState({ spriteList })
    },

    removeFrame: (that, spriteIndex, frameIndex) => {
        let spriteList = that.state.spriteList.slice()
        let sprite = spriteList[spriteIndex]
        sprite.frameList = sprite.frameList.slice()
        sprite.frameList.splice(frameIndex, 1)
        that.setState({ spriteList })
    },

    updateFrame: (that, spriteIndex, frameIndex, newFrame) => {
        let spriteList = that.state.spriteList.slice()
        let sprite = spriteList[spriteIndex]
        sprite.frameList = sprite.frameList.slice()
        sprite.frameList[frameIndex] = newFrame
        that.setState({ spriteList })
    },

    clearFrame: (width, height) => {
        return Array(width * height).fill(0)
    },

    flipFrame: (width, height, frame, horizontal) => {
        let rows = []
        for (let i = 0; i < height; i++) {
            rows.push(
                frame.slice(i * width, i * width + width)
            )
        }

        if (horizontal) rows.forEach(row => row.reverse())
        else rows.reverse()

        let newFrame = rows.reduce((prev, curr) => prev.concat(curr), [])
        return newFrame
    },

    rotateFrame: (width, height, frame) => {
        if (width !== height) return frame

        let newFrame = Array(width * height).fill(0)
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                newFrame[y * width + x] = frame[(width - x - 1) * height + y]
            }
        }
        return newFrame
    },

    randomFrame: (width, height) => {
        let newFrame = Array(width * height).fill(0)
        let randomPixels = Array(width * height).fill(0)
            .map(() => Math.floor(Math.random() * 2))

        let styles = ['left-right', 'top-bottom', 'corners']
        let style = styles[Math.floor(Math.random() * styles.length)]

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let xA = x
                let yA = y
                if (style === 'left-right' || style === 'corners') {
                    if (x >= width / 2) xA = (width - x - 1)
                }
                if (style === 'top-bottom' || style === 'corners') {
                    if (y >= height / 2) yA = (height - y - 1)
                }
                newFrame[y * width + x] = randomPixels[yA * width + xA]
            }
        }
    
        return newFrame
    },

    createGif: (that, spriteIndex, scale, colorList, onComplete) => {
        let { spriteList, spriteWidth, spriteHeight } = that.state
        let sprite = spriteList[spriteIndex]

        let width = spriteWidth * scale
        let height = spriteHeight * scale

        let frameCount = 12
        let frames = Array(frameCount).fill(0).map(() =>
            Array(width * height).fill(0)
        )

        frames.forEach((frame, i) => {
            let frameIndex = i % sprite.frameList.length
            let spriteFrame = sprite.frameList[frameIndex]

            let colorIndex = sprite.colorIndex
            while (colorIndex > 0 && !colorList[colorIndex]) colorIndex--

            spriteFrame.forEach((pixel, j) => {
                if (!pixel) return
                let pxOffset = Math.floor(j % spriteWidth) * scale
                let pyOffset = Math.floor(j / spriteWidth) * scale
                for (let x = 0; x < scale; x++) {
                    for (let y = 0; y < scale; y++) {
                        let pixelIndex = x + pxOffset + ((y + pyOffset) * width)
                        frame[pixelIndex] = colorIndex
                    }
                }
            })
        })

        GIF.encode(width, height, frames, FRAME_RATE, colorList, onComplete)
    },

    updateScript: (that, spriteIndex, event, script) => {
        let spriteList = that.state.spriteList.slice()
        let scriptList = spriteList[spriteIndex].scriptList
        scriptList[event] = script
        that.setState({ spriteList })
    },

    resize: (sprite, newWidth, newHeight) => {
        let oldWidth = sprite.width
        let oldHeight = sprite.height

        sprite.frameList = sprite.frameList.map(frame => {
            let newFrame = Array(newWidth * newHeight).fill(0)
            for (let x = 0; x < oldWidth; x++) {
                for (let y = 0; y < oldHeight; y++) {
                    let oldIndex = y * oldWidth + x
                    let oldPixelData = frame[oldIndex]
                    let newIndex = y * newWidth + x
                    newFrame[newIndex] = oldPixelData
                }
            }
            return newFrame
        })

        sprite.width = newWidth
        sprite.height = newHeight
    }

}
