class PaletteListPanel extends Component {
    render ({ closeTab }) {
        return panel({ header: 'palettes', id: 'paletteListPanel', closeTab }, [
            h(PaletteList, this.props)
        ])
    }
}

class PaletteList extends Component {
    render ({
        selectPalette,
        editPalette,
        addPalette,
        importPalette,
        currentPaletteIndex,
        paletteList = []
    }, {
        showImportOverlay
    }) {
        let paletteButtonList = paletteList.map((palette, i) => {
            return paletteButton({
                className: i === currentPaletteIndex ? 'initial-focus' : '',
                onclick: () => {
                    if (currentPaletteIndex === i) {
                        editPalette()
                    } else {
                        selectPalette(i, 'palette')
                    }
                },
                isSelected: (i === currentPaletteIndex),
                palette
            })
        })

        let addPaletteButton = !addPalette ? null :
            iconButton({
                title: 'new palette',
                onclick: addPalette
            }, 'add')

        let importPaletteButton = !importPalette ? null :
            iconButton({
                title: 'import palette',
                onclick: () => this.setState({ showImportOverlay: true })
            }, 'import')

        let importOverlay = !showImportOverlay ? null :
            h(ImportOverlay, {
                header: 'import palette',
                onImport: data => {
                    importPalette(data)
                    this.setState({ showImportOverlay: false })
                },
                fileType: '.mosipalette',
                closeOverlay: () => this.setState({ showImportOverlay: false })
            })

        return div({ className: 'content' }, [
            row([
                importPaletteButton,
                fill(),
                addPaletteButton
            ]),
            hr(),
            div({ className: 'paletteList' }, [
                paletteButtonList
            ]),
            importOverlay
        ])
    }
}