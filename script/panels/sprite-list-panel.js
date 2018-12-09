class SpriteListPanel extends Panel {
    constructor() {
        super()
        this.state = {
            currentSpriteId: 0,
            spritePanelOpen: false,
            choosingNewSprite: false,
            search: ''
        }
    }

    render({ world, set, undo, redo, selectedId, selectSprite, filter }) {
        if (this.state.spritePanelOpen && world.sprites[this.state.currentSpriteId]) {
            return h(SpritePanel, {
                world, set, undo, redo,
                sprite: world.sprites[this.state.currentSpriteId],
                spriteId: this.state.currentSpriteId,
                path: 'sprites.' + this.state.currentSpriteId,
                back: () => this.state.choosingNewSprite && selectSprite ?
                    selectSprite(this.state.currentSpriteId)
                    : this.setState({ spritePanelOpen: false })
            })
        }
        
        let palette = world.palettes[0]

        let searchTextbox = searchBox({
            placeholder: 'search',
            value: this.state.search,
            onchange: search => this.setState({ search })
        })

        let addSpriteButton = button({
            class: 'icon',
            onclick: () => {
                set('', World.addSprite(clone(world), world.randomSprites))
                this.setState({
                    currentSpriteId: world.sprites.length,
                    spritePanelOpen: true,
                    choosingNewSprite: true
                })
            }
        }, '+')

        let avatar = world.sprites[world.avatarId]
        let avatarComponent = (!filter || filter(world.avatarId)) ? button({
            class: 'sprite-button avatar-button' + (selectedId === world.avatarId ? ' selected' : ''),
            onclick: () => {
                if (selectSprite) selectSprite(world.avatarId)
                else this.setState({ currentSpriteId: world.avatarId, spritePanelOpen: true })
            }
        },
            h(SpriteComponent, { sprite: avatar, palette })
        ) : null

        let spriteComponents = world.sprites.map((sprite, spriteId) => {
            if (filter && !filter(spriteId)) return null
            if (this.state.search && !sprite.name.includes(this.state.search)) return null
            if (spriteId === world.avatarId) return null
            
            return button({
                class: 'sprite-button' + (selectedId === spriteId ? ' selected' : ''),
                onclick: () => {
                    if (selectSprite) selectSprite(spriteId)
                    else this.setState({ currentSpriteId: spriteId, spritePanelOpen: true })
                }
            },
                h(SpriteComponent, { sprite, palette, frameId: 0 })
            )
        })

        return div({ class: 'panel sprite-list-panel' }, [
            buttonRow([
                this.backButton(),
                this.undoButton(),
                this.redoButton(),
                searchTextbox,
                addSpriteButton,
            ]),
            buttonRow('wrap', [
                avatarComponent,
                vr(),
                spriteComponents
            ])
        ])
    }
}