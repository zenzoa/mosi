class RoomPanel extends Panel {
    constructor() {
        super()
        this.state = {
            drawLock: false
        }

        this.isDrawing = false
        this.maxSpriteButtons = 100

        this.selectSprite = (spriteId) => {
            let { world, set } = this.props
            let recentSpriteIds = world.recentSpriteIds.filter(id => id !== spriteId)
            recentSpriteIds.unshift(spriteId)
            recentSpriteIds = recentSpriteIds.slice(0, this.maxSpriteButtons)
            set([
                { path: 'currentSpriteId', value: spriteId },
                { path: 'recentSpriteIds', value: recentSpriteIds}
            ])
            this.setState({ spriteListOpen: false })
        }

        this.drawSprite = (x, y) => {
            let { world, room, roomId, path, set } = this.props
            if (!Room.isSpriteAtLocation(room, world.currentSpriteId, x, y)) {
                if (world.currentSpriteId === world.avatarId) {
                    let newWorld = clone(world)
                    newWorld = World.clearSprite(newWorld, world.avatarId)
                    newWorld.rooms[roomId] = Room.addSpriteLocation(newWorld.rooms[roomId], world.currentSpriteId, x, y)
                    set('', newWorld)
                } else {
                    set(path, Room.addSpriteLocation(clone(this.props.room), world.currentSpriteId, x, y))
                }
            }
        }

        this.eraseSprite = (x, y) => {
            let { room, path, set } = this.props
            set(path, Room.clearTopSprite(clone(room), x, y))
        }

        this.resize = () => {
            let { world, set } = this.props
            let rect = this.base.getBoundingClientRect()
            this.maxSpriteButtons = Math.floor((rect.width - 12) / 44) - 1
            if (world.recentSpriteIds.length > this.maxSpriteButtons) {
                set('recentSpriteIds', world.recentSpriteIds.slice(0, this.maxSpriteButtons))
            }
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.resize)
        setTimeout(this.resize, 1)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    render({ world, room, roomId, path, set, undo, redo }) {
        let palette = world.palettes[room.paletteId] || world.palettes[0]

        if (this.state.spriteListOpen) {
            return h(SpriteListPanel, {
                world, set, undo, redo,
                selectedId: world.currentSpriteId,
                palette: palette,
                back: () => this.setState({ spriteListOpen: false }),
                selectSprite: this.selectSprite
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

        let drawModeButton = toggle({
            value: world.drawMode === 'drag',
            onclick: x => set('drawMode', x ? 'drag' : 'draw')
        }, 'cursor mode')

        let drawLockButton = toggle({
            value: this.state.drawLock,
            onclick: x => this.setState({ drawLock: x })
        }, 'draw only')

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

        // let spriteButton = button({
        //     onclick: () => this.setState({ spriteListOpen: true })
        // },
        //     h(SpriteComponent, {
        //         sprite: world.sprites[world.currentSpriteId],
        //         palette: palette,
        //         frameRate: world.frameRate
        //     }),
        //     span({}, 'current sprite')
        // )

        // let editSpriteButton = button({
        //     onclick: () => this.setState({ spritePanelOpen: true })
        // }, 'edit sprite')

        let drawingCanvas = h(DrawingCanvas, {
            w: world.roomWidth,
            h: world.roomHeight,
            sw: world.spriteWidth,
            sh: world.spriteHeight,
            backgroundColor: palette.colors[0] + '99',
            frameRate: world.frameRate,
            showGrid: world.showGrid,
            mode: world.drawMode,
            update: (context, progressFrames) => {
                if (progressFrames) world.sprites = world.sprites.map(sprite => Sprite.nextFrame(sprite))
                Room.draw(context, { world, room })
            },
            draw: (x, y, isMoving) => {
                if (!isMoving) this.isDrawing = Room.isTileEmpty(room, x, y)
                if (this.isDrawing || this.state.drawLock) {
                    if (!this.state.drawLock && isMoving && !Room.isTileEmpty(room, x, y)) return
                    this.drawSprite(x, y)
                } else {
                    this.eraseSprite(x, y)
                }
            },
            cursorX: this.cursorX,
            cursorY: this.cursorY,
            saveCursor: (x, y) => {
                this.cursorX = x,
                this.cursorY = y
            }
        })

        let recentSpriteButtons = world.recentSpriteIds.map(spriteId => {
            return button({
                class: 'sprite-button'
                    + (world.currentSpriteId === spriteId ? ' selected' : '')
                    + (spriteId === world.avatarId ? ' avatar-button' : ''),
                onclick: () => set('currentSpriteId', spriteId)
            },
                h(SpriteComponent, {
                    sprite: world.sprites[spriteId],
                    palette
                })
            )
        })

        let addSpriteButton = button({
            class: 'icon',
            onclick: () => this.setState({ spriteListOpen: true })
        }, '⋯')

        return div({ class: 'panel room-panel' }, [
            buttonRow([
                this.backButton(),
                this.undoButton(),
                this.redoButton(),
                nameTextbox,
                this.menu([
                    drawModeButton,
                    drawLockButton,
                    hr(),
                    paletteButton,
                    hr(),
                    clearButton,
                    importButton,
                    exportButton
                ])
            ]),
            drawingCanvas,
            buttonRow([
                recentSpriteButtons,
                div({ class: 'filler' }),
                addSpriteButton
            ])
        ])
    }
}