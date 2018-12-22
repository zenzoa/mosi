class PlayPanel extends Panel {
    constructor(props) {
        super()
        this.world = clone(props.world)
    }

    componentDidMount() {
        this.game = new Game(this.world, this.canvas)
        this.game.load()
    }

    componentWillUnmount() {
        this.game.removeEventListeners()
    }

    render() {
        return div({ class: 'panel play-panel' }, [
            buttonRow(this.backButton()),
            div({
                class: 'play-canvas',
                ref: n => this.canvasWrapper = n
            },
                div({ style: { position: 'relative' } },
                    canvas({ ref: n => this.canvas = n })
                )
            )
        ])
    }
}