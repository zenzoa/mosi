class DialogComponent extends Component {
    constructor() {
        super()
        this.frameId = 0
        this.animationLoop = null
        this.animationStart = null

        this.update = timestamp => {
            if (!this.animationStart) this.animationStart = timestamp
            let dt = timestamp - this.animationStart
            
            if (this.canvas && this.text) {
                let context = this.canvas.getContext('2d')
                this.text.drawPage(context, dt)
            }

            this.animationLoop = window.requestAnimationFrame(this.update)
        }

        this.nextPage = () => {
            let lastPage = this.text.nextPage()
            if (lastPage) this.text.firstPage()
        }
    }

    componentDidMount() {
        this.animationLoop = window.requestAnimationFrame(this.update)
        this.update()
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.animationLoop)
    }

    render({ font, string, x, y, width, displayTime }) {
        this.text = new Text(font, string, x, y, width, displayTime)
        return canvas({
            class: 'dialog-component',
            onclick: () => {
                this.animationStart = null
                this.nextPage()
            },
            width: this.text.w,
            height: this.text.h,
            ref: n => { this.canvas = n }
        })
    }
}