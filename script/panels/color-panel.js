class ColorPanel extends Component {
    constructor() {
        super()
        this.state = {
            currentPaletteIndex: 0,
            currentColorIndex: 0
        }

        this.hexStringRegex = /^#[0-9a-f]{6}$/i

        this.onColorChange = (newColor) => {
            let { updateColor } = this.props
            let { currentPaletteIndex, currentColorIndex } = this.state
            updateColor(currentPaletteIndex, currentColorIndex, newColor.hexString)
        }
    }

    render({
        closeTab,
        addPalette,
        renamePalette,
        removePalette,
        randomPalette,
        addColor,
        updateColor,
        removeColor,
        paletteList
    }, {
        currentPaletteIndex,
        currentColorIndex,
        showRemovePaletteOverlay,
        showRandomPaletteOverlay,
        showRemoveColorOverlay
    }) {
        let palette = paletteList[currentPaletteIndex]
        let color = palette ? palette.colorList[currentColorIndex] : nullcolor

        let paletteDropdown = dropdown({
            className: 'initial-focus',
            value: currentPaletteIndex,
            onchange: e => {
                if (e.target.value === 'add') {
                    this.setState({
                        currentPaletteIndex: paletteList.length,
                        currentColorIndex: 0
                    })
                    addPalette(palette.colorList)
                } else {
                    this.setState({ 
                        currentPaletteIndex: e.target.value,
                        currentColorIndex: 0
                    })
                }
            }
        }, paletteList
            // remember original indices
            .map((palette, i) => ({ palette, i }))
            // sort alphabetically
            .sort((p1, p2) => {
                let name1 = p1.palette.name.toUpperCase()
                let name2 = p2.palette.name.toUpperCase()
                if (name1 < name2) return -1
                if (name1 > name2) return 1
                else return 0
            })
            // convert to options
            .map(({ palette, i }) =>
                option({ value: i }, palette.name)
            )
            // include 'add palette' option
            .concat([
                option({ value: 'add' }, '[ add palette ]')
            ])
        )
        
        let nameTextbox = !palette ? null :
            textbox({
                value: palette.name,
                onchange: e => renamePalette(currentPaletteIndex, e.target.value)
            })



        let removePaletteButton = paletteList.length <= 1 ? null :
            button({
                onclick: () => this.setState({ showRemovePaletteOverlay: true })
            }, 'remove palette')

        let removePaletteOverlay = !showRemovePaletteOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove palette?',
                closeOverlay: () => this.setState({ showRemovePaletteOverlay: false }),
                remove: () => {
                    removePalette(currentPaletteIndex)
                    this.setState({
                        currentPaletteIndex: 0,
                        currentColorIndex: 0,
                        showRemovePaletteOverlay: false
                    })
                }
            })

        let randomPaletteButton = button({
            onclick: () => this.setState({ showRandomPaletteOverlay: true })
        }, 'randomize')

        let randomPaletteOverlay = !showRandomPaletteOverlay ? null :
            h(RemoveOverlay, {
                header: 'randomize palette?',
                closeOverlay: () => this.setState({ showRandomPaletteOverlay: false }),
                remove: () => {
                    randomPalette(currentPaletteIndex)
                    this.setState({ showRandomPaletteOverlay: false })
                }
            })

        let colorButtonList = !palette ? null :
            palette.colorList.map((color, i) => {
                let selectedClass = (i === currentColorIndex) ? ' selected' : ''
                return button({
                    className: 'color-button' + selectedClass,
                    onclick: () => this.setState({ currentColorIndex: i })
                }, div({
                    className: 'color-button-block',
                    style: { backgroundColor: color }
                }))
            })

        let addColorButton = !palette || palette.colorList.length >= 8 ? null :
            button({
                onclick: () => {
                    this.setState({ currentColorIndex: palette.colorList.length })
                    let currentColor = palette.colorList[currentColorIndex]
                    addColor(currentPaletteIndex, currentColor)
                }
            }, 'add color')

        let removeColorButton = !palette || palette.colorList.length <= 2 ? null :
            button({
                onclick: () => this.setState({ showRemoveColorOverlay: true })
            }, 'remove color')

        let removeColorOverlay = !showRemoveColorOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove color?',
                closeOverlay: () => this.setState({ showRemoveColorOverlay: false }),
                remove: () => {
                    removeColor(currentPaletteIndex, currentColorIndex)
                    let newColorIndex = currentColorIndex - 1
                    if (newColorIndex < 0) newColorIndex = 0
                    this.setState({
                        currentColorIndex: newColorIndex,
                        showRemoveColorOverlay: false
                    })
                }
            })

        let colorPicker = !color ? null :
            h(ColorPicker, {
                color: color,
                onColorChange: this.onColorChange
            })
        
        let colorTextbox = !color ? null :
            textbox({
                className: 'color-textbox',
                value: color,
                style: { backgroundColor: color },
                onchange: e => {
                    let newColor = e.target.value
                    if (this.hexStringRegex.test(newColor)) {
                        updateColor(currentPaletteIndex, currentColorIndex, newColor)
                    }
                }
            })

        return panel({ header: 'colors', closeTab }, [
            div({ className: 'palette-dropdown' }, [
                paletteDropdown
            ]),
            div({ className: 'palette-settings' }, [
                nameTextbox
            ]),
            div({ className: 'palette-actions' }, [
                removePaletteButton,
                randomPaletteButton
            ]),
            div({ className: 'palette-colors' }, [
                colorButtonList,
                addColorButton,
                removeColorButton
            ]),
            div({ className: 'palette-color-picker' }, [
                colorPicker
            ]),
            div({ className: 'palette-color-textbox'}, [
                colorTextbox
            ]),
            removePaletteOverlay,
            removeColorOverlay,
            randomPaletteOverlay
        ])
    }
}
