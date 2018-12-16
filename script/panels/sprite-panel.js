class SpritePanel extends Panel {
    constructor() {
        super()
        this.state = {
            currentFrameId: 0
        }

        this.isDrawing = true
    }

    componentWillUpdate(_, nextState) {
        if (this.state.menuOpen) nextState.menuOpen = false
        if (nextState.currentFrameId !== this.state.currentFrameId) {
            this.horizontal = true
        }
    }

    render({ world, sprite, spriteId, palette, path, set, undo, redo, back }) {
        if (this.state.actionListOpen) {
            return h(ActionListPanel, {
                world, sprite, spriteId, path, set, undo, redo,
                back: () => this.setState({ actionListOpen: false })
            })
        }

        palette = palette || world.palettes[0]

        let isAvatar = spriteId === world.avatarId

        let nameTextbox = textbox({
            value: sprite.name,
            placeholder: 'sprite',
            onchange: x => set(path + '.name', x)
        })

        let wallToggle = !isAvatar ? toggle({
            value: sprite.wall,
            onclick: x => set(path + '.wall', x)
        }, 'wall') : null

        let itemToggle = !isAvatar ? toggle({
            value: sprite.item,
            onclick: x => set(path + '.item', x)
        }, 'item') : null

        let actionButton =  !isAvatar ? toggle({
            value: sprite.actions.length,
            onclick: () => this.setState({ actionListOpen: true })
        }, 'actions') : null

        let avatarIndicator = isAvatar ? div({}, '★ player avatar') : null
    
        let setAvatarButton = !isAvatar ? h(ConfirmComponent, {
            description: 'set sprite as avatar and clear it from all rooms?',
            onconfirm: () => {
                set('', World.setAvatar(clone(world), spriteId))
                back()
            }
        }, 'set as avatar ★') : null

        let copyButton = button({
            onclick: () => {
                set('', World.copySprite(clone(world), sprite))
                back()
            }
        }, 'copy sprite')
        
        let delButton = !isAvatar ? h(ConfirmComponent, {
            description: 'delete sprite?',
            onconfirm: () => {
                set('', World.delSprite(clone(world), spriteId))
                back()
            }
        }, 'delete sprite') : null

        let importButton = h(ImportComponent, {
            description: 'sprite',
            filetype: '.mosisprite',
            onupload: data => {
                try {
                    let obj = JSON.parse(data)
                    let newSprite = Sprite.import(obj, sprite.w, sprite.h, spriteId, world.sprites)
                    if (newSprite.relatedSprites) {
                        set([
                            { path: 'sprites', value: world.sprites.concat(newSprite.relatedSprites) },
                            { path: path, value: newSprite },
                        ])
                        delete newSprite.relatedSprites
                    } else {
                        set(path, newSprite)
                    }
                } catch (e) {
                    console.error('unable to import sprite', e)
                    throw 'unable to import sprite'
                }
            }
        }, 'import sprite')
    
        let exportButton = h(ExportComponent, {
            description: 'sprite',
            getData: () => Sprite.export(sprite, spriteId, world.sprites)
        }, 'export sprite')

        let drawModeButton = toggle({
            value: world.drawMode === 'drag',
            onclick: x => set('drawMode', x ? 'drag' : 'draw')
        }, 'cursor mode')

        let addFrameButton = sprite.frames.length < 4 ? button({
            class: 'icon',
            onclick: () => {
                set(path, Sprite.addFrame(clone(sprite), this.state.currentFrameId))
                this.setState({ currentFrameId: sprite.frames.length })
            }
        }, '+') : null

        let delFrameButton = sprite.frames.length > 1 ? h(ConfirmComponent, {
            class: 'icon',
            description: 'delete frame?',
            onconfirm: () => {
                set(path, Sprite.delFrame(clone(sprite), this.state.currentFrameId))
                this.setState({ currentFrameId: Math.max(0, this.state.currentFrameId - 1) })
            }
        }, '-') : null

        let framePath = path + '.frames.' + this.state.currentFrameId

        let flipFrameButton = button({
            onclick: () => {
                set(framePath, Frame.flip(clone(frame), this.horizontal))
                this.horizontal = !this.horizontal
            }
        }, 'flip frame')
        if (!exists(this.horizontal)) this.horizontal = true

        let rotateFrameButton = sprite.w === sprite.h ? button({
            onclick: () => set(framePath, Frame.rotate(clone(frame)))
        }, 'rotate frame') : null

        let clearFrameButton = h(ConfirmComponent, {
            description: 'clear frame?',
            onconfirm: () => set(framePath, Frame.clear(clone(frame)))
        }, 'clear frame')

        let frameButtons = sprite.frames.map((frame, frameId) => {
            return button({
                class: 'sprite-button ' + (this.state.currentFrameId === frameId ? 'selected' : ''),
                onclick: () => this.setState({ currentFrameId: frameId})
            }, h(CanvasComponent, {
                w: frame.w,
                h: frame.h,
                draw: context => Sprite.draw(sprite, context, { frameId, palette, background: true })
            }))
        })

        let frame = sprite.frames[Math.min(this.state.currentFrameId, sprite.frames.length - 1)]

        let drawingCanvas = h(DrawingCanvas, {
            w: sprite.w,
            h: sprite.h,
            backgroundColor: palette.colors[0],
            showGrid: world.showGrid,
            mode: world.drawMode,
            update: context => {
                Sprite.draw(sprite, context, { frameId: this.state.currentFrameId, palette, background: true })
            },
            updateOnion: (sprite.frames.length > 1) ? context => {
                let onionFrameId = this.state.currentFrameId - 1
                if (onionFrameId < 0) onionFrameId = sprite.frames.length - 1
                Sprite.draw(sprite, context, { frameId: onionFrameId, palette, clear: true })
            } : null,
            draw: (x, y, isMoving) => {
                if (!isMoving) this.isDrawing = (Frame.getPixel(frame, x, y) === 0)
                let pixelPath = path + '.frames.' + this.state.currentFrameId
                if (this.isDrawing) {
                    set(pixelPath, Frame.setPixel(clone(frame), x, y, 1), true)
                } else {
                    set(pixelPath, Frame.setPixel(clone(frame), x, y, 0), true)
                }
            }
        })

        let spritePreview = h(SpriteComponent, { sprite, palette, frameRate: world.frameRate })

        let colorButton = button({
            class: 'sprite-button',
            onclick: () => {
                let newColorId = sprite.colorId + 1
                if (newColorId > palette.colors.length - 1) {
                    newColorId = 1
                }
                set(path + '.colorId', newColorId)
            }
        }, spritePreview)

        return div({ class: 'panel sprite-panel' }, [
            buttonRow([
                this.backButton(),
                this.undoButton(),
                this.redoButton(),
                nameTextbox,
                this.menu([
                    drawModeButton,
                    hr(),
                    setAvatarButton,
                    importButton,
                    exportButton,
                    copyButton,
                    delButton,
                    hr(),
                    flipFrameButton,
                    rotateFrameButton,
                    clearFrameButton
                ])
            ]),
            buttonRow([
                avatarIndicator,
                wallToggle,
                itemToggle,
                actionButton,
                div({ class: 'filler' }),
                colorButton
            ]),
            drawingCanvas,
            buttonRow([
                frameButtons,
                addFrameButton,
                delFrameButton
            ])
        ])
    }
}