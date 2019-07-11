class SpriteGrid extends Component {
    constructor() {
        super()

        this.state = {
            usingKeyboard: false,
            lastTileX: 0,
            lastTileY: 0
        }

        this.pointerStart = (e) => {
            e.preventDefault()
            this.pointerIsDown = true
            this.drawPixelEvent(e, true)
        }

        this.pointerMove = (e) => {
            if (this.pointerIsDown) {
                e.preventDefault()
                this.drawPixelEvent(e)
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

            let { width, height, frame, drawPixel } = this.props
            let x = this.state.lastTileX
            let y = this.state.lastTileY

            if (e.key === 'ArrowUp') y--
            if (e.key === 'ArrowDown') y++
            if (e.key === 'ArrowLeft') x--
            if (e.key === 'ArrowRight') x++
            if (x < 0 || y < 0 || x >= width || y >= height) {
                return
            }

            let pixelIndex = width * y + x

            if (e.key === ' ') {
                this.spaceIsDown = true
                this.pixelValue = frame[pixelIndex] ? 0 : 1
            }

            if (this.spaceIsDown) {
                drawPixel(pixelIndex, this.pixelValue)
            }

            this.setState({ usingKeyboard: true, lastTileX: x, lastTileY: y })
        }

        this.keyUp = (e) => {
            if (e.key === ' ') this.spaceIsDown = false
        }

        this.drawPixelEvent = (e, setPixelValue) => {
            let pointer = e.touches ? e.touches[0] : e
            let rect = this.node.getBoundingClientRect()
            let pixelSize = rect.width / this.props.width
            let relX = pointer.clientX - rect.x
            let relY = pointer.clientY - rect.y
            if (relX < 0 || relY < 0 || relX >= rect.width || relY >= rect.height) {
                return
            }

            let x = Math.floor(relX / pixelSize)
            let y = Math.floor(relY / pixelSize)

            let pixelIndex = this.props.width * y + x
            if (setPixelValue) {
                this.pixelValue = this.props.frame[pixelIndex] ? 0 : 1
            }
            this.props.drawPixel(pixelIndex, this.pixelValue)

            this.setState({ lastTileX: x, lastTileY: y })
        }

        this.drawFrame = (frame, width, context) => {
            frame.forEach((pixel, i) => {
                let x = Math.floor(i % width)
                let y = Math.floor(i / width)
                if (pixel) context.fillRect(x, y, 1, 1)
            })
        }

        this.update = () => {
            let context = this.canvas.getContext('2d')
            let { width, height, frame, prevFrame, color, backgroundColor } = this.props

            context.clearRect(0, 0, width, height)
            context.fillStyle = backgroundColor || '#ffffff'
            context.fillRect(0, 0, width, height)
            context.fillStyle = color || '#000000'

            if (prevFrame) {
                context.globalAlpha = 0.1
                this.drawFrame(prevFrame, width, context)
                context.globalAlpha = 1
            }

            this.drawFrame(frame, width, context)
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
    }

    shouldComponentUpdate(nextProps, nextState) {
        return checkForUpdates(nextProps, this.props) || checkForUpdates(nextState, this.state)
    }

    componentDidUpdate() {
        this.update()
    }

    render({ className, width, height }, { usingKeyboard, lastTileX, lastTileY }) {
        let tileWidth = 100 / width
        let tileHeight = 100 / height
        let tileX = lastTileX * tileWidth
        let tileY = lastTileY * tileHeight

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
            className: 'grid spritegrid ' + className,
            ref: node => { this.node = node },
            tabindex: 0
        }, [
            canvas({
                width,
                height,
                ref: node => { this.canvas = node }
            }),
            gridHighlight
        ])
    }
}