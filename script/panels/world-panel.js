class WorldPanel extends Component {
    constructor() {
        super()
        this.state = {}
    }

    render({
        closeTab,
        renameWorld,
        importWorld,
        exportWorld,
        randomWorld,
        clearWorld,
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
        spriteList,
        spriteWidth,
        spriteHeight,
        paletteList
    }, {
        showImportOverlay,
        showExportOverlay,
        showRandomOverlay,
        showClearOverlay,
        showSettingsOverlay
    }) {

        let nameTextbox = textbox({
            class: 'simple',
            placeholder: 'name of world',
            value: worldName,
            onchange: e => renameWorld(e.target.value)
        })

        let importButton = iconButton({
            title: 'import world',
            onclick: () => this.setState({ showImportOverlay: true })
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
            onclick: () => this.setState({ showExportOverlay: true })
        }, 'export')

        let exportOverlay = !showExportOverlay ? null :
            h(ExportOverlay, {
                header: 'export world',
                fileName: `${worldName || 'untitled'}.mosi`,
                data: exportWorld(),
                closeOverlay: () => this.setState({ showExportOverlay: false })
            })

        let randomButton = iconButton({
            title: 'randomize world',
            onclick: () => this.setState({ showRandomOverlay: true })
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
            onclick: () => this.setState({ showClearOverlay: true })
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
                resize: (props) => {
                    // let newWorld = World.create(props)
                    // this.setState({ showNewOverlay: false })
                    // updateWorld(newWorld)
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
                nameTextbox
            ]),
            div({
                className: 'world-grid grid-container',
                style: { backgroundColor: paletteList[0].colorList[0] }
            },
                worldGrid
            ),
            row([
                exportButton,
                importButton,
                randomButton,
                clearButton,
                div({ class: 'fill' }),
                settingsButton
            ]),
            importOverlay,
            exportOverlay,
            randomOverlay,
            clearOverlay,
            settingsOverlay
        ])
    }
}