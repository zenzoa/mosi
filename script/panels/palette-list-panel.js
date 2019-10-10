class PaletteListPanel extends Component {
    render ({ closeTab }) {
        return panel({ header: 'palettes', id: 'paletteListPanel', closeTab }, [
            h(PaletteList, this.props)
        ])
    }
}

class PaletteList extends Component {
    render ({
        backButton,
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
                onclick: () => selectPalette(i, 'palette'),
                isSelected: (i === currentPaletteIndex),
                palette
            })
        })

        let editPaletteButton = !editPalette ? null :
            iconButton({ title: 'edit palette', onclick: editPalette }, 'edit')

        let addPaletteButton = !addPalette ? null :
            iconButton({ title: 'add palette', onclick: addPalette }, 'add')

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
                backButton,
                fill(),
                importPaletteButton,
                addPaletteButton,
                editPaletteButton ? vr() : null,
                editPaletteButton
            ]),
            hr(),
            div({ className: 'paletteList' }, [
                paletteButtonList
            ]),
            importOverlay
        ])
    }
}