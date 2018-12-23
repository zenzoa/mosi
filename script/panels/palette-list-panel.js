class PaletteListPanel extends Panel {
    constructor() {
        super()
        this.state = {
            currentPaletteId: 0,
            palettePanelOpen: false,
            choosingNewPalette: false
        }

        this.selectPalette = (paletteId) => {
            if (this.props.selectPalette) this.props.selectPalette(paletteId)
            this.setState({ currentPaletteId: paletteId, palettePanelOpen: true })
        }

        this.renderPalette = (paletteId) => {
            let palette = this.props.world.palettes[paletteId]
            return [
                palette.colors.map(color =>
                    div({ class: 'color-box', style: { backgroundColor: color }})
                ),
                div({ class: 'color-name' }, palette.name)
            ]
        }
    }

    render({ world, set, undo, redo, selectedId, selectPalette }) {
        if (this.state.palettePanelOpen && world.palettes[this.state.currentPaletteId]) {
            return h(PalettePanel, {
                world, set, undo, redo,
                palette: world.palettes[this.state.currentPaletteId],
                paletteId: this.state.currentPaletteId,
                path: 'palettes.' + this.state.currentPaletteId,
                back: () => this.state.choosingNewPalette && selectPalette ?
                    selectPalette(this.state.currentPaletteId)
                    : this.setState({ palettePanelOpen: false })
            })
        }

        let addPaletteButton = button({
            class: 'icon',
            onclick: () => {
                set('', World.addPalette(clone(world)))
                this.setState({
                    currentPaletteId: world.palettes.length,
                    palettePanelOpen: true,
                    choosingNewPalette: true
                })
            }
        }, '+')

        let items = []
        world.palettes.forEach((palette, paletteId) => {
            items.push({
                class: 'color-button' + (selectedId === paletteId ? ' selected' : ''),
                index: paletteId
            })
        })

        let paletteList = h(DragList, {
            class: 'wrap',
            vertical: true,
            items,
            renderItem: this.renderPalette,
            selectItem: this.selectPalette,
            moveItem: (paletteId, insertId) => set('', World.reorderPalettes(clone(world), paletteId, insertId))
        })

        return div({ class: 'panel palette-list-panel' }, [
            buttonRow([
                this.backButton(),
                this.undoButton(),
                this.redoButton(),
                div({ class: 'filler' }),
                addPaletteButton,
            ]),
            paletteList
        ])
    }
}