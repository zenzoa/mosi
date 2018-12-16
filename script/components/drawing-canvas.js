class DrawingCanvas extends Component {
    constructor(props) {
        super()

        this.state = {
            tw: 64,
            th: 64,
            cursorX: Math.floor(props.w / 2),
            cursorY: Math.floor(props.h / 2)
        }

        this.animationLoop = null
        this.animationStart = null

        this.pointerIsDown = false
        this.pointerStart = { x: 0, y: 0 }
        this.pointerCurrent = { x: 0, y: 0 }

        this.isMoving = false

        this.keyActive = false
        this.keyCodes = []

        this.waitingForCursor = false
        this.waitingForKey = false

        this.pointerDown = (event) => {
            event.preventDefault()

            let pos = this.getPointerPos(event)
            if (pos) {
                this.pointerIsDown = true
                this.pointerStart = pos
                this.pointerCurrent = pos

                if (this.props.mode !== 'drag') {
                    this.moveCursorTo(pos.x, pos.y)
                }
            }
        }

        this.pointerMove = (event) => {
            if (!this.pointerIsDown) return
            event.preventDefault()
            
            this.pointerCurrent = this.getPointerPos(event)

            if (this.props.mode === 'drag') {
                if (!this.waitingForCursor) this.updateCursor()
            } else {
                this.moveCursorTo(this.pointerCurrent.x, this.pointerCurrent.y)
            }
        }

        this.pointerUp = (event) => {
            if (!this.pointerIsDown) return
            event.preventDefault()

            if (!this.isMoving && this.props.mode === 'drag') {
                if (this.props.draw) this.props.draw(this.state.cursorX, this.state.cursorY)
            }

            this.pointerIsDown = false
            this.isMoving = false
        }

        this.keyDown = (event) => {
            if (event.target.tagName.toLowerCase() === 'input') return
            this.keyActive = true
            this.keyCodes.push(event.key)
            this.updateKeys()
        }

        this.keyUp = (event) => {
            this.keyCodes = this.keyCodes.filter(keyCode => keyCode !== event.key)
            if (this.keyCodes.length === 0) this.keyActive = false
            if (!this.keyCodes.includes(' ')) this.isMoving = false
        }

        this.updateCursor = () => {
            if (!this.pointerStart || !this.pointerCurrent) return

            let dx = this.pointerCurrent.x - this.pointerStart.x
            let dy = this.pointerCurrent.y - this.pointerStart.y

            if (dx * dx + dy * dy > 20 * 20) {
                let angle = Math.atan2(dy, dx) * 180 / Math.PI + 180
                if (angle > 45 && angle <= 135) this.moveCursor(0, -1) // up
                else if (angle > 135 && angle <= 225) this.moveCursor(1, 0) // right
                else if (angle > 225 && angle <= 315) this.moveCursor(0, 1) // down
                else this.moveCursor(-1, 0) // left
                this.isMoving = true
            }
        }

        this.updateKeys = () => {
            if (this.keyActive) {
                let key = this.keyCodes[this.keyCodes.length - 1]
                if (key === 'ArrowLeft') this.moveCursor(-1, 0)
                else if (key === 'ArrowRight') this.moveCursor(1, 0)
                else if (key === 'ArrowUp') this.moveCursor(0, -1)
                else if (key === 'ArrowDown') this.moveCursor(0, 1)
                
                if (this.keyCodes.includes(' ')) {
                    this.moveCursor(0, 0)
                    if (this.props.draw) this.props.draw(this.state.cursorX, this.state.cursorY, this.isMoving)
                    this.isMoving = true
                }
            }
        }

        this.moveCursor = (dx, dy) => {
            let x = Math.max(0, Math.min(this.props.w - 1, this.state.cursorX + dx))
            let y = Math.max(0, Math.min(this.props.h - 1, this.state.cursorY + dy))
            let cursorMoved = x !== this.state.cursorX || y !== this.state.cursorY
            if (cursorMoved) this.setState({ cursorX: x, cursorY: y })

            this.waitingForCursor = true
            setTimeout(() => {
                this.waitingForCursor = false
                if (this.pointerIsDown) this.updateCursor()
            }, 150)

            this.waitingForKey = true
            setTimeout(() => { this.waitingForKey = false }, 100)
        }

        this.moveCursorTo = (posX, posY) => {
            let { x, y } = this.getTileCoords(posX, posY)
            let cursorMoved = x !== this.state.cursorX || y !== this.state.cursorY
            if (cursorMoved) this.setState({ cursorX: x, cursorY: y })
            if (cursorMoved || !this.isMoving) {
                if (this.props.draw) this.props.draw(x, y, this.isMoving)
                this.isMoving = true
            }
        }

        this.getPointerPos = (event) => {
            if (!this.canvas) return

            let pointer = event.touches ? event.touches[0] : event
            let rect = this.canvas.getBoundingClientRect()

            return {
                x: pointer.clientX - rect.x,
                y: pointer.clientY - rect.y
            }
        }

        this.getTileCoords = (posX, posY) => {
            let x = Math.max(0, Math.min(this.props.w - 1, Math.floor(posX / this.state.tw)))
            let y = Math.max(0, Math.min(this.props.h - 1, Math.floor(posY / this.state.th)))
            return { x, y }
        }

        this.update = (timestamp) => {
            if (!this.canvas) return
            let context = this.canvas.getContext('2d')

            if (timestamp) {
                if (!this.animationStart) this.animationStart = timestamp
                let dt = timestamp - this.animationStart
                let progressFrames = dt >= this.props.frameRate
                if (progressFrames) this.animationStart = timestamp

                this.props.update(context, progressFrames)
                this.animationLoop = window.requestAnimationFrame(this.update)

            } else {
                this.props.update(context)
                if (this.onionCanvas) {
                    this.props.updateOnion(this.onionCanvas.getContext('2d'))
                }
            }
        }

        this.resize = () => {
            let rect = this.base.getBoundingClientRect()
            let minSize = Math.min(rect.width, rect.height) - 4
            let tw = Math.floor(minSize / this.props.w)
            let th = tw * (this.props.h / this.props.w)
            this.setState({ tw, th })
        }
    }

    componentDidUpdate() {
        this.update()
    }

    componentDidMount() {
        if (this.props.frameRate) this.animationLoop = window.requestAnimationFrame(this.update)

        document.addEventListener('keydown', this.keyDown)
        document.addEventListener('keyup', this.keyUp)

        this.base.addEventListener('mousedown', this.pointerDown)
        document.addEventListener('mouseup', this.pointerUp)
        document.addEventListener('mousemove', this.pointerMove)

        this.base.addEventListener('touchstart', this.pointerDown, { passive: false })
        document.addEventListener('touchend', this.pointerUp, { passive: false })
        document.addEventListener('touchcancel', this.pointerUp, { passive: false })
        document.addEventListener('touchmove', this.pointerMove, { passive: false })

        window.addEventListener('resize', this.resize)
        setTimeout(this.resize, 1)
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.animationLoop)

        document.removeEventListener('keydown', this.keyDown)
        document.removeEventListener('keyup', this.keyUp)

        this.base.removeEventListener('mousedown', this.pointerDown)
        document.removeEventListener('mouseup', this.pointerUp)
        document.removeEventListener('mousemove', this.pointerMove)

        this.base.removeEventListener('touchstart', this.pointerDown)
        document.removeEventListener('touchend', this.pointerUp)
        document.removeEventListener('touchcancel', this.pointerUp)
        document.removeEventListener('touchmove', this.pointerMove)

        window.removeEventListener('resize', this.resize)
    }

    render({ key, w, h, sw = 1, sh = 1, showGrid, backgroundColor, highlight, updateOnion }) {
        let tw = this.state.tw
        let th = this.state.th

        let style = { width: w * tw, height: h * th }

        let canvasEl = canvas({
            key: key,
            width: w * sw,
            height: h * sh,
            style,
            ref: n => { this.canvas = n }
        })

        let onionCanvasEl = updateOnion ? canvas({
            key: 'onion-canvas',
            width: w * sw,
            height: h * sh,
            class: 'onion-skin',
            style,
            ref: n => { this.onionCanvas = n }
        }) : null

        let tableContents = Array(h).fill().map(() =>
            tr({}, Array(w).fill().map(() =>
                td()
            ))
        )
        let tableEl = table({
            class: 'grid' + (showGrid ? ' grid-lines' : ''),
            style
        }, tableContents)

        let highlightTile = highlight ? div({
            class: 'highlight-tile',
            style: {
                width: tw + 'px',
                height: th + 'px',
                left: (highlight.x * tw) + 'px',
                top: (highlight.y * th) + 'px'
            }
        }) : null

        let cursorTile = div({
            class: 'cursor-tile',
            style: {
                left: this.state.cursorX * tw + 'px',
                top: this.state.cursorY * th + 'px',
                width: tw + 'px',
                height: th + 'px'
            }
        })

        return div({ class: 'tile-canvas drawing-canvas', style: { backgroundColor } },
            div({ class: 'canvas-wrapper', style }, [
                canvasEl,
                onionCanvasEl,
                highlightTile,
                tableEl,
                cursorTile
            ])
        )
    }
}