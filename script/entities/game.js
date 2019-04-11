class Game {
    constructor (world, canvas) {
        this.world = world

        this.canvas = canvas
        this.context = canvas.getContext('2d')

        this.textCanvas = document.createElement('canvas')
        this.canvas.parentNode.appendChild(this.textCanvas)
        this.textCanvas.style.position = 'absolute'
        this.textCanvas.style.top = '0'
        this.textCanvas.style.left = '0'
        this.textCanvas.style.width = '100%'
        this.textContext = this.textCanvas.getContext('2d')

        this.canvas.parentNode.style.position = 'relative'

        this.animationLoop = null
        this.animationStart = null

        this.pointerIsDown = false
        this.pointerOrigin = { x: 0, y: 0 }
        this.pointerPos = { x: 0, y: 0 }

        this.keyActive = false
        this.keyCodes = []

        this.avatarSprite = world.sprites[world.avatarId]
        this.currentRoomId = World.avatarRoom(this.world) || 0
        this.currentRoom = world.rooms[this.currentRoomId]
        this.currentRoom.spriteLocations = this.currentRoom.spriteLocations.filter(l => {
            if (l.spriteId === world.avatarId) {
                this.avatarPos = {
                    x: l.x * world.spriteWidth,
                    y: l.y * world.spriteHeight
                }
                return false
            } else {
                return true
            }
        })
        this.facingDirection = 'left'

        this.messages = []
        this.inventory = {}

        this.text = null
        this.textStart = null

        this.load = () => {
            this.canvas.width = this.world.roomWidth * this.world.spriteWidth
            this.canvas.height = this.world.roomHeight * this.world.spriteHeight

            this.textCanvas.width = this.canvas.width * (this.world.textScale || 1)
            this.textCanvas.height = this.canvas.height * (this.world.textScale || 1)

            this.addEventListeners()
            this.resize()
        }

        this.addEventListeners = () => {
            this.animationLoop = window.requestAnimationFrame(this.update)

            document.addEventListener('keydown', this.keyDown)
            document.addEventListener('keyup', this.keyUp)

            this.canvas.parentNode.addEventListener('mousedown', this.pointerDown)
            document.addEventListener('mouseup', this.pointerUp)
            document.addEventListener('mousemove', this.pointerMove)
    
            this.canvas.parentNode.addEventListener('touchstart', this.pointerDown, { passive: false })
            document.addEventListener('touchend', this.pointerUp, { passive: false })
            document.addEventListener('touchcancel', this.pointerUp, { passive: false })
            document.addEventListener('touchmove', this.pointerMove, { passive: false })

            window.addEventListener('resize', this.resize)
        }
    
        this.removeEventListeners = () => {
            window.cancelAnimationFrame(this.animationLoop)

            document.removeEventListener('keydown', this.keyDown)
            document.removeEventListener('keyup', this.keyUp)

            this.canvas.parentNode.removeEventListener('mousedown', this.pointerDown)
            document.removeEventListener('mouseup', this.pointerUp)
            document.removeEventListener('mousemove', this.pointerMove)
    
            this.canvas.parentNode.removeEventListener('touchstart', this.pointerDown)
            document.removeEventListener('touchend', this.pointerUp)
            document.removeEventListener('touchcancel', this.pointerUp)
            document.removeEventListener('touchmove', this.pointerMove)
            
            window.removeEventListener('resize', this.resize)
        }

        this.resize = () => {
            let rect = this.canvas.parentNode.parentNode.getBoundingClientRect()
            let minSize = Math.min(rect.width, rect.height)

            let baseWidth = this.world.roomWidth * this.world.spriteWidth
            let baseHeight = this.world.roomHeight * this.world.spriteHeight

            let pixelSize = Math.floor(minSize / Math.min(baseWidth, baseHeight))
            let width = pixelSize * baseWidth
            let height = pixelSize * baseHeight

            this.canvas.parentNode.style.width = width + 'px'
            this.canvas.parentNode.style.height = height + 'px'
        }

        this.keyDown = (event) => {
            if (event.key.startsWith('Arrow')) {
                // prevent arrow keys from scrolling page
                event.preventDefault()
            }
            if (event.repeat) return
            this.keyActive = true
            this.keyCodes.push(event.key)
        }

        this.keyUp = (event) => {
            this.keyCodes = this.keyCodes.filter(keyCode => keyCode !== event.key)
            if (this.keyCodes.length === 0) this.keyActive = false
        }

        this.pointerDown = (event) => {
            event.preventDefault()
            this.pointerOrigin = this.getPointerPos(event)
            this.pointerPos = this.pointerOrigin
            this.pointerIsDown = true

            if (this.text) {
                let isAtEnd = this.text.nextPage()
                if (isAtEnd) this.endDialog()
                this.textStart = null
            }
        }

        this.pointerMove = (event) => {
            if (!this.pointerIsDown) return
            event.preventDefault()
            this.pointerPos = this.getPointerPos(event)
        }

        this.pointerUp = (event) => {
            if (!this.pointerIsDown) return
            event.preventDefault()
            this.pointerIsDown = false
        }

        this.getPointerPos = (event) => {
            let pointer = event.touches ? event.touches[0] : event
            let rect = this.canvas.getBoundingClientRect()
            return {
                x: Math.floor(pointer.clientX - rect.x),
                y: Math.floor(pointer.clientY - rect.y)
            }
        }

        this.checkMovement = (timestamp) => {
            if (this.keyActive) {
                let key = this.keyCodes[this.keyCodes.length - 1]

                if (this.text && key) {
                    let isAtEnd = this.text.nextPage()
                    if (isAtEnd) this.endDialog()
                    this.textStart = null
                    this.keyCodes.pop()

                } else {
                    if (key === 'ArrowLeft') this.moveAvatar(-1, 0)
                    else if (key === 'ArrowRight') this.moveAvatar(1, 0)
                    else if (key === 'ArrowUp') this.moveAvatar(0, -1)
                    else if (key === 'ArrowDown') this.moveAvatar(0, 1)
                }
            }

            else if (this.pointerIsDown && !this.text) {
                if (!this.lastPointerMove) this.lastPointerMove = timestamp
                let dt = timestamp - this.lastPointerMove
                if (dt < Math.max(this.world.spriteWidth, this.world.spriteHeight) * 8) return

                let dx = this.pointerPos.x - this.pointerOrigin.x
                let dy = this.pointerPos.y - this.pointerOrigin.y

                if (dx * dx + dy * dy > 20 * 20) {
                    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 180
                    if (angle > 45 && angle <= 135) this.moveAvatar(0, -1) // up
                    else if (angle > 135 && angle <= 225) this.moveAvatar(1, 0) // right
                    else if (angle > 225 && angle <= 315) this.moveAvatar(0, 1) // down
                    else this.moveAvatar(-1, 0) // left
                    this.lastPointerMove = null
                }
            }
        }

        this.moveAvatar = (dx, dy) => {
            let blockAvatar = false
            let stopMovement = false

            let avatarTile = {
                x: Math.floor(this.avatarPos.x / this.world.spriteWidth),
                y: Math.floor(this.avatarPos.y / this.world.spriteHeight)
            }

            let goalTile = {
                x: avatarTile.x + dx,
                y: avatarTile.y + dy
            }

            let roomPos = {
                x: Math.floor(this.currentRoomId % this.world.worldWidth),
                y: Math.floor(this.currentRoomId / this.world.worldHeight)
            }

            // check for edge of room
            if (goalTile.x < 0) {
                avatarTile.x = this.world.roomWidth
                goalTile.x = this.world.roomWidth - 1
                roomPos.x--
            }
            else if (goalTile.x >= this.world.roomWidth) {
                avatarTile.x = -1
                goalTile.x = 0
                roomPos.x++
            }
            else if (goalTile.y < 0) {
                avatarTile.y = this.world.roomHeight
                goalTile.y = this.world.roomHeight - 1
                roomPos.y--
            }
            else if (goalTile.y >= this.world.roomHeight) {
                avatarTile.y = -1
                goalTile.y = 0
                roomPos.y++
            }

            // check for edge of world
            if (roomPos.x < 0) {
                if (this.world.wrapLeftRight) roomPos.x = this.world.worldWidth - 1
                else blockAvatar = true
            }
            if (roomPos.x >= this.world.worldWidth) {
                if (this.world.wrapLeftRight) roomPos.x = 0
                else blockAvatar = true
            }
            if (roomPos.y < 0) {
                if (this.world.wrapTopBottom) roomPos.y = this.world.worldHeight - 1
                else blockAvatar = true
            }
            if (roomPos.y >= this.world.worldHeight) {
                if (this.world.wrapTopBottom) roomPos.y = 0
                else blockAvatar = true
            }

            // get the room the avatar is now in
            let roomId = blockAvatar ? this.currentRoomId : roomPos.x + (roomPos.y * this.world.worldWidth)
            let room = blockAvatar ? this.currentRoom : this.world.rooms[roomId]

            // check sprites at goal location for walls, items, and actions
            room.spriteLocations = room.spriteLocations.map(l => {
                if (l.x === goalTile.x && l.y === goalTile.y) {
                    let sprite = this.world.sprites[l.spriteId]
                    if (sprite.actions.length) {
                        let pushActions = sprite.actions.filter(action => action.trigger.type === 'push')
                        pushActions.forEach(({ event }) => {
                            Event.run(event, {
                                avatarTile, goalTile,
                                spriteLocation: l,
                                messages: this.messages,
                                inventory: this.inventory,
                                setRoomId: x => { roomId = x },
                                setDialog: x => this.setDialog(x, l)
                            })
                        })
                    }
                    if (sprite.wall) {
                        blockAvatar = true
                    }
                    if (sprite.item) {
                        this.inventory[l.spriteId] = (this.inventory[l.spriteId] || 0) + 1
                        stopMovement = true
                        l.removeMe = true
                    }
                }
                return l
            }).filter(l => !l.removeMe)

            // set direction of avatar
            let newDirection
            if (goalTile.x > avatarTile.x) newDirection = 'right'
            else if (goalTile.x < avatarTile.x) newDirection = 'left'
            if (newDirection && newDirection !== this.facingDirection) {
                Sprite.flip(this.avatarSprite, true)
                this.facingDirection = newDirection
            }

            // cancel movement if needed
            if (avatarTile.x === goalTile.x && avatarTile.y === goalTile.y) stopMovement = true
            if (stopMovement || blockAvatar) this.keyCodes.pop()
            if (blockAvatar) return

            // move rooms if needed
            if (this.currentRoomId !== roomId) {
                this.currentRoomId = roomId
                this.currentRoom = this.world.rooms[roomId]
            }

            // set avatar position in case it changed
            this.avatarPos = {
                x: avatarTile.x * this.world.spriteWidth,
                y: avatarTile.y * this.world.spriteHeight
            }

            // set new goal
            this.avatarGoal = {
                x: goalTile.x * this.world.spriteWidth,
                y: goalTile.y * this.world.spriteHeight
            }
        }

        this.setDialog = (text, spritePos) => {
            if (!this.text) {
                let scale = this.world.textScale || 1
                let padding = 1 * scale

                this.textStart = null
                this.text = new Text(world.font, text, padding, padding, this.textCanvas.width - (2 * padding))
                if (spritePos.y < world.roomHeight / 2) {
                    this.text.y = (this.canvas.height * scale) - this.text.h - padding
                }
            }
        }

        this.endDialog = () => {
            this.textContext.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height)
            this.text = null
        }

        this.checkMessages = () => {
            let newMessages = []
            this.messages.forEach(message => {
                this.currentRoom.spriteLocations = this.currentRoom.spriteLocations.map(l => {
                    let sprite = this.world.sprites[l.spriteId]
                    sprite.actions.forEach(({ trigger, event }) => {
                        if (trigger.type === 'receive_message' && trigger.message === message) {
                            Event.run(event, {
                                spriteLocation: l,
                                messages: newMessages,
                                inventory: this.inventory
                            })
                        }
                    })
                    return l
                }).filter(l => !l.removeMe)
            })
            this.messages = newMessages.filter(m => !this.messages.includes(m))
        }
    
        this.update = (timestamp) => {
            if (!this.animationStart) this.animationStart = timestamp
            let dt = timestamp - this.animationStart
    
            // update sprite frames
            if (dt >= this.world.frameRate) {
                this.animationStart = timestamp
                this.world.sprites.forEach(sprite => Sprite.nextFrame(sprite))
            }

            // update avatar movement
            if (this.avatarGoal) {
                let dx = Math.sign(this.avatarGoal.x - this.avatarPos.x)
                let dy = Math.sign(this.avatarGoal.y - this.avatarPos.y)
                this.avatarPos.x += dx
                this.avatarPos.y += dy
                if (this.avatarPos.x === this.avatarGoal.x && this.avatarPos.y === this.avatarGoal.y) {
                    this.avatarGoal = null
                }
            } else {
                this.checkMovement(timestamp)
            }

            this.checkMessages()
    
            this.draw(dt)
            if (this.text) this.drawText(timestamp)
    
            this.animationLoop = window.requestAnimationFrame(this.update)
        }
    
        this.draw = (dt) => {
            Room.draw(this.context, { world: this.world, room: this.currentRoom })
            if (this.avatarPos) Sprite.draw(this.avatarSprite, this.context, {
                x: this.avatarPos.x,
                y: this.avatarPos.y,
                palette: this.world.palettes[this.currentRoom.paletteId],
            })
        }

        this.drawText = (timestamp) => {
            if (!this.textStart) this.textStart = timestamp
            let dt = timestamp - this.textStart
            this.text.drawPage(this.textContext, dt)
        }
    }
}