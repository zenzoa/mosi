class SpritePanel extends Component {
    constructor() {
        super()
        
        this.state = { frameId: 0 }
        this.frame = 0
        this.maxFrames = 4

        this.setData = (path, value) => {
            path = ['sprites', this.props.spriteId].concat(path)
            this.props.setData(path, value)
        }
    
        this.getFrame = (id) => {
            return this.sprite.frames[id]
        }
    
        this.addFrame = () => {
            let frames = this.sprite.frames
            if (frames.length >= this.maxFrames) return

            let newFrame = frames[frames.length - 1].slice()
            let newFrames = frames.concat([newFrame])

            this.setData(['frames'], newFrames)
            this.setState({ frameId: newFrames.length - 1 })
        }

        this.removeFrame = () => {
            let id = this.state.frameId
            let frames = this.sprite.frames
            let newFrames = frames.slice(0, id).concat(frames.slice(id + 1))
            this.setData(['frames'], newFrames)
            this.setState({ frameId: Math.max(0, id - 1) })
        }

        this.changeColor = () => {
            this.props.setPanel('palette')
        }

        this.flipHorizontal = () => {
            let flippedFrames = this.sprite.frames.map((frame) => flipFrame(frame, this.props.world.spriteSize, false))
            this.setData(['frames'], flippedFrames)
            this.props.setPanel('sprite')
        }
    
        this.flipVertical = () => {
            let flippedFrames = this.sprite.frames.map((frame) => flipFrame(frame, this.props.world.spriteSize, true))
            this.setData(['frames'], flippedFrames)
            this.props.setPanel('sprite')
        }
    
        this.getPixel = (id) => {
            return this.frame[id]
        }
    
        this.setPixel = (id, drawing) => {
            let value = drawing ? 1 : null
            this.setData(['frames', this.state.frameId, id], value)
        }

        this.canErasePixel = (id) => {
            return typeof this.frame[id] === 'number'
        }
    }

    render(props, state) {
        this.sprite = this.props.getData(['sprites', this.props.spriteId])
        this.frame = this.sprite.frames[this.state.frameId]

        let isAvatar = (props.spriteId === props.world.avatarId)
        let onlySprite = props.world.sprites.length <= 1

        let colors = props.getPaletteColors()
        let color = colors[this.sprite.colorId] || colors[colors.length - 1]
        let backgroundColor = colors[0]

        let copyButton = h(Button, {
            onclick: this.props.copySprite
        }, 'copy')

        let removeButton = !isAvatar && !onlySprite && h(RemoveButton, {
            onclick: this.props.removeSprite
        }, 'remove')
        
        let flipHorizontalButton = h(Button, {
            onclick: this.flipHorizontal
        }, 'flip horizontal')
        
        let flipVerticalButton = h(Button, {
            onclick: this.flipVertical
        }, 'flip vertical')

        let changeColorButton = color && h(Button, {
            onclick: this.changeColor
        }, 'change color')

        let avatarButton = !isAvatar && h(Button, {
            onclick: this.props.setAvatarId
        }, '★ set as avatar')

        let prevFrame = state.frameId > 0 ? state.frameId - 1 : this.sprite.frames.length - 1

        let spriteCanvas = h(SpriteCanvas, {
            class: 'canvas-bg',
            sprite: this.sprite,
            size: props.world.spriteSize,
            frameId: state.frameId,
            color: color,
            backgroundColor: backgroundColor
        })
        
        let onionSkinCanvas = h(SpriteCanvas, {
            class: 'canvas-bg onion-skin',
            sprite: this.sprite,
            size: props.world.spriteSize,
            frameId: prevFrame,
            transparent: true,
            color: color
        })
        
        let grid = h(DrawingGrid, {
            size: props.world.spriteSize,
            getCell: this.getPixel,
            setCell: this.setPixel,
            canEraseCell: this.canErasePixel,
            renderCell: () => ''
        })
        
        let canvasGrid = h('div', {
            class: 'canvas-wrapper'
        }, [spriteCanvas, onionSkinCanvas, grid])

        let frameButtons = this.sprite.frames.map((_, frameId) => {
            let frameCanvas = h(SpriteCanvas, {
                sprite: this.sprite,
                size: props.world.spriteSize,
                frameId: frameId,
                color: color,
                backgroundColor: backgroundColor
            })

            return h(Toggle, {
                class: 'canvas-button',
                value: this.sprite.frames.length > 1 && frameId === state.frameId,
                onchange: () => this.setState({ frameId })
            }, frameCanvas)
        })

        let addFrameButton = this.sprite.frames.length < this.maxFrames && h(Button, {
            class: 'icon-button',
            onclick: this.addFrame
        }, '+')

        let removeFrameButton = (this.sprite.frames.length > 1) && h(RemoveButton, {
            class: 'icon-button',
            onclick: this.removeFrame
        }, '-')

        let spritePreviewCanvas = h(SpriteCanvas, {
            sprite: this.sprite,
            size: props.world.spriteSize,
            frameRate: props.world.frameRate,
            color: color,
            backgroundColor: backgroundColor
        })

        let spritePreviewButton = (this.sprite.frames.length > 1) && h(Button, {
            class: 'canvas-button preview'
        }, spritePreviewCanvas)

        let divider = (this.sprite.frames.length > 1) && h('div', {
            class: 'filler'
        })

        let frameControls = h(ButtonRow, null, [frameButtons, addFrameButton, removeFrameButton, divider, spritePreviewButton])

        let buttons
        if (props.spriteId === props.world.avatarId) {
            buttons = h('div', null, 'this is the avatar')
        } else {
            let wallToggle = h(Toggle, {
                value: this.sprite.wall,
                onchange: (x) => this.setData(['wall'], x)
            }, 'wall')

            let itemToggle = h(Toggle, {
                value: this.sprite.item,
                onchange: (x) => this.setData(['item'], x)
            }, 'item')

            let uniqueToggle = h(Toggle, {
                value: this.sprite.unique,
                onchange: (x) => this.setData(['unique'], x)
            }, 'unique')

            let scriptButton = h(Toggle, {
                value: this.sprite.scripts.length > 0,
                onchange: () => props.setPanel('scriptList')
            }, 'script')

            buttons = [wallToggle, itemToggle, uniqueToggle, scriptButton]
        }

        let backButton = h(BackButton, { onclick: props.back })

        let nameTextbox = h(Textbox, {
            text: this.sprite.name,
            placeholder: 'sprite',
            onchange: (x) => this.setData(['name'], x)
        })

        let moreActions = h(MoreActions, null, [copyButton, removeButton, changeColorButton, flipHorizontalButton, flipVerticalButton, avatarButton])

        return h(Panel, {
            header: [backButton, nameTextbox, moreActions],
            content: [canvasGrid, frameControls],
            footer: buttons,
            centered: true
        })
    }
}