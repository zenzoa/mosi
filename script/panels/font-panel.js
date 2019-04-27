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

        let importOverlay = !showImportOverlay ? null :
            h(ImportOverlay, {
                header: 'import font',
                onImport: data => {
                    let fontData = Font.parse(data)
                    setFontData(fontData)
                    this.setState({ showImportOverlay: false })
                },
                fileType: '.bitsyfont',
                hideTextImport: true,
                closeOverlay: () => this.setState({ showImportOverlay: false })
            })

        return panel({ header: 'font', closeTab }, [
            div({ className: 'font-data' }, [
                label({}, [
                    span({}, ['current font: ', strong(fontData.name)]),
                    button({ onclick: () => this.setState({ showImportOverlay: true }) }, 'import font')
                ])
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
            ]),
            importOverlay
        ])
    }
}
