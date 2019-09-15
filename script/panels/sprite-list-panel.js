class SpriteListPanel extends Component {
    render ({ closeTab }) {
        return panel({ header: 'sprites', className: 'sprite-list-panel', closeTab }, [
            h(SpriteList, this.props)
        ])
    }
}

class SpriteList extends Component {
    constructor() {
        super()
        this.state = {
            filter: ''
        }
    }

    render ({
        backButton,
        selectSprite,
        editSprite,
        addSprite,
        importSprite,
        spriteList,
        currentSpriteIndex,
        colorList,
        hideAvatar
    }, {
        showImportOverlay,
        filter
    }) {
        let filterInput = textbox({
            placeholder: 'search sprites',
            value: filter,
            onchange: e => this.setState({ filter: e.target.value })
        })

        // TODO: add clear filter button

        let spriteButtonList = spriteList
            // remember original indices
            .map((sprite, i) => ({ sprite, i }))
            // apply filter
            .filter(({ sprite }) => {
                if (filter) return sprite.name.includes(filter)
                else if (hideAvatar && sprite.isAvatar) return false
                else return true
            })
            // sort alphabetically, avatar is always first
            .sort((s1, s2) => {
                if (s1.sprite.isAvatar) return -1
                if (s2.sprite.isAvatar) return 1
                let name1 = s1.sprite.name.toUpperCase()
                let name2 = s2.sprite.name.toUpperCase()
                if (name1 < name2) return -1
                if (name1 > name2) return 1
                else return 0
            })
            // convert to components
            .map(({ sprite, i }) =>
                spriteButton({
                    className: i === currentSpriteIndex ? 'initial-focus' : '',
                    onclick: () => selectSprite(i, 'sprite'),
                    sprite,
                    colorList,
                    isSelected: (i === currentSpriteIndex)
                })
            )

        let editSpriteButton = !editSprite ? null :
            iconButton({ title: 'edit sprite', onclick: editSprite }, 'edit')

        let addSpriteButton = !addSprite ? null :
            iconButton({ title: 'add sprite', onclick: addSprite }, 'add')

        let importSpriteButton = !importSprite ? null :
            iconButton({
                title: 'import sprite',
                onclick: () => this.setState({ showImportOverlay: true })
            }, 'import')

        let importOverlay = !showImportOverlay ? null :
            h(ImportOverlay, {
                header: 'import sprite',
                onImport: data => {
                    importSprite(data)
                    this.setState({ showImportOverlay: false })
                },
                fileType: '.mosisprite',
                closeOverlay: () => this.setState({ showImportOverlay: false })
            })

        return div({ className: 'content' }, [
            row([
                backButton,
                filterInput
            ]),
            div({ className: 'spritelist' }, [
                spriteButtonList
            ]),
            hr(),
            row([
                importSpriteButton,
                fill(),
                editSpriteButton,
                addSpriteButton
            ]),
            importOverlay
        ])
    }
}