class SpritePanel extends Component {
    constructor() {
        super()
        this.state = {
            currentFrameIndex: 0
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.sprite !== this.props.sprite) {
            this.setState({ currentFrameIndex: 0 })
        }
    }

    render({
        backButton,
        closeTab,
        openScriptTab,

        renameSprite,
        exportSprite,
        createSpriteGif,
        setSpriteIsWall,
        setSpriteIsItem,
        setSpriteIsTransparent,
        setColorIndex,
        removeSprite,
        duplicateSprite,

        addFrame,
        removeFrame,
        updateFrame,
        
        sprite,
        colorList
    }, {
        currentFrameIndex,
        showRemoveSpriteOverlay,
        showExportOverlay,
        showGifOverlay,
        showRemoveFrameOverlay,
        showClearFrameOverlay,
        showRandomFrameOverlay,
        showExtrasOverlay
    }) {
        if (!sprite) return

        let { name, width, height, isAvatar, isWall, isItem, isTransparent, frameList, colorIndex } = sprite
        let currentFrame = frameList[currentFrameIndex]

        while (colorIndex > 0 && !colorList[colorIndex]) colorIndex--
        let color = colorList[colorIndex]
        let backgroundColor = colorList[0]

        let nameTextbox = textbox({
            placeholder: 'sprite name',
            value: name,
            onchange: e => renameSprite(e.target.value)
        })

        let spritePreview = button({
            className: 'sprite-button',
            onclick: () => {
                let newColorIndex = colorIndex
                newColorIndex++
                if (newColorIndex >= colorList.length) newColorIndex = 1
                setColorIndex(newColorIndex)
            }
        }, h(SpriteCanvas, {
            width,
            height,
            frameList,
            isAnimated: true,
            color,
            backgroundColor
        }))
    
        let wallButton = isAvatar ? null :
            iconButton({
                title: 'wall',
                className: (isWall ? 'selected' : ''),
                onclick: () => setSpriteIsWall(!isWall)
            }, 'wall')
    
        let itemButton = isAvatar ? null :
            iconButton({
                title: 'item',
                className: (isItem ? 'selected' : ''),
                onclick: () => setSpriteIsItem(!isItem)
            }, 'item')
    
        let transparentButton = iconButton({
            title: 'transparent',
            className: (isTransparent ? 'selected' : ''),
            onclick: () => setSpriteIsTransparent(!isTransparent)
        }, 'transparent')
    
        let scriptList = Object.keys(sprite.scriptList).map(key => sprite.scriptList[key])
        let hasScripts = scriptList.find(script => !!script)
        let scriptButton = isAvatar ? null :
            iconButton({
                title: 'script',
                className: (hasScripts ? 'selected' : ''),
                onclick: openScriptTab
            }, 'script')
    
        let exportButton = iconButton({
            title: 'export sprite',
            onclick: () => this.setState({ showExtrasOverlay: false, showExportOverlay: true })
        }, 'export')

        let exportOverlay = !showExportOverlay ? null :
            h(ExportOverlay, {
                header: 'export sprite',
                fileName: `${sprite.name || 'untitled'}.mosisprite`,
                data: exportSprite(),
                closeOverlay: () => this.setState({ showExportOverlay: false })
            })
    
        let removeButton = isAvatar ? null :
            iconButton({
                title: 'remove sprite',
                onclick: () => this.setState({ showExtrasOverlay: false, showRemoveSpriteOverlay: true }),
            }, 'delete')

        let removeSpriteOverlay = !showRemoveSpriteOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove sprite?',
                closeOverlay: () => this.setState({ showRemoveSpriteOverlay: false }),
                remove: () => {
                    removeSprite()
                    this.setState({ showRemoveSpriteOverlay: false })
                }
            })

        let duplicateButton = iconButton({
            title: 'duplicate sprite',
            onclick: () => {
                this.setState({ showExtrasOverlay: false })
                duplicateSprite()
            }
        }, 'duplicate')

        let gifButton = iconButton({
            title: 'create GIF',
            onclick: () => this.setState({ showExtrasOverlay: false, showGifOverlay: true })
        }, 'gif')

        let gifOverlay = !showGifOverlay ? null :
            h(GifOverlay, {
                colorList,
                createGif: createSpriteGif,
                maxScale: 8,
                closeOverlay: () => this.setState({ showGifOverlay: false })
            })

        let extrasButton = iconButton({
            title: 'sprite actions',
            onclick: () => this.setState({ showExtrasOverlay: true })
        }, 'extras')

        let extrasOverlay = !showExtrasOverlay ? null :
            h(ExtrasOverlay, {
                header: 'sprite actions',
                buttons: [
                    duplicateButton,
                    removeButton,
                    exportButton,
                    gifButton
                ],
                closeOverlay: () => this.setState({ showExtrasOverlay: false })
            })
    
        let frameButtonList = frameList.length === 1 ? null :
            frameList.map((frame, i) => {
                let selectedClass = i === currentFrameIndex ? ' selected' : ''
                return button({
                    className: 'sprite-button' + selectedClass,
                    onclick: () => this.setState({ currentFrameIndex: i })
                }, h(SpriteCanvas, {
                    width,
                    height,
                    frameList,
                    frameIndex: i,
                    color,
                    backgroundColor
                }))
            })

        let frameListDivider = frameList.length === 1 ? null :
            div({ className: 'vertical-divider' })
    
        let addFrameButton = frameList.length >= 4 ? null :
            iconButton({
                title: 'add frame',
                onclick: () => {
                    let newFrame = currentFrame.slice()
                    addFrame(newFrame)
                    this.setState({ currentFrameIndex: frameList.length - 1 })
                }
            }, 'add')
    
        let removeFrameButton = frameList.length <= 1 ? null :
            iconButton({
                title: 'remove frame',
                onclick: () => this.setState({ showRemoveFrameOverlay: true })
            }, 'delete')

        let removeFrameOverlay = !showRemoveFrameOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove frame?',
                closeOverlay: () => this.setState({ showRemoveFrameOverlay: false }),
                remove: () => {
                    removeFrame(currentFrameIndex)
                    this.setState({
                        currentFrameIndex: Math.max(0, currentFrameIndex - 1),
                        showRemoveFrameOverlay: false
                    })
                }
            })
    
        let clearFrameButton = iconButton({
            className: 'icon',
            title: 'clear frame',
            onclick: () => this.setState({ showClearFrameOverlay: true })
        }, 'clear')

        let clearFrameOverlay = !showClearFrameOverlay ? null :
            h(RemoveOverlay, {
                header: 'clear frame?',
                closeOverlay: () => this.setState({ showClearFrameOverlay: false }),
                remove: () => {
                    let frame = Sprite.clearFrame(width, height)
                    updateFrame(currentFrameIndex, frame)
                    this.setState({ showClearFrameOverlay: false })
                }
            })

        let randomFrameButton = iconButton({
            className: 'icon',
            title: 'randomize frame',
            onclick: () => this.setState({ showRandomFrameOverlay: true })
        }, 'random')

        let randomFrameOverlay = !showRandomFrameOverlay ? null :
            h(RemoveOverlay, {
                header: 'randomize frame?',
                closeOverlay: () => this.setState({ showRandomFrameOverlay: false }),
                remove: () => {
                    let frame = Sprite.randomFrame(width, height)
                    updateFrame(currentFrameIndex, frame)
                    this.setState({ showRandomFrameOverlay: false })
                }
            })

        let flipFrameHorizontalButton = iconButton({
            className: 'icon',
            title: 'flip left-right',
            onclick: () => updateFrame(currentFrameIndex, Sprite.flipFrame(width, height, currentFrame, true))
        }, 'flip-h')

        let flipFrameVerticalButton = iconButton({
            className: 'icon',
            title: 'flip up-down',
            onclick: () => updateFrame(currentFrameIndex, Sprite.flipFrame(width, height, currentFrame, false))
        }, 'flip-v')

        let rotateFrameButton = iconButton({
            className: 'icon',
            title: 'rotate',
            onclick: () => updateFrame(currentFrameIndex, Sprite.rotateFrame(width, height, currentFrame))
        }, 'rotate')
    
        let drawPixel = (pixelIndex, newValue) => {
            let frame = frameList[currentFrameIndex].slice()
            frame[pixelIndex] = newValue
            updateFrame(currentFrameIndex, frame)
        }

        let prevFrame
        if (frameList.length > 1) {
            if (currentFrameIndex > 0) {
                prevFrame = frameList[currentFrameIndex - 1]
            } else {
                prevFrame = frameList[frameList.length - 1]
            }
        }

        let spriteGrid = h(SpriteGrid, {
            className: 'initial-focus',
            drawPixel,
            width,
            height,
            frame: frameList[currentFrameIndex],
            prevFrame,
            color,
            backgroundColor
        })
    
        return panel({ header: 'sprite', className: 'sprite-panel', closeTab }, [
            row([
                backButton,
                nameTextbox,
                wallButton,
                itemButton,
                transparentButton,
                scriptButton
            ]),
            spriteGrid,
            row([
                spritePreview,
                frameListDivider,
                frameButtonList,
                addFrameButton,
                removeFrameButton
            ]),
            row([
                extrasButton,
                fill(),
                randomFrameButton,
                clearFrameButton,
                flipFrameHorizontalButton,
                flipFrameVerticalButton,
                rotateFrameButton
            ]),
            exportOverlay,
            gifOverlay,
            removeSpriteOverlay,
            removeFrameOverlay,
            clearFrameOverlay,
            randomFrameOverlay,
            extrasOverlay
        ])
    }
}