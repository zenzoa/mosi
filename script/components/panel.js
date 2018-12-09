class Panel extends Component {
    constructor() {
        super()

        this.undoButton = () => {
            if (this.props.undo) {
                return button({ class: 'icon', onclick: this.props.undo }, '⤺')
            }
        }

        this.redoButton = () => {
            if (this.props.redo) {
                return button({ class: 'icon', onclick: this.props.redo }, '⤻')
            }
        }

        this.backButton = () => {
            if (this.props.back) {
                return button({ class: 'icon', onclick: this.props.back }, '←')
            }
        }

        this.menu = (contents) => {
            let menuOpenButton = button({
                class: 'icon',
                onclick: () => this.setState({ menuOpen: true })
            }, '≡')

            let menuCloseButton = button({
                class: 'icon close',
                onclick: () => this.setState({ menuOpen: false })
            }, '×')

            let menu = this.state.menuOpen ? menuModal([
                menuCloseButton,
                contents
            ]) : null

            return [ menuOpenButton, menu ]
        }
    }

    componentWillUpdate(_, nextState) {
        if (this.state.menuOpen) nextState.menuOpen = false
    }
}