class RoomPanel extends Component {
    constructor() {
        super()
        this.state = {}
    }

    render({
        closeTab,
        renameRoom,
        importRoom,
        exportRoom,
        clearRoom,
        randomRoom,
        setPaletteName,
        createRoomGif,
        addTile,
        clearTile,
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
        currentSpriteIndex,
        paletteList
    }, {
        showClearOverlay,
        showImportOverlay,
        showExportOverlay,
        showGifOverlay,
        showSpriteOverlay,
        showRandomOverlay
    }) {

        let sprite = spriteList[currentSpriteIndex]
        let currentPaletteIndex = paletteList.findIndex(p => p.name === room.paletteName)
        let currentPalette = paletteList[currentPaletteIndex]
        let colorList = currentPalette.colorList

        let nameTextbox = textbox({
            placeholder: 'room name',
            value: room.name,
            onchange: e => renameRoom(e.target.value)
        })

        let paletteDropdown = dropdown({
            value: room.paletteName,
            onchange: e => setPaletteName(e.target.value)
        }, paletteList
            // sort alphabetically
            .sort((p1, p2) => {
                let name1 = p1.name.toUpperCase()
                let name2 = p2.name.toUpperCase()
                if (name1 < name2) return -1
                if (name1 > name2) return 1
                else return 0
            })
            // convert to options
            .map(palette =>
                option({ value: palette.name }, palette.name)
            )
        )
    
        let clearButton = button({
            onclick: () => this.setState({ showClearOverlay: true })
        }, 'clear room')

        let clearOverlay = !showClearOverlay ? null :
            h(RemoveOverlay, {
                header: 'clear room?',
                closeOverlay: () => this.setState({ showClearOverlay: false }),
                remove: () => {
                    clearRoom()
                    this.setState({ showClearOverlay: false })
                }
            })

        let randomButton = button({
            onclick: () => this.setState({ showRandomOverlay: true })
        }, 'randomize room')

        let randomOverlay = !showRandomOverlay ? null :
            h(RemoveOverlay, {
                header: 'randomize room?',
                closeOverlay: () => this.setState({ showRandomOverlay: false }),
                remove: () => {
                    randomRoom()
                    this.setState({ showRandomOverlay: false })
                }
            })

        let importButton = button({
            onclick: () => this.setState({ showImportOverlay: true })
        }, 'import room')

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
    
        let exportButton = button({
            onclick: () => this.setState({ showExportOverlay: true })
        }, 'export room')

        let exportOverlay = !showExportOverlay ? null :
            h(ExportOverlay, {
                header: 'export room',
                fileName: `${room.name || 'untitled'}.mosiroom`,
                data: exportRoom(),
                closeOverlay: () => this.setState({ showExportOverlay: false })
            })
    
        let gifButton = button({
            onclick: () => this.setState({ showGifOverlay: true })
        }, 'create gif')

        let gifOverlay = !showGifOverlay ? null :
            h(RoomGifOverlay, {
                colorList,
                createGif: createRoomGif,
                closeOverlay: () => this.setState({ showGifOverlay: false })
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
            colorList
        })

        return panel({ header: 'room', closeTab }, [
            row([
                nameTextbox,
                menu({}, [
                    paletteDropdown,
                    clearButton,
                    randomButton,
                    importButton,
                    exportButton,
                    gifButton
                ])
            ]),
            div({
                className: 'room-grid',
                style: { backgroundColor: colorList[0] }
            },
                roomGrid
            ),
            div({ className: 'room-actions' }, [
                currentSpriteButton
            ]),
            clearOverlay,
            importOverlay,
            exportOverlay,
            gifOverlay,
            spriteOverlay,
            randomOverlay
        ])
    }
}
