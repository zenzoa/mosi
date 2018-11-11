class Editor extends Component {
    constructor() {
        super()

        this.newGame = () => {
            let newWorld = {
                version: 0.1,
                worldSize: 8,
                roomSize: 16,
                spriteSize: 8,
                frameRate: 400,
                rooms: new Array(16 * 16),
                sprites: [],
                palettes: [],
                avatarId: 0,
                font: parseFont(ASCII_4x6)
            }

            newWorld.palettes.push({
                name: '',
                colors: ['#ddd', '#d43368', '#594D65']
            })

            let tiles = [
                null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
                null, [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], null,
                null, [1], null, null, null, null, null, null, null, null, null, null, null, null, [1], null,
                null, [1], null, [1], [1], [1], [1], null, null, [1], [1], [1], [1], null, [1], null,
                null, [1], null, [1], [1], null, null, null, null, null, null, [1], [1], null, [1], null,
                null, [1], null, [1], null, null, null, null, null, null, null, null, [1], null, [1], null,
                [1], [1], null, [1], null, null, null, null, null, null, null, null, [1], null, [1], [1],
                null, null, null, [1], null, null, [2], null, null, [0], null, null, [1], null, null, null,
                null, null, null, [1], null, null, null, null, null, null, null, null, [1], null, null, null,
                [1], [1], null, [1], null, null, null, null, null, null, null, null, [1], null, [1], [1],
                null, [1], null, [1], null, null, null, null, null, null, null, null, [1], null, [1], null,
                null, [1], null, [1], [1], null, null, null, null, null, null, [1], [1], null, [1], null,
                null, [1], null, [1], [1], [1], [1], null, null, [1], [1], [1], [1], null, [1], null,
                null, [1], null, null, null, null, null, null, null, null, null, null, null, null, [1], null,
                null, [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], null,
                null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
            ]

            newWorld.rooms[27] = {
                name: '',
                paletteId: 0,
                tiles: tiles
            }

            newWorld.sprites.push({
                name: 'avatar',
                colorId: 1,
                wall: false,
                item: false,
                unique: false,
                scripts: [],
                frames: [[
                    0,0,1,1,1,1,0,0,
                    0,1,1,1,1,1,1,0,
                    0,1,0,1,0,1,1,0,
                    0,1,1,1,1,1,1,0,
                    0,0,1,1,1,1,0,0,
                    0,1,1,1,1,1,1,0,
                    0,0,1,1,1,1,0,0,
                    0,0,1,0,0,1,0,0,
                ], [
                    0,0,1,1,1,1,0,0,
                    0,1,1,1,1,1,1,0,
                    0,1,0,1,0,1,1,0,
                    0,1,1,1,1,1,1,0,
                    0,0,1,1,1,1,0,0,
                    0,1,1,1,1,1,1,0,
                    0,0,1,1,1,1,0,0,
                    0,0,0,1,1,0,0,0,
                ]]
            })

            newWorld.sprites.push({
                name: 'wall',
                colorId: 2,
                wall: true,
                item: false,
                unique: false,
                scripts: [],
                frames: [[
                    0,0,1,1,1,1,0,0,
                    0,1,1,1,1,1,1,0,
                    1,1,1,1,1,1,1,1,
                    1,1,1,1,1,1,1,1,
                    1,1,1,1,1,1,1,1,
                    1,1,1,1,1,1,1,1,
                    0,1,1,1,1,1,1,0,
                    0,0,1,1,1,1,0,0,
                ]]
            })

            newWorld.sprites.push({
                name: 'hot chocolate',
                colorId: 1,
                wall: false,
                item: true,
                unique: false,
                scripts: [],
                frames: [[
                    0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,
                    0,0,1,1,1,1,0,0,
                    0,0,1,1,1,0,1,0,
                    0,0,1,1,1,1,0,0,
                    0,0,1,1,1,0,0,0,
                    0,0,0,0,0,0,0,0,
                ]]
            })

            let newState = {
                panel: 'world',
                breadcrumbs: [],
                roomId: 0,
                spriteId: 0,
                paletteId: 0,
                filter: '',
                gridLines: true,
                world: newWorld
            }

            return newState
        }

        this.getData = (path) => {
            return getDeepValue(this.state.world, path)
        }

        this.setData = (path, value) => {
            let world = deepClone(this.state.world)
            setDeepValue(world, path, value)
            this.setState({ world })
        }

        this.back = () => {
            let panel = this.state.breadcrumbs[this.state.breadcrumbs.length - 1]
            let breadcrumbs = this.state.breadcrumbs.slice(0, -1)
            this.setState({ panel, breadcrumbs })
        }

        this.setPanel = (panel) => {
            let breadcrumbs = this.state.breadcrumbs.slice()
            if (panel !== this.state.panel) breadcrumbs.push(this.state.panel)
            this.setState({ panel, breadcrumbs })
        }

        this.setRoomId = (roomId) => {
            this.setState({ roomId })
        }

        this.setSpriteId = (spriteId) => {
            this.setState({ spriteId })
        }

        this.setPaletteId = (paletteId) => {
            this.setState({ paletteId })
        }

        this.setAvatarId = () => {
            this.setData(['avatarId'], this.state.spriteId)
            this.setData(['sprites', this.state.spriteId, 'unique'], true)
        }

        this.setFilter = (filter) => {
            this.setState({ filter })
        }

        this.addRoom = (id) => {
            let size = this.state.world.roomSize
            this.setData(['rooms', id], {
                name: '',
                paletteId: this.state.paletteId,
                tiles: Array(size * size).fill(null)
            })
        }

        this.copyRoom = (sourceId, targetId) => {
            // TODO: open room selection panel to choose targetId
            // let room = deepClone(this.state.world.rooms[sourceId] || {})
            // room.name = room.name ? room.name + '-copy' : ''
            // this.setData(['rooms', targetId], room)
        }
        
        this.removeRoom = (id) => {
            this.setData(['rooms', id], null)
            if (id > 0) this.setState({ room: id - 1 })
            // TODO: remove references to room from scripts
            this.back()
        }

        this.addSprite = () => {
            let id = this.state.world.sprites.length
            let size = this.state.world.spriteSize

            this.setData(['sprites', id], {
                name: '',
                colorId: 1,
                wall: false,
                item: false,
                unique: false,
                scripts: [],
                frames: [
                    Array(size * size).fill(null)
                ]
            })

            this.setSpriteId(id)
            this.setPanel('sprite')
        }

        this.copySprite = () => {
            let sprites = this.state.world.sprites
            let id = sprites.length

            let sprite = deepClone(sprites[this.state.spriteId] || {})
            sprite.name = sprite.name ? sprite.name + '-copy' : ''
            this.setData(['sprites', id], sprite)
    
            this.setSpriteId(id)
            this.setPanel('sprite')
        }

        this.removeSprite = () => {
            let sprites = this.state.world.sprites
            if (sprites.length <= 1) return

            let id = this.state.spriteId

            this.removeSpriteReferences(id)

            sprites.forEach((_, thisId) => {
                if (thisId > id) this.updateSpriteReferences(thisId, thisId - 1)
            })

            let newSprites = sprites.slice(0, id).concat(sprites.slice(id + 1))
            this.setData(['sprites'], newSprites)

            if (this.state.spriteId === id) {
                if (id > 0) this.setState({ spriteId: id - 1 })
            }

            // TODO: remove references to sprite from scripts

            this.back()
        }

        this.updateSpriteReferences = (oldId, newId) => {
            let newRooms = this.state.world.rooms.map((room) => {
                if (!room || !room.tiles) return
                let newRoom = deepClone(room)
                newRoom.tiles = room.tiles.map((tile) => {
                    return tile && tile.map((spriteId) => {
                        if (spriteId === oldId) return newId
                        else return spriteId
                    })
                })
                return newRoom
            })
            this.setData(['rooms'], newRooms)

            if (this.state.world.avatarId === oldId) {
                this.setAvatarId(newId)
            }
        }

        this.removeSpriteReferences = (id) => {
            let newRooms = this.state.world.rooms.map((room) => {
                if (!room || !room.tiles) return
                let newRoom = deepClone(room)
                newRoom.tiles = room.tiles.map((tile) => {
                    if (tile) return tile.filter((thisSpriteId) => thisSpriteId !== id)
                })
                return newRoom
            })
            this.setData(['rooms'], newRooms)
        }

        this.getPaletteColors = () => {
            let room = this.state.world.rooms[this.state.roomId]
            let paletteId = room ? room.paletteId : 0
            let palette = this.state.world.palettes[paletteId]
            let colors = palette ? palette.colors : []
            return colors
        }

        this.addPalette = () => {
            let id = this.state.world.palettes.length
            let lastPalette = id > 0 && this.state.world.palettes[id - 1]
            let colors = lastPalette ? lastPalette.colors : []

            this.setData(['palettes', id], {
                name: '',
                colors: colors
            })

            this.setPaletteId(id)
            this.setPanel('palette')
        }

        this.removePalette = () => {
            let id = this.state.paletteId
            let palettes = this.state.world.palettes
            let newPalettes = palettes.slice(0, id).concat(palettes.slice(id + 1))
            
            this.removePaletteReferences(id)

            this.setData(['palettes'], newPalettes)
            this.setPaletteId(Math.max(0, id - 1))
        }

        this.removePaletteReferences = (id) => {
            let newRooms = this.state.world.rooms.map((room) => {
                if (!room || !room.tiles) return
                let newRoom = deepClone(room)
                if (newRoom.paletteId === id) newRoom.paletteId = 0
                if (newRoom.paletteId > id) newRoom.paletteId--
                console.log(room.paletteId, newRoom.paletteId)
                return newRoom
            })
            this.setData(['rooms'], newRooms)
        }

        this.state = this.newGame()
    }

    render(_, state) {
        let panelProps = {
            world: state.world,
            roomId: state.roomId,
            spriteId: state.spriteId,
            paletteId: state.paletteId,
            filter: state.filter,
            back: this.back,
            breadcrumbs: state.breadcrumbs,

            getData: this.getData,
            setData: this.setData,

            setPanel: this.setPanel,
            setRoomId: this.setRoomId,
            setSpriteId: this.setSpriteId,
            setPaletteId: this.setPaletteId,
            setFilter: this.setFilter,

            addRoom: this.addRoom,
            copyRoom: this.copyRoom,
            removeRoom: this.removeRoom,

            setAvatarId: this.setAvatarId,
            addSprite: this.addSprite,
            copySprite: this.copySprite,
            removeSprite: this.removeSprite,
            removeSpriteReferences: this.removeSpriteReferences,

            getPaletteColors: this.getPaletteColors,
            addPalette: this.addPalette,
            removePalette: this.removePalette
        }

        let panel = null
        if (state.panel === 'world') panel = h(WorldPanel, panelProps)
        else if (state.panel === 'room') panel = h(RoomPanel, panelProps)
        else if (state.panel === 'spriteList') panel = h(SpriteListPanel, panelProps)
        else if (state.panel === 'sprite') panel = h(SpritePanel, panelProps)
        else if (state.panel === 'scriptList') panel = h(ScriptListPanel, panelProps)
        else if (state.panel === 'paletteList') panel = h(PaletteListPanel, panelProps)
        else if (state.panel === 'palette') panel = h(PalettePanel, panelProps)
        else if (state.panel === 'play') panel = h(PlayPanel, panelProps)
        else if (state.panel === 'settings') panel = h(SettingsPanel, panelProps)
        else if (state.panel === 'font') panel = h(FontPanel, panelProps)

        return h('div', { class: 'editor ' + (state.gridLines ? 'grid-lines' : '') }, panel)
    }
}