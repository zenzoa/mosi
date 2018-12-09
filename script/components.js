class Textbox extends Component {
    constructor(props) {
        super()
        this.handleInput = (text) => props.onchange && props.onchange(text)
    }

    render(props) {
        props = deepClone(props)
        props.type = props.type || 'text'
        props.value = props.text
        props.oninput = (event) => this.handleInput(event.target.value)
        props.onchange = null

        let input = h('input', props)
        if (!props.label) return input

        return h('label', null, [
            h('span', null, props.label),
            input
        ])
    }
}

class BigTextbox extends Component {
    constructor(props) {
        super()
        this.state = { text: props.text }
        this.handleInput = (text) => this.setState({ text })
        this.handleChange = (text) => props.onchange && props.onchange(text)
    }

    render(props, state) {
        props = deepClone(props)
        props.value = state.text
        props.oninput = (event) => this.handleInput(event.target.value)
        props.onchange = (event) => this.handleChange(event.target.value)

        let textarea = h('textarea', props)
        if (!props.label) return textarea

        return h('label', null, [
            h('span', null, props.label),
            textarea
        ])
    }
}