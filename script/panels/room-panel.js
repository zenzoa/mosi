class RoomPanel extends Panel {
    constructor() {
        super()
        this.state = {
            drawMode: 'draw',
            modalMessage: ''
        }
    }

    render({ world, room, roomId, path, set, undo, redo }) {
        let palette = world.palettes[room.paletteId] || world.palettes[0]

        if (this.state.spriteListOpen) {
            return h(SpriteListPanel, {
                world, set, undo, redo,
                selectedId: world.currentSpriteId,
                palette: palette,
                back: () => this.setState({ spriteListOpen: false }),
                selectSprite: id => {
                    set('currentSpriteId', id)
                    this.setState({ spriteListOpen: false, drawMode: 'draw' })
                }
            })
        }

        if (this.state.spritePanelOpen) {
            return h(SpritePanel, {
                world, set,
                sprite: world.sprites[world.currentSpriteId],
                spriteId: world.currentSpriteId,
                palette: palette,
                path: 'sprites.' + world.currentSpriteId,
                back: () => this.setState({ spritePanelOpen: false })
            })
        }

        if (this.state.paletteListOpen) {
            return h(PaletteListPanel, {
                world, set, undo, redo,
                selectedId: room.paletteId,
                back: () => this.setState({ paletteListOpen: false }),
                selectPalette: paletteId => {
                    set(path + '.paletteId', paletteId)
                    this.setState({ paletteListOpen: false })
                }
            })
        }

        let nameTextbox = textbox({
            value: room.name,
            placeholder: 'room',
            onchange: x => set(path + '.name', x)
        })

        let paletteButton = button({
            onclick: () => this.setState({ paletteListOpen: true })
        }, 'change color palette')

        let clearButton = h(ConfirmComponent, {
            description: 'clear room?',
            onconfirm: () => set(path, Room.clear(clone(room)))
        }, 'clear room')

        let importButton = h(ImportComponent, {
            description: 'room',
            filetype: '.mosiroom',
            onupload: data => {
                try {
                    let obj = JSON.parse(data)
                    let newRoom = Room.import(obj, world.roomWidth, world.roomHeight, world.sprites)
                    if (newRoom.relatedSprites) {
                        set([
                            { path: 'sprites', value: world.sprites.concat(newRoom.relatedSprites) },
                            { path: path, value: newRoom },
                        ])
                        delete newRoom.relatedSprites
                    } else {
                        set(path, newRoom)
                    }

                } catch (e) {
                    console.error('unable to import room', e)
                    throw 'unable to import room'
                }
            }
        }, 'import room')
    
        let exportButton = h(ExportComponent, {
            description: 'room',
            getData: () => Room.export(room, world.sprites)
        }, 'export room')

        let spriteButton = button({
            onclick: () => this.setState({ spriteListOpen: true })
        },
            h(SpriteComponent, {
                sprite: world.sprites[world.currentSpriteId],
                palette: palette,
                frameRate: world.frameRate
            }),
            span({}, 'current sprite')
        )

        let drawModeButton = button({
            class: 'toggle toggle-' + (this.state.drawMode === 'draw' ? 'on' : 'off'),
            onclick: () => this.setState({ drawMode: this.state.drawMode === 'draw' ? 'erase' : 'draw' })
        }, this.state.drawMode === 'draw' ? 'draw' : 'erase')

        let editSpriteButton = button({
            onclick: () => this.setState({ spritePanelOpen: true })
        }, 'edit sprite')

        let tileCanvas = h(TileCanvas, {
            w: world.roomWidth,
            h: world.roomHeight,
            sw: world.spriteWidth,
            sh: world.spriteHeight,
            backgroundColor: palette.colors[0] + '99',
            frameRate: world.frameRate,
            showGrid: world.showGrid,
            isErasing: this.state.drawMode === 'erase',
            draw: (context, progressFrames) => {
                if (progressFrames) world.sprites = world.sprites.map(sprite => Sprite.nextFrame(sprite))
                Room.draw(context, { world, room })
            },
            move: ({ x, y }, destination) => {
                if (!world.sprites[world.currentSpriteId]) return

                let newX = destination.x
                let newY = destination.y

                if (x === newX && y === newY) {
                    if (Room.isTileEmpty(room, x, y)) {
                        if (world.currentSpriteId === world.avatarId && room.spriteLocations.filter(l => l.spriteId === world.currentSpriteId)) {
                            let avatarRoom = World.avatarRoom(world)
                            if (exists(avatarRoom) && avatarRoom !== roomId) {
                                this.setState({ modalMessage: 'The avatar is already in another room' })
                                return
                            }
                            let newRoom = clone(room)
                            Room.clearSprite(newRoom, world.currentSpriteId, x, y)
                            Room.addSpriteLocation(newRoom, world.currentSpriteId, x, y)
                            set(path, newRoom)
                        } else {
                            set(path, Room.addSpriteLocation(clone(room), world.currentSpriteId, x, y))
                        }
                    }

                } else {
                    if (!Room.isTileEmpty(room, x, y) && !Room.isSpriteAtLocation(room, world.currentSpriteId, newX, newY)) {
                        set(path, Room.moveSpriteLocation(clone(room), x, y, newX, newY))
                    }
                }
                
            },
            erase: ({ x, y }) => {
                set(path, Room.clearTile(clone(room), x, y))
            }
        })

        let modalMessage = this.state.modalMessage ? modal([
            div({}, this.state.modalMessage),
            button({ onclick: () => this.setState({ modalMessage: '' })}, 'ok')
        ]) : null

        return div({ class: 'panel room-panel' }, [
            buttonRow([
                this.backButton(),
                this.undoButton(),
                this.redoButton(),
                nameTextbox,
                this.menu([
                    paletteButton,
                    clearButton,
                    importButton,
                    exportButton
                ])
            ]),
            tileCanvas,
            buttonRow([
                spriteButton,
                editSpriteButton,
                div({ class: 'filler' }),
                drawModeButton
            ]),
            modalMessage
        ])
    }
}