class PaletteListPanel extends Panel {
    constructor() {
        super()
        this.state = {
            currentPaletteId: 0,
            palettePanelOpen: false,
            choosingNewPalette: false
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

        let paletteComponents = world.palettes.map((palette, paletteId) => {
            return button({
                class: 'color-button' + (selectedId === paletteId ? ' selected' : ''),
                onclick: () => {
                    if (selectPalette) selectPalette(paletteId)
                    this.setState({ currentPaletteId: paletteId, palettePanelOpen: true })
                }
            }, [
                palette.colors.map(color =>
                    div({ class: 'color-box', style: { backgroundColor: color }})
                ),
                div({ class: 'color-name' }, palette.name)
            ])
        })

        return div({ class: 'panel palette-list-panel' }, [
            buttonRow([
                this.backButton(),
                this.undoButton(),
                this.redoButton(),
                div({ class: 'filler' }),
                addPaletteButton,
            ]),
            buttonRow('wrap',
                paletteComponents
            )
        ])
    }
}