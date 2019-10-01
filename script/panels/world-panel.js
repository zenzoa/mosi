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
        fontData
    }, {
        showImportOverlay,
        showExportOverlay,
        showRandomOverlay,
        showClearOverlay,
        showResetOverlay,
        showExtrasOverlay,
        showSettingsOverlay
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

        let importButton = iconButton({
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

        let exportButton = iconButton({
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
    
        let resetButton =
            iconButton({
                title: 'reset world',
                onclick: () => this.setState({ showExtrasOverlay: false, showResetOverlay: true }),
            }, 'delete')

        let resetOverlay = !showResetOverlay ? null :
            h(RemoveOverlay, {
                header: 'reset world?',
                closeOverlay: () => this.setState({ showResetOverlay: false }),
                remove: () => {
                    resetWorld()
                    this.setState({ showResetOverlay: false })
                }
            })

        let randomButton = iconButton({
            title: 'randomize world',
            onclick: () => this.setState({ showExtrasOverlay: false, showRandomOverlay: true })
        }, 'random')

        let randomOverlay = !showRandomOverlay ? null :
            h(RemoveOverlay, {
                header: 'randomize all rooms in world?',
                closeOverlay: () => this.setState({ showRandomOverlay: false }),
                remove: () => {
                    randomWorld()
                    this.setState({ showRandomOverlay: false })
                }
            })

        let clearButton = iconButton({
            title: 'clear world',
            onclick: () => this.setState({ showExtrasOverlay: false, showClearOverlay: true })
        }, 'clear')

        let clearOverlay = !showClearOverlay ? null :
            h(RemoveOverlay, {
                header: 'clear all rooms in world?',
                closeOverlay: () => this.setState({ showClearOverlay: false }),
                remove: () => {
                    clearWorld()
                    this.setState({ showClearOverlay: false })
                }
            })

        let extrasButton = iconButton({
            title: 'world actions',
            onclick: () => this.setState({ showExtrasOverlay: true })
        }, 'extras')

        let extrasOverlay = !showExtrasOverlay ? null :
            h(ExtrasOverlay, {
                header: 'world actions',
                buttons: [
                    exportButton,
                    importButton,
                    randomButton,
                    clearButton,
                    resetButton
                ],
                closeOverlay: () => this.setState({ showExtrasOverlay: false })
            })

        let settingsButton = iconButton({
            title: 'world settings',
            onclick: () => this.setState({ showSettingsOverlay: true })
        }, 'settings')

        let settingsOverlay = !showSettingsOverlay ? null :
            h(WorldSettingsOverlay, {
                worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight,
                worldWrapHorizontal,
                worldWrapVertical,
                setWrapHorizontal,
                setWrapVertical,
                setFontResolution,
                setFontDirection,
                setFontData,
                fontResolution,
                fontDirection,
                fontData,
                resize: (props) => {
                    resizeWorld(props)
                    this.setState({ showSettingsOverlay: false })
                },
                closeOverlay: () => this.setState({ showSettingsOverlay: false })
            })

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

        return panel({ header: 'world', className: 'world-panel', closeTab }, [
            row([
                nameTextbox,
                scriptButton
            ]),
            worldGrid,
            row([
                extrasButton,
                fill(),
                settingsButton
            ]),
            importOverlay,
            exportOverlay,
            randomOverlay,
            clearOverlay,
            resetOverlay,
            extrasOverlay,
            settingsOverlay
        ])
    }
}