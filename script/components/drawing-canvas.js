class DrawingCanvas extends Component {
    constructor() {
        super()

        this.state = {
            tw: 64,
            th: 64
        }

        this.pointerIsDown = false
        this.lastCoords = null
        this.pixelValue = null

        this.pointerDown = (event) => {
            event.preventDefault() // prevent both mouse and touch events from triggering
            this.pointerIsDown = true
            this.draw(event)
        }

        this.pointerUp = (event) => {
            if (!this.pointerIsDown) return
            event.preventDefault() // prevent both mouse and touch events from triggering
            this.pointerIsDown = false
            this.pixelValue = null
        }

        this.pointerMove = (event) => {
            if (!this.pointerIsDown) return
            event.preventDefault() // prevent both mouse and touch events from triggering
            this.draw(event)
        }

        this.getCoords = (event) => {
            if (!this.canvas) return
            let pointer = event.touches ? event.touches[0] : event

            let rect = this.canvas.getBoundingClientRect()
            let px = pointer.clientX - rect.x
            let py = pointer.clientY - rect.y
            let x = Math.floor(px / this.state.tw)
            let y = Math.floor(py / this.state.th)

            let inBounds = (x >= 0 && x < this.props.w && y >= 0 && y < this.props.h)
            if (inBounds) return { x, y }
        }

        this.draw = (event) => {
            let coords = this.getCoords(event)
            if (!coords) return

            let currentValue = this.props.getPixel(coords.x, coords.y)
            if (!exists(this.pixelValue)) {
                this.pixelValue = currentValue ? 0 : 1
            }
            if (this.pixelValue !== currentValue)  {
                this.props.setPixel(coords.x, coords.y, this.pixelValue)
            }
            this.update()
        }

        this.update = () => {
            if (!this.canvas) return
            this.props.draw(this.canvas.getContext('2d'))
            if (this.props.drawOnion) {
                this.props.drawOnion(this.onionCanvas.getContext('2d'))
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
        this.base.addEventListener('mousedown', this.pointerDown)
        document.addEventListener('mouseup', this.pointerUp)
        document.addEventListener('mousemove', this.pointerMove)

        this.base.addEventListener('touchstart', this.pointerDown, { passive: false })
        document.addEventListener('touchend', this.pointerUp, { passive: false })
        document.addEventListener('touchcancel', this.pointerUp, { passive: false })
        document.addEventListener('touchmove', this.pointerMove, { passive: false })

        window.addEventListener('resize', this.resize)
        this.resize()
    }

    componentWillUnmount() {
        this.base.removeEventListener('mousedown', this.pointerDown)
        document.removeEventListener('mouseup', this.pointerUp)
        document.removeEventListener('mousemove', this.pointerMove)

        this.base.removeEventListener('touchstart', this.pointerDown)
        document.removeEventListener('touchend', this.pointerUp)
        document.removeEventListener('touchcancel', this.pointerUp)
        document.removeEventListener('touchmove', this.pointerMove)

        window.removeEventListener('resize', this.resize)
    }

    render(props) {
        let w = props.w
        let h = props.h

        let tw = this.state.tw
        let th = this.state.th

        let style = { width: w * tw, height: h * th }
        
        let canvasEl = canvas({
            width: w,
            height: h,
            style,
            ref: n => { this.canvas = n }
        })

        let onionCanvas = props.drawOnion ? canvas({
            width: w,
            height: h,
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
            class: 'grid' + (props.showGrid ? ' grid-lines' : ''),
            style
        }, tableContents)

        return div({ class: 'drawing-canvas', style: { backgroundColor: props.backgroundColor } },
            div({ class: 'canvas-wrapper', style }, [
                canvasEl,
                onionCanvas,
                tableEl
            ])
        )
    }
}