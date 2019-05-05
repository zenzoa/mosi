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
        renameSprite,
        exportSprite,
        setSpriteIsWall,
        setSpriteIsItem,
        setColorIndex,
        removeSprite,
        duplicateSprite,
        addFrame,
        removeFrame,
        updateFrame,
        openBehaviorTab,
        sprite,
        colorList
    }, {
        currentFrameIndex,
        showRemoveSpriteOverlay,
        showExportOverlay,
        showRemoveFrameOverlay,
        showClearFrameOverlay,
        showRandomFrameOverlay
    }) {
        if (!sprite) return

        let { name, width, height, isAvatar, isWall, isItem, frameList, colorIndex } = sprite
        let currentFrame = frameList[currentFrameIndex]

        while (colorIndex > 0 && !colorList[colorIndex]) colorIndex--
        let color = colorList[colorIndex]
        let backgroundColor = colorList[0]

        let nameTextbox = textbox({
            className: 'initial-focus',
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
            button({
                className: 'toggle' + (isWall ? ' selected' : ''),
                onclick: () => setSpriteIsWall(!isWall)
            }, 'wall')
    
        let itemButton = isAvatar ? null :
            button({
                className: 'toggle' + (isItem ? ' selected' : ''),
                onclick: () => setSpriteIsItem(!isItem)
            }, 'item')
    
        let behaviorButton = isAvatar ? null :
            button({
                onclick: openBehaviorTab
            }, 'behavior')
    
        let exportButton = button({
            onclick: () => this.setState({ showExportOverlay: true })
        }, 'export sprite')

        let exportOverlay = !showExportOverlay ? null :
            h(ExportOverlay, {
                header: 'export sprite',
                fileName: `${sprite.name || 'untitled'}.mosisprite`,
                data: exportSprite(),
                closeOverlay: () => this.setState({ showExportOverlay: false })
            })
    
        let removeButton = isAvatar ? null :
            button({
                onclick: () => this.setState({ showRemoveSpriteOverlay: true }),
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
            onclick: duplicateSprite
        }, 'duplicate sprite')
    
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
            button({
                className: 'icon',
                title: 'add frame',
                onclick: () => {
                    let newFrame = currentFrame.slice()
                    addFrame(newFrame)
                    this.setState({ currentFrameIndex: frameList.length - 1 })
                }
            }, frameList.length === 1 ? 'animate' : '+')
    
        let removeFrameButton = frameList.length <= 1 ? null :
            button({
                className: 'icon',
                title: 'remove frame',
                onclick: () => this.setState({ showRemoveFrameOverlay: true })
            }, '-')

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
    
        let clearFrameButton = button({
            className: 'icon',
            title: 'clear',
            onclick: () => this.setState({ showClearFrameOverlay: true })
        }, '×')

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

        let randomFrameButton = button({
            className: 'icon',
            title: 'randomize',
            onclick: () => this.setState({ showRandomFrameOverlay: true })
        }, '?')

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

        let flipFrameHorizontalButton = button({
            className: 'icon',
            title: 'flip left-right',
            onclick: () => updateFrame(currentFrameIndex, Sprite.flipFrame(width, height, currentFrame, true))
        }, '⇆')

        let flipFrameVerticalButton = button({
            className: 'icon',
            title: 'flip up-down',
            onclick: () => updateFrame(currentFrameIndex, Sprite.flipFrame(width, height, currentFrame, false))
        }, '⇅')

        let rotateFrameButton = button({
            className: 'icon',
            title: 'rotate',
            onclick: () => updateFrame(currentFrameIndex, Sprite.rotateFrame(width, height, currentFrame))
        }, '⟳')
    
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
            drawPixel,
            width,
            height,
            frame: frameList[currentFrameIndex],
            prevFrame,
            color,
            backgroundColor
        })
    
        return panel({ header: 'sprite', closeTab }, [
            row([
                nameTextbox,
                menu({}, [
                    exportButton,
                    duplicateButton,
                    removeButton
                ])
            ]),
            row([
                wallButton,
                itemButton,
                behaviorButton
            ]),
            row([
                spritePreview,
                frameListDivider,
                frameButtonList,
                addFrameButton,
                removeFrameButton
            ]),
            div({
                className: 'sprite-grid',
                style: { backgroundColor }
            },
                spriteGrid
            ),
            row([
                clearFrameButton,
                flipFrameHorizontalButton,
                flipFrameVerticalButton,
                rotateFrameButton,
                randomFrameButton
            ]),
            exportOverlay,
            removeSpriteOverlay,
            removeFrameOverlay,
            clearFrameOverlay,
            randomFrameOverlay
        ])
    }
}