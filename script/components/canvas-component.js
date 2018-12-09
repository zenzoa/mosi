class CanvasComponent extends Component {
    constructor() {
        super()
        this.update = () => {
            let context = this.canvas.getContext('2d')
            this.props.draw(context)
        }
    }

    componentDidMount() {
        this.update()
    }

    componentDidUpdate() {
        this.update()
    }

    render({ w, h }) {
        return canvas({
            width: w,
            height: h,
            ref: n => { this.canvas = n }
        })
    }
}