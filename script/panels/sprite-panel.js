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
        convertSprite,
        duplicateSprite,

        addFrame,
        removeFrame,
        updateFrame,

        sprite,
        colorList
    }, {
        currentFrameIndex,
        showConvertSpriteOverlay,
        showRemoveSpriteOverlay,
        showExportOverlay,
        showGifOverlay,
        showRemoveFrameOverlay,
        showClearFrameOverlay,
        showRandomFrameOverlay,
        showExtrasOverlay,
        showFrameExtrasOverlay
    }) {
        if (!sprite) return

        let { name, width, height, isAvatar, isWall, isItem, isTransparent, frameList, colorIndex } = sprite
        let currentFrame = frameList[currentFrameIndex]

        while (colorIndex > 0 && !colorList[colorIndex]) colorIndex--
        let color = colorList[colorIndex]
        let backgroundColor = colorList[0]

        let nameButton = button({
            className: 'fill',
            onclick: () => this.setState({ showExtrasOverlay: true })
        }, name)

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
                className: 'simple' + (isWall ? ' selected' : ''),
                onclick: () => setSpriteIsWall(!isWall)
            }, 'wall')

        let itemButton = isAvatar ? null :
            iconButton({
                title: 'item',
                className: 'simple' + (isItem ? ' selected' : ''),
                onclick: () => setSpriteIsItem(!isItem)
            }, 'item')

        let transparentButton = iconButton({
            title: 'transparent',
            className: 'simple' + (isTransparent ? ' selected' : ''),
            onclick: () => setSpriteIsTransparent(!isTransparent)
        }, 'transparent')

        let scriptList = Object.keys(sprite.scriptList).map(key => sprite.scriptList[key])
        let hasScripts = scriptList.find(script => !!script)
        let scriptButton = isAvatar ? null :
            iconButton({
                title: 'script',
                className: 'simple' + (hasScripts ? ' selected' : ''),
                onclick: openScriptTab
            }, 'script')

        let exportButton = button({
            onclick: () => this.setState({ showExtrasOverlay: false, showExportOverlay: true })
        }, 'export')

        let exportOverlay = !showExportOverlay ? null :
            h(ExportOverlay, {
                header: 'export sprite',
                fileName: `${sprite.name || 'untitled'}.mosisprite`,
                data: exportSprite(),
                closeOverlay: () => this.setState({ showExportOverlay: false })
            })

        let convertButton = isAvatar ? null : button({
            onclick: () => this.setState({ showExtrasOverlay: false, showConvertSpriteOverlay: true })
        }, 'convert to avatar')

        let convertSpriteOverlay = !showConvertSpriteOverlay ? null :
            h(ConfirmOverlay, {
                header: 'convert sprite to avatar? (old avatar will become a regular sprite)',
                closeOverlay: () => this.setState({ showConvertSpriteOverlay: false }),
                confirm: () => {
                    convertSprite()
                    this.setState({ showConvertSpriteOverlay: false })
                }
            })

        let removeButton = isAvatar ? null :
            button({
                onclick: () => this.setState({ showExtrasOverlay: false, showRemoveSpriteOverlay: true }),
            }, 'remove sprite')

        let removeSpriteOverlay = !showRemoveSpriteOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove sprite?',
                closeOverlay: () => this.setState({ showRemoveSpriteOverlay: false }),
                remove: () => {
                    removeSprite()
                    this.setState({ showRemoveSpriteOverlay: false })
                }
            })

        let duplicateButton = button({
            onclick: () => {
                this.setState({ showExtrasOverlay: false })
                duplicateSprite()
            }
        }, 'duplicate')

        let gifButton = button({
            onclick: () => this.setState({ showExtrasOverlay: false, showGifOverlay: true })
        }, 'create gif')

        let gifOverlay = !showGifOverlay ? null :
            h(GifOverlay, {
                colorList,
                createGif: createSpriteGif,
                maxScale: 8,
                closeOverlay: () => this.setState({ showGifOverlay: false })
            })

        let extrasOverlay = !showExtrasOverlay ? null :
            h(ExtrasOverlay, {
                header: 'sprite settings',
                buttons: [
                    nameTextbox,
                    hr(),
                    gifButton,
                    hr(),
                    exportButton,
                    duplicateButton,
                    convertButton,
                    removeButton,
                ],
                closeOverlay: () => this.setState({ showExtrasOverlay: false })
            })

        let frameButtonList = frameList.length === 1 ? null :
            frameList.map((frame, i) => {
                let selectedClass = i === currentFrameIndex ? ' selected' : ''
                return button({
                    className: 'simple sprite-button' + selectedClass,
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

        let addFrameButton = frameList.length >= 4 ? null :
            iconButton({
                title: 'add frame',
                onclick: () => {
                    let newFrame = currentFrame.slice()
                    addFrame(newFrame)
                    this.setState({ currentFrameIndex: frameList.length - 1 })
                }
            }, frameList.length > 1 ? 'add' : 'animation')

        let removeFrameButton = frameList.length <= 1 ? null :
            button({
                onclick: () => this.setState({ showRemoveFrameOverlay: true })
            }, 'remove frame')

        let removeFrameOverlay = !showRemoveFrameOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove frame?',
                closeOverlay: () => this.setState({ showRemoveFrameOverlay: false }),
                remove: () => {
                    removeFrame(currentFrameIndex)
                    this.setState({
                        currentFrameIndex: Math.max(0, currentFrameIndex - 1),
                        showRemoveFrameOverlay: false,
                        showFrameExtrasOverlay: false
                    })
                }
            })

        let clearFrameButton = button({
            onclick: () => this.setState({ showClearFrameOverlay: true })
        }, 'clear')

        let clearFrameOverlay = !showClearFrameOverlay ? null :
            h(RemoveOverlay, {
                header: 'clear frame?',
                closeOverlay: () => this.setState({ showClearFrameOverlay: false }),
                remove: () => {
                    let frame = Sprite.clearFrame(width, height)
                    updateFrame(currentFrameIndex, frame)
                    this.setState({
                        showClearFrameOverlay: false,
                        showFrameExtrasOverlay: false
                    })
                }
            })

        let randomFrameButton = button({
            onclick: () => this.setState({ showRandomFrameOverlay: true })
        }, 'randomize')

        let randomFrameOverlay = !showRandomFrameOverlay ? null :
            h(RemoveOverlay, {
                header: 'randomize frame?',
                closeOverlay: () => this.setState({ showRandomFrameOverlay: false }),
                remove: () => {
                    let frame = Sprite.randomFrame(width, height)
                    updateFrame(currentFrameIndex, frame)
                    this.setState({
                        showRandomFrameOverlay: false,
                        showFrameExtrasOverlay: false
                    })
                }
            })

        let flipFrameHorizontalButton = button({
            onclick: () => {
                this.setState({ showFrameExtrasOverlay: false })
                updateFrame(currentFrameIndex, Sprite.flipFrame(width, height, currentFrame, true))
            }
        }, 'flip horizontally')

        let flipFrameVerticalButton = button({
            onclick: () => {
                this.setState({ showFrameExtrasOverlay: false })
                updateFrame(currentFrameIndex, Sprite.flipFrame(width, height, currentFrame, false))
            }
        }, 'flip vertically')

        let rotateFrameButton = button({
            onclick: () => {
                this.setState({ showFrameExtrasOverlay: false })
                updateFrame(currentFrameIndex, Sprite.rotateFrame(width, height, currentFrame))
            }
        }, 'rotate')

        let frameExtrasButton = iconButton({
            title: 'frame actions',
            onclick: () => this.setState({ showFrameExtrasOverlay: true })
        }, 'edit')

        let frameExtrasOverlay = !showFrameExtrasOverlay ? null :
            h(ExtrasOverlay, {
                header: 'frame actions',
                buttons: [
                    flipFrameHorizontalButton,
                    flipFrameVerticalButton,
                    rotateFrameButton,
                    hr(),
                    randomFrameButton,
                    clearFrameButton,
                    removeFrameButton
                ],
                closeOverlay: () => this.setState({ showFrameExtrasOverlay: false })
            })

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

        return panel({ header: 'sprite', id: 'spritePanel', closeTab }, [
            row([
                nameButton,
                scriptButton,
                transparentButton,
                itemButton,
                wallButton
            ]),
            div({ className: 'grid-container' }, [
                spriteGrid,
            ]),
            row([
                spritePreview,
                vr(),
                frameButtonList,
                addFrameButton,
                fill(),
                frameExtrasButton
            ]),
            helpLink('sprites'),
            extrasOverlay,
            frameExtrasOverlay,
            exportOverlay,
            gifOverlay,
            convertSpriteOverlay,
            removeSpriteOverlay,
            removeFrameOverlay,
            clearFrameOverlay,
            randomFrameOverlay
        ])
    }
}