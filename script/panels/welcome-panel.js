class WelcomePanel extends Component {
    render({ closeTab, getStarted }) {
        return panel({ header: 'about', closeTab }, [
            div({ className: 'welcome-logo' },
                img({ src: 'images/logo.png' })
            ),
            div({ className: 'welcome-message' }, [
                strong('Welcome to môsi!'), ' It\'s still in alpha, so please back up your work often and report any bugs you find along the way. ', strong('Enjoy making tiny games!')
            ]),
            div({ className: 'welcome-links' }, [
                a({ href: 'https://github.com/sarahgould/mosi', target: '_blank' }, 'source code'),
                ' | ',
                a({ href: 'https://github.com/sarahgould/mosi/issues/new', target: '_blank' }, 'report issues')
            ]),
            div({ className: 'welcome-actions' },
                button({
                    className: 'initial-focus',
                    onclick: getStarted
                }, `let's get started!`)
            )
        ])
    }
}