class SpriteListPanel extends Panel {
    constructor() {
        super()
        this.state = {
            currentSpriteId: 0,
            spritePanelOpen: false,
            choosingNewSprite: false,
            search: ''
        }

        this.selectSprite = (spriteId) => {
            if (this.props.selectSprite) {
                this.props.selectSprite(spriteId)
            } else {
                this.props.set('currentSpriteId', spriteId)
                this.setState({ spritePanelOpen: true })
            }
        }

        this.renderSprite = (spriteId) => {
            return h(SpriteComponent, {
                sprite: this.props.world.sprites[spriteId],
                palette: this.props.world.palettes[0],
                frameId: 0
            })
        }
    }

    render({ world, set, undo, redo, selectedId, selectSprite, filter }) {
        if (this.state.spritePanelOpen && world.sprites[world.currentSpriteId]) {
            return h(SpritePanel, {
                world, set, undo, redo,
                sprite: world.sprites[world.currentSpriteId],
                spriteId: world.currentSpriteId,
                path: 'sprites.' + world.currentSpriteId,
                back: () => this.state.choosingNewSprite && selectSprite ?
                    selectSprite(world.currentSpriteId)
                    : this.setState({ spritePanelOpen: false })
            })
        }

        let searchTextbox = searchBox({
            placeholder: 'search',
            value: this.state.search,
            onchange: search => this.setState({ search })
        })

        let addSpriteButton = button({
            class: 'icon',
            onclick: () => {
                set('', World.addSprite(clone(world), world.randomSprites))
                this.setState({ spritePanelOpen: true, choosingNewSprite: true })
            }
        }, '+')

        let avatar = world.sprites[world.avatarId]
        let avatarOutsideFilter = filter && !filter(world.avatarId)
        let avatarOutsideSearch = this.state.search && !avatar.name.includes(this.state.search)
        let avatarComponent = (avatarOutsideFilter || avatarOutsideSearch) ? null :
            div({ class: 'avatar-component' }, button({
                class: 'sprite-button avatar-button' + (selectedId === world.avatarId ? ' selected' : ''),
                onclick: () => this.selectSprite(world.avatarId)
            }, this.renderSprite(world.avatarId)))

        let items = []
        world.sprites.forEach((sprite, spriteId) => {
            if (filter && !filter(spriteId)) return
            if (this.state.search && !sprite.name.includes(this.state.search)) return
            if (spriteId === world.avatarId) return null
            items.push({
                class: 'sprite-button' + (selectedId === spriteId ? ' selected' : ''),
                index: spriteId
            })
        })

        let spriteList = h(DragList, {
            before: avatarComponent,
            items,
            renderItem: this.renderSprite,
            selectItem: this.selectSprite,
            moveItem: (spriteId, insertId) => set('', World.reorderSprites(clone(world), spriteId, insertId))
        })

        return div({ class: 'panel sprite-list-panel' }, [
            buttonRow([
                this.backButton(),
                this.undoButton(),
                this.redoButton(),
                searchTextbox,
                addSpriteButton,
            ]),
            spriteList
        ])
    }
}