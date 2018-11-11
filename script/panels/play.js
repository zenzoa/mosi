class PlayPanel extends Component {
    constructor(props) {
        super()
        this.world = deepClone(props.world)
    }

    componentDidMount() {
        let canvas = this.base.getElementsByTagName('canvas')[0]
        this.game = new Game(this.world, canvas)
        this.game.addEventListeners()
    }

    componentWillUnmount() {
        this.game.removeEventListeners()
    }

    render(props) {
        let size = this.world.roomSize * this.world.spriteSize
        let playCanvas = h('canvas', { class: 'play-canvas ' + (props.class || ''), width: size, height: size })
        let playDiv = h('div', { class: 'canvas-wrapper' }, playCanvas)

        let backButton = h(BackButton, { onclick: props.back })

        return h(Panel, {
            header: [backButton, h(Filler)],
            content: playDiv,
            centered: true
        })
    }
}