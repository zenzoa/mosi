class PaletteListPanel extends Component {
    render ({ closeTab }) {
        return panel({ header: 'palettes', className: 'palette-list-panel', closeTab }, [
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
        paletteList
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
                fileType: '.mosicolors',
                closeOverlay: () => this.setState({ showImportOverlay: false })
            })

        return div({ className: 'content' }, [
            row([ backButton ]),
            div({ className: 'paletteList' }, [
                paletteButtonList
            ]),
            hr(),
            row([
                importPaletteButton,
                fill(),
                editPaletteButton,
                addPaletteButton
            ]),
            importOverlay
        ])
    }
}