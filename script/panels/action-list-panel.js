class ActionListPanel extends Panel {
    constructor() {
        super()
        this.state = {
            currentActionId: 0,
            actionPanelOpen: false
        }

        this.openSpriteList = (spriteId, selectSprite) => {
            this.setState({
                spriteListOpen: true,
                spriteId,
                selectSprite: id => {
                    this.setState({ spriteListOpen: false })
                    selectSprite(id)
                }
            })
        }

        this.openRoomPicker = (roomId, x, y, selectTile) => {
            this.setState({
                roomPickerProps: { roomId, x, y },
                roomPickerOpen: true,
                selectTile: (newRoomId, newX, newY) => {
                    this.setState({ roomPickerOpen: false })
                    selectTile(newRoomId, newX, newY)
                }
            })
        }
    }

    render({ world, sprite, path, set, undo, redo }) {
        if (this.state.spriteListOpen) {
            return h(SpriteListPanel, {
                world, set, undo, redo,
                selectedId: this.state.spriteId,
                selectSprite: this.state.selectSprite,
                back: () => this.setState({ spriteListOpen: false })
            })
        }

        if (this.state.roomPickerOpen) {
            return h(RoomPicker, {
                world,
                roomId: this.state.roomPickerProps.roomId,
                x: this.state.roomPickerProps.x,
                y: this.state.roomPickerProps.y,
                selectTile: this.state.selectTile,
                back: () => this.setState({ roomPickerOpen: false })
            })
        }

        let actionList = h(DragList, {
            class: 'action-list',
            noButtons: true,
            vertical: true,
            items: sprite.actions.map((action, actionId) => ({ index: actionId })),
            renderItem: (actionId, nodeSettings) => {
                let action = sprite.actions[actionId]
                return h(ActionComponent, {
                    world, action, set, undo, redo,
                    path: path + '.actions.' + actionId,
                    delAction: () => set(path, Sprite.delAction(clone(sprite), actionId)),
                    openSpriteList: this.openSpriteList,
                    openRoomPicker: this.openRoomPicker,
                    nodeSettings
                })
            },
            moveItem: (actionId, insertId) => {
                set(path + '.actions', reorderList(sprite.actions, actionId, insertId))
            }
        })

        let addActionButton = button({
            class: 'icon',
            onclick: () => {
                set(path, Sprite.addAction(clone(sprite)))
                this.setState({ currentActionId: sprite.actions.length, actionPanelOpen: true })
            }
        }, '+')

        return div({ class: 'panel action-list-panel' }, [
            buttonRow([
                this.backButton(),
                this.undoButton(),
                this.redoButton(),
                div({ class: 'filler' }),
                addActionButton
            ]),
            actionList
        ])
    }
}

let actionTypeLabels = {
    'dialog': 'say something',
    'give-item': 'give/take item',
    'move-avatar': 'move avatar',
    'send-message': 'send message',
    'remove-self': 'remove myself',
    'become-sprite': 'transform myself',
    'branch': 'branch',
    'sequence': 'sequence'
}