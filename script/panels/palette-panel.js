class PalettePanel extends Panel {
    constructor(props) {
        super()
        this.state = {
            tempColor: props.palette.colors[0],
            currentColorId: 0
        }

        this.hexRegex = /#[0-9a-f]{6}/i

        this.setColor = newColor => {
            if (this.hexRegex.test(newColor)) {
                this.colorPicker.color.hexString = newColor
            }
        }

        this.pickColor = color => {
            let { palette, path, set } = this.props
            let newColor = color.hexString
            let oldColor = palette.colors[this.state.currentColorId]
            if (newColor !== oldColor) {
                set(path + '.colors.' + this.state.currentColorId, newColor)
                if (this.state.tempColor !== newColor) this.setState({ tempColor: newColor })
            }
            this.colorPicker.width = 100
        }

        this.initColorPicker = () => {
            let colorPickerContainer = document.getElementById('colorPicker')
            colorPickerContainer.innerHTML = ''
            let rect = colorPickerContainer.getBoundingClientRect()
            let minSize = Math.min(rect.width, rect.height)
            this.colorPicker = new iro.ColorPicker(colorPickerContainer, {
                width: minSize,
                height: minSize,
                color: this.props.palette.colors[this.state.currentColorId],
                sliderMargin: 8
            })
            this.colorPicker.on('color:change', debounce(this.pickColor, 300))
        }

        this.selectColor = (colorId) => {
            this.setState({ currentColorId: colorId })
        }

        this.renderColor = (colorId) => {
            let { world, palette } = this.props
            return h(SpriteComponent, {
                sprite: world.sprites[world.avatarId],
                palette: { colors: [ palette.colors[0], palette.colors[colorId] ] }
            })
        }

        this.moveColor = (colorId, insertId) => {
            let { palette, path, set } = this.props
            set(path, Palette.reorderColors(clone(palette), colorId, insertId))

            let currentColorId = (colorId > insertId) ? insertId : insertId - 1
            setTimeout(() => this.setState({ currentColorId }), 1)
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.initColorPicker)
        this.initColorPicker()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.initColorPicker)
    }

    componentDidUpdate(_, prevState) {
        if (prevState.currentColorId !== this.state.currentColorId) {
            this.setState({ tempColor: this.props.palette.colors[this.state.currentColorId] })
        }
        if (prevState.tempColor !== this.state.tempColor) {
            this.setColor(this.state.tempColor)
        }
    }

    render({ world, palette, paletteId, path, set, undo, redo, back }) {
        let nameTextbox = textbox({
            value: palette.name,
            placeholder: 'palette',
            onchange: x => set(path + '.name', x)
        })

        let copyButton = button({
            onclick: () => {
                set('', World.copyPalette(clone(world), palette))
                back()
            }
        }, 'copy palette')
        
        let delButton = world.palettes.length > 1 ? h(ConfirmComponent, {
            description: 'delete palette?',
            onconfirm: () => {
                set('', World.delPalette(clone(world), paletteId))
                back()
            }
        }, 'delete palette') : null

        let items = []
        palette.colors.forEach((color, colorId) => {
            items.push({
                class: 'color' + (this.state.currentColorId === colorId ? ' selected' : ''),
                index: colorId
            })
        })

        let colorList = h(DragList, {
            class: 'scroll',
            items,
            renderItem: this.renderColor,
            selectItem: this.selectColor,
            moveItem: this.moveColor
        })

        let colorPickerContainer = div({
            class: 'colorPicker',
            id: 'colorPicker'
        })

        let colorCodeTextbox = textbox({
            class: 'color',
            style: { backgroundColor: palette.colors[this.state.currentColorId] },
            value: this.state.tempColor,
            onchange: tempColor => {
                this.setState({ tempColor })
                if (this.hexRegex.test(tempColor)) {
                    this.setColor(tempColor)
                    set(path + '.colors.' + this.state.currentColorId, tempColor)
                }
            }
        })

        return div({ class: 'panel palette-panel' }, [
            buttonRow([
                this.backButton(),
                this.undoButton(),
                this.redoButton(),
                nameTextbox,
                this.menu([
                    copyButton,
                    delButton
                ])
            ]),
            colorList,
            colorPickerContainer,
            colorCodeTextbox
        ])
    }
}