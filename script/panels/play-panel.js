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
                iconButton({
                    className: 'simple',
                    onclick: closeTab
                }, 'back'),
                fill(),
                iconButton({
                    className: 'simple',
                    onclick: () => this.setState({ showShareOverlay: true })
                }, 'share')
            ]),
            div({ className: 'play-panel' }, 
                div({
                    className: 'play-canvas',
                    ref: n => this.gameWrapper = n
                })
            ),
            helpLink('play'),
            shareOverlay
        ])

    }
}
