class FontPanel extends Component {
    constructor() {
        super()
        this.state = {}
    }

    render({
        closeTab,
        setFontResolution,
        setFontDirection,
        setFontData,
        fontResolution,
        fontDirection,
        fontData
    }, {
        showImportOverlay
    }) {

        let fontResolutionInput = numbox({
            value: fontResolution,
            min: 1,
            max: 4,
            onchange: e => setFontResolution(parseInt(e.target.value))
        })
    
        let fontDirectionButton = button({
            onclick: () => setFontDirection((fontDirection === 'ltr' ? 'rtl' : 'ltr'))
        }, (fontDirection === 'ltr' ? 'left to right' : 'right to left'))

        return panel({ header: 'font', closeTab }, [
            div({ className: 'font-data' }, [
                
            ]),
            div({ className: 'font-resolution' }, [
                label({}, [
                    span({}, 'font resolution'),
                    fontResolutionInput
                ])
            ]),
            div({ className: 'font-direction' }, [
                label({}, [
                    span({}, 'font direction'),
                    fontDirectionButton
                ])
            ])
        ])
    }
}
