class WelcomePanel extends Component {
    render({ closeTab, getStarted }) {
        return panel({ header: 'welcome', closeTab }, [
            div({ className: 'welcome-logo' }, [
                img({ src: 'images/logo.png' })
            ]),
            div({ className: 'welcome-links' }, [
                h('strong', {}, 'version 1.0 preview'),
                h('br'),
                span({}, 'new UI, new scripting system, and music!')
            ]),
            div({ className: 'welcome-links' }, [
                a({ href: 'https://github.com/zenzoa/mosi/wiki', target: '_blank' }, 'tutorial'),
                ' | ',
                a({ href: 'https://github.com/zenzoa/mosi/issues/new', target: '_blank' }, 'found a bug?')
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