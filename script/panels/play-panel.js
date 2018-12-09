class PlayPanel extends Panel {
    constructor(props) {
        super()
        this.state = { width: 0, height: 0 }
        this.world = clone(props.world)

        this.resize = () => {
            let rect = this.canvasWrapper.getBoundingClientRect()
            let minSize = Math.min(rect.width, rect.height) - 4

            let baseWidth = this.world.roomWidth * this.world.spriteWidth
            let baseHeight = this.world.roomHeight * this.world.spriteHeight

            let width = minSize
            let height = minSize * (baseHeight / baseWidth)

            this.setState({ width, height })
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.resize)
        this.resize()

        this.game = new Game(this.world, this.canvas)
        this.game.addEventListeners()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
        this.game.removeEventListeners()
    }

    render() {
        return div({ class: 'panel play-panel' }, [
            buttonRow(this.backButton()),
            div({ class: 'play-canvas', ref: n => this.canvasWrapper = n }, [
                canvas({
                    width: this.world.roomWidth * this.world.spriteWidth,
                    height: this.world.roomHeight * this.world.spriteHeight,
                    style: { width: this.state.width, height: this.state.height },
                    ref: n => this.canvas = n
                })
            ])
        ])
    }
}