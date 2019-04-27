class SpriteListPanel extends Component {
    render ({ closeTab }) {
        return panel({ header: 'list of sprites', closeTab }, [
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
        selectSprite,
        editSprite,
        addSprite,
        importSprite,
        spriteList,
        currentSpriteIndex,
        colorList
    }, {
        showImportOverlay,
        filter
    }) {
        let filterInput = textbox({
            className: 'initial-focus',
            placeholder: 'search sprites',
            value: filter,
            onchange: e => this.setState({ filter: e.target.value })
        })

        // TODO: add clear filter button

        let spriteButtonList = spriteList
            // remember original indices
            .map((sprite, i) => ({ sprite, i }))
            // apply filter
            .filter(({ sprite }) =>
                filter ? sprite.name.includes(filter) : true
            )
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
                    onclick: () => selectSprite(i, 'sprite'),
                    sprite,
                    colorList,
                    isSelected: (i === currentSpriteIndex)
                })
            )

        let editSpriteButton = !editSprite ? null :
            button({ onclick: editSprite }, 'edit sprite')

        let addSpriteButton = !addSprite ? null :
            button({ onclick: addSprite }, 'add sprite')

        let importSpriteButton = !importSprite ? null :
            button({
                onclick: () => this.setState({ showImportOverlay: true })
            }, 'import sprite')

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

        return div({ className: 'spritelist' }, [
            div({ className: 'spritelist-filter' }, [
                filterInput,
                importSpriteButton ? menu({}, importSpriteButton) : null
            ]),
            div({ className: 'spritelist-actions' }, [
                editSpriteButton,
                addSpriteButton
            ]),
            div({ className: 'spritelist-sprites' }, [
                spriteButtonList
            ]),
            importOverlay
        ])
    }
}