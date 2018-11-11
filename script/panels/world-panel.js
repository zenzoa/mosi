class WorldPanel extends Component {
    constructor() {
        super()

        this.setName = (name) => {
            this.props.setData(['name'], name)
        }

        this.renderCell = (id) => {
            return h('div', {
                class: 'grid-cell-contents',
                onclick: () => this.openRoom(id)
            })
        }
    
        this.openRoom = (id) => {
            let room = this.props.world.rooms[id]
            if (!room) this.props.addRoom(id)
            this.props.setRoomId(id)
            if (room) this.props.setPaletteId(room.paletteId)
            this.props.setPanel('room')
        }
    }

    render(props) {
        let settingsButton = h(Button, {
            onclick: () => this.props.setPanel('settings')
        }, 'settings')

        let paletteListButton = h(Button, {
            onclick: () => this.props.setPanel('paletteList')
        }, 'palettes')

        let importButton = h(Button, {
            // TODO: hook this up
        }, 'import')

        let resetButton = h(Button, {
            // TODO: hook this up
        }, 'reset')

        let worldCanvas = h(WorldCanvas, {
            class: 'canvas-bg',
            rooms: props.world.rooms,
            sprites: props.world.sprites,
            palettes: props.world.palettes,
            worldSize: props.world.worldSize,
            roomSize: props.world.roomSize,
            spriteSize: props.world.spriteSize
        })
        
        let grid = h(Grid, {
            size: props.world.worldSize,
            cell: this.renderCell
        })

        let worldGrid = h('div', {
            class: 'canvas-wrapper'
        }, [worldCanvas, grid])

        let playButton = h(Button, {
            onclick: () => this.props.setPanel('play')
        }, 'play')

        let exportButton = h(Button, {
            // TODO: hook this up
        }, 'export')

        let spriteListButton = h(Button, {
            onclick: () => this.props.setPanel('spriteList')
        }, 'sprites')

        let nameTextbox = h(Textbox, {
            text: props.world.name,
            placeholder: 'world',
            onchange: this.setName
        })

        let moreActions = h(MoreActions, null, [spriteListButton, paletteListButton, exportButton])

        return h(Panel, {
            header: [nameTextbox, moreActions],
            content: worldGrid,
            footer: [playButton],
            centered: true
        })
    }
}

class WorldCanvas extends Component {
    constructor() {
        super()

        this.updateCanvas = () => {
            let canvas = this.base
            let worldSize = this.props.worldSize
            let roomSize = this.props.roomSize
            let context = canvas.getContext('2d')
            context.clearRect(0, 0, canvas.width, canvas.height)
    
            for (let y = 0; y < worldSize; y++) {
                for(let x = 0; x < worldSize; x++) {
                    let roomId = XYtoID(x, y, worldSize)
                    let room = this.props.rooms[roomId]
                    let tiles = room && room.tiles

                    if (tiles) {
                        let palette = this.props.palettes[room.paletteId]
                        let colors = palette ? palette.colors : []
                        context.fillStyle = colors[0] || '#fff'
                        context.fillRect(x * roomSize, y * roomSize, roomSize, roomSize)

                        for (let tileY = 0; tileY < roomSize; tileY++) {
                            for(let tileX = 0; tileX < roomSize; tileX++) {
                                let tileId = XYtoID(tileX, tileY, roomSize)
                                let tile = tiles[tileId]

                                if (tile && tile.length) {
                                    let spriteId = tile[tile.length - 1]
                                    let sprite = this.props.sprites[spriteId]

                                    if (sprite) {
                                        context.fillStyle = colors[sprite.colorId] || colors[colors.length - 1]
                                        context.fillRect(x * roomSize + tileX, y * roomSize + tileY, 1, 1)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    componentDidMount() {
        this.updateCanvas()
    }

    componentDidUpdate() {
        this.updateCanvas()
    }

    render(props) {
        let size = props.worldSize * props.roomSize
        return h('canvas', { class: 'world-canvas ' + (props.class || ''), width: size, height: size })
    }
}