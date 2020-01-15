class RoomPanel extends Component {
    constructor() {
        super()
        this.state = {}
    }

    render({
        backButton,
        closeTab,
        openScriptTab,
        
        renameRoom,
        importRoom,
        exportRoom,
        clearRoom,
        randomRoom,
        createRoomGif,

        addTile,
        clearTile,

        setMusic,
        editMusic,
        addMusic,
        importMusic,

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
        currentMusicIndex,
        currentPaletteIndex,
        currentSpriteIndex,
        musicList,
        paletteList,

        roomNorth,
        roomEast,
        roomSouth,
        roomWest,
        selectRoom,

        spritePalette
    }, {
        showClearOverlay,
        showImportOverlay,
        showExportOverlay,
        showGifOverlay,
        showMusicOverlay,
        showPaletteOverlay,
        showSpriteOverlay,
        showRandomOverlay,
        showExtrasOverlay
    }) {
        let sprite = spriteList[currentSpriteIndex]
        let currentMusic = musicList[currentMusicIndex]
        let currentPalette = paletteList[currentPaletteIndex]
        let colorList = currentPalette.colorList

        let nameTextbox = textbox({
            placeholder: 'room name',
            value: room.name,
            onchange: e => renameRoom(e.target.value)
        })
    
        let scriptList = Object.keys(room.scriptList).map(key => room.scriptList[key])
        let hasScripts = scriptList.find(script => !!script)
        let scriptButton = iconButton({
            title: 'script',
            className: (hasScripts ? 'selected' : ''),
            onclick: openScriptTab
        }, 'script')
    
        let clearButton = button({
            title: 'clear room',
            onclick: () => this.setState({ showExtrasOverlay: false, showClearOverlay: true })
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
            title: 'randomize room',
            onclick: () => this.setState({ showExtrasOverlay: false, showRandomOverlay: true })
        }, 'randomize')

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
            title: 'import room',
            onclick: () => this.setState({ showExtrasOverlay: false, showImportOverlay: true })
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
    
        let exportButton = button({
            title: 'export room',
            onclick: () => this.setState({ showExtrasOverlay: false, showExportOverlay: true })
        }, 'export')

        let exportOverlay = !showExportOverlay ? null :
            h(ExportOverlay, {
                header: 'export room',
                fileName: `${room.name || 'untitled'}.mosiroom`,
                data: exportRoom(),
                closeOverlay: () => this.setState({ showExportOverlay: false })
            })
    
        let gifButton = button({
            title: 'create GIF',
            onclick: () => this.setState({ showExtrasOverlay: false, showGifOverlay: true })
        }, 'create gif')

        let gifOverlay = !showGifOverlay ? null :
            h(GifOverlay, {
                colorList,
                createGif: createRoomGif,
                maxScale: 4,
                closeOverlay: () => this.setState({ showGifOverlay: false })
            })

        let extrasButton = iconButton({
            title: 'room actions',
            onclick: () => this.setState({ showExtrasOverlay: true })
        }, 'extras')

        let extrasOverlay = !showExtrasOverlay ? null :
            h(ExtrasOverlay, {
                header: 'room actions',
                buttons: [
                    gifButton,
                    hr(),
                    exportButton,
                    importButton,
                    randomButton,
                    clearButton
                ],
                closeOverlay: () => this.setState({ showExtrasOverlay: false })
            })

        let currentMusicButton =
            musicButton({
                onclick: () => this.setState({ showMusicOverlay: true }),
                music: currentMusic,
                isSmall: true
            })
            
        let musicOverlay = !showMusicOverlay ? null :
            h(MusicListOverlay, {
                closeOverlay: () => this.setState({ showMusicOverlay: false }),
                selectMusic: musicIndex => {
                    setMusic(musicIndex)
                    this.setState({ showMusicOverlay: false })
                },
                editMusic: () => {
                    editMusic()
                    this.setState({ showMusicOverlay: false })
                },
                addMusic: music => {
                    addMusic(music)
                    this.setState({ showMusicOverlay: false })
                },
                importMusic: musicData => {
                    importMusic(musicData)
                    this.setState({ showMusicOverlay: false })
                },
                currentMusicIndex,
                musicList
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

        let roomSliceNorth = h(RoomSlice, {
            sliceHorizontal: true,
            sliceIndex: roomHeight - 1,
            roomWidth,
            roomHeight,
            spriteWidth,
            spriteHeight,
            spriteList,
            colorList: roomNorth ? Palette.find(roomNorth.room.paletteName, paletteList).colorList : null,
            tileList: roomNorth ? roomNorth.room.tileList : null,
            onclick: roomNorth ? (() => selectRoom(roomNorth.roomIndex)) : null,
            arrow: roomNorth ? '▲' : ''
        })

        let roomSliceEast = h(RoomSlice, {
            sliceVertical: true,
            sliceIndex: 0,
            roomWidth,
            roomHeight,
            spriteWidth,
            spriteHeight,
            spriteList,
            colorList: roomEast ? Palette.find(roomEast.room.paletteName, paletteList).colorList : null,
            tileList: roomEast ? roomEast.room.tileList : null,
            onclick: roomEast ? (() => selectRoom(roomEast.roomIndex)) : null,
            arrow: roomEast ? '▶' : ''
        })

        let roomSliceSouth = h(RoomSlice, {
            sliceHorizontal: true,
            sliceIndex: 0,
            roomWidth,
            roomHeight,
            spriteWidth,
            spriteHeight,
            spriteList,
            colorList: roomSouth ? Palette.find(roomSouth.room.paletteName, paletteList).colorList : null,
            tileList: roomSouth ? roomSouth.room.tileList : null,
            onclick: roomSouth ? (() => selectRoom(roomSouth.roomIndex)) : null,
            arrow: roomSouth ? '▼' : ''
        })

        let roomSliceWest = h(RoomSlice, {
            sliceVertical: true,
            sliceIndex: roomWidth - 1,
            roomWidth,
            roomHeight,
            spriteWidth,
            spriteHeight,
            spriteList,
            colorList: roomWest ? Palette.find(roomWest.room.paletteName, paletteList).colorList : null,
            tileList: roomWest ? roomWest.room.tileList : null,
            onclick: roomWest ? (() => selectRoom(roomWest.roomIndex)) : null,
            arrow: roomWest ? '◀' : ''
        })

        let spritePaletteButtons = spritePalette.map(spriteIndex => {
            if (!spriteList[spriteIndex]) return

            return spriteButton({
                className: 'simple',
                isSelected: spriteIndex === currentSpriteIndex,
                onclick: () => {
                    if (spriteIndex === currentSpriteIndex) {
                        editSprite()
                    } else {
                        selectSprite(spriteIndex)
                    }
                },
                sprite: spriteList[spriteIndex],
                colorList
            })
        })

        let addSpriteToPaletteButton = iconButton({
            onclick: () => this.setState({ showSpriteOverlay: true }),
        }, 'add')
            
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

        return panel({ header: 'room', id: 'roomPanel', closeTab }, [
            row([
                extrasButton,
                nameTextbox,
                scriptButton,
                currentMusicButton,
                currentPaletteButton
            ]),
            div({ class: 'room-block' }, [
                row([ roomSliceNorth ]),
                row([ roomSliceWest, roomGrid, roomSliceEast ]),
                row([ roomSliceSouth ])
            ]),
            row([
                spritePaletteButtons,
                fill(),
                addSpriteToPaletteButton
            ]),
            extrasOverlay,
            clearOverlay,
            importOverlay,
            exportOverlay,
            gifOverlay,
            musicOverlay,
            paletteOverlay,
            spriteOverlay,
            randomOverlay
        ])
    }
}
