class ScriptPanel extends Component {
    constructor(props) {
        super()

        let eventList = Object.keys(props.scriptList)
        let currentEvent = eventList[0]

        this.state = {
            currentEvent
        }

        let timeout
        this.updateScript = () => {
            let update = () => {
                if (!this.textarea) return
                this.props.updateScript(this.state.currentEvent, this.textarea.value)
            }
            let callNow = !timeout
            window.clearTimeout(timeout)
            timeout = setTimeout(() => {
                timeout = null
                update()
            }, 500)
            if (callNow) update()
        }

        this.insertText = (text = '') => {
            if (!this.textarea) return
            let beforeSelection = this.textarea.value.slice(0, this.textarea.selectionStart)
            let afterSelection = this.textarea.value.slice(this.textarea.selectionStart) // intentionally not using selectionEnd so as not to accidentally overwrite anything
            let newValue = beforeSelection + text.toString() + afterSelection
            this.props.updateScript(this.state.currentEvent, newValue)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.scriptList !== this.props.scriptList) {
            let eventList = Object.keys(nextProps.scriptList)
            this.setState({ currentEvent: eventList[0] })
        }
    }

    render ({
        backButton,
        closeTab,
        updateScript,
        scriptList
    }, {
        currentEvent,
        showScriptoriumOverlay
    }) {
        let eventList = Object.keys(scriptList)
            .filter(x => x !== 'on-message') // TEMP until message scripts implemented
        let currentScript = scriptList[currentEvent]

        let eventButtons = eventList.map(event => {
            return button({
                className: 'simple fill ' + (event === currentEvent ? 'selected' : ''),
                onclick: () => {
                    this.setState({ currentEvent: event })
                }
            }, '> ' + event.replace('-', ' ') + (scriptList[event] ? ' ★' : ''))
        })

        let scriptText = textarea({
            value: currentScript,
            className: 'initial-focus',
            onkeydown: this.updateScript,
            onchange: e => updateScript(currentEvent, e.target.value),
            ref: node => { this.textarea = node },
            rows: 10
        })

        let scriptoriumButton = iconButton({
            onclick: () => this.setState({ showScriptoriumOverlay: true })
        }, 'add')

        let scriptoriumOverlay = !showScriptoriumOverlay ? null :
            h(ScriptoriumOverlay, {
                closeOverlay: () => this.setState({ showScriptoriumOverlay: false }),
                insertText: (text) => {
                    this.insertText(text)
                    this.setState({ showScriptoriumOverlay: false })
                },
                spriteOnly: true
            })

        return panel({ header: 'script', id: 'scriptPanel', closeTab }, [
            row([
                backButton,
                eventButtons
            ]),
            scriptText,
            row([ fill(), scriptoriumButton ]),
            scriptoriumOverlay
        ])
    }
}