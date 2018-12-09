class SpriteComponent extends Component {
    constructor() {
        super()
        this.frameId = 0
        this.animationLoop = null
        this.animationStart = null

        this.update = timestamp => {
            let { sprite, palette, frameRate } = this.props

            if (!this.animationStart) this.animationStart = timestamp
            let dt = timestamp - this.animationStart
            
            if ((dt >= frameRate || !timestamp) && sprite && this.canvas) {
                this.animationStart = timestamp
                this.frameId = (this.frameId >= sprite.frames.length - 1) ? 0 : this.frameId + 1

                let context = this.canvas.getContext('2d')
                Sprite.draw(sprite, context, { frameId: this.frameId, palette, background: true })
            }

            if (this.props.frameRate) this.animationLoop = window.requestAnimationFrame(this.update)
        }
    }

    componentDidMount() {
        if (this.props.frameRate) {
            this.animationLoop = window.requestAnimationFrame(this.update)
            this.update()
        } else {
            this.update()
        }
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.animationLoop)
    }

    componentDidUpdate() {
        this.update()
    }

    render({ sprite }) {
        if (!sprite) return
        return canvas({
            width: sprite.w,
            height: sprite.h,
            ref: n => { this.canvas = n }
        })
    }
}