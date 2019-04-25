class Game {

    constructor(world, wrapper) {
        this.world = world

        this.wrapper = wrapper

        this.canvas = document.createElement('canvas')
        this.canvas.width = world.roomWidth * world.spriteWidth
        this.canvas.height = world.roomHeight * world.spriteWidth
        wrapper.appendChild(this.canvas)
        this.context = this.canvas.getContext('2d')

        this.frameRate = 400

        this.begin = () => {
            let { roomList, spriteList, paletteList } = this.world

            // get avatar
            this.avatar = spriteList.find(sprite => sprite.isAvatar) || spriteList[0]
            this.avatarX = 0
            this.avatarY = 0
            this.inventory = {}

            // initialize animations variables
            this.lastTimestamp = 0
            this.timeToNextFrame = 0
            this.timeToNextInput = 0
            this.frameIndex = 0
            this.spriteFrameList = {}
            this.avatarDirection = 'right'

            // initialize dialog variables
            this.showDialog = false
            this.dialog = null

            // get starting room
            this.moveRooms(this.startingRoom())

            // initialize event handling
            this.keyActive = false
            this.keyCodes = []
            this.addEventListeners()

            // kick off update loop
            this.update(0)
        }

        this.end = () => {
            this.removeEventListeners()
            window.cancelAnimationFrame(this.animationRequest)
        }

        this.update = (timestamp) => {
            let dt = timestamp - this.lastTimestamp
            this.lastTimestamp = timestamp

            let {
                roomList,
                roomWidth,
                roomHeight,
                spriteList,
                spriteWidth,
                spriteHeight,
                paletteList
            } = this.world

            // progress frames
            this.timeToNextFrame -= dt
            if (this.timeToNextFrame <= 0) {
                this.frameIndex++
                if (this.frameIndex >= 12) this.frameIndex = 0
                this.timeToNextFrame = this.frameRate
            }

            // update avatar
            this.timeToNextInput -= dt
            if (this.timeToNextInput <= 0) {
                if (!this.showDialog) this.updateAvatar()
                this.timeToNextInput = 150
            }

            // get current tiles and colors
            let tileList = this.currentRoom.tileList
            let palette = paletteList[this.currentPaletteIndex]
            let colorList = palette.colorList
            
            // draw background
            this.context.fillStyle = colorList[0]
            this.context.fillRect(0, 0, spriteWidth * roomWidth, spriteHeight * roomHeight)

            // draw sprites
            tileList.forEach(tile => {
                let { spriteName, x, y } = tile
                let sprite = spriteList.find(sprite => sprite.name === spriteName)
                if (sprite && !sprite.isAvatar) {
                    let xOffset = x * sprite.width
                    let yOffset = y * sprite.height
                    let frameList = this.spriteFrameList[sprite.name]
                    let frameIndex = this.frameIndex % frameList.length
                    let frameData = frameList[frameIndex]
                    this.context.drawImage(frameData, xOffset, yOffset)
                }
            })

            this.drawAvatar()

            // draw dialog
            if (this.showDialog) {
                this.dialog.draw(timestamp)
            }

            // see you next frame!
            this.animationRequest = window.requestAnimationFrame(this.update)
        }

        this.updateAvatar = () => {
            let {
                worldWidth,
                worldHeight,
                worldWrapHorizontal,
                worldWrapVertical,
                roomWidth,
                roomHeight,
                roomList
            } = this.world

            let x = this.avatarX
            let y = this.avatarY
            let roomX = Math.floor(this.currentRoomIndex % worldWidth)
            let roomY = Math.floor(this.currentRoomIndex / worldWidth)
            let stopMoving = false

            // check input
            if (this.keyActive) {
                let key = this.keyCodes[this.keyCodes.length - 1]
                if (key === 'ArrowLeft') {
                    x--
                    this.avatarDirection = 'left'
                } else if (key === 'ArrowRight') {
                    x++
                    this.avatarDirection = 'right'
                } else if (key === 'ArrowUp') {
                    y--
                } else if (key === 'ArrowDown') {
                    y++
                }
            }

            // check if avatar is going outside of room bounds
            if (x < 0) {
                x = roomWidth - 1
                roomX--
            }
            if (x >= roomWidth) {
                x = 0
                roomX++
            }
            if (y < 0) {
                y = roomHeight - 1
                roomY--
            }
            if (y >= roomHeight) {
                y = 0
                roomY++
            }

            // check if avatar is going outside of world bounds
            if (roomX < 0) {
                if (worldWrapHorizontal) roomX = worldWidth - 1
                else stopMoving = true
            }
            if (roomX >= worldWidth) {
                if (worldWrapHorizontal) roomX = 0
                else stopMoving = true
            }
            if (roomY < 0) {
                if (worldWrapVertical) roomY = worldHeight - 1
                else stopMoving = true
            }
            if (roomY >= worldHeight) {
                if (worldWrapVertical) roomY = 0
                else stopMoving = true
            }
            if (stopMoving) return
            
            // check for tile interactions
            let roomIndex = (roomY * worldWidth) + roomX
            let room = roomList[roomIndex]
            let tileIsClear = this.checkTiles(room, x, y)
            if (!tileIsClear) stopMoving = true

            // finalize avatar movement
            if (!stopMoving) {
                this.avatarX = x
                this.avatarY = y
                room.tileList = room.tileList.filter(tile => !tile.removeMe)
                if (roomIndex !== this.currentRoomIndex) this.moveRooms(roomIndex)
            } else {
                room.tileList.forEach(tile => { tile.removeMe = false })
            }
        }

        this.checkTiles = (room, x, y) => {
            let { roomHeight, spriteList } = this.world
            let tileIsClear = true
            room.tileList.forEach(tile => {
                if (tile.x !== x || tile.y !== y) return
                let sprite = spriteList.find(s => s.name === tile.spriteName)
                if (sprite.isAvatar) return
                // wall
                if (sprite.isWall) {
                    tileIsClear = false
                }
                // item
                if (sprite.isItem) {
                    if (this.inventory[sprite.name]) this.inventory[sprite.name]++
                    else this.inventory[sprite.name] = 1
                    tile.removeMe = true
                }
                // behaviors - only do if not already on this tile
                if (x !== this.avatarX || y !== this.avatarY) {
                    let displayAtBottom = y < roomHeight / 2
                    this.beginDialog('hello how are you', displayAtBottom)
                }
            })
            return tileIsClear
        }

        this.startingRoom = () => {
            let { roomList } = this.world
            let roomIndex = 0
            roomList.forEach((room, i) => {
                room.tileList.forEach(tile => {
                    if (tile.spriteName === this.avatar.name) {
                        roomIndex = i
                    }
                })
            })
            return roomIndex
        }

        this.moveRooms = (roomIndex) => {
            let { roomList, paletteList } = this.world
            this.currentRoomIndex = roomIndex
            this.currentRoom = roomList[this.currentRoomIndex]
            this.currentPaletteIndex = paletteList.findIndex(p => p.name === this.currentRoom.paletteName)
            this.cacheSprites()
        }

        this.nextFrames = () => {
            Object.keys(this.spriteFrameIndexList).forEach(key => {
                let frameIndex = this.spriteFrameIndexList[key]

                this.frameIndex = frameIndex || 0
                if (this.frameIndex >= this.frameCanvasList.length) {
                    this.frameIndex = 0
                }
            })
        }

        this.drawFrame = (frame, width, context) => {
            frame.forEach((pixel, i) => {
                let x = Math.floor(i % width)
                let y = Math.floor(i / width)
                if (pixel) context.fillRect(x, y, 1, 1)
            })
        }

        this.getFrameData = (frame, color, flipped) => {
            let { spriteWidth, spriteHeight } = this.world

            let frameCanvas = document.createElement('canvas')
            frameCanvas.width = spriteWidth
            frameCanvas.height = spriteHeight

            let context = frameCanvas.getContext('2d')
            if (flipped) {
                context.translate(spriteWidth, 0)
                context.scale(-1, 1)
            }
            context.fillStyle = color
            this.drawFrame(frame, spriteWidth, context)
            
            let frameData = frameCanvas
            return frameData
        }

        this.cacheSprite = (sprite, colorList, flipped) => {
            let name = sprite.name + (flipped ? '__flipped' : '')
            let colorIndex = sprite.colorIndex
            while (colorIndex > 0 && !colorList[colorIndex]) colorIndex--
            let color = colorList[colorIndex]
            
            if (sprite && !this.spriteFrameList[name]) {
                this.spriteFrameList[name] = sprite.frameList.map(frame => {
                    return this.getFrameData(frame, color, flipped)
                })
            }
        }

        this.cacheSprites = () => {
            let { spriteList, paletteList } = this.world
            let tileList = this.currentRoom.tileList
            let palette = paletteList[this.currentPaletteIndex]
            let colorList = palette.colorList

            this.spriteFrameList = {}

            tileList.forEach(tile => {
                let { spriteName } = tile
                let sprite = spriteList.find(sprite => sprite.name === spriteName)
                this.cacheSprite(sprite, colorList)
            })

            this.cacheSprite(this.avatar, colorList)
            this.cacheSprite(this.avatar, colorList, true)
        }

        this.drawAvatar = () => {
            let { spriteWidth, spriteHeight } = this.world
            let name = this.avatar.name
            if (this.avatarDirection === 'left') name += '__flipped'

            let frameList = this.spriteFrameList[name]
            let frameIndex = this.frameIndex % frameList.length
            let frameData = frameList[frameIndex]
            this.context.drawImage(frameData, this.avatarX * spriteWidth, this.avatarY * spriteHeight)
        }

        this.beginDialog = (string, displayAtBottom) => {
            let { roomWidth, roomHeight, spriteWidth, spriteHeight, fontResolution, fontDirection } = this.world
            this.showDialog = true
            this.dialog = new Text({
                string: 'hello, how are you? What even are you doing! We may never know for sure...',
                fontData: fontData,
                fontDirection: fontDirection,
                wrapper: this.wrapper,
                padding: Math.floor(spriteWidth * fontResolution),
                width: roomWidth * spriteWidth * fontResolution,
                height: roomHeight * spriteHeight * fontResolution,
                displayAtBottom
            })
            this.dialog.begin()
        }

        this.endDialog = () => {
            this.showDialog = false
            this.dialog.end()
        }

        this.addEventListeners = () => {
            document.addEventListener('keydown', this.keyDown)
            document.addEventListener('keyup', this.keyUp)

            this.wrapper.addEventListener('mousedown', this.pointerStart)
            document.addEventListener('mouseup', this.pointerEnd)
            document.addEventListener('mousemove', this.pointerMove)
    
            this.wrapper.addEventListener('touchstart', this.pointerStart, { passive: false })
            document.addEventListener('touchend', this.pointerEnd, { passive: false })
            document.addEventListener('touchcancel', this.pointerEnd, { passive: false })
            document.addEventListener('touchmove', this.pointerMove, { passive: false })

            window.addEventListener('resize', this.resize)
        }

        this.removeEventListeners = () => {
            document.removeEventListener('keydown', this.keyDown)
            document.removeEventListener('keyup', this.keyUp)

            this.wrapper.removeEventListener('mousedown', this.pointerDown)
            document.removeEventListener('mouseup', this.pointerEnd)
            document.removeEventListener('mousemove', this.pointerMove)
    
            this.wrapper.removeEventListener('touchstart', this.pointerDown)
            document.removeEventListener('touchend', this.pointerEnd)
            document.removeEventListener('touchcancel', this.pointerEnd)
            document.removeEventListener('touchmove', this.pointerMove)
            
            window.removeEventListener('resize', this.resize)
        }

        this.keyDown = (e) => {
            if (e.key.startsWith('Arrow')) e.preventDefault() // prevent arrow keys from scrolling page
            if (e.repeat) return // ignore key repeats
            if (this.showDialog) {
                if (e.key.startsWith('Arrow')) {
                    if (this.dialog.isComplete()) {
                        this.endDialog()
                    } else {
                        this.dialog.finishPage()
                    }
                }
            } else {
                this.keyActive = true
                this.keyCodes.push(event.key)
                this.timeToNextInput = 0
            }
        }

        this.keyUp = (e) => {
            this.keyCodes = this.keyCodes.filter(keyCode => keyCode !== e.key)
            if (this.keyCodes.length === 0) this.keyActive = false
        }

        this.pointerStart = (e) => {
            let pointer = e.touches ? e.touches[0] : e
        }

        this.pointerEnd = (e) => {
            
        }

        this.pointerMove = (e) => {
            
        }

        this.resize = () => {
            
        }
    }

}