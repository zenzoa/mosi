class WorldPanel extends Component {
    constructor() {
        super()
        this.state = {}
    }

    render({
        closeTab,
        updateWorld,
        renameWorld,
        importWorld,
        exportWorld,
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
        showSettingsOverlay
    }) {

        let nameTextbox = textbox({
            class: 'simple',
            placeholder: 'name of world',
            value: worldName,
            onchange: e => renameWorld(e.target.value)
        })

        let importButton = button({
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

        let exportButton = button({
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

        let randomButton = button({
            title: 'randomize world',
            onclick: () => {}
        }, 'random')

        let clearButton = button({
            title: 'clear world',
            onclick: () => {}
        }, 'clear')

        let settingsButton = button({
            title: 'world settings',
            onclick: () => this.setState({ showSettingsOverlay: true })
        }, 'settings')

        let settingsOverlay = !showSettingsOverlay ? null :
            h(NewWorldOverlay, {
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

        return panel({ header: 'world', closeTab }, [
            row([
                nameTextbox
            ]),
            div({
                className: 'world-grid',
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
            settingsOverlay
        ])
    }
}