class WelcomePanel extends Component {
    render({ closeTab, getStarted }) {
        return panel({ header: 'welcome', id: 'welcomePanel', closeTab }, [
            div({ className: 'welcome-logo' }, [
                img({ src: 'images/logo.png' })
            ]),
            div({ className: 'welcome-links' }, [
                h('strong', {}, 'version 1.1'),
                h('br'),
                span({}, 'added adjacent room edges, support for custom scripts, and less destructive resizing')
            ]),
            div({ className: 'welcome-links' }, [
                link({ href: 'https://github.com/zenzoa/mosi/wiki' }, 'tutorial'),
                ' | ',
                link({ href: 'https://github.com/zenzoa/mosi/issues/new' }, 'found a bug?')
            ]),
            row([
                button({
                    className: 'initial-focus fill',
                    onclick: getStarted
                }, `let's get started!`)
            ])
        ])
    }
}