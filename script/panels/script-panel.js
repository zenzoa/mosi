class ScriptListPanel extends Component {
    constructor(props) {
        super()

        this.state = { scriptId: null }

        this.renderScript = (script, id) => {
            let contents = [h('div', { class: 'script-header' }, SCRIPT_TYPES[script.type].icon)]

            if (script.type === 'dialog') {
                contents.push(h('div', { class: 'script-text' }, script.text))
            } else if (script.type === 'ending') {
                contents.push(h('div', { class: 'script-text' }, script.text))
            } else if (script.type === 'doorway') {
            } else if (script.type === 'item') {
                let label = ''
                label += script.give ? 'give ' : 'take '
                label += script.number + ' '
                let spriteName = this.props.getData(['sprites', script.itemId, 'name'])
                if (script.itemId < 0) spriteName = '??'
                else if (!spriteName) spriteName = 'item #' + script.itemId
                label += spriteName
                contents.push(h('div', { class: 'script-text' }, label))
            } else if (script.type === 'branch') {
            } else if (script.type === 'sequence') {
            } else if (script.type === 'loop') {
            } else if (script.type === 'shuffle') {
            }

            return h(Button, {
                class: 'script',
                onclick: () => this.setState({ scriptId: id})
            }, contents)
        }

        this.addScript = () => {
            let newScript = {
                type: 'dialog',
                text: ''
            }
            let newScripts = this.scripts.concat([newScript])
            this.props.setData(['sprites', this.props.spriteId, 'scripts'], newScripts)
            this.setState({ scriptId: this.scripts.length })
        }

        this.updateScript = (id, property, value) => {
            if (property === 'type') {
                let script = { type: value }
                if (value === 'dialog') {
                    script.text = this.scripts[id].text || ''
                } else if (value === 'ending') {
                    script.text = this.scripts[id].text || ''
                } else if (value === 'doorway') {
                } else if (value === 'item') {
                    script.give = true
                    script.number = 1
                    let itemId = this.props.spriteId
                    if (!this.sprite.item) itemId = this.props.world.sprites.findIndex((sprite) => sprite.item)
                    script.itemId = itemId
                } else if (value === 'branch') {
                } else if (value === 'sequence') {
                } else if (value === 'loop') {
                } else if (value === 'shuffle') {
                }
                this.props.setData(['sprites', this.props.spriteId, 'scripts', id], script)
            } else {
                this.props.setData(['sprites', this.props.spriteId, 'scripts', id, property], value)
            }
        }

        this.removeScript = (id) => {
            let newScripts = this.scripts.slice(0, id).concat(this.scripts.slice(id + 1))
            this.props.setData(['sprites', this.props.spriteId, 'scripts'], newScripts)
            this.setState({ scriptId: null })
        }
    }

    render(props, state) {
        this.sprite = props.getData(['sprites', props.spriteId])
        this.scripts = this.sprite && this.sprite.scripts

        if (this.scripts.length === 0) this.addScript()

        if (state.scriptId != null) {
            return h(ScriptPanel, {
                script: this.scripts[state.scriptId],
                update: (property, value) => this.updateScript(state.scriptId, property, value),
                remove: () => this.removeScript(state.scriptId),
                back: () => this.setState({ scriptId: null })
            })
        }

        let scriptList = this.scripts.map(this.renderScript)

        let newScriptButton = h(Button, { onclick: this.addScript }, 'add script')

        let backButton = h(BackButton, { onclick: props.back })

        return h(Panel, {
            header: [backButton, h(Filler)],
            content: scriptList,
            footer: [newScriptButton]
        })

    }
}

class ScriptPanel extends Component {
    constructor() {
        super()
    }

    render(props, state) {
        let script = props.script
        let update = props.update

        let contents = null
        if (script.type === 'dialog') {
            contents = h(DialogScriptPanel, { script, update })
        } else if (script.type === 'ending') {
            contents = h(EndingScriptPanel, { script, update })
        } else if (script.type === 'doorway') {
            contents = h(DoorwayScriptPanel, { script, update })
        } else if (script.type === 'item') {
            contents = h(ItemScriptPanel, { script, update })
        } else if (script.type === 'branch') {
        } else if (script.type === 'sequence') {
        } else if (script.type === 'loop') {
        } else if (script.type === 'shuffle') {
        }

        let typeButton = h(ButtonRow, null, h(ScriptTypeModal, {
            type: script.type,
            updateType: (type) => update('type', type)
        }))

        let removeButton = h(RemoveButton, {
            onclick: props.remove
        }, 'remove')

        let backButton = h(BackButton, { onclick: props.back })

        let moreActions = h(MoreActions, null, [removeButton])

        return h(Panel, {
            header: [backButton, h(Filler), moreActions],
            content: [contents]
        })
    }
}

class DialogScriptPanel extends Component {
    render(props, state) {
        let dialog = h(BigTextbox, {
            label: 'say',
            text: props.script.text,
            onchange: (value) => props.update('text', value)
        })

        let preview

        return h('div', null, [dialog])
    }
}

class EndingScriptPanel extends Component {
    render(props, state) {
        let dialog = h(BigTextbox, {
            label: 'say',
            text: props.script.text,
            onchange: (value) => props.update('text', value)
        })

        let preview

        return h('div', null, [dialog])
    }
}

class DoorwayScriptPanel extends Component {
    render(props, state) {
        let room
        let x
        let y

        let preview

        return h('div', null, [])
    }
}

class ItemScriptPanel extends Component {
    render(props, state) {
        let giveButton = h(Toggle, {
            value: props.script.give,
            onchange: () => props.update('give', true)
        }, 'give')

        let takeButton = h(Toggle, {
            value: !props.script.give,
            onchange: () => props.update('give', false)
        }, 'take')

        let giveOrTake = h(ButtonRow, null, [giveButton, takeButton])

        let number = h(Textbox, {
            label: 'number of items',
            type: 'number',
            step: 1,
            min: 0,
            text: props.script.number,
            onchange: (value) => props.update('number', value)
        })

        let item = h(Textbox, {
            label: 'item id',
            text: props.script.itemId,
            onchange: (value) => props.update('itemId', value)
        })

        return h('div', null, [giveOrTake, number, item])
    }
}

class ScriptTypeModal extends Component {
    constructor(props) {
        super()
        this.state = { open: props.open }
        this.open = () => this.setState({ open: true })
        this.close = () => this.setState({ open: false })
        this.choose = (type) => {
            this.props.updateType(type)
            this.close()
        }
    }

    render(props, state) {
        let options = [
            h(Button, { onclick: () => this.choose('dialog') }, SCRIPT_TYPES['dialog'].label),
            h(Button, { onclick: () => this.choose('doorway') }, SCRIPT_TYPES['doorway'].label),
            h(Button, { onclick: () => this.choose('ending') }, SCRIPT_TYPES['ending'].label),
            h(Button, { onclick: () => this.choose('item') }, SCRIPT_TYPES['item'].label),
            // h('hr'),
            // h(Button, { onclick: () => this.choose('branch') }, SCRIPT_TYPES['branch'].label),
            // h(Button, { onclick: () => this.choose('sequence') }, SCRIPT_TYPES['sequence'].label),
            // h(Button, { onclick: () => this.choose('loop') }, SCRIPT_TYPES['loop'].label),
            // h(Button, { onclick: () => this.choose('shuffle') }, SCRIPT_TYPES['shuffle'].label)
        ]

        let buttonOpen = h(Button, { onclick: this.open }, SCRIPT_TYPES[props.type].label)
        let buttonClose = h(CloseButton, { onclick: this.close })
        let modal = h(Modal, { open: true }, [ buttonClose, options ])
        return state.open ? modal : buttonOpen
    }
}

let SCRIPT_TYPES = {
    dialog: { icon: '🗩', label: '🗩 dialog' },
    doorway: { icon: '◨', label: '◨ doorway' },
    ending: { icon: '⚑', label: '⚑ ending' },
    item: { icon: '❤', label: '❤ give/take item' },
    branch: { icon: '⤙', label: '⤙ branch' },
    sequence: { icon: '⇢', label: '⇢ sequence' },
    loop: { icon: '⟳', label: '⟳ loop' },
    shuffle: { icon: '↝', label: '↝ shuffle' }
}