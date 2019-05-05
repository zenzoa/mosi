class PlayPanel extends Component {
    componentDidMount() {
        this.game = new Game(deepClone(this.props.world), this.gameWrapper)
        this.game.begin()
    }

    componentWillUnmount() {
        this.game.end()
    }

    render({ closeTab, world }, { showShareOverlay }) {

        let shareOverlay = !showShareOverlay ? null :
            h(ShareOverlay, {
                closeOverlay: () => this.setState({ showShareOverlay: false }),
                world
            })

        return div({ className: 'main' }, [
            div({ className: 'editor-header row' }, [
                button({
                    onclick: closeTab
                }, 'back'),
                fill(),
                button({
                    onclick: () => this.setState({ showShareOverlay: true })
                }, 'share')
            ]),
            div({ className: 'play-canvas-wrapper' }, 
                div({
                    className: 'play-canvas',
                    ref: n => this.gameWrapper = n
                })
            ),
            shareOverlay
        ])

    }
}
