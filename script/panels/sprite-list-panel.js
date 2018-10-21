class SpriteListPanel extends Component {
    constructor() {
        super()

        this.setFilter = (filter) => {
            this.props.setFilter(filter)
        }

        this.chooseSprite = (id) => {
            this.props.setSpriteId(id)
            let lastPanel = this.props.breadcrumbs[this.props.breadcrumbs.length - 1]
            if (lastPanel === 'room') this.props.back()
            else this.props.setPanel('sprite')
        }
    }

    render(props) {
        let colors = props.getPaletteColors()
        let backgroundColor = colors[0]
        let lastPanel = this.props.breadcrumbs[this.props.breadcrumbs.length - 1]

        let spriteButtons = []
        props.world.sprites.forEach((sprite, spriteId) => {
            if (props.filter && !(sprite.name && sprite.name.includes(props.filter))) return null

            let spriteCanvas = h(SpriteCanvas, {
                sprite: sprite,
                size: props.world.spriteSize,
                frameRate: props.world.frameRate,
                color: colors[sprite.colorId] || colors[colors.length - 1],
                backgroundColor: backgroundColor
            })

            let spriteButton = h(Button, {
                class: 'canvas-button'
                    + (spriteId === props.spriteId && lastPanel === 'room' ? ' on' : ' off')
                    + (spriteId === props.world.avatarId ? ' avatar' : ''),
                onclick: () => this.chooseSprite(spriteId)
            }, spriteCanvas)

            spriteButtons.push(spriteButton)
        })

        let spriteList = h('div', { class: 'grid-list' }, spriteButtons)

        let addSpriteButton = h(Button, {
            onclick: this.props.addSprite
        }, 'add sprite')

        let backButton = h(BackButton, { onclick: props.back })

        let filterTextbox = h(Textbox, {
            text: props.filter,
            placeholder: 'filter',
            onchange: this.setFilter
        })

        return h(Panel, {
            header: [backButton, filterTextbox],
            content: spriteList,
            footer: [addSpriteButton]
        })
    }
}