class PaletteListPanel extends Component {
    constructor() {
        super()

        this.choosePalette = (id) => {
            this.props.setPaletteId(id)
            let lastPanel = this.props.breadcrumbs[this.props.breadcrumbs.length - 1]
            if (lastPanel === 'room') {
                this.props.setData(['rooms', this.props.roomId, 'paletteId'], id)
                this.props.back()
            } else {
                this.props.setPanel('palette')
            }
        }
    }

    render(props) {
        let lastPanel = this.props.breadcrumbs[this.props.breadcrumbs.length - 1]

        let paletteButtons = props.world.palettes.map((palette, id) => {
            return h(PaletteButton, {
                palette: palette,
                id: id,
                selected: props.paletteId === id && lastPanel === 'room',
                onclick: () => this.choosePalette(id)
            })
        })

        let paletteList = h('div', { class: 'palette-list' }, paletteButtons)

        let addPaletteButton = h(Button, {
            onclick: this.props.addPalette
        }, 'add palette')

        let backButton = h(BackButton, { onclick: props.back })

        return h(Panel, {
            header: [backButton, h(Filler)],
            content: paletteList,
            footer: [addPaletteButton]
        })
    }
}

class PalettePanel extends Component {
    constructor() {
        super()

        this.state = { colorId: null }

        this.setData = (path, value) => {
            path = ['palettes', this.props.paletteId].concat(path)
            this.props.setData(path, value)
        }

        this.setName = (name) => {
            this.setData(['name'], name)
        }

        this.setColor = (id, color) => {
            this.setData(['colors', id], color)
        }

        this.addColor = () => {
            let colors = this.palette.colors
            let lastColor = colors.length > 0 ? colors[colors.length - 1] : '#000'
            let newColors = colors.concat([lastColor])
            this.setData(['colors'], newColors)
            this.setState({ colorId: newColors.length - 1 })
        }

        this.removeColor = (id) => {
            let colors = this.palette.colors
            let newColors = colors.slice(0, id).concat(colors.slice(id + 1))
            this.setData(['colors'], newColors)
        }

        this.chooseColor = (id) => {
            let lastPanel = this.props.breadcrumbs[this.props.breadcrumbs.length - 1]
            if (lastPanel === 'sprite') {
                this.props.setData(['sprites', this.props.spriteId, 'colorId'], id)
                this.props.back()
            } else {
                this.setState({ colorId: id })
            }
        }
    }

    render(props, state) {
        this.palette = props.getData(['palettes', props.paletteId])
        let colors = this.palette.colors
        let sprite = props.getData(['sprites', props.spriteId])
        let lastPanel = this.props.breadcrumbs[this.props.breadcrumbs.length - 1]

        let colorControls = colors.map((color, id) => {
            let canvas = h(SpriteCanvas, {
                sprite: sprite,
                size: props.world.spriteSize,
                frameId: 0,
                color: color,
                backgroundColor: colors[0]
            })

            return h(Button, {
                class: 'canvas-button',
                disabled: id === 0 && lastPanel === 'sprite',
                onclick: () => this.chooseColor(id)
            }, canvas)
        })
        let divider = h('div', { class: 'divider' })
        if (colorControls.length > 1) colorControls = [colorControls[0]].concat([divider]).concat(colorControls.slice(1))

        let colorList = h('div', { class: 'color-list button-row' }, colorControls)

        let modal
        if (state.colorId != null) {
            modal = h(ColorModal, {
                open: true,
                close: () => this.setState({ colorId: null }),
                color: colors[state.colorId],
                colorId: state.colorId,
                setColor: this.setColor,
                sprite: sprite,
                spriteSize: props.world.spriteSize,
                backgroundColor: colors[0]
            })
        }

        let backButton = h(BackButton, { onclick: props.back })

        let nameTextbox = h(Textbox, {
            text: this.palette.name,
            placeholder: 'palette',
            onchange: this.setName
        })

        let moreActions = h(MoreActions, null, [])

        return h(Panel, {
            header: [backButton, nameTextbox, moreActions],
            content: [colorList, modal]
        })
    }
}

class PaletteButton extends Component {
    render(props) {
        let colorBars = props.palette.colors.map((color) => {
            return h('div', { class: 'color-bar', style: { backgroundColor: color } })
        })

        let colorBarContainer = h('div', { class: 'color-bars' }, colorBars)

        return h(Button, {
            class: 'palette-button canvas-button ' + (props.selected ? 'on' : 'off'),
            onclick: props.onclick
        }, colorBarContainer)
    }
}

class ColorModal extends Component {
    constructor(props) {
        super()

        this.state = { color: props.color }

        let hexRegex = /#[0-9a-f]{6}/i
        this.setColor = (newColor) => {
            this.setState({ color: newColor })
            if (hexRegex.test(newColor)) {
                this.props.setColor(this.props.colorId, newColor)
                this.colorPicker.color.hexString = newColor
            }
        }
    }

    componentDidMount() {
        let colorPickerContainer = document.getElementById('colorPicker')
        let size = colorPickerContainer.offsetWidth
        this.colorPicker = new iro.ColorPicker(colorPickerContainer, {
            width: size,
            height: size,
            color: this.props.color,
            sliderMargin: 8
        })
        this.colorPicker.on('color:change', (color) => {
            let newColor = color.hexString
            this.props.setColor(this.props.colorId, newColor)
            this.setState({ color: newColor })
        })
    }

    render(props, state) {
        let buttonClose = h(CloseButton, { onclick: props.close })

        let colorPickerContainer = h('div', { class: 'colorPicker', id: 'colorPicker' })

        let canvas = h(SpriteCanvas, {
            sprite: props.sprite,
            size: props.spriteSize,
            frameId: 0,
            color: props.color,
            backgroundColor: props.backgroundColor
        })
        let spriteButton = h(Button, { class: 'canvas-button' }, canvas)

        let hexColor = h(Textbox, {
            class: 'color-input',
            style: { backgroundColor: props.color },
            text: state.color,
            onchange: this.setColor,
        })

        let buttonRow = h(ButtonRow, null, [spriteButton, hexColor])

        let modalChildren = [buttonClose, colorPickerContainer, buttonRow]
        return h(Modal, { open: props.open }, modalChildren)
    }
}

