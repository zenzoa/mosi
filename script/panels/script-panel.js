class ScriptPanel extends Component {
    constructor() {
        super()
    }

    render ({
        backButton,
        closeTab,
        updateScript,
        scriptList
    }, {
        currentEvent
    }) {
        if (!scriptList) return

        let eventList = Object.keys(scriptList)
        currentEvent = eventList.includes(currentEvent) ? currentEvent : eventList[0]
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
            onchange: e => updateScript(currentEvent, e.target.value),
            ref: node => { this.textarea = node },
            rows: 10
        })

        return panel({ header: 'script', className: 'script-panel', closeTab }, [
            row([
                backButton,
                eventButtons
            ]),
            scriptText
        ])
    }
}