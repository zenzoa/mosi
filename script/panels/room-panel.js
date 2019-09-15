class RoomPanel extends Component {
    constructor() {
        super()
        this.state = {}
    }

    render({
        backButton,
        closeTab,
        
        renameRoom,
        importRoom,
        exportRoom,
        clearRoom,
        randomRoom,
        createRoomGif,

        addTile,
        clearTile,

        setPalette,
        editPalette,
        addPalette,
        importPalette,

        selectSprite,
        editSprite,
        addSprite,
        importSprite,

        room,
        roomWidth,
        roomHeight,
        spriteWidth,
        spriteHeight,
        spriteList,
        currentPaletteIndex,
        currentSpriteIndex,
        paletteList
    }, {
        showClearOverlay,
        showImportOverlay,
        showExportOverlay,
        showGifOverlay,
        showPaletteOverlay,
        showSpriteOverlay,
        showRandomOverlay
    }) {
        let sprite = spriteList[currentSpriteIndex]
        let currentPalette = paletteList[currentPaletteIndex]
        let colorList = currentPalette.colorList

        let nameTextbox = textbox({
            class: 'simple',
            placeholder: 'room name',
            value: room.name,
            onchange: e => renameRoom(e.target.value)
        })
    
        let clearButton = iconButton({
            title: 'clear room',
            onclick: () => this.setState({ showClearOverlay: true })
        }, 'clear')

        let clearOverlay = !showClearOverlay ? null :
            h(RemoveOverlay, {
                header: 'clear room?',
                closeOverlay: () => this.setState({ showClearOverlay: false }),
                remove: () => {
                    clearRoom()
                    this.setState({ showClearOverlay: false })
                }
            })

        let randomButton = iconButton({
            title: 'randomize room',
            onclick: () => this.setState({ showRandomOverlay: true })
        }, 'random')

        let randomOverlay = !showRandomOverlay ? null :
            h(RemoveOverlay, {
                header: 'randomize room?',
                closeOverlay: () => this.setState({ showRandomOverlay: false }),
                remove: () => {
                    randomRoom()
                    this.setState({ showRandomOverlay: false })
                }
            })

        let importButton = iconButton({
            title: 'import room',
            onclick: () => this.setState({ showImportOverlay: true })
        }, 'import')

        let importOverlay = !showImportOverlay ? null :
            h(ImportOverlay, {
                header: 'import room',
                onImport: data => {
                    importRoom(data)
                    this.setState({ showImportOverlay: false })
                },
                fileType: '.mosiroom',
                closeOverlay: () => this.setState({ showImportOverlay: false })
            })
    
        let exportButton = iconButton({
            title: 'export room',
            onclick: () => this.setState({ showExportOverlay: true })
        }, 'export')

        let exportOverlay = !showExportOverlay ? null :
            h(ExportOverlay, {
                header: 'export room',
                fileName: `${room.name || 'untitled'}.mosiroom`,
                data: exportRoom(),
                closeOverlay: () => this.setState({ showExportOverlay: false })
            })
    
        let gifButton = iconButton({
            title: 'create GIF',
            onclick: () => this.setState({ showGifOverlay: true })
        }, 'gif')

        let gifOverlay = !showGifOverlay ? null :
            h(RoomGifOverlay, {
                colorList,
                createGif: createRoomGif,
                closeOverlay: () => this.setState({ showGifOverlay: false })
            })

        let currentPaletteButton =
            paletteButton({
                onclick: () => this.setState({ showPaletteOverlay: true }),
                palette: currentPalette
            })
            
        let paletteOverlay = !showPaletteOverlay ? null :
            h(PaletteListOverlay, {
                closeOverlay: () => this.setState({ showPaletteOverlay: false }),
                selectPalette: paletteIndex => {
                    setPalette(paletteIndex)
                    this.setState({ showPaletteOverlay: false })
                },
                editPalette: () => {
                    editPalette()
                    this.setState({ showPaletteOverlay: false })
                },
                addPalette: palette => {
                    addPalette(palette)
                    this.setState({ showPaletteOverlay: false })
                },
                importPalette: paletteData => {
                    importPalette(paletteData)
                    this.setState({ showPaletteOverlay: false })
                },
                currentPaletteIndex,
                paletteList
            })

        let currentSpriteButton = !sprite ? null :
            spriteButton({
                onclick: () => this.setState({ showSpriteOverlay: true }),
                sprite,
                colorList
            })
            
        let spriteOverlay = !showSpriteOverlay ? null :
            h(SpriteListOverlay, {
                closeOverlay: () => this.setState({ showSpriteOverlay: false }),
                selectSprite: spriteIndex => {
                    selectSprite(spriteIndex)
                    this.setState({ showSpriteOverlay: false })
                },
                editSprite: () => {
                    editSprite()
                    this.setState({ showSpriteOverlay: false })
                },
                addSprite: sprite => {
                    addSprite(sprite)
                    this.setState({ showSpriteOverlay: false })
                },
                importSprite: spriteData => {
                    importSprite(spriteData)
                    this.setState({ showSpriteOverlay: false })
                },
                spriteList,
                currentSpriteIndex,
                colorList
            })

        let roomGrid = h(RoomGrid, {
            className: 'initial-focus',
            roomWidth,
            roomHeight,
            spriteWidth,
            spriteHeight,
            spriteList,
            currentSpriteName: sprite.name,
            tileList: room.tileList,
            drawTile: (x, y) => addTile(x, y, currentSpriteIndex),
            eraseTile: (x, y) => clearTile(x, y),
            isAnimated: true,
            spriteIsTransparent: sprite.isTransparent,
            colorList
        })

        return panel({ header: 'room', className: 'world-panel', closeTab }, [
            row([
                backButton,
                nameTextbox
            ]),
            roomGrid,
            row([
                exportButton,
                importButton,
                randomButton,
                clearButton,
                gifButton,
                div({ class: 'fill' }),
                currentPaletteButton,
                currentSpriteButton
            ]),
            clearOverlay,
            importOverlay,
            exportOverlay,
            gifOverlay,
            paletteOverlay,
            spriteOverlay,
            randomOverlay
        ])
    }
}
