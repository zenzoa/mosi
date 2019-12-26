class RoomGrid extends Component {
    constructor(props) {
        super()

        this.state = {
            usingKeyboard: false,
            lastTileX: props.selectedX || 0,
            lastTileY: props.selectedY || 0
        }

        this.frameIndex = 0
        this.spriteFrameList = {}
        this.isDrawing = true

        this.pointerStart = (e) => {
            e.preventDefault()
            this.pointerIsDown = true
            let startOfDraw = true
            this.pointerDraw(e, startOfDraw)
        }

        this.pointerMove = (e) => {
            if (this.pointerIsDown) {
                e.preventDefault()
                this.pointerDraw(e)
            }
        }

        this.pointerEnd = (e) => {
            if (this.pointerIsDown) {
                e.preventDefault()
                this.pointerIsDown = false
            }
        }

        this.keyDown = (e) => {
            if (!e.key.includes('Arrow') && e.key !== ' ') return
            e.preventDefault()

            let { roomWidth, roomHeight } = this.props
            let x = this.state.lastTileX
            let y = this.state.lastTileY

            if (e.key === 'ArrowUp') y--
            if (e.key === 'ArrowDown') y++
            if (e.key === 'ArrowLeft') x--
            if (e.key === 'ArrowRight') x++
            if (x < 0 || y < 0 || x >= roomWidth || y >= roomHeight) {
                return
            }

            let startOfDraw = false
            if (e.key === ' ') {
                startOfDraw = true
                this.spaceIsDown = true
            }

            if (this.spaceIsDown) {
                this.drawTile(x, y, startOfDraw)
            }

            this.setState({ usingKeyboard: true, lastTileX: x, lastTileY: y })
        }

        this.keyUp = (e) => {
            if (e.key === ' ') this.spaceIsDown = false
        }

        this.pointerDraw = (e, startOfDraw) => {
            let pointer = e.touches ? e.touches[0] : e
            let { roomWidth, roomHeight } = this.props
            let rect = this.node.getBoundingClientRect()
            let tileWidth = rect.width / roomWidth
            let tileHeight = rect.height / roomHeight
            let relX = pointer.clientX - rect.x
            let relY = pointer.clientY - rect.y
            if (relX < 0 || relY < 0 || relX >= rect.width || relY >= rect.height) {
                return
            }

            let x = Math.floor(relX / tileWidth)
            let y = Math.floor(relY / tileHeight)

            this.drawTile(x, y, startOfDraw)

            this.setState({ lastTileX: x, lastTileY: y })
        }

        this.drawTile = (x, y, startOfDraw) => {
            let { tileList, selectTile, drawTile, eraseTile, currentSpriteName, spriteIsTransparent } = this.props

            // when selecting tiles
            if (selectTile) {
                selectTile(x, y)
            }

            // when drawing/erasing tiles
            if (drawTile && eraseTile) {
                let spritesAtLocation = tileList.filter(l => l.x === x && l.y === y)
                let locationIsEmpty = spritesAtLocation.length === 0
                let spriteAlreadyAtLocation = spritesAtLocation.find(l => l.spriteName === currentSpriteName)
                let canDrawOnTile = spriteIsTransparent ? !spriteAlreadyAtLocation : locationIsEmpty

                if (startOfDraw) {
                    this.isDrawing = canDrawOnTile
                }

                if (this.isDrawing && canDrawOnTile) {
                    drawTile(x, y)
                }
                else if (!this.isDrawing) {
                    eraseTile(x, y)
                }
            }
        }

        this.nextFrames = () => {
            Object.keys(this.spriteFrameIndexList).forEach(key => {
                let frameIndex = this.spriteFrameIndexList[key]

                if (!isAnimated) this.frameIndex = frameIndex || 0
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

        this.cacheSprites = () => {
            let { spriteList, tileList, colorList } = this.props

            this.spriteFrameList = {}

            tileList.forEach(tile => {
                let { spriteName } = tile
                let sprite = spriteList.find(sprite => sprite.name === spriteName)

                let colorIndex = sprite.colorIndex
                while (colorIndex > 0 && !colorList[colorIndex]) colorIndex--
                let color = colorList[colorIndex]
                let bgColor = colorList[0]
                
                if (sprite && !this.spriteFrameList[sprite.name]) {
                    this.spriteFrameList[sprite.name] = sprite.frameList.map(frame => {
                        let frameCanvas = document.createElement('canvas')
                        frameCanvas.width = sprite.width
                        frameCanvas.height = sprite.height

                        let context = frameCanvas.getContext('2d')

                        if (!sprite.isTransparent) {
                            context.fillStyle = bgColor
                            context.fillRect(0, 0, sprite.width, sprite.height)
                        }
                        
                        context.fillStyle = color
                        this.drawFrame(frame, sprite.width, context)
                        
                        let frameData = frameCanvas
                        return frameData
                    })
                }
            })
        }

        this.update = (timestamp) => {
            let {
                roomWidth,
                roomHeight,
                spriteWidth,
                spriteHeight,
                spriteList,
                tileList,
                colorList,
                isAnimated,
                showBackground
            } = this.props

            if (!this.lastFrameTimestamp) this.lastFrameTimestamp = timestamp
            let dt = timestamp - this.lastFrameTimestamp
            if (dt >= FRAME_RATE) {
                if (isAnimated) this.frameIndex++
                if (this.frameIndex >= 12) this.frameIndex = 0
                this.lastFrameTimestamp = timestamp
            }
            
            let width = spriteWidth * roomWidth
            let height = spriteHeight * roomHeight
            
            let context = this.canvas.getContext('2d')

            if (showBackground) {
                context.fillStyle = colorList[0]
                context.fillRect(0, 0, width, height)
            } else {
                context.clearRect(0, 0, width, height)
            }

            tileList.forEach(tile => {
                let { spriteName, x, y } = tile
                let sprite = spriteList.find(sprite => sprite.name === spriteName)
                if (sprite) {
                    let xOffset = x * sprite.width
                    let yOffset = y * sprite.height
                    let frameList = this.spriteFrameList[sprite.name]
                    let frameIndex = this.frameIndex % frameList.length
                    let frameData = frameList[frameIndex]
                    context.drawImage(frameData, xOffset, yOffset)
                } else {
                    console.error('sprite "' + spriteName + '" not found')
                }
            })

            if (isAnimated) {
                this.animationRequest = window.requestAnimationFrame(this.update)
            }
        }
    }

    componentDidMount() {
        this.node.addEventListener('mousedown', this.pointerStart)
        document.addEventListener('mousemove', this.pointerMove)
        document.addEventListener('mouseup', this.pointerEnd)
    
        this.node.addEventListener('touchstart', this.pointerStart, { passive: false })
        document.addEventListener('touchend', this.pointerEnd, { passive: false })
        document.addEventListener('touchcancel', this.pointerEnd, { passive: false })
        document.addEventListener('touchmove', this.pointerMove, { passive: false })

        this.node.addEventListener('keydown', this.keyDown)
        this.node.addEventListener('keyup', this.keyUp)

        this.cacheSprites()
        this.update()
    }

    componentWillUnmount() {
        this.node.removeEventListener('mousedown', this.pointerStart)
        document.removeEventListener('mousemove', this.pointerMove)
        document.removeEventListener('mouseup', this.pointerEnd)
    
        this.node.removeEventListener('touchstart', this.pointerStart)
        document.removeEventListener('touchend', this.pointerEnd)
        document.removeEventListener('touchcancel', this.pointerEnd)
        document.removeEventListener('touchmove', this.pointerMove)

        this.node.removeEventListener('keydown', this.keyDown)
        this.node.removeEventListener('keyup', this.keyUp)

        window.cancelAnimationFrame(this.animationRequest)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return checkForUpdates(nextProps, this.props) || checkForUpdates(nextState, this.state)
    }

    componentDidUpdate() {
        this.cacheSprites()
        if (!this.props.isAnimated) this.update()
    }

    render({ className, spriteWidth, spriteHeight, roomWidth, roomHeight, colorList }, { usingKeyboard, lastTileX, lastTileY }) {
        let tileWidth = 100 / roomWidth
        let tileHeight = 100 / roomHeight
        let tileX = lastTileX * tileWidth
        let tileY = lastTileY * tileHeight

        let width = spriteWidth * (roomWidth + 2)
        let height = spriteHeight * roomHeight
        let widthRatio = width > height ? 1 : width / height
        let heightRatio = width > height ? height / width : 1

        let gridHighlight = !usingKeyboard ? null :
            div({
                className: 'grid-highlight',
                style: {
                    left: tileX + '%',
                    top: tileY + '%',
                    width: tileWidth + '%',
                    height: tileHeight + '%'
                }
            })

        return div({
            className: 'grid room-grid ' + className,
            style: {
                width: widthRatio * 100 + '%',
                paddingTop: heightRatio * 100 + '%',
                backgroundColor: colorList[0]
            },
            ref: node => { this.node = node },
            tabindex: 0
        }, [
            canvas({
                width: spriteWidth * roomWidth,
                height: spriteHeight * roomHeight,
                ref: node => { this.canvas = node }
            }),
            gridHighlight
        ])
    }
}