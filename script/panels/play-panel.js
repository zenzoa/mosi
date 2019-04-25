class PlayPanel extends Component {
    componentDidMount() {
        this.game = new Game(deepClone(this.props.world), this.gameWrapper)
        this.game.begin()
    }

    componentWillUnmount() {
        this.game.end()
    }

    render({ closeTab }) {

        return div({}, [
            button({
                onclick: closeTab
            }, 'back'),
            div({
                className: 'play-canvas-wrapper',
                ref: n => this.gameWrapper = n
            })
        ])
    }
}
