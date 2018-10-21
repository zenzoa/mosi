class SettingsPanel extends Component {
    render(props) {
        // TODO: world size

        // TODO: room size

        // TODO: sprite size

        let fontButton = h(Button, { onclick: () => props.setPanel('font') }, 'import font data')

        let backButton = h(BackButton, { onclick: props.back })

        return h(Panel, {
            header: [backButton, h(Filler)],
            content: [fontButton]
        })
    }
}

class FontPanel extends Component {
    constructor() {
        super()

        this.state = { text: '' }

        this.importFont = (text) => {
            let font = parseFont(text)
            this.props.setData(['font'], font)
            this.props.back()
        }
    }

    render(props, state) {
        let fontBox = h(BigTextbox, {
            text: state.font,
            placeholder: 'paste font data here',
            onchange: (text) => this.setState({ text })
        })

        let fontButton = h(Button, {
            onclick: () => this.importFont(state.text)
        }, 'import font')

        let backButton = h(BackButton, { onclick: props.back })

        return h(Panel, {
            header: [backButton, h(Filler)],
            content: [fontBox],
            footer: [fontButton]
        })
    }
}