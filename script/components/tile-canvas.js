class TileCanvas extends Component {
    constructor(props) {
        super()

        this.state = {
            tw: 64,
            th: 64
        }

        this.animationLoop = null
        this.animationStart = null

        this.pointerIsDown = false
        this.lastCoords = null
        this.origin = { x: 0, y: 0 }
        this.temp = { x: 0, y: 0 }

        this.pointerDown = (event) => {
            event.preventDefault() // prevent both mouse and touch events from triggering
            
            let coords = this.getCoords(event)
            this.lastCoords = coords
            if (exists(coords)) {
                this.pointerIsDown = true
                this.pickUp(coords)
                this.showTemp(coords)
            }
        }

        this.pointerUp = (event) => {
            if (!this.pointerIsDown) return
            event.preventDefault() // prevent both mouse and touch events from triggering

            let coords = this.lastCoords
            if (exists(coords)) {
                this.drop(coords)
            } else {
                if (this.props.erase) this.props.erase(this.origin)
            }

            this.hideTemp()
            this.pointerIsDown = false
        }

        this.pointerMove = (event) => {
            if (!this.pointerIsDown) return
            event.preventDefault() // prevent both mouse and touch events from triggering

            let coords = this.getCoords(event)
            this.lastCoords = coords
            if (exists(coords)) {
                this.moveTemp(this.destTile, coords)
            } else {
                if (this.destTile) this.destTile.style.display = 'none'
            }
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

        this.pickUp = (coords) => {
            this.origin = coords
        }

        this.drop = (coords) => {
            if (this.props.isErasing && this.props.erase) {
                if (this.origin.x === coords.x && this.origin.y === coords.y) this.props.erase(this.origin)
            } else {
                this.props.move(this.origin, coords)
            }
        }

        this.showTemp = (coords) => {
            if (this.sourceTile) {
                this.sourceTile.style.display = 'block'
                this.moveTemp(this.sourceTile, this.origin)
            }

            if (this.destTile) {
                this.destTile.style.display = 'block'
                this.moveTemp(this.destTile, coords)
            }
        }

        this.moveTemp = (tile, coords) => {
            if (!tile) return
            tile.style.display = 'block'
            tile.style.left = coords.x * this.state.tw + 'px'
            tile.style.top = coords.y * this.state.th + 'px'
        }

        this.hideTemp = () => {
            if (this.sourceTile) this.sourceTile.style.display = 'none'
            if (this.destTile) this.destTile.style.display = 'none'
        }

        this.update = (timestamp) => {
            if (!this.canvas) return
            let context = this.canvas.getContext('2d')

            if (timestamp) {
                if (!this.animationStart) this.animationStart = timestamp
                let dt = timestamp - this.animationStart
                let progressFrames = dt >= this.props.frameRate
                if (progressFrames) this.animationStart = timestamp

                this.props.draw(context, progressFrames)
                this.animationLoop = window.requestAnimationFrame(this.update)
            }
            else {
                this.props.draw(context)
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
        setTimeout(this.resize, 1)

        if (this.props.frameRate) {
            this.animationLoop = window.requestAnimationFrame(this.update)
        }
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

        window.cancelAnimationFrame(this.animationLoop)
    }

    render(props) {
        let w = props.w
        let h = props.h

        let sw = props.sw
        let sh = props.sh

        let tw = this.state.tw
        let th = this.state.th

        let style = { width: w * tw, height: h * th }

        let canvasEl = canvas({
            key: props.key,
            width: w * sw,
            height: h * sh,
            style,
            ref: n => { this.canvas = n }
        })

        let tableContents = Array(h).fill().map(() =>
            tr({}, Array(w).fill().map(() =>
                td()
            ))
        )
        let tableEl = table({
            class: 'grid' + (props.showGrid ? ' grid-lines' : ''),
            style
        }, tableContents)

        let sourceTile = div({
            class: 'source-tile',
            style: { display: 'none', width: tw + 'px', height: th + 'px' },
            ref: n => { this.sourceTile = n }
        })

        let destTile = !props.isErasing ? div({
            class: 'dest-tile',
            style: { display: 'none', width: tw + 'px', height: th + 'px' },
            ref: n => { this.destTile = n }
        }) : null

        let highlightTile = props.highlight ? div({
            class: 'highlight-tile',
            style: {
                width: tw + 'px',
                height: th + 'px',
                left: (props.highlight.x * tw) + 'px',
                top: (props.highlight.y * th) + 'px'
            }
        }) : null

        return div({ class: 'tile-canvas drawing-canvas', style: { backgroundColor: props.backgroundColor } },
            div({ class: 'canvas-wrapper', style }, [
                canvasEl,
                highlightTile,
                sourceTile,
                destTile,
                tableEl
            ])
        )
    }
}