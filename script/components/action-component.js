class ActionComponent extends Component {
    render({ world, action, path, set, delAction, openSpriteList, openRoomPicker }) {
        let triggerComponent = h(TriggerComponent, {
            set, delAction,
            trigger: action.trigger,
            path: path + '.trigger'
        })

        let eventComponent = h(EventComponent, {
            world, set, openSpriteList, openRoomPicker,
            event: action.event,
            path: path + '.event'
        })

        return div({ class: 'action' }, [
            triggerComponent,
            eventComponent
        ])
    }
}

class TriggerComponent extends Component {
    render({ trigger, path, set, delAction }) {
        let triggerTypeDropdown = dropdown({
            value: trigger.type,
            onchange: x => set(path, Trigger.setType(trigger, x))
        }, [
            option({ value: 'push' }, 'when pushed'),
            option({ value: 'receive_message' }, 'when message received')
        ])

        let triggerSettings = [
            triggerTypeDropdown
        ]

        if (trigger.type === 'push') {
            triggerSettings.push(
                div({ class: 'filler' })
            )
        }
        else if (trigger.type === 'receive_message') {
            triggerSettings.push(
                textbox({
                    value: trigger.message,
                    onchange: x => set(path + '.message', x)
                })
            )
        }

        let delButton = delAction ? h(ConfirmComponent, {
            class: 'icon',
            description: 'delete action?',
            onconfirm: delAction
        }, '×') : null
        triggerSettings.push(delButton)

        return div({ class: 'trigger button-row' }, triggerSettings)
    }
}

class EventComponent extends Component {
    render({ world, event, path, set, delEvent, openSpriteList, openRoomPicker }) {
        if (!event || !event.type) return buttonRow([button({
            class: 'simple',
            onclick: () => set(path, Event.new('dialog'))
        }, 'create event')])

        let delButton = delEvent ? h(ConfirmComponent, {
            class: 'icon',
            description: 'delete event?',
            onconfirm: delEvent
        }, '×') : null

        let eventTypeDropdown = dropdown({
            value: event.type,
            onchange: x => set(path, Event.setType(event, x))
        }, [
            option({ value: 'dialog' }, 'say something'),
            option({ value: 'give_item' }, 'give/take an item'),
            option({ value: 'move_avatar' }, 'move avatar'),
            option({ value: 'transform_self' }, 'transform sprite'),
            option({ value: 'remove_self' }, 'remove sprite'),
            option({ value: 'send_message' }, 'send message'),
            option({ value: 'sequence' }, 'sequence'),
            option({ value: 'branch' }, 'branching')
        ])

        let standardHeader = buttonRow([
            eventTypeDropdown,
            div({ class: 'filler' }),
            delButton
        ])

        let eventSettings
        if (event.type === 'dialog') {
            eventSettings = [
                standardHeader,
                div({}, [
                    textarea({
                        value: event.text,
                        onchange: x => set(path + '.text', x)
                    }),
                    h(DialogComponent, { 
                        font: world.font,
                        string: event.text,
                        width: world.roomWidth * world.spriteWidth
                    })
                ])
            ]
        }
        else if (event.type === 'give_item') {
            eventSettings = [
                standardHeader,
                buttonRow([
                    button({
                        class: 'sprite-button',
                        onclick: () => openSpriteList(event.spriteId, id => set(path + '.spriteId', id))
                    },
                        h(SpriteComponent, {
                            sprite: world.sprites[event.spriteId],
                            palette: world.palettes[0]
                        })
                    ),
                    button({
                        onclick: () => set(path + '.isGiving', !event.isGiving)
                    }, event.isGiving ? 'give to avatar' : 'take from avatar'),
                    numbox({
                        value: event.quantity,
                        min: 0,
                        onchange: x => set(path + '.quantity', x)
                    })
                ])
            ]
        }
        else if (event.type === 'move_avatar') {
            let roomX = Math.floor(event.roomId % world.worldWidth)
            let roomY = Math.floor(event.roomId / world.worldWidth)
            eventSettings = [
                standardHeader,
                buttonRow([
                    div({}, 'to'),
                    button({ onclick: () => openRoomPicker(
                        event.roomId,
                        event.x,
                        event.y,
                        (roomId, x, y) => {
                            let newEvent = clone(event)
                            newEvent.roomId = roomId
                            newEvent.x = x
                            newEvent.y = y
                            set(path, newEvent)
                        }
                    )}, `room (${roomX}, ${roomY}) | tile (${event.x}, ${event.y})`)
                ])
            ]
        }
        else if (event.type === 'transform_self') {
            eventSettings = buttonRow([
                eventTypeDropdown,
                div({}, 'into'),
                button({
                    class: 'sprite-button',
                    onclick: () => openSpriteList(event.spriteId, id => set(path + '.spriteId', id))
                },
                    h(SpriteComponent, {
                        sprite: world.sprites[event.spriteId],
                        palette: world.palettes[0]
                    })
                ),
                div({ class: 'filler' }),
                delButton
            ])
        }
        else if (event.type === 'remove_self') {
            eventSettings = standardHeader
        }
        else if (event.type === 'send_message') {
            eventSettings = buttonRow([
                eventTypeDropdown,
                textbox({
                    value: event.message,
                    onchange: x => set(path + '.message', x)
                }),
                div({ class: 'filler' }),
                delButton
            ])
        }
        else if (event.type === 'sequence') {
            let sequenceTypeDropdown = dropdown({
                value: event.sequenceType,
                onchange: x => set(path + '.sequenceType', x)
            }, [
                option({ value: 'loop' }, 'loop'),
                option({ value: 'linear' }, 'linear'),
                option({ value: 'shuffle' }, 'shuffle'),
                option({ value: 'simultaneous'}, 'all at once')
            ])
            let addEventButton = button({
                class: 'simple wide',
                onclick: () => set(path, Event.addEvent(clone(event), 'events'))
            }, 'add event')
            let eventList = event.events.map((e, i) =>
                h(EventComponent, {
                    world, set, openSpriteList, openRoomPicker,
                    event: e,
                    path: path + '.events.' + i,
                    delEvent: () => set(path, Event.delEvent(clone(event), 'events', i))
                })
            )
            eventSettings = [
                buttonRow([
                    eventTypeDropdown,
                    sequenceTypeDropdown,
                    div({ class: 'filler' }),
                    delButton
                ]),
                div({}, [
                    div({ class: 'event-list' }, eventList),
                    addEventButton
                ])
            ]
        }
        else if (event.type === 'branch') {
            eventSettings = [
                standardHeader,
                h(ConditionComponent, {
                    world, set, openSpriteList,
                    condition: event.condition,
                    path: path + '.condition',
                }),
                div({}, [
                    div({}, 'then'),
                    div({ class: 'event-list' }, h(EventComponent, {
                        world, set, openSpriteList, openRoomPicker,
                        event: event.trueEvent,
                        path: path + '.trueEvent'
                    }))
                ]),
                div({}, [
                    div({}, 'else'),
                    div({ class: 'event-list' }, h(EventComponent, {
                        world, set, openSpriteList, openRoomPicker,
                        event: event.falseEvent,
                        path: path + '.falseEvent'
                    }))
                ])
            ]
        }
        
        return div({ class: 'event' },
            eventSettings
        )
    }
}

class ConditionComponent extends Component {
    render({ world, condition, path, set, delCondition, openSpriteList }) {
        // let delButton = delCondition ? h(ConfirmComponent, {
        //     class: 'icon',
        //     description: 'delete condition?',
        //     onconfirm: delCondition
        // }, '×') : null

        // let conditionTypeDropdown = dropdown({
        //     value: condition.type,
        //     onchange: x => set(path, Condition.setType(condition, x))
        // }, [
        //     option({ value: 'item_comparison' }, 'inventory check'),
        //     option({ value: 'any' }, 'any'),
        //     option({ value: 'all' }, 'all'),
        //     option({ value: 'none' }, 'none')
        // ])
        
        // let standardHeader = buttonRow([
        //     conditionTypeDropdown,
        //     div({ class: 'filler' }),
        //     delButton
        // ])

        let conditionSettings
        if (condition.type === 'item_comparison') {
            let itemButton = button({
                class: 'sprite-button',
                onclick: () => openSpriteList(condition.spriteId, id => set(path + '.spriteId', id))
            },
                h(SpriteComponent, {
                    sprite: world.sprites[condition.spriteId],
                    palette: world.palettes[0]
                })
            )
            let operatorDropdown = dropdown({
                value: condition.operator,
                onchange: x => set(path + '.operator', x)
            }, [
                option({ value: '=' }, '='),
                option({ value: '>' }, '>'),
                option({ value: '>=' }, '≥'),
                option({ value: '<' }, '<'),
                option({ value: '<=' }, '≤'),
                option({ value: '!=' }, '≠')
            ])
            let valueTextbox = numbox({
                value: condition.value,
                onchange: x => set(path + '.value', x)
            })
            conditionSettings = [
                // standardHeader,
                div({}, 'if inventory has'),
                buttonRow([
                    itemButton,
                    operatorDropdown,
                    valueTextbox
                ])
            ]
        }
        // else {
        //     conditionSettings = standardHeader
        // }

        return div({ class: 'condition' },
            conditionSettings
        )
    }
}