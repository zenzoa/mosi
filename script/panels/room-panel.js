class RoomPanel extends Component {
    constructor(props) {
        super()

        this.state = { erasing: false }

        this.setData = (path, value) => {
            path = ['rooms', this.props.roomId].concat(path)
            this.props.setData(path, value)
        }

        this.setName = (name) => {
            this.setData(['name'], name)
        }
    
        this.getTile = (id) => {
            return this.room.tiles[id]
        }

        this.setTile = (id, drawing) => {
            if (!this.sprite) return
            let spriteId = this.props.spriteId

            let tile = this.room.tiles[id] || []
            let newTile = tile.slice()
            let topTile = tile[tile.length - 1]

            if (this.state.erasing) {
                newTile = newTile.slice(0, -1)
            } else if (topTile === spriteId && !drawing) {
                newTile = newTile.slice(0, -1)
            } else if (topTile !== spriteId && drawing) {
                if (this.sprite.unique || spriteId === this.props.world.avatarId) this.props.removeSpriteReferences(spriteId)
                newTile.push(spriteId)
            } else {
                return
            }

            if (newTile.length === 0) newTile = null
            this.setData(['tiles', id], newTile)
        }
    
        this.canEraseTile = (id) => {
            let tile = this.room.tiles[id]
            if (!tile) return
            let lastSprite = tile[tile.length - 1]
            return lastSprite === this.props.spriteId
        }

        this.setErasing = (value) => {
            this.setState({ erasing: value })
        }

        this.changePalette = () => {
            this.props.setPanel('paletteList')
        }
    }

    render(props, state) {
        this.room = props.getData(['rooms', props.roomId])
        this.sprite = props.getData(['sprites', props.spriteId])

        let colors = props.getPaletteColors()
        let backgroundColor = colors[0]

        // let copyButton = h(Button, {
        //     onclick: () => this.props.copyRoom(props.room)
        // }, 'copy')

        let removeButton = h(RemoveButton, {
            onclick: () => this.props.removeRoom(props.room)
        }, 'remove')

        let changePaletteButton = h(Button, {
            onclick: this.changePalette
        }, 'change palette')

        let roomCanvas = h(RoomCanvas, {
            class: 'canvas-bg',
            tiles: this.room.tiles,
            sprites: props.world.sprites,
            roomSize: props.world.roomSize,
            spriteSize: props.world.spriteSize,
            frameRate: props.world.frameRate,
            colors: colors
        })
        
        let grid = h(DrawingGrid, {
            size: props.world.roomSize,
            getCell: this.getTile,
            setCell: this.setTile,
            canEraseCell: this.canEraseTile,
            renderCell: () => ''
        })

        let roomGrid = h('div', {
            class: 'canvas-wrapper'
        }, [roomCanvas, grid])

        let spriteCanvas = this.sprite && h(SpriteCanvas, {
            sprite: this.sprite,
            size: props.world.spriteSize,
            frameRate: props.world.frameRate,
            backgroundColor: backgroundColor,
            color: colors[this.sprite.colorId] || colors[colors.length - 1]
        })

        let spriteButton = this.sprite && h(Button, {
            class: 'canvas-button',
            onclick: () => this.props.setPanel('spriteList')
        }, spriteCanvas)

        let editSpriteButton = this.sprite && h(Button, {
            onclick: () => this.props.setPanel('sprite')
        }, 'edit')
        
        let addSpriteButton = h(Button, {
            onclick: this.props.addSprite
        }, 'add')
        
        let eraseButton = h(Toggle, {
            value: state.erasing,
            onchange: this.setErasing
        }, 'erase')

        let backButton = h(BackButton, { onclick: props.back })

        let nameTextbox = h(Textbox, {
            text: this.room.name,
            placeholder: 'room',
            onchange: this.setName
        })

        let moreActions = h(MoreActions, null, [removeButton, changePaletteButton])

        return h(Panel, {
            header: [backButton, nameTextbox, moreActions],
            content: roomGrid,
            footer: [spriteButton, editSpriteButton, addSpriteButton, eraseButton],
            centered: true
        })
    }
}

class RoomCanvas extends Component {
    constructor() {
        super()

        this.frames = []
        this.animationLoop = null
        this.animationStart = null

        this.updateCanvas = (timestamp) => {
            if (!this.animationStart) this.animationStart = timestamp
            let dt = timestamp - this.animationStart
            if (dt >= this.props.frameRate && !this.props.fixed) {
                this.animationStart = timestamp
                this.progressFrames()
            }

            clearCanvas(this.base, this.props.colors[0] || '#fff')

            let tiles = this.props.tiles || []
            let sprites = this.props.sprites || []
            let spriteFrames = this.props.fixed ? null : this.frames

            renderRoom(this.base, tiles, sprites, {
                spriteFrames: spriteFrames,
                roomSize: this.props.roomSize,
                spriteSize: this.props.spriteSize,
                colors: this.props.colors
            })

            this.animationLoop = window.requestAnimationFrame(this.updateCanvas)
        }

        this.progressFrames = () => {
            this.frames = this.props.sprites.map((_, spriteId) => {
                let sprite = this.props.sprites[spriteId]
                let frames = sprite.frames
                let frameId = this.frames[spriteId] || 0
                let nextFrameId = frameId + 1
                if (nextFrameId >= frames.length) nextFrameId = 0
                return nextFrameId
            })
        }
    }

    componentDidMount() {
        this.animationLoop = window.requestAnimationFrame(this.updateCanvas)
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.animationLoop)
    }

    render(props) {
        let size = props.roomSize * props.spriteSize
        return h('canvas', { class: 'room-canvas ' + (props.class || ''), width: size, height: size })
    }
}