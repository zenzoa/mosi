let gameScript = `
return class {

    constructor(world, el) {
        this.world = world

        this.wrapper = document.createElement('div')
        this.wrapper.style.position = 'relative'
        this.wrapper.style.paddingTop = '100%'
        this.wrapper.style.margin = '0 auto'
        el.appendChild(this.wrapper)

        this.canvas = document.createElement('canvas')
        this.canvas.tabIndex = "1"
        this.canvas.width = world.roomWidth * world.spriteWidth
        this.canvas.height = world.roomHeight * world.spriteHeight
        this.canvas.style.position = 'absolute'
        this.canvas.style.display = 'block'
        this.canvas.style.top = '0'
        this.canvas.style.left = '0'
        this.canvas.style.width = '100%'
        this.wrapper.appendChild(this.canvas)
        this.context = this.canvas.getContext('2d')

        this.textCanvas = document.createElement('canvas')
        this.textCanvas.width = world.roomWidth * world.spriteWidth * world.fontResolution
        this.textCanvas.height = world.roomHeight * world.spriteHeight * world.fontResolution
        this.textCanvas.style.position = 'absolute'
        this.textCanvas.style.display = 'block'
        this.textCanvas.style.top = '0'
        this.textCanvas.style.left = '0'
        this.textCanvas.style.width = '100%'
        this.wrapper.appendChild(this.textCanvas)
        this.textContext = this.textCanvas.getContext('2d')

        this.frameRate = 400
        this.dialogRate = 50
        this.nextPageDelay = 200

        this.begin = () => {
            // set up avatar
            this.avatar =
                this.world.spriteList.find(sprite => sprite.isAvatar)
                || this.world.spriteList[0]
            this.avatarX = 0
            this.avatarY = 0
            this.nextX = 0
            this.nextY = 0
            this.inventory = {}
            this.variables = {}

            // initialize animations variables
            this.lastTimestamp = 0
            this.timeToNextFrame = 0
            this.timeToNextInput = 0
            this.frameIndex = 0
            this.spriteFrameList = {}
            this.avatarDirection = 'right'

            // initialize dialog variables
            this.dialogNodes = []
            this.pageIsComplete = false
            this.nextPageTimer = 0

            // get starting room
            this.moveRooms(this.startingRoom(), true)
            this.nextRoomIndex = this.currentRoomIndex

            // run game start script
            this.runScript(this.world.worldScriptList, 'on-start')

            // initialize event handling
            this.keyActive = false
            this.keyCodes = []
            this.addEventListeners()

            // kick off update loop
            this.update(0)
        }

        this.end = () => {
            // stop any music that's playing
            MusicPlayer.stopSong()

            // clean up event listeners
            this.removeEventListeners()

            // stop animation loop
            window.cancelAnimationFrame(this.animationRequest)
        }

        this.update = (timestamp) => {
            let dt = timestamp - this.lastTimestamp
            this.lastTimestamp = timestamp

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
                this.updateAvatar()
                this.timeToNextInput = 200
            }

            // get current tiles and colors
            let tileList = this.currentRoom.tileList
            let palette = this.world.paletteList[this.currentPaletteIndex]
            let colorList = palette.colorList
            
            // draw background
            let canvasWidth = this.world.spriteWidth * this.world.roomWidth
            let canvasHeight = this.world.spriteHeight * this.world.roomHeight
            this.context.fillStyle = colorList[0]
            this.context.fillRect(0, 0, canvasWidth, canvasHeight)

            // draw sprites
            tileList.forEach(tile => {
                let { spriteName, x, y } = tile
                let sprite = this.world.spriteList.find(sprite => sprite.name === spriteName)
                if (sprite && !sprite.isAvatar) {
                    let xOffset = x * sprite.width
                    let yOffset = y * sprite.height
                    let frameList = this.spriteFrameList[sprite.name]
                    let frameIndex = this.frameIndex % frameList.length
                    let frameData = frameList[frameIndex]
                    this.context.drawImage(frameData, xOffset, yOffset)
                }
            })

            // draw player avatar
            this.drawAvatar()

            // draw dialog
            this.updateDialog(timestamp)

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
                roomHeight
            } = this.world

            let x = this.avatarX
            let y = this.avatarY
            let roomX = Math.floor(this.currentRoomIndex % worldWidth)
            let roomY = Math.floor(this.currentRoomIndex / worldWidth)
            let stopMoving = false

            // check input
            if (this.dialogNodes.length > 0) {
                // do nothing if there's dialog up
            } else if (this.keyActive) {
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
            } else if (this.pointerIsDown || this.oneMoreMove) {
                let dx = this.pointerEndPos.x - this.pointerStartPos.x
                let dy = this.pointerEndPos.y - this.pointerStartPos.y

                if (dx * dx + dy * dy > 20 * 20) {
                    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 180
                    if (angle > 45 && angle <= 135) {
                        y--
                    } else if (angle > 135 && angle <= 225) {
                        x++
                        this.avatarDirection = 'right'
                    } else if (angle > 225 && angle <= 315) {
                        y++
                    } else {
                        x--
                        this.avatarDirection = 'left'
                    }
                    this.movesSinceLastTouch++
                    this.oneMoreMove = false
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

            // move avatar
            let roomIndex = (roomY * worldWidth) + roomX
            this.moveAvatar(roomIndex, x, y)
        }

        this.moveAvatar = (roomIndex, x, y) => {
            let stopMoving = false

            // reset next positions
            this.nextRoomIndex = roomIndex
            this.nextX = x
            this.nextY = y

            // check for tile interactions
            let tileIsClear = this.checkTileForAvatar(this.nextRoomIndex, this.nextX, this.nextY)
            if (!tileIsClear) stopMoving = true

            // remove any tiles marked for death
            this.world.roomList.forEach(r => {
                r.tileList = r.tileList.filter(tile => !tile.removeMe)
            })

            // finalize avatar movement
            if (!stopMoving) {
                this.avatarX = this.nextX
                this.avatarY = this.nextY
                this.moveRooms(this.nextRoomIndex)
            }
        }

        this.checkTileForAvatar = (roomIndex, x, y) => {
            let room = this.world.roomList[roomIndex]
            let tileIsClear = true

            // look at each tile in the room
            room.tileList.forEach(tile => {
                // ignore tiles that player is not going to be standing on
                if (tile.x !== x || tile.y !== y) return

                // get sprite data for the current tile
                let sprite = this.world.spriteList.find(s => s.name === tile.spriteName)

                // ignore sprite if it's the avatar or if it doesn't exist
                if (!sprite || sprite.isAvatar) return

                // it's a wall - block the way!
                if (sprite.isWall) {
                    tileIsClear = false
                }

                // it's an item - pick it up!
                if (sprite.isItem) {
                    this.addToInventory(sprite.name, 1)
                    tile.removeMe = true
                }

                // run the sprite's script (if player's not already on this tile)
                if (this.avatarX !== x || this.avatarY !== y) {
                    this.runScript(sprite.scriptList, 'on-push', { sprite, tile, roomIndex })
                }
            })

            // return whether tile is blocking player movement
            return tileIsClear
        }

        this.checkTileForSprite = (roomIndex, x, y) => {
            let room = this.world.roomList[roomIndex]
            let tileIsClear = true

            // look at each tile in the room
            room.tileList.forEach(tile => {
                // ignore tiles that player is not going to be standing on
                if (tile.x !== x || tile.y !== y) return

                // get sprite data for the current tile
                let sprite = this.world.spriteList.find(s => s.name === tile.spriteName)

                // it's a wall - block the way!
                if (sprite.isWall) tileIsClear = false
            })

            // return whether tile is blocking player movement
            return tileIsClear
        }

        this.startDialog = (dialogNodes) => {
            this.dialogNodes = dialogNodes
            this.pageStartTimestamp = null
            this.pageIsComplete = false
            window.textPosition = null
        }

        this.progressDialog = () => {
            if (this.pageIsComplete && this.nextPageTimer >= this.nextPageDelay) {
                this.pageStartTimestamp = null
                this.pageIsComplete = false
                this.nextPageTimer = 0
                this.dialogNodes = this.dialogNodes.slice(this.nextPageNodeIndex)

                if (this.dialogNodes.length === 0) {
                    // clear text canvas when dialog is complete
                    this.textContext.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height)
                }
            } else {
                this.pageIsComplete = true
            }
        }

        this.updateDialog = (timestamp) => {
            if (this.dialogNodes.length === 0) return

            let canvas = this.textCanvas
            let context = this.textContext
            let { fontData, fontDirection } = this.world

            context.clearRect(0, 0, canvas.width, canvas.height)

            // calculate number of characters to draw
            if (!this.pageStartTimestamp) this.pageStartTimestamp = timestamp
            let dt = timestamp - this.pageStartTimestamp
            let maxChars = this.pageIsComplete ? -1 : Math.floor(dt / this.dialogRate)

            // draw background
            if (!window.textPosition) window.textPosition = 'none'
            let { bgX, bgY, bgWidth, bgHeight } = Text.drawBackground(context, fontData, window.textPosition)

            // draw continue indicator
            if (this.pageIsComplete) {
                if (window.textPosition === 'none') {
                    // skip end-of-page delay if no text
                    this.nextPageTimer = this.nextPageDelay
                } else {
                    // otherwise show next-page indicator and progress the delay timer
                    this.nextPageTimer += Math.floor(dt / this.dialogRate)
                    if (this.nextPageTimer >= this.nextPageDelay) {
                        Text.drawContinueIndicator(context, fontData, bgX, bgY, bgWidth, bgHeight)
                    }
                }
            }

            // draw text
            let nextPageNodeIndex = Text.drawNode({
                nodes: this.dialogNodes,
                canvas,
                context,
                fontData,
                fontDirection,
                timestamp,
                maxChars,
                bgX, bgY
            })

            if (nextPageNodeIndex >= 0) {
                let textNodeCount = this.dialogNodes.filter((node, i) =>
                        (node.type === 'text' && i < nextPageNodeIndex)
                    ).length

                this.pageIsComplete = true
                this.nextPageNodeIndex = nextPageNodeIndex

                if (textNodeCount === 0) this.progressDialog()
            }
        }

        this.addToInventory = (item, quantity) => {
            // add item to the player's inventory
            if (!this.inventory[item]) this.inventory[item] = 0
            this.inventory[item] += quantity
            if (this.inventory[item] < 0) this.inventory[item] = 0
        }

        this.startingRoom = () => {
            // find the room that the player starts in
            let roomIndex = 0
            this.world.roomList.forEach((room, i) => {
                room.tileList.forEach(tile => {
                    if (tile.spriteName === this.avatar.name) {
                        roomIndex = i
                        this.avatarX = tile.x
                        this.avatarY = tile.y
                    }
                })
            })
            return roomIndex
        }

        this.moveRooms = (roomIndex, startOfGame) => {
            // ignore if player is already in this room
            if (this.currentRoomIndex === roomIndex) return

            // run exit script for old room
            if (!startOfGame && this.currentRoom) {
                this.runScript(this.currentRoom.scriptList, 'on-exit')
            }

            // update room references
            this.currentRoomIndex = roomIndex
            this.currentRoom = this.world.roomList[this.currentRoomIndex]

            // update color palette
            this.currentPaletteIndex = this.world.paletteList.findIndex(p => p.name === this.currentRoom.paletteName)
            
            // play new music
            this.updateMusic()

            // cache new sprites
            this.updateCache()

            // run enter script for new room
            if (!startOfGame) {
                this.runScript(this.currentRoom.scriptList, 'on-enter')
            }
        }

        this.updateMusic = () => {
            // find music for current room
            let musicIndex = this.world.musicList.findIndex(m => m.name === this.currentRoom.musicName)
            
            // stop previous music and play new music, if changed
            if (musicIndex !== this.currentMusicIndex) {
                this.currentMusicIndex = musicIndex
                MusicPlayer.stopSong()
                let music = this.world.musicList[musicIndex]
                if (music) MusicPlayer.playSong(music)
            }
        }

        this.runScript = (scriptList, scriptName, context) => {
            // ignore non-existent scripts
            if (!scriptList || !scriptList[scriptName]) return

            // get script
            let script = scriptList[scriptName]

            // run script
            Script.run(script, this, context)
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

        this.getFrameData = (frame, color, flipped, bgColor) => {
            let { spriteWidth, spriteHeight } = this.world

            let frameCanvas = document.createElement('canvas')
            frameCanvas.width = spriteWidth
            frameCanvas.height = spriteHeight

            let context = frameCanvas.getContext('2d')
            if (flipped) {
                context.translate(spriteWidth, 0)
                context.scale(-1, 1)
            }

            if (bgColor) {
                context.fillStyle = bgColor
                context.fillRect(0, 0, spriteWidth, spriteHeight)
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
            let bgColor = sprite.isTransparent ? null : colorList[0]
            
            if (sprite && !this.spriteFrameList[name]) {
                this.spriteFrameList[name] = sprite.frameList.map(frame => {
                    return this.getFrameData(frame, color, flipped, bgColor)
                })
            }
        }

        this.updateCache = () => {
            let tileList = this.currentRoom.tileList
            this.currentPaletteIndex = this.world.paletteList.findIndex(p => p.name === this.currentRoom.paletteName)
            let palette = this.world.paletteList[this.currentPaletteIndex]
            let colorList = palette.colorList

            this.spriteFrameList = {}

            tileList.forEach(tile => {
                let { spriteName } = tile
                let sprite = this.world.spriteList.find(s => s.name === spriteName)
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
            this.resize()
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
            if (e.key === 'm') {
                window.muteMusic = !window.muteMusic
            }
            else if (this.dialogNodes.length > 0) {
                if (e.key.startsWith('Arrow')) {
                    this.progressDialog()
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
            e.preventDefault()
            this.canvas.focus()
            let pointer = e.touches ? e.touches[0] : e
            this.pointerIsDown = true
            this.movesSinceLastTouch = 0
            this.pointerStartPos = {
                x: pointer.clientX,
                y: pointer.clientY
            }
            this.pointerEndPos = {
                x: pointer.clientX,
                y: pointer.clientY
            }
            this.timeToNextInput = 0
        }

        this.pointerMove = (e) => {
            if (this.pointerIsDown) {
                e.preventDefault()
                let pointer = e.touches ? e.touches[0] : e
                this.pointerEndPos = {
                    x: pointer.clientX,
                    y: pointer.clientY
                }
            }
        }

        this.pointerEnd = (e) => {
            if (this.pointerIsDown) {
                e.preventDefault()
                this.pointerIsDown = false
                if (this.dialogNodes.length > 0) {
                    this.progressDialog()
                } else {
                    if (this.movesSinceLastTouch === 0) {
                        this.oneMoreMove = true
                        this.timeToNextInput = 0
                    }
                }
            }
        }

        this.resize = () => {
            this.canvas.focus()
            let width = this.canvas.width
            let height = this.canvas.height
            let widthRatio = width > height ? 1 : width / height
            let heightRatio = width > height ? height / width : 1
            this.wrapper.style.width = widthRatio * 100 + '%',
            this.wrapper.style.paddingTop = heightRatio * 100 + '%'
        }
    }

}
`

let generateGameScript = new Function(gameScript)
let Game = generateGameScript()