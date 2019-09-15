class BehaviorPanel extends Component {
    constructor() {
        super()
        this.state = {
            currentBehaviorIndex: 0
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentSpriteIndex !== this.props.currentSpriteIndex) {
            this.setState({ currentBehaviorIndex: 0 })
        }
    }

    render ({
        backButton,
        closeTab,
        addEvent,
        renameEvent,
        removeEvent,
        addAction,
        updateAction,
        removeAction,
        spriteList,
        currentSpriteIndex
    }, {
        currentBehaviorIndex,
        showRemoveEventOverlay
    }) {
        let sprite = spriteList[currentSpriteIndex]
        if (!sprite) return
        let behaviorList = sprite.behaviorList
        let currentBehavior = behaviorList[currentBehaviorIndex]

        let eventDropdown = dropdown({
            className: 'simple',
            value: currentBehaviorIndex,
            onchange: e => {
                if (e.target.value === 'add') {
                    this.setState({
                        currentBehaviorIndex: behaviorList.length
                    })
                    addEvent()
                } else {
                    this.setState({ 
                        currentBehaviorIndex: e.target.value
                    })
                }
            }
        }, behaviorList
            // remember original indices
            .map((behavior, i) => ({ behavior, i }))
            // sort alphabetically
            .sort((b1, b2) => {
                if (b1.behavior.event === 'push') return -1
                if (b2.behavior.event === 'push') return 1
                let name1 = b1.behavior.event.toUpperCase()
                let name2 = b2.behavior.event.toUpperCase()
                if (name1 < name2) return -1
                if (name1 > name2) return 1
                else return 0
            })
            // convert to options
            .map(({ behavior, i }) =>
                option({ value: i }, 'on ' + behavior.event)
            )
            // include 'add event' option
            .concat([
                option({ value: 'add' }, '[ add event ]')
            ])
        )

        let eventTextbox = currentBehavior.event === 'push' ? null :
            textbox({
                placeholder: 'event name',
                value: currentBehavior.event,
                onchange: e => renameEvent(currentBehavior.event, e.target.value)
            })

        let removeEventButton = currentBehavior.event === 'push' ? null :
            iconButton({
                title: 'remove event',
                onclick: () => this.setState({ showRemoveEventOverlay: true }),
            }, 'delete')

        let removeEventOverlay = !showRemoveEventOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove event?',
                closeOverlay: () => this.setState({ showRemoveEventOverlay: false }),
                remove: () => {
                    removeEvent(currentBehavior.event)
                    this.setState({
                        currentBehaviorIndex: 0,
                        showRemoveEventOverlay: false
                    })
                }
            })

        let actionComponents = currentBehavior.actionList.map((action, i) => {
            return h(BehaviorComponent, {
                ...this.props,
                action,
                updateAction: (newAction) => updateAction(currentBehavior.event, i, newAction),
                removeAction: () => removeAction(currentBehavior.event, i),
                firstAction: i === 0
            })
        })

        let addActionButton = iconButton({
            title: 'add action',
            className: currentBehavior.actionList.length === 0 ? 'initial-focus' : '',
            onclick: () => addAction(currentBehavior.event)
        }, 'add')

        if (sprite.isAvatar) {
            return panel({ header: 'behaviors', closeTab }, [
                div({}, 'avatar behavior is controlled by the player')
            ])
        }

        return panel({ header: 'behaviors', className: 'sprite-panel', closeTab }, [
            row([
                backButton,
                eventDropdown,
                eventTextbox,
                removeEventButton
            ]),
            hr(),
            actionComponents,
            row([
                fill(),
                addActionButton
            ]),
            removeEventOverlay
        ])
    }
}

class BehaviorComponent extends Component {
    constructor() {
        super()

        this.spriteOverlay = (spriteIndex, propName) => {
            let { updateAction, spriteList, colorList } = this.props
            return h(SpriteListOverlay, {
                closeOverlay: () => this.setState({ showSpriteOverlay: false }),
                selectSprite: newSpriteIndex => {
                    let newSprite = spriteList[newSpriteIndex]
                    let newProps = {}
                    newProps[propName] = newSprite.name
                    updateAction(newProps)
                    this.setState({ showSpriteOverlay: false })
                },
                spriteList,
                currentSpriteIndex: spriteIndex,
                colorList,
                hideAvatar: true
            })
        }

        this.worldOverlay = (currentRoomIndex, propName) => {
            let {
                updateAction,
                roomList,
                roomWidth,
                roomHeight,
                worldWidth,
                worldHeight,
                spriteList,
                paletteList
            } = this.props
            return h(RoomPickerOverlay, {
                closeOverlay: () => this.setState({ showWorldOverlay: false }),
                selectRoom: (newRoomIndex) => {
                    let newProps = {}
                    newProps[propName] = newRoomIndex
                    updateAction(newProps)
                    this.setState({ showWorldOverlay: false })
                },
                currentRoomIndex,
                roomList,
                roomWidth,
                roomHeight,
                worldWidth,
                worldHeight,
                spriteList,
                paletteList
            })
        }

        this.roomOverlay = (roomIndex, tileX, tileY, propX, propY) => {
            let {
                updateAction,
                roomList,
                roomWidth,
                roomHeight,
                spriteWidth,
                spriteHeight,
                spriteList,
                paletteList
            } = this.props
            let room = roomList[roomIndex]
            let palette = paletteList.find(p => p.name === room.paletteName)
            let colorList = palette.colorList

            return h(TilePickerOverlay, {
                closeOverlay: () => this.setState({ showRoomOverlay: false }),
                selectTile: (x, y) => {
                    let newProps = {}
                    newProps[propX] = x
                    newProps[propY] = y
                    updateAction(newProps)
                    this.setState({ showRoomOverlay: false })
                },
                selectedX: tileX,
                selectedY: tileY,
                roomWidth,
                roomHeight,
                spriteWidth,
                spriteHeight,
                spriteList,
                tileList: room.tileList,
                colorList
            })
        }

        this.addSubAction = (propName) => {
            let { action, updateAction } = this.props
            let actionList = action[propName].slice()
            let newSubAction = Behavior.createAction('dialog')
            actionList.push(newSubAction)
            let newProps = {}
            newProps[propName] = actionList
            updateAction(newProps)
        }

        this.updateSubAction = (propName, actionIndex, propList) => {
            let { action, updateAction } = this.props
            let actionList = action[propName].slice()
            let subAction = actionList[actionIndex]

            Object.keys(propList).forEach(prop => {
                let value = propList[prop]
                if (prop === 'type') {
                    subAction = Behavior.createAction(value)
                }
                else {
                    subAction[prop] = value
                }
            })

            actionList[actionIndex] = subAction
            let newProps = {}
            newProps[propName] = actionList
            updateAction(newProps)
        }

        this.removeSubAction = (propName, actionIndex) => {
            let { action, updateAction } = this.props
            let actionList = action[propName].slice()
            actionList.splice(actionIndex, 1)
            let newProps = {}
            newProps[propName] = actionList
            updateAction(newProps)
        }
    }

    renderDialog() {
        let { action, updateAction } = this.props
        return [
            textarea({
                value: action.text,
                onchange: e => updateAction({ text: e.target.value })
            })
        ]
    }

    renderGiveItem() {
        let { action, updateAction, spriteList, colorList } = this.props
        let spriteIndex = spriteList.findIndex(s => s.name === action.spriteName)
        let sprite = spriteList[spriteIndex]

        let currentSpriteButton = sprite ?
            spriteButton({
                onclick: () => this.setState({ showSpriteOverlay: true }),
                sprite,
                colorList
            })
            : button({
                onclick: () => this.setState({ showSpriteOverlay: true })
            }, 'choose sprite')

        let spriteOverlay = !this.state.showSpriteOverlay ? null :
            this.spriteOverlay(spriteIndex, 'spriteName')

        return row([
            button({
                onclick: e => updateAction({ isGiving: !action.isGiving })
            }, action.isGiving ? 'add to inventory' : 'take from inventory'),
            numbox({
                min: 0,
                value: action.quantity,
                onchange: e => updateAction({ quantity: parseInt(e.target.value) })
            }),
            currentSpriteButton,
            spriteOverlay
        ])
    }

    renderMoveAvatar() {
        let { action, roomList } = this.props
        let room = roomList[action.roomIndex]

        let currentRoomButton = button({
            onclick: () => this.setState({ showWorldOverlay: true })
        }, room.name)

        let currentTileButton = button({
            onclick: () => this.setState({ showRoomOverlay: true })
        }, 'tile: ' + action.tileX + ', ' + action.tileY)

        let worldOverlay = !this.state.showWorldOverlay ? null :
            this.worldOverlay(action.roomIndex, 'roomIndex')

        let roomOverlay = !this.state.showRoomOverlay ? null :
            this.roomOverlay(action.roomIndex, action.tileX, action.tileY, 'tileX', 'tileY')

        return [
            row([
                currentRoomButton,
                currentTileButton
            ]),
            worldOverlay,
            roomOverlay
        ]
    }

    renderTransformSelf() {
        let { action, spriteList, colorList } = this.props
        let spriteIndex = spriteList.findIndex(s => s.name === action.spriteName)
        let sprite = spriteList[spriteIndex]

        let currentSpriteButton = sprite ?
            spriteButton({
                onclick: () => this.setState({ showSpriteOverlay: true }),
                sprite,
                colorList
            })
            : button({
                onclick: () => this.setState({ showSpriteOverlay: true })
            }, 'choose sprite')

        let spriteOverlay = !this.state.showSpriteOverlay ? null :
            this.spriteOverlay(spriteIndex, 'spriteName')

        return row([
            currentSpriteButton,
            spriteOverlay
        ])
    }

    renderRemoveSelf() {
        return []
    }

    renderTriggerEvent() {
        let { action, updateAction } = this.props
        return [
            textbox({
                placeholder: 'event name',
                value: action.eventName,
                onchange: e => updateAction({ eventName: e.target.value })
            })
        ]
    }

    renderSequence() {
        let { action, updateAction } = this.props

        let loopButton = button({
            className: 'toggle' + (action.isLooping ? ' selected' : ''),
            onclick: () => updateAction({ isLooping: !action.isLooping })
        }, 'loop')

        let shuffleButton = button({
            className: 'toggle' + (action.isShuffled ? ' selected' : ''),
            onclick: () => updateAction({ isShuffled: !action.isShuffled })
        }, 'shuffle')

        let actionComponents = action.actionList.map((subAction, i) => {
            return h(BehaviorComponent, {
                ...this.props,
                updateAction: (newAction) => this.updateSubAction('actionList', i, newAction),
                removeAction: () => this.removeSubAction('actionList', i),
                action: subAction
            })
        })

        let addActionButton = iconButton({
            onclick: () => this.addSubAction('actionList')
        }, 'add')

        return [
            row([
                loopButton,
                shuffleButton
            ]),
            div({ className: 'behaviorList' }, [
                actionComponents,
                row([
                    fill(),
                    addActionButton
                ])
            ])
        ]
    }

    renderConditional() {
        let { action, updateAction, spriteList, colorList } = this.props
        let spriteIndex = spriteList.findIndex(s => s.name === action.spriteName)
        let sprite = spriteList[spriteIndex]

        let currentSpriteButton = sprite ?
            spriteButton({
                onclick: () => this.setState({ showSpriteOverlay: true }),
                sprite,
                colorList
            })
            : button({
                onclick: () => this.setState({ showSpriteOverlay: true })
            }, 'choose sprite')

        let spriteOverlay = !this.state.showSpriteOverlay ? null :
            this.spriteOverlay(spriteIndex, 'spriteName')

        let comparisonDropdown = dropdown({
            value: action.comparison,
            onchange: e => updateAction({ comparison: e.target.value })
        }, [
            option({ value: '<=' }, 'no more than'),
            option({ value: '<' }, 'less than'),
            option({ value: '=' }, 'equal to'),
            option({ value: '!=' }, 'not equal to'),
            option({ value: '>' }, 'more than'),
            option({ value: '>=' }, 'at least')
        ])

        let quantityNumbox = numbox({
            min: 0,
            value: action.quantity,
            onchange: e => updateAction({ quantity: parseInt(e.target.value) })
        })

        let actionComponents = action.actionList.map((subAction, i) => {
            return h(BehaviorComponent, {
                ...this.props,
                updateAction: (newAction) => this.updateSubAction('actionList', i, newAction),
                removeAction: () => this.removeSubAction('actionList', i),
                action: subAction
            })
        })

        let addActionButton = iconButton({
            onclick: () => this.addSubAction('actionList')
        }, 'add')

        return [
            row([
                currentSpriteButton,
                comparisonDropdown,
                quantityNumbox
            ]),
            div({ className: 'behaviorList' }, [
                actionComponents,
                row([
                    fill(),
                    addActionButton
                ])
            ]),
            spriteOverlay
        ]
    }

    render({
        updateAction,
        removeAction,
        action,
        firstAction
    }, {
        showRemoveOverlay
    }) {

        let actionTypeDropdown = dropdown({
            className: 'simple',
            value: action.type,
            onchange: e => updateAction({ type: e.target.value })
        }, [
            option({ value: 'dialog' }, 'dialog'),
            option({ value: 'give_item' }, 'give/take item'),
            option({ value: 'move_avatar' }, 'move avatar'),
            option({ value: 'transform_self' }, 'transform self'),
            option({ value: 'remove_self' }, 'remove self'),
            option({ value: 'trigger_event' }, 'trigger event'),
            option({ value: 'sequence' }, 'sequence'),
            option({ value: 'conditional' }, 'conditional')
        ])

        let removeButton = iconButton({
            title: 'remove action',
            onclick: () => this.setState({ showRemoveOverlay: true }),
        }, 'delete')

        let removeOverlay = !showRemoveOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove action?',
                closeOverlay: () => this.setState({ showRemoveOverlay: false }),
                remove: () => {
                    removeAction()
                    this.setState({ showRemoveOverlay: false })
                }
            })

        let actionSettings
        if (action.type === 'dialog') {
            actionSettings = this.renderDialog()
        }
        else if (action.type === 'give_item') {
            actionSettings = this.renderGiveItem()
        }
        else if (action.type === 'move_avatar') {
            actionSettings = this.renderMoveAvatar()
        }
        else if (action.type === 'transform_self') {
            actionSettings = this.renderTransformSelf()
        }
        else if (action.type === 'remove_self') {
            actionSettings = this.renderRemoveSelf()
        }
        else if (action.type === 'trigger_event') {
            actionSettings = this.renderTriggerEvent()
        }
        else if (action.type === 'sequence') {
            actionSettings = this.renderSequence()
        }
        else if (action.type === 'conditional') {
            actionSettings = this.renderConditional()
        }

        return div({
            className: 'behavior' + (firstAction ? ' initial-focus' : ''),
            tabIndex: 0
        }, [
            row([
                actionTypeDropdown,
                removeButton
            ]),
            div({ className: 'behavior-settings' },
                actionSettings
            ),
            removeOverlay
        ])
    }
}
