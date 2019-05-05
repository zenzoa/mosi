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
        showNewOverlay
    }) {

        let nameTextbox = textbox({
            className: 'initial-focus',
            placeholder: 'name of world',
            value: worldName,
            onchange: e => renameWorld(e.target.value)
        })
    
        let wrapHorizontalButton = button({
            className: 'toggle' + (worldWrapHorizontal ? ' selected' : ''),
            onclick: () => setWrapHorizontal(!worldWrapHorizontal)
        }, 'wrap horizontally')
    
        let wrapVerticalButton = button({
            className: 'toggle' + (worldWrapVertical ? ' selected' : ''),
            onclick: () => setWrapVertical(!worldWrapVertical)
        }, 'wrap vertically')

        let newWorldButton = button({
            onclick: () => this.setState({ showNewOverlay: true })
        }, 'new world')

        let newOverlay = !showNewOverlay ? null :
            h(NewWorldOverlay, {
                worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight,
                createWorld: (props) => {
                    let newWorld = World.create(props)
                    this.setState({ showNewOverlay: false })
                    updateWorld(newWorld)
                },
                closeOverlay: () => this.setState({ showNewOverlay: false })
            })

        let importButton = button({
            onclick: () => this.setState({ showImportOverlay: true })
        }, 'import world')

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
            onclick: () => this.setState({ showExportOverlay: true })
        }, 'export world')

        let exportOverlay = !showExportOverlay ? null :
            h(ExportOverlay, {
                header: 'export world',
                fileName: `${worldName || 'untitled'}.mosi`,
                data: exportWorld(),
                closeOverlay: () => this.setState({ showExportOverlay: false })
            })

        let worldGrid = h(WorldGrid, {
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
                nameTextbox,
                menu({}, [
                    newWorldButton,
                    importButton,
                    exportButton
                ])
            ]),
            div({
                className: 'world-grid',
                style: { backgroundColor: paletteList[0].colorList[0] }
            },
                worldGrid
            ),
            row([
                wrapHorizontalButton,
                wrapVerticalButton
            ]),
            newOverlay,
            importOverlay,
            exportOverlay
        ])
    }
}