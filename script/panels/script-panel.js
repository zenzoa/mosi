class ScriptPanel extends Component {
    constructor(props) {
        super()

        let eventList = Object.keys(props.scriptList)
        this.state = {
            currentEvent: eventList[0]
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
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.scriptList !== this.props.scriptList) {
            let eventList = Object.keys(this.props.scriptList)
            this.setState({ currentEvent: eventList[0] })
        }
    }

    render ({
        backButton,
        closeTab,
        updateScript,
        scriptList
    }, {
        currentEvent
    }) {
        let eventList = Object.keys(scriptList)
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

        return panel({ header: 'script', className: 'script-panel', closeTab }, [
            row([
                backButton,
                eventButtons
            ]),
            scriptText,
            div({ className: 'welcome-links' }, [
                a({ href: 'https://github.com/zenzoa/mosi/wiki/scripts', target: '_blank' }, 'guide to scripts'),
            ]),
        ])
    }
}