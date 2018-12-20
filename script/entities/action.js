class Action {
    static new() {
        return {
            trigger: Trigger.new('push'),
            event: Event.new('dialog')
        }
    }
 
    static import(obj, codeMap) {
        let action = Action.new()
        if (isObj(obj.trigger)) action.trigger = Trigger.import(obj.trigger)
        if (isObj(obj.event)) action.event = Event.import(obj.event, codeMap)
        return action
    }
 
    static export(action, codeMap) {
        return {
            trigger: Trigger.export(action.trigger),
            event: Event.export(action.event, codeMap)
        }
    }

    static relatedSpriteIds(action) {
        return Event.relatedSpriteIds(action.event)
    }

    static changeSpriteIndex(action, start, end, change) {
        action.event = Event.changeSpriteIndex(action.event, start, end, change)
        return action
    }
}
 
class Trigger {
    static new(type) {
        if (type === 'push') {
            return { type }
        }
        else if (type === 'receive_message') {
            return { type, message: 'ping' }
        }
    }
 
    static import(obj, overrideType) {
        let trigger = Trigger.new(overrideType || obj.type)
        if (!trigger) return Trigger.new('push')
       
        if (obj.type === 'receive_message') {
            if (isStr(obj.message)) trigger.message = obj.message
        }
       
        return trigger
    }
 
    static export(trigger) {
        return trigger
    }

    static setType(trigger, newType) {
        return Trigger.import(trigger, newType)
    }
}
 
class Event {
    static new(type) {
        if (type === 'dialog') {
            return { type, text: 'hello' }
        }
        else if (type === 'give_item') {
            return { type, isGiving: true, spriteId: 0, quantity: 1 }
        }
        else if (type === 'transform_self') {
            return { type, spriteId: 0 }
        }
        else if (type === 'move_avatar') {
            return { type, roomId: 0, x: 0, y:0 }
        }
        else if (type === 'remove_self') {
            return { type }
        }
        else if (type === 'send_message') {
            return { type, message: 'ping' }
        }
        else if (type === 'sequence') {
            return { type, sequenceType: 'loop', events: [] }
        }
        else if (type === 'branch') {
            return { type, condition: Condition.new(), trueEvent: null, falseEvent: null }
        }
    }
 
    static import(obj, codeMap, overrideType) {
        let event = Event.new(overrideType || obj.type)
        if (!event || !event.type) return Event.new('dialog')
 
        if (obj.type === 'dialog') {
            if (isStr(obj.text)) event.text = obj.text
        }
 
        else if (obj.type === 'give_item') {
            if (isBool(obj.isGiving)) event.isGiving = obj.isGiving
            if (isInt(obj.quantity)) event.quantity = obj.quantity
            if (isInt(obj.spriteId)) {
                if (codeMap) event.spriteId = codeMap[obj.spriteId]
                else event.spriteId = obj.spriteId
            }
        }
 
        else if (obj.type === 'transform_self') {
            if (isInt(obj.spriteId)) {
                if (codeMap) event.spriteId = codeMap[obj.spriteId]
                else event.spriteId = obj.spriteId
            }
        }
 
        else if (obj.type === 'move_avatar') {
            if (isInt(obj.roomId)) event.roomId = obj.roomId
            if (isInt(obj.x)) event.x = obj.x
            if (isInt(obj.y)) event.y = obj.y
        }

        else if (obj.type === 'send_message') {
            if (isStr(obj.message)) event.message = obj.message
        }
 
        else if (obj.type === 'sequence') {
            if (isStr(obj.sequenceType) && ['loop', 'shuffle', 'linear', 'simultaneous'].includes(obj.sequenceType)) {
                event.sequenceType = obj.sequenceType
            }
            if (isArr(obj.events)) {
                event.events = obj.events.map(e => Event.import(e, codeMap))
            }
        }
 
        else if (obj.type === 'branch') {
            if (isObj(obj.condition)) {
                event.condition = Condition.import(obj.condition, codeMap)
            }
            if (isObj(obj.trueEvent)) {
                event.trueEvent = Event.import(obj.trueEvent, codeMap)
            }
            if (isObj(obj.falseEvent)) {
                event.falseEvent = Event.import(obj.falseEvent, codeMap)
            }
        }
 
        return event
    }
 
    static export(event, codeMap) {
        if (!event || !event.type) return
        let exportEvent = clone(event)
        if (codeMap && (event.type === 'give_item' || event.type === 'transform_self')) {
            exportEvent.spriteId = codeMap[event.spriteId]
        }
        else if (event.type === 'sequence') {
            exportEvent.events = event.events.map(e => Event.export(e, codeMap))
        }
        else if (event.type === 'branch') {
            exportEvent.condition = Condition.export(event.condition, codeMap)
            exportEvent.trueEvent = Event.export(event.trueEvent, codeMap)
            exportEvent.falseEvent = Event.export(event.falseEvent, codeMap)
        }
        return exportEvent
    }
   
    static relatedSpriteIds(event) {
        let ids = []
 
        if (event.type === 'give_item') {
            ids.push(event.spriteId)
        }
 
        else if (event.type === 'transform_self') {
            ids.push(event.spriteId)
        }
 
        else if (event.type === 'sequence') {
            event.events.forEach(e => {
                ids = ids.concat(Event.relatedSpriteIds(e))
            })
        }
 
        else if (event.type === 'branch') {
            ids = ids.concat(Condition.relatedSpriteIds(event.condition))
            ids = ids.concat(Event.relatedSpriteIds(event.trueEvent))
            ids = ids.concat(Event.relatedSpriteIds(event.falseEvent))
        }
 
        return ids
    }

    static changeSpriteIndex(event, start, end, change) {
        if (event.type === 'give_item' || event.type === 'transform_self') {
            if (event.spriteId >= start && event.spriteId < end) {
                event.spriteId = change(event.spriteId)
            }
        }
        else if (event.type === 'sequence') {
            event.events = event.events.map(e => Event.changeSpriteIndex(e, start, end, change))
        }
        else if (event.type === 'branch') {
            event.condition = Condition.changeSpriteIndex(event.condition, start, end, change)
            event.trueEvent = Event.changeSpriteIndex(event.trueEvent, start, end, change)
            event.falseEvent = Event.changeSpriteIndex(event.falseEvent, start, end, change)
        }
        return event
    }

    static setType(event, newType) {
        return Event.import(event, null, newType)
    }

    static addEvent(event, key) {
        let newEvent = Event.new('dialog')
        event[key].push(newEvent)
        return event
    }

    static delEvent(event, key, id) {
        event[key].splice(id, 1)
        return event
    }
 
    static run(event, props) {
        if (!event || !event.type) return
        let { avatarTile, goalTile, spriteLocation, messages, inventory, setDialog, setRoomId } = props

        if (event.type === 'dialog') {
            if (setDialog) setDialog(event.text)
        }
 
        else if (event.type === 'give_item') {
            if (!inventory) return
            if (event.isGiving) {
                if (!inventory[event.spriteId]) inventory[event.spriteId] = 0
                inventory[event.spriteId] += event.quantity
            }
            else if (inventory[event.spriteId]) {
                inventory[event.spriteId] -= event.quantity
                if (inventory[event.spriteId] < 0) inventory[event.spriteId] = 0
            }
        }
 
        else if (event.type === 'transform_self') {
            if (!spriteLocation) return
            spriteLocation.spriteId = event.spriteId
        }
 
        else if (event.type === 'move_avatar') {
            if (!avatarTile || !goalTile || !setRoomId) return
            avatarTile.x = event.x
            avatarTile.y = event.y
            goalTile.x = event.x
            goalTile.y = event.y
            setRoomId(event.roomId)
        }
 
        else if (event.type === 'remove_self') {
            spriteLocation.removeMe = true
        }
 
        else if (event.type === 'send_message') {
            if (!messages) return
            messages.push(event.message)
        }
 
        else if (event.type === 'sequence') {
            if (event.sequenceType === 'simultaneous') {
                event.events.forEach(e => Event.run(e, props))
                return
            }
            let nextEvent
            if (event.sequenceType === 'linear') {
                if (!exists(event.index)) event.index = 0
                nextEvent = event.events[event.index]
                event.index++
                if (event.index > event.events.length - 1) event.index = event.events.length - 1
            }
            else if (event.sequenceType === 'loop') {
                if (!exists(event.index)) event.index = 0
                nextEvent = event.events[event.index]
                event.index++
                if (event.index > event.events.length - 1) event.index = 0
            }
            else if (event.sequenceType === 'shuffle') {
                if (!exists(event.index)) {
                    event.events = shuffle(event.events)
                    event.index = 0
                }
                nextEvent = event.events[event.index]
                event.index++
                if (event.index > event.events.length - 1) event.index = null
            }
            if (nextEvent) Event.run(nextEvent, props)
        }
 
        else if (event.type === 'branch') {
            let conditionResult = Condition.eval(event.condition, inventory)
            if (conditionResult) {
                Event.run(event.trueEvent, props)
            } else {
                Event.run(event.falseEvent, props)
            }
        }
    }
}
 
class Condition {
    static new(type = 'item_comparison') {
        if (type === 'item_comparison') {
            return { type, operator: '=', spriteId: 0, value: 1, valueIsSprite: false }
        }
        else if (type === 'all' || type === 'any' || type === 'none') {
            return { type, conditions: [] }
        }
    }
 
    static import(obj, codeMap, overrideType) {
        let condition = Condition.new(overrideType || obj.type)
        if (!condition) return Condition.new('item_comparison')
 
        if (obj.type === 'item_comparison') {
            if (isStr(obj.operator) && ['=', '>', '<', '>=', '<=', '!='].includes(obj.operator)) {
                condition.operator = obj.operator
            }
            if (isInt(obj.spriteId)) {
                if (codeMap) condition.spriteId = codeMap[obj.spriteId]
                else condition.spriteId = obj.spriteId
            }
            if (isInt(obj.value)) {
                if (codeMap && obj.valueIsSprite) condition.value = codeMap[obj.value]
                else condition.value = obj.value
            }
            if (isBool(obj.valueIsSprite)) condition.valueIsSprite = obj.valueIsSprite
        }
        else if (obj.type === 'all' || obj.type === 'any' || obj.type === 'none') {
            if (isArr(obj.conditions)) {
                condition.conditions = obj.conditions.map(c => Condition.import(c, codeMap))
            }
       }
 
        return condition
    }
 
    static export(condition, codeMap) {
        let exportCondition = clone(condition)
        if (codeMap && condition.type === 'item_comparison') {
            exportCondition.spriteId = codeMap[condition.spriteId]
            if (condition.valueIsSprite) exportCondition.value = codeMap[condition.value]
        }
        else if (condition.type === 'all' || condition.type === 'any' || condition.type === 'none') {
            exportCondition.conditions = condition.conditions.map(c => Condition.export(c, codeMap))
        }
        return exportCondition
    }

    static changeSpriteIndex(condition, start, end, change) {
        if (condition.type === 'item_comparison') {
            if (condition.spriteId >= start && condition.spriteId < end) {
                condition.spriteId = change(condition.spriteId)
            }
            if (condition.valueIsSprite && condition.value >= start && condition.value < end) {
                condition.value = change(condition.value)
            }
        }
        else if (condition.type === 'all' || condition.type === 'any' || condition.type === 'none') {
            condition.conditions = condition.conditions.map(c => Condition.changeSpriteIndex(c, start, end, change))
        }
        return condition
    }
   
    static relatedSpriteIds(condition) {
        let ids = []
 
        if (condition.type === 'item_comparison') {
            ids.push(condition.spriteId)
            if (condition.valueIsSprite) ids.push(condition.value)
        }
        else if (type === 'all' || type === 'any' || type === 'none') {
            condition.conditions.forEach(c => {
                ids = ids.concat(Condition.relatedSpriteIds(c))
            })
        }
 
        return ids
    }

    static setType(condition, newType) {
        return Condition.import(condition, null, newType)
    }
 
    static eval(condition, inventory) {
        if (condition.type === 'item_comparison') {
            let itemCount = inventory[condition.spriteId]
            let value = condition.valueIsSprite ? inventory[condition.value] : condition.value
            if (condition.operator === '=') return itemCount === value
            else if (condition.operator === '>') return itemCount > value
            else if (condition.operator === '<') return itemCount < value
            else if (condition.operator === '>=') return itemCount >= value
            else if (condition.operator === '<=') return itemCount <= value
            else if (condition.operator === '!=') return itemCount !== value
        }
        else if (condition.type === 'all' || condition.type === 'any' || condition.type === 'none') {
            let results = condition.conditions.map(c => Condition.eval(c, inventory))
            if (condition.type === 'all') return !results.includes(false)
            else if (condition.type === 'any') return results.includes(true)
            else if (condition.type === 'none') return !results.includes(true)
        }
    }
}