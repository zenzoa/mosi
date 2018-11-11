class PlayPanel extends Component {
    render(props) {
        let playCanvas = h(PlayCanvas, { world: props.world })
        let playDiv = h('div', { class: 'canvas-wrapper' }, playCanvas)

        let backButton = h(BackButton, { onclick: props.back })

        return h(Panel, {
            header: [backButton, h(Filler)],
            content: playDiv,
            centered: true
        })
    }
}

class PlayCanvas extends Component {
    constructor(props) {
        super()

        this.world = deepClone(props.world)
        this.frames = Array(this.world.sprites.length).fill(0)

        this.animationLoop = null
        this.animationStart = null
        this.lastFrame = null
        this.lastMovement = null
        this.inventory = []

        this.lastDirection = 'left'
        this.facing = 'left'
        this.atGoal = true

        this.displayText = false
        this.textFinished = false
        this.text = ''
        this.textStart = null
        this.textPage = 0

        this.keyActive = false
        this.keyCodes = []
        this.pointerActive = false
        this.pointerX = 0
        this.pointerY = 0

        this.updateCanvas = (timestamp) => {
            let canvas = this.base

            if (!this.animationStart) this.animationStart = timestamp
            let dt = timestamp - this.animationStart
            if (dt >= this.world.frameRate) {
                this.animationStart = timestamp
                this.progressFrames()
            }

            let room = this.world.rooms[this.room] || {}
            let tiles = room.tiles || []
            let sprites = this.world.sprites || []
            let spriteFrames = this.frames
            let palette = this.world.palettes[room.paletteId]
            let colors = palette ? palette.colors : []

            clearCanvas(canvas, colors[0])
            renderRoom(canvas, tiles, sprites, {
                spriteFrames: spriteFrames,
                roomSize: this.world.roomSize,
                spriteSize: this.world.spriteSize,
                colors: colors
            })

            this.updateAvatar(timestamp)
            this.renderAvatar(colors)

            if (this.displayText) this.renderDialog(timestamp)

            this.animationLoop = window.requestAnimationFrame(this.updateCanvas)
        }

        this.renderDialog = (timestamp) => {
            if (!this.textStart) {
                this.textCurrentPage = 0
                this.textStart = timestamp
            }
            let dt = timestamp - this.textStart
            let canvas = this.base
            let position = this.avatarTileY >= this.world.roomSize / 2 ? 'top' : 'bottom'
            this.textPageCount = renderText(canvas, this.text, this.world.font, this.textCurrentPage, { position, dt, done: () => { this.textFinished = true } })
        }

        this.progressDialog = () => {
            if (!this.textFinished) return
            this.textCurrentPage++
            if (this.textCurrentPage === this.textPageCount) this.displayText = 0
        }

        this.progressFrames = () => {
            let sprites = this.world.sprites || []
            this.frames = sprites.map((_, spriteId) => {
                let sprite = sprites[spriteId] || {}
                let frame = this.frames[spriteId] || 0
                let nextFrame = frame + 1
                if (!sprite || nextFrame >= sprite.frames.length) nextFrame = 0
                return nextFrame
            })
        }

        this.onKeyDown = (event) => {
            if (event.repeat) return

            if (this.displayText) {
                this.progressDialog()
                return
            }

            this.keyActive = true
            this.keyCodes.push(event.key)
            this.lastMovement = null
        }

        this.onKeyUp = (event) => {
            this.keyCodes = this.keyCodes.filter((keyCode) => keyCode !== event.key)
            if (this.keyCodes.length === 0) this.keyActive = false
        }

        this.onPointerStart = (event) => {
            if (!event.touches) event.preventDefault()

            if (this.displayText) {
                this.progressDialog()
                return
            }

            this.updatePointer(event)
            this.pointerActive = true
        }

        this.onPointerMove = (event) => {
            if (this.pointerActive) this.updatePointer(event)
        }

        this.onPointerEnd = () => {
            this.pointerActive = false
        }

        this.updatePointer = (event) => {
            let realEvent = event.touches ? event.touches[0] : event
            let rect = this.base.getBoundingClientRect()
            this.pointerX = realEvent.clientX - rect.x
            this.pointerY = realEvent.clientY - rect.y
        }

        this.setRoom = (newRoom) => {
            this.room = newRoom
        }
    
        this.initAvatar = () => {
            let locations = findSpriteInWorld(this.world.avatarId, this.world.rooms)
            let location = locations[0] || { room: 0, tile: 0 }
            let tilePos = IDtoXY(location.tile, this.world.roomSize)
            this.room = location.room
            this.roomGoal = this.room
            this.avatarTileX = tilePos.x
            this.avatarTileY = tilePos.y
            this.avatarX = tilePos.x * this.world.spriteSize
            this.avatarY = tilePos.y * this.world.spriteSize
            this.world.rooms = removeSpriteFromWorld(this.world.avatarId, this.world.rooms)
        }

        this.checkForMovement = (timestamp) => {
            if (!this.atGoal) return

            let dt = this.lastMovement ? timestamp - this.lastMovement : 0
            if (!this.lastMovement || dt >= 200) this.lastMovement = timestamp
            else return

            if (this.pointerActive) {
                let rect = this.base.getBoundingClientRect()
                let tileSize = rect.width / this.world.roomSize
                let tileX = Math.floor(this.pointerX / tileSize)
                let tileY = Math.floor(this.pointerY / tileSize)
                if (tileX === this.avatarTileX && tileY === this.avatarTileY) return

                let dx = tileX - this.avatarTileX
                let dy = tileY - this.avatarTileY
                let angle = Math.atan2(dy, dx) + Math.PI

                if (angle >= Math.PI * (1/4) && angle < Math.PI * (3/4)) this.moveUp()
                else if (angle >= Math.PI * (3/4) && angle < Math.PI * (5/4)) this.moveRight()
                else if (angle >= Math.PI * (5/4) && angle < Math.PI * (7/4)) this.moveDown()
                else this.moveLeft()

            } else if (this.keyActive) {
                let key = this.keyCodes[this.keyCodes.length - 1]
                if (key === 'ArrowLeft') this.moveLeft()
                else if (key === 'ArrowRight') this.moveRight()
                else if (key === 'ArrowUp') this.moveUp()
                else if (key === 'ArrowDown') this.moveDown()
            }
        }

        this.moveLeft = () => {
            this.lastDirection = 'left'
            this.moveAvatar(this.avatarTileX - 1, this.avatarTileY)
        }

        this.moveRight = () => {
            this.lastDirection = 'right'
            this.moveAvatar(this.avatarTileX + 1, this.avatarTileY)
        }

        this.moveUp = () => {
            this.lastDirection = 'up'
            this.moveAvatar(this.avatarTileX, this.avatarTileY - 1)
        }

        this.moveDown = () => {
            this.lastDirection = 'down'
            this.moveAvatar(this.avatarTileX, this.avatarTileY + 1)
        }

        this.moveAvatar = (x, y) => {
            // don't move while reading text
            if (this.displayText) return

            // check for movement between rooms
            let result = this.checkRoomBounds(x, y)
            x = result ? result.x : this.avatarTileX
            y = result ? result.y : this.avatarTileY
            let roomId = result ? result.roomId : this.room

            // face direction avatar is moving
            if (roomId === this.room) this.checkFacing(x)

            // check for walls, handle items and scripts
            let isWallBlockingMe = this.checkTiles(x, y, roomId)
            if (isWallBlockingMe) return

            // update goal position
            this.roomGoal = roomId
            this.avatarTileX = x
            this.avatarTileY = y
        }

        this.checkRoomBounds = (x, y) => {
            let roomPos = IDtoXY(this.room, this.world.worldSize)
            let roomX = roomPos.x
            let roomY = roomPos.y
            if (x < 0) {
                roomX -= 1
                x = this.world.roomSize - 1
            } else if (x >= this.world.roomSize) {
                roomX += 1
                x = 0
            } else if (y < 0) {
                roomY -= 1
                y = this.world.roomSize - 1
            } else if (y >= this.world.roomSize) {
                roomY += 1
                y = 0
            }
            let roomId = XYtoID(roomX, roomY, this.world.worldSize)
            if (!this.world.rooms[roomId]) return

            return { x, y, roomId }
        }

        this.checkFacing = (x) => {
            let lastFacing = this.facing
            if (x * this.world.spriteSize > this.avatarX) this.facing = 'right'
            else if (x * this.world.spriteSize < this.avatarX) this.facing = 'left'
            if (lastFacing !== this.facing) this.flipAvatar()
        }

        this.flipAvatar = () => {
            let sprite = this.world.sprites[this.world.avatarId]
            sprite.frames = sprite.frames.map((frame) => flipFrame(frame, this.world.spriteSize))
        }

        this.checkTiles = (x, y, roomId) => {
            let tileId = XYtoID(x, y, this.world.roomSize)
            let room = this.world.rooms[roomId]
            let tiles = room.tiles || []
            let tile = tiles[tileId] || []
            let isWallBlockingMe = false

            tile.forEach((spriteId) => {
                let sprite = this.world.sprites[spriteId] || {}
                
                if (sprite.wall) isWallBlockingMe = true

                if (sprite.item) {
                    this.inventory.push(spriteId)
                    if (sprite.unique) this.world.rooms = removeSpriteFromWorld(spriteId, this.world.rooms)
                    else this.world.rooms[roomId].tiles[tileId] = tile.filter(x => x !== spriteId)
                }

                sprite.scripts && sprite.scripts.forEach(script => {
                    if (script.type === 'dialog') {
                        this.displayText = true
                        this.text = script.text
                        this.textStart = null
                        this.textFinished = false
                    }
                })
            })

            return isWallBlockingMe
        }

        this.updateAvatar = (timestamp) => {
            this.checkForMovement(timestamp)

            let dt = this.lastFrame ? timestamp - this.lastFrame : 0
            if (!this.lastFrame || dt >= 16) this.lastFrame = timestamp
            else return

            // handle room transitions smoothly
            if (this.room !== this.roomGoal) {
                let roomPixels = this.world.roomSize * this.world.spriteSize
                if (this.lastDirection === 'left') this.avatarX += roomPixels
                else if (this.lastDirection === 'right') this.avatarX -= roomPixels
                else if (this.lastDirection === 'up') this.avatarY += roomPixels
                else if (this.lastDirection === 'down') this.avatarY -= roomPixels
                this.room = this.roomGoal
            }

            let x = this.avatarX
            let y = this.avatarY
            let goalX = this.avatarTileX * this.world.spriteSize
            let goalY = this.avatarTileY * this.world.spriteSize

            let distance = dt * (this.world.spriteSize / 200)
            let dx = goalX - x
            let dy = goalY - y
            x += Math.sign(dx) * Math.min(distance, Math.abs(dx))
            y += Math.sign(dy) * Math.min(distance, Math.abs(dy))
            this.avatarX = x
            this.avatarY = y

            let closeEnough = this.world.spriteSize / 8
            this.atGoal = Math.abs(dx) < closeEnough && Math.abs(dy) < closeEnough
        }

        this.renderAvatar = (colors) => {
            let avatarId = this.world.avatarId
            let avatarSprite = this.world.sprites[avatarId] || {}
            let avatarFrames = avatarSprite.frames || []
            let frame = this.frames[avatarId]
            let frameData = avatarFrames[frame]
            
            if (frameData) renderFrame(this.base, frameData, {
                size: this.world.spriteSize,
                offsetX: Math.round(this.avatarX),
                offsetY: Math.round(this.avatarY),
                color: colors[avatarSprite.colorId] || colors[colors.length - 1]
            })
        }

        this.initAvatar()
    }

    componentDidMount() {
        this.animationLoop = window.requestAnimationFrame(this.updateCanvas)

        document.addEventListener('keydown', this.onKeyDown)
        document.addEventListener('keyup', this.onKeyUp)

        document.addEventListener('mousedown', this.onPointerStart)
        document.addEventListener('touchstart', this.onPointerStart, { passive: false })
        
        document.addEventListener('mousemove', this.onPointerMove)
        document.addEventListener('touchmove', this.onPointerMove)

        document.addEventListener('mouseup', this.onPointerEnd)
        document.addEventListener('touchend', this.onPointerEnd)
        document.addEventListener('touchcancel', this.onPointerEnd)
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.animationLoop)

        document.removeEventListener('keydown', this.onKeyDown)
        document.removeEventListener('keyup', this.onKeyUp)

        document.removeEventListener('mousedown', this.onPointerStart)
        document.removeEventListener('touchstart', this.onPointerStart)

        document.removeEventListener('mousemove', this.onPointerMove)
        document.removeEventListener('touchmove', this.onPointerMove)

        document.removeEventListener('mouseup', this.onPointerEnd)
        document.removeEventListener('touchend', this.onPointerEnd)
        document.removeEventListener('touchcancel', this.onPointerEnd)
    }

    render(props) {
        let size = this.world.roomSize * this.world.spriteSize
        return h('canvas', { class: 'play-canvas ' + (props.class || ''), width: size, height: size })
    }
}