class WorldPanel extends Component {
    constructor() {
        super()
        this.state = {}
    }

    render({
        closeTab,
        openScriptTab,

        renameWorld,
        importWorld,
        exportWorld,
        randomWorld,
        resizeWorld,
        clearWorld,
        resetWorld,
        setWrapHorizontal,
        setWrapVertical,

        selectRoom,
        startRoomIndex,
        currentRoomIndex,
        roomList,
        roomWidth,
        roomHeight,

        worldWidth,
        worldHeight,
        worldName,
        worldWrapHorizontal,
        worldWrapVertical,
        worldScriptList,

        spriteList,
        spriteWidth,
        spriteHeight,
        paletteList,

        setFontResolution,
        setFontDirection,
        setFontData,
        fontResolution,
        fontDirection,
        fontData,
        
        modList,
        addMod,
        renameMod,
        changeModType,
        updateModCode,
        removeMod
    }, {
        showImportOverlay,
        showExportOverlay,
        showRandomOverlay,
        showClearOverlay,
        showResetOverlay,
        showExtrasOverlay,
        showFontOverlay,
        showResizeOverlay,
        showModsOverlay
    }) {

        let nameTextbox = textbox({
            placeholder: 'name of world',
            value: worldName,
            onchange: e => renameWorld(e.target.value)
        })
    
        let scriptList = Object.keys(worldScriptList).map(key => worldScriptList[key])
        let hasScripts = scriptList.find(script => !!script)
        let scriptButton = iconButton({
            title: 'script',
            className: (hasScripts ? 'selected' : ''),
            onclick: openScriptTab
        }, 'script')

        let importButton = button({
            title: 'import world',
            onclick: () => this.setState({ showExtrasOverlay: false, showImportOverlay: true })
        }, 'import')

        let importOverlay = !showImportOverlay ? null :
            h(ImportOverlay, {
                header: 'import world',
                onImport: data => {
                    importWorld(data)
                    this.setState({ showImportOverlay: false })
                },
                fileType: '.mosi',
                closeOverlay: () => this.setState({ showImportOverlay: false })
            })

        let exportButton = button({
            title: 'export world',
            onclick: () => this.setState({ showExtrasOverlay: false, showExportOverlay: true })
        }, 'export')

        let exportOverlay = !showExportOverlay ? null :
            h(ExportOverlay, {
                header: 'export world',
                fileName: `${worldName || 'untitled'}.mosi`,
                data: exportWorld(),
                closeOverlay: () => this.setState({ showExportOverlay: false })
            })
    
        let resetButton = button({
                title: 'reset world',
                onclick: () => this.setState({ showExtrasOverlay: false, showResetOverlay: true }),
            }, 'reset everything')

        let resetOverlay = !showResetOverlay ? null :
            h(RemoveOverlay, {
                header: 'reset world?',
                closeOverlay: () => this.setState({ showResetOverlay: false }),
                remove: () => {
                    resetWorld()
                    this.setState({ showResetOverlay: false })
                }
            })

        let randomButton = button({
            title: 'randomize world',
            onclick: () => this.setState({ showExtrasOverlay: false, showRandomOverlay: true })
        }, 'randomize')

        let randomOverlay = !showRandomOverlay ? null :
            h(RemoveOverlay, {
                header: 'randomize all rooms in world?',
                closeOverlay: () => this.setState({ showRandomOverlay: false }),
                remove: () => {
                    randomWorld()
                    this.setState({ showRandomOverlay: false })
                }
            })

        let clearButton = button({
            title: 'clear world',
            onclick: () => this.setState({ showExtrasOverlay: false, showClearOverlay: true })
        }, 'clear world')

        let clearOverlay = !showClearOverlay ? null :
            h(RemoveOverlay, {
                header: 'clear all rooms in world?',
                closeOverlay: () => this.setState({ showClearOverlay: false }),
                remove: () => {
                    clearWorld()
                    this.setState({ showClearOverlay: false })
                }
            })

        let modsButton = button({
            title: 'custom scripts',
            onclick: () => this.setState({ showExtrasOverlay: false, showModsOverlay: true })
        }, 'custom scripts')

        let modsOverlay = !showModsOverlay ? null :
            h(ModsOverlay, {
                closeOverlay: () => this.setState({ showModsOverlay: false }),
                modList,
                addMod,
                renameMod,
                changeModType,
                updateModCode,
                removeMod
            })

        let resizeButton = button({
            title: 'resize world',
            onclick: () => this.setState({ showExtrasOverlay: false, showResizeOverlay: true })
        }, 'resize')

        let resizeOverlay = !showResizeOverlay ? null :
            h(ResizeWorldOverlay, {
                worldWidth,
                worldHeight,
                roomWidth,
                roomHeight,
                spriteWidth,
                spriteHeight,
                resize: (props) => {
                    resizeWorld(props)
                    this.setState({ showResizeOverlay: false })
                },
                closeOverlay: () => this.setState({ showResizeOverlay: false })
            })

        let fontButton = button({
            title: 'font settings',
            onclick: () => this.setState({ showExtrasOverlay: false, showFontOverlay: true })
        }, 'font settings')

        let fontOverlay = !showFontOverlay ? null :
            h(FontOverlay, {
                fontResolution,
                fontDirection,
                fontData,
                setFontResolution,
                setFontDirection,
                setFontData,
                closeOverlay: () => this.setState({ showFontOverlay: false })
            })

        let extrasButton = iconButton({
            title: 'world actions',
            onclick: () => this.setState({ showExtrasOverlay: true })
        }, 'extras')

        let extrasOverlay = !showExtrasOverlay ? null :
            h(ExtrasOverlay, {
                header: 'world actions',
                buttons: [
                    resizeButton,
                    modsButton,
                    fontButton,
                    hr(),
                    exportButton,
                    importButton,
                    randomButton,
                    clearButton,
                    resetButton
                ],
                closeOverlay: () => this.setState({ showExtrasOverlay: false })
            })

        let wrapHorizontalButton = iconButton({
            title: 'wrap horizontal',
            className: (worldWrapHorizontal ? 'selected' : ''),
            onclick: () => setWrapHorizontal(!worldWrapHorizontal)
        }, 'wrap-h')

        let wrapVerticalButton = iconButton({
            title: 'wrap vertical',
            className: (worldWrapVertical ? 'selected' : ''),
            onclick: () => setWrapVertical(!worldWrapVertical)
        }, 'wrap-v')

        let worldGrid = h(WorldGrid, {
            className: 'initial-focus',
            selectRoom,
            startRoomIndex,
            currentRoomIndex,
            roomList,
            roomWidth,
            roomHeight,
            worldWidth,
            worldHeight,
            spriteList,
            paletteList
        })

        return panel({ header: 'world', id: 'worldPanel', closeTab }, [
            row([
                extrasButton,
                nameTextbox,
                scriptButton,
                wrapHorizontalButton,
                wrapVerticalButton
            ]),
            worldGrid,
            extrasOverlay,
            importOverlay,
            exportOverlay,
            randomOverlay,
            clearOverlay,
            resetOverlay,
            resizeOverlay,
            fontOverlay,
            modsOverlay
        ])
    }
}