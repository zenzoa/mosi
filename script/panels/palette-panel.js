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
    }

    componentDidMount() {
        window.addEventListener('resize', this.initColorPicker)
        this.initColorPicker()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.initColorPicker)
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
        
        let delButton = h(ConfirmComponent, {
            description: 'delete palette?',
            onconfirm: () => {
                set('', World.delPalette(clone(world), paletteId))
                back()
            }
        }, 'delete palette')

        let colorButtons = palette.colors.map((color, colorId) => {
            return button({
                class: 'color' + (this.state.currentColorId === colorId ? ' selected' : ''),
                onclick: () => {
                    this.setColor(color)
                    this.setState({ tempColor: color, currentColorId: colorId })
                }
            },
                h(SpriteComponent, {
                    sprite: world.sprites[world.avatarId],
                    palette: { colors: [ palette.colors[0], palette.colors[colorId] ] }
                })
            )
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
            buttonRow('scroll', [
                colorButtons[0],
                vr(),
                colorButtons.slice(1)
            ]),
            colorPickerContainer,
            colorCodeTextbox
        ])
    }
}