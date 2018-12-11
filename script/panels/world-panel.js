class WorldPanel extends Panel {
    constructor() {
        super()
        this.state = {
            showSplashscreen: true,
            currentRoomId: 0,
            currentSpriteId: 0
        }
    }

    render({ world, set, undo, redo }) {
        if (this.state.roomPanelOpen) {
            return h(RoomPanel, {
                world, set, undo, redo,
                room: world.rooms[this.state.currentRoomId],
                roomId: this.state.currentRoomId,
                path: 'rooms.' + this.state.currentRoomId,
                spriteId: this.state.currentSpriteId,
                setSpriteId: x => this.setState({ currentSpriteId: x }),
                back: () => this.setState({ roomPanelOpen: false })
            })
        }

        if (this.state.spriteListOpen) {
            return h(SpriteListPanel, {
                world, set, undo, redo,
                back: () => this.setState({ spriteListOpen: false })
            })
        }

        if (this.state.paletteListOpen) {
            return h(PaletteListPanel, {
                world, set, undo, redo,
                back: () => this.setState({ paletteListOpen: false })
            })
        }

        if (this.state.settingsPanelOpen) {
            return h(SettingsPanel, {
                world, set, undo, redo,
                path: '',
                back: () => this.setState({ settingsPanelOpen: false })
            })
        }

        if (this.state.playPanelOpen) {
            return h(PlayPanel, {
                world,
                back: () => this.setState({ playPanelOpen: false })
            })
        }

        let nameTextbox = textbox({
            value: world.name,
            placeholder: 'world',
            onchange: x => set('name', x)
        })

        let resetButton = h(ConfirmComponent, {
            description: 'reset world?',
            onconfirm: () => {
                let newWorld = World.new(world.worldWidth, world.worldHeight, world.roomWidth, world.roomHeight, world.spriteWidth, world.spriteHeight)
                newWorld.name = world.name
                set('', newWorld)
            }
        }, 'reset world')

        let importButton = h(ImportComponent, {
            description: 'world',
            filetype: '.mosi',
            onupload: data => {
                try {
                    let obj = JSON.parse(data)
                    let newWorld = World.import(obj)
                    set('', newWorld)
                } catch (e) {
                    console.error('unable to import world', e)
                    throw 'unable to import world'
                }
            }
        }, 'import world')
    
        let exportButton = h(ExportComponent, {
            description: 'world',
            getData: () => World.export(world),
            exportGame: () => Exporter.exportGame(window.resources, world)
        }, 'export world')

        let spriteListButton = button({
            onclick: () => this.setState({ spriteListOpen: true })
        }, 'sprites')

        let paletteListButton = button({
            onclick: () => this.setState({ paletteListOpen: true })
        }, 'colors')

        let settingsButton = button({
            onclick: () => this.setState({ settingsPanelOpen: true })
        }, 'settings')

        let playButton = button({
            onclick: () => this.setState({ playPanelOpen: true })
        }, '▶ play')

        let avatarRoomId = World.avatarRoom(world)
        let avatarRoom = exists(avatarRoomId) ? {
            x: Math.floor(avatarRoomId % world.worldWidth),
            y: Math.floor(avatarRoomId / world.worldWidth)
        } : null

        let tileCanvas = h(TileCanvas, {
            w: world.worldWidth,
            h: world.worldHeight,
            sw: world.roomWidth,
            sh: world.roomHeight,
            highlight: avatarRoom,
            showGrid: world.showGrid,
            draw: context => World.draw(context, world),
            move: ({ x, y }, destination) => {
                let newX = destination.x
                let newY = destination.y
                if (x === newX && y === newY) {
                    let roomId = x + (y * world.worldWidth)
                    this.setState({ currentRoomId: roomId, roomPanelOpen: true })
                } else {
                    let roomId1 = x + (y * world.worldWidth)
                    let roomId2 = newX + (newY * world.worldWidth)
                    let newRooms = clone(world.rooms)
                    newRooms[roomId1] = world.rooms[roomId2]
                    newRooms[roomId2] = world.rooms[roomId1]
                    set('rooms', newRooms)
                }
            },
            erase: ({ x, y }) => {
                this.setState({
                    confirmErase: true,
                    onConfirm: () => {
                        let roomId = x + (y * world.worldWidth)
                        set('rooms.' + roomId, Room.new(world.roomWidth, world.roomHeight))
                    }
                })
            }
        })

        let confirmEraseModal = this.state.confirmErase ? h(ConfirmComponent, {
            description: 'erase room?',
            onclose: () => this.setState({ confirmErase: false }),
            onconfirm: () => {
                this.state.onConfirm()
                this.setState({ confirmErase: false })
            }
        }) : null

        let splashscreen = this.state.showSplashscreen ? modal([
            div({ style: { marginBottom: '16px' } }, 'môsi is still in early release and probably has lots of bugs - please backup your work often!'),
            div({ style: { marginBottom: '16px' } }, a({ href: 'https://github.com/sarahgould/mosi/issues/new', target: '_blank'}, 'please report bugs here')),
            button({
                onclick: () => this.setState({ showSplashscreen: false })
            }, 'ok, got it!')
        ]) : null

        return div({ class: 'panel world-panel' }, [
            buttonRow([
                this.undoButton(),
                this.redoButton(),
                nameTextbox,
                this.menu([
                    settingsButton,
                    resetButton,
                    importButton,
                    exportButton
                ])
            ]),
            tileCanvas,
            buttonRow([
                spriteListButton,
                paletteListButton,
                div({ class: 'filler' }),
                playButton
            ]),
            confirmEraseModal,
            splashscreen
        ])
    }
}