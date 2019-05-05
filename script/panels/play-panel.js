class PlayPanel extends Component {
    componentDidMount() {
        this.game = new Game(deepClone(this.props.world), this.gameWrapper)
        this.game.begin()
    }

    componentWillUnmount() {
        this.game.end()
    }

    render({ closeTab }) {

        return div({ className: 'main' }, [
            div({ className: 'editor-header row' }, [
                button({
                    onclick: closeTab
                }, 'back'),
                fill(),
                button({
                    onclick: () => console.log('da share zone')
                }, 'share')
            ]),
            div({ className: 'play-canvas-wrapper' }, 
                div({
                    className: 'play-canvas',
                    ref: n => this.gameWrapper = n
                })
            )
        ])
    }
}
