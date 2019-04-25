let Behavior = {

    addEvent: (that, spriteIndex) => {
        let spriteList = that.state.spriteList.slice()
        let sprite = spriteList[spriteIndex]
        sprite.behaviorList = sprite.behaviorList.slice()

        let eventNameIndex = 1
        while (sprite.behaviorList.find(b => b.event === 'event ' + eventNameIndex)) {
            eventNameIndex++
        }

        let newBehavior = {
            event: 'event ' + eventNameIndex,
            actionList: []
        }
        sprite.behaviorList.push(newBehavior)
        that.setState({ spriteList })
    },

    renameEvent: (that, spriteIndex, event, newName) => {
        let spriteList = that.state.spriteList.slice()
        let sprite = spriteList[spriteIndex]
        sprite.behaviorList = sprite.behaviorList.slice()
        let behavior = sprite.behaviorList.find(b => b.event === event)
        if (!behavior) return

        if (newName === '') {
            that.setState({
                showErrorOverlay: true,
                errorMessage: `an event's name can't be empty!`
            })
        } else if (sprite.behaviorList.find(b => b.event === newName)) {
            that.setState({
                showErrorOverlay: true,
                errorMessage: `event "${newName}" already exists for this sprite`
            })
        } else {
            behavior.event = newName
            that.setState({ spriteList })
        }
    },

    removeEvent: (that, spriteIndex, event) => {
        let spriteList = that.state.spriteList.slice()
        let sprite = spriteList[spriteIndex]
        sprite.behaviorList = sprite.behaviorList.slice()
        let behaviorIndex = sprite.behaviorList.findIndex(b => b.event === event)
        if (behaviorIndex < 0) return

        sprite.behaviorList.splice(behaviorIndex, 1)
        that.setState({ spriteList })
    },

    createAction: (type) => {
        let action
        if (type === 'dialog') {
            action = {
                type,
                text: 'hello'
            }
        }
        else if (type === 'give_item') {
            action = {
                type,
                isGiving: true,
                spriteName: null,
                quantity: 1
            }
        }
        else if (type === 'transform_self') {
            action = {
                type,
                spriteName: null
            }
        }
        else if (type === 'move_avatar') {
            action = {
                type,
                roomIndex: 0,
                tileX: 0,
                tileY: 0
            }
        }
        else if (type === 'remove_self') {
            action = {
                type
            }
        }
        else if (type === 'trigger_event') {
            action = {
                type,
                eventName: ''
            }
        }
        else if (type === 'conditional') {
            action = {
                type,
                comparison: '=',
                spriteName: null,
                quantity: 10,
                actionList: []
            }
        }
        else if (type === 'sequence') {
            action = {
                type,
                isLooping: true,
                isShuffled: false,
                actionList: []
            }
        }
        return action
    },

    addAction: (that, spriteIndex, event) => {
        let spriteList = that.state.spriteList.slice()
        let sprite = spriteList[spriteIndex]
        sprite.behaviorList = sprite.behaviorList.slice()
        let behavior = sprite.behaviorList.find(b => b.event === event)
        if (!behavior) return

        behavior.actionList = behavior.actionList.slice()
        behavior.actionList.push(
            Behavior.createAction('dialog')
        )
        that.setState({ spriteList })
    },

    updateAction: (that, spriteIndex, event, actionIndex, propList) => {
        let spriteList = that.state.spriteList.slice()
        let sprite = spriteList[spriteIndex]
        sprite.behaviorList = sprite.behaviorList.slice()
        let behavior = sprite.behaviorList.find(b => b.event === event)
        if (!behavior) return

        let action = behavior.actionList[actionIndex]

        Object.keys(propList).forEach(prop => {
            let value = propList[prop]
            if (prop === 'type') {
                action = Behavior.createAction(value)
            }
            else {
                action[prop] = value
            }
        })
        
        behavior.actionList[actionIndex] = action
        that.setState({ spriteList })
    },

    removeAction: (that, spriteIndex, event, actionIndex) => {
        let spriteList = that.state.spriteList.slice()
        let sprite = spriteList[spriteIndex]
        sprite.behaviorList = sprite.behaviorList.slice()
        let behavior = sprite.behaviorList.find(b => b.event === event)
        if (!behavior) return

        behavior.actionList.splice(actionIndex, 1)
        that.setState({ spriteList })
    }

}
