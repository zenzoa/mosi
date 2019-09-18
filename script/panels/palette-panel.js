class PalettePanel extends Component {
    constructor() {
        super()
        this.state = {
            currentColorIndex: 0
        }

        this.hexStringRegex = /^#[0-9a-f]{6}$/i

        this.onColorChange = (newColor) => {
            let { updateColor, palette } = this.props
            let { currentColorIndex } = this.state
            let newColorValue = newColor.hexString
            let oldColorValue = palette.colorList[currentColorIndex]
            if (newColorValue !== oldColorValue) {
                updateColor(currentColorIndex, newColorValue)
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.palette !== nextProps.palette) {
            this.setState({ currentColorIndex: 0 })
        }
    }

    render({
        backButton,
        closeTab,
        removePalette,
        renamePalette,
        randomPalette,
        exportPalette,
        duplicatePalette,
        addColor,
        updateColor,
        removeColor,
        currentPaletteIndex,
        paletteList,
        palette
    }, {
        currentColorIndex,
        showExportOverlay,
        showRemovePaletteOverlay,
        showRandomOverlay,
        showRemoveColorOverlay,
        showExtrasOverlay
    }) {
        let currentColor = palette.colorList[currentColorIndex]

        let nameTextbox = textbox({
            placeholder: 'palette name',
            value: palette.name,
            onchange: e => renamePalette(e.target.value)
        })
    
        let exportButton = iconButton({
            title: 'export palette',
            onclick: () => this.setState({ showExtrasOverlay: false, showExportOverlay: true })
        }, 'export')

        let exportOverlay = !showExportOverlay ? null :
            h(ExportOverlay, {
                header: 'export palette',
                fileName: `${palette.name || 'untitled'}.mosicolors`,
                data: exportPalette(),
                closeOverlay: () => this.setState({ showExportOverlay: false })
            })
    
        let removeButton = paletteList.length < 2 ? null :
            iconButton({
                title: 'remove palette',
                onclick: () => this.setState({ showExtrasOverlay: false, showRemovePaletteOverlay: true }),
            }, 'delete')

        let removePaletteOverlay = !showRemovePaletteOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove palette?',
                closeOverlay: () => this.setState({ showRemovePaletteOverlay: false }),
                remove: () => {
                    removePalette()
                    this.setState({ showRemovePaletteOverlay: false })
                }
            })

        let duplicateButton = iconButton({
            title: 'duplicate palette',
            onclick: () => {
                this.setState({ showExtrasOverlay: false })
                duplicatePalette()
            }
        }, 'duplicate')

        let randomButton = iconButton({
            className: 'icon',
            title: 'randomize palette',
            onclick: () => this.setState({ showExtrasOverlay: false, showRandomOverlay: true })
        }, 'random')

        let randomOverlay = !showRandomOverlay ? null :
            h(RemoveOverlay, {
                header: 'randomize palette?',
                closeOverlay: () => this.setState({ showRandomOverlay: false }),
                remove: () => {
                    randomPalette()
                    this.setState({ showRandomOverlay: false })
                }
            })

        let colorButtonList = palette.colorList.map((color, i) => {
            return colorButton({
                className: i === currentColorIndex ? 'initial-focus' : '',
                isSelected: (i === currentColorIndex),
                onclick: () => this.setState({ currentColorIndex: i }),
                color
            })
        })

        let addColorButton = palette.colorList.length >= 8 ? null :
            iconButton({
                title: 'add color',
                onclick: () => {
                    addColor(currentColor)
                    this.setState({ currentColorIndex: palette.colorList.length - 1 })
                }
            }, 'add')

        let removeColorButton = palette.colorList.length <= 2 ? null :
            iconButton({
                title: 'remove color',
                onclick: () => this.setState({ showRemoveColorOverlay: true })
            }, 'remove')

        let removeColorOverlay = !showRemoveColorOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove color?',
                closeOverlay: () => this.setState({ showRemoveColorOverlay: false }),
                remove: () => {
                    removeColor(currentColorIndex)
                    this.setState({
                        currentColorIndex: Math.max(0, currentColorIndex - 1),
                        showRemoveColorOverlay: false
                    })
                }
            })

        let extrasButton = iconButton({
            title: 'palette actions',
            onclick: () => this.setState({ showExtrasOverlay: true })
        }, 'extras')

        let extrasOverlay = !showExtrasOverlay ? null :
            h(ExtrasOverlay, {
                header: 'palette actions',
                buttons: [
                    duplicateButton,
                    removeButton,
                    exportButton,
                    randomButton
                ],
                closeOverlay: () => this.setState({ showExtrasOverlay: false })
            })

        let colorPicker = !currentColor ? null :
            h(ColorPicker, {
                color: currentColor,
                onColorChange: this.onColorChange
            })
        
        let colorTextbox = !currentColor ? null :
            textbox({
                className: 'color-textbox',
                value: currentColor,
                style: { backgroundColor: currentColor },
                onchange: e => {
                    let newColor = e.target.value
                    if (this.hexStringRegex.test(newColor)) {
                        updateColor(currentColorIndex, newColor)
                    } else {
                        e.target.value = currentColor
                    }
                }
            })

        return panel({ header: 'palette', className: 'palette-panel', closeTab }, [
            row([
                backButton,
                nameTextbox
            ]),
            row(
                colorButtonList.concat([
                    addColorButton,
                    removeColorButton
                ])
            ),
            colorPicker,
            row([
                extrasButton,
                colorTextbox
            ]),
            exportOverlay,
            removePaletteOverlay,
            randomOverlay,
            removeColorOverlay,
            extrasOverlay
        ])
    }
}