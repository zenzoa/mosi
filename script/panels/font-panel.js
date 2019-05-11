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

        let fontResolutionDropdown = dropdown({
            value: fontResolution,
            onchange: e => setFontResolution(parseFloat(e.target.value))
        }, [
            option({ value: 0.125 }, '×1/16'),
            option({ value: 0.25 }, '×1/4'),
            option({ value: 0.5 }, '×1/2'),
            option({ value: 1 }, '×1'),
            option({ value: 2 }, '×2'),
            option({ value: 3 }, '×3'),
            option({ value: 4 }, '×4')
        ])
    
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
                    fontResolutionDropdown
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
