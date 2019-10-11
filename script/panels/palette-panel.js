class PalettePanel extends Component {
    constructor() {
        super()
        this.state = {
            currentColorIndex: 0,
            colorSliceIndex: 3
        }

        this.hexStringRegex = /^#[0-9a-f]{6}$/i

        this.colorScale = (colors) => {
            return chroma.scale(colors)
                .mode('lab')
                .correctLightness()
                .colors(8)
        }

        let colorsNW = this.colorScale(['#5cd3fa', '#a2e362'])
        let colorsNE = this.colorScale(['#5D5DF6', '#121A30'])
        let colorsSW = this.colorScale(['#ffffeb', '#f4de3a'])
        let colorsSE = this.colorScale(['#cf65de', '#fb5060'])
        this.colorSets = []
        for (let i = 0; i < 8; i++) {
            this.colorSets.push({
                startColors: this.colorScale([colorsNW[i], colorsSW[i]]),
                endColors: this.colorScale([colorsNE[i], colorsSE[i]])
            })
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
        paletteList,
        palette
    }, {
        currentColorIndex,
        colorSliceIndex,
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
                fileName: `${palette.name || 'untitled'}.mosipalette`,
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
            }, 'delete')

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

        let gridItems = []
        let startColors = this.colorSets[colorSliceIndex].startColors
        let endColors = this.colorSets[colorSliceIndex].endColors
        for (let i = 0; i < 8; i++) {
            let startColor = startColors[i]
            let endColor = endColors[i]
            let colors = this.colorScale([startColor, endColor])
            colors.forEach(color => {
                gridItems.push(
                    div({ className: 'color-grid-item', style: { background: color } },
                        button({
                            //className: color === currentColor ? 'selected' : '',
                            onclick: () => updateColor(currentColorIndex, color)
                        })
                    )
                )
            })
        }
        let colorGrid = div({ className: 'color-grid' }, gridItems)

        let sliceColors = chroma.scale(['#ffffeb', '#121A30']).mode('lab').colors(8)
        let colorSliceItems = sliceColors.map((color, i) => {
            return div({ className: 'color-grid-item', style: { background: color } },
                button({
                    className: i === colorSliceIndex ? 'selected' : '',
                    onclick: () => this.setState({ colorSliceIndex: i })
                })
            )
        })
        let colorSlices = div({ className: 'color-grid one-row' }, colorSliceItems)
        
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

        return panel({ header: 'palette', id: 'palettePanel', closeTab }, [
            row([
                backButton,
                nameTextbox,
                extrasButton
            ]),
            row(
                colorButtonList.concat([
                    addColorButton,
                    removeColorButton
                ])
            ),
            colorGrid,
            colorSlices,
            row([ colorTextbox ]),
            extrasOverlay,
            exportOverlay,
            removePaletteOverlay,
            randomOverlay,
            removeColorOverlay
        ])
    }
}