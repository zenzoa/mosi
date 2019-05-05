let World = {

    create: ({ worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight, randomStart }) => {
        let world = {
            version: 0.4,
            
            currentSpriteIndex: 0,
            spriteList: [],
            spriteWidth,
            spriteHeight,

            currentRoomIndex: 0,
            roomList: [],
            roomWidth,
            roomHeight,

            worldWidth,
            worldHeight,
            worldName: '',
            worldWrapHorizontal: false,
            worldWrapVertical: false,

            paletteList: [],

            fontResolution: 1,
            fontDirection: 'ltr',
            fontData: Font.parse(ASCII_TINY)
        }
 
        // initialize room list
        world.roomList = Array(worldWidth * worldHeight).fill(0).map((_, i) => {
            let x = Math.floor(i % worldWidth) + 1
            let y = Math.floor(i / worldWidth) + 1
            return {
                name: 'room-' + x + '-' + y,
                paletteName: 'palette 1',
                tileList: []
            }
        })

        // create avatar
        world.spriteList.push(Sprite.create({
            name: 'avatar',
            isAvatar: true,
            spriteWidth,
            spriteHeight,
            randomStart: true
        }))

        if (spriteWidth === 8 && spriteHeight === 8) {
            world.spriteList[0].frameList = [
                [0,0,0,0,1,0,0,1,0,1,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,1,0,0,1,0,0],
                [0,0,0,0,1,0,0,1,1,0,0,0,1,1,1,1,0,1,0,0,1,1,1,1,0,1,0,0,1,1,1,1,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,1,0,1,0,0,1,0]
            ]
        }

        // pick contrasting colors for initial palette
        let bgColor = chroma.random()
        let fgColor = chroma.random()
        while(chroma.contrast(bgColor, fgColor) < 4.5) {
            bgColor = chroma.random()
            fgColor = chroma.random()
        }
        world.paletteList.push({
            name: 'palette 1',
            colorList: [
                bgColor.hex(),
                fgColor.hex()
            ]
        })

        // place random tiles throughout world
        if (randomStart) {
            world.spriteList.push(Sprite.create({
                name: 'floor',
                spriteWidth,
                spriteHeight,
                randomStart: true
            }))
            world.spriteList.push(Sprite.create({
                name: 'wall',
                isWall: true,
                spriteWidth,
                spriteHeight,
                randomStart: true
            }))
            world.spriteList.push(Sprite.create({
                name: 'item',
                isItem: true,
                spriteWidth,
                spriteHeight,
                randomStart: true
            }))
            world.roomList.forEach(room => {
                room.tileList = Room.randomTileList(roomWidth, roomHeight, world.spriteList)
            })
        }

        // place avatar
        world.roomList[0].tileList.push({
            spriteName: 'avatar',
            x: 0,
            y: 0
        })

        return world
    },
    
    rename: (that, newName) => {
        that.setState({ worldName: newName })
    },

    import: (that, worldData) => {
        try {
            let world = JSON.parse(worldData)
            if (world.version < 0.4) world = convertOldWorld(world)
            that.setState(world)
        }
        catch (e) {
            console.error('unable to import world!', e)
            that.setState({
                showErrorOverlay: true,
                errorMessage: isStr(e) ? e : 'unable to import world!'
            })
        }
    },

    export: (that) => {
        let world = deepClone(that.state)

        // remove editor state
        delete world.currentTab
        delete world.tabVisibility
        delete world.tabHistory
        delete world.oneTabMode
        delete world.showErrorOverlay
        delete world.errorMessage
        delete world.themeName

        let worldData = JSON.stringify(world)
        return worldData
    },

    setWrapHorizontal: (that, newValue) => {
        that.setState({ worldWrapHorizontal: newValue })
    },

    setWrapVertical: (that, newValue) => {
        that.setState({ worldWrapVertical: newValue })
    }

}

let convertOldWorld = (world) => {
    let newWorld = {
        version: 0.4,
        currentSpriteIndex: 0,
        currentRoomIndex: 0
    }

    // convert colors
    newWorld.paletteList = world.palettes.map((palette, i) => {
        return {
            name: palette.name || 'palette ' + i,
            colorList: palette.colors

        }
    })

    // convert sprites
    newWorld.spriteWidth = world.spriteWidth
    newWorld.spriteHeight = world.spriteHeight
    newWorld.spriteList = world.sprites.map((sprite, i) => {
        return {
            width: world.spriteWidth,
            height: world.spriteHeight,
            name: sprite.name || 'sprite ' + i,
            colorIndex: sprite.colorId,
            isAvatar: i === world.avatarId,
            isWall: sprite.wall,
            isItem: sprite.item,
            frameList: sprite.frames.map(frame => {
                return frame.pixels
            })
        }
    })

    // convert behaviors
    let convertAction = (action) => {
        let actionList = []
        if (action.type === 'dialog') {
            actionList.push({
                type: 'dialog',
                text: action.text
            })
        }
        else if (action.type === 'give_item') {
            actionList.push({
                type: 'give_item',
                isGiving: action.isGiving,
                spriteName: newWorld.spriteList[action.spriteId].name,
                quantity: action.quantity
            })
        }
        else if (action.type === 'transform_self') {
            actionList.push({
                type: 'give_item',
                spriteName: newWorld.spriteList[action.spriteId].name
            })
        }
        else if (action.type === 'move_avatar') {
            actionList.push({
                type: 'move_avatar',
                roomIndex: action.roomId,
                tileX: action.x,
                tileY: action.y
            })
        }
        else if (action.type === 'remove_self') {
            actionList.push({
                type: 'remove_self'
            })
        }
        else if (action.type === 'send_message') {
            actionList.push({
                type: 'trigger_event',
                eventName: action.message
            })
        }
        else if (action.type === 'branch') {
            let oppositeOperator = {
                '=': '!=',
                '>': '<=',
                '<': '>=',
                '>=': '<',
                '<=': '>',
                '!=': '='
            }
            actionList.push({
                type: 'conditional',
                comparison: action.condition.operator,
                spriteName: newWorld.spriteList[action.condition.spriteId].name,
                quantity: action.condition.value,
                actionList: convertAction(action.trueEvent)
            })
            actionList.push({
                type: 'conditional',
                comparison: oppositeOperator(action.condition.operator),
                spriteName: newWorld.spriteList[action.condition.spriteId].name,
                quantity: action.condition.value,
                actionList: convertAction(action.falseEvent)
            })
        }
        else if (action.type === 'sequence') {
            let subActions = []
            action.events.forEach(event => {
                subActions = subActions.concat(convertAction(event))
            })
            if (action.sequenceType === 'simultaneous') {
                actionList = subActions
            } else {
                actionList.push({
                    type: 'sequence',
                    isLooping: action.sequenceType === 'loop',
                    isShuffled: action.sequenceType === 'shuffle',
                    actionList: subActions
                })
            }
        }
        return actionList
    }

    world.sprites.forEach((sprite, i) => {
        let behaviorList = []
        let events = ['push']
        sprite.actions.forEach(action => {
            let event = action.trigger.type === 'push' ? 'push' : action.trigger.message
            if (!events.includes(event)) events.push(event)
        })
        events.forEach(event => {
            let actions = sprite.actions.filter(a => a.trigger.type === event || a.trigger.message === event)
            let behavior = {
                event,
                actionList: []
            }
            actions.forEach(action => {
                behavior.actionList = behavior.actionList.concat(
                    convertAction(action.event)
                )
            })
            behaviorList.push(behavior)
        })
        newWorld.spriteList[i].behaviorList = behaviorList
    })

    // convert rooms
    newWorld.roomWidth = world.roomWidth
    newWorld.roomHeight = world.roomHeight
    newWorld.roomList = world.rooms.map((room, i) => {
        return {
            width: world.roomWidth,
            height: world.roomHeight,
            name: room.name || 'room-' + i,
            paletteName: newWorld.paletteList[room.paletteId].name,
            tileList: room.spriteLocations.map(spriteLocation => {
                let sprite = newWorld.spriteList[spriteLocation.spriteId]
                return {
                    spriteName: sprite.name,
                    x: spriteLocation.x,
                    y: spriteLocation.y
                }
            })
        }
    })

    // convert font
    newWorld.fontResolution = world.textScale
    newWorld.fontDirection = 'ltr'
    newWorld.fontData = {
        name: 'imported_font',
        width: world.font.size.width,
        height: world.font.size.height,
        characterList: {}
    }
    let charCodes = Object.keys(world.font.characters)
    charCodes.forEach(charCode => {
        newWorld.fontData.characterList[charCode] = {
            data: world.font.characters[charCode]
        }
    })

    // convert world
    newWorld.worldWidth = world.worldWidth
    newWorld.worldHeight = world.worldHeight
    newWorld.worldWrapHorizontal = world.wrapLeftRight
    newWorld.worldWrapVertical = world.wrapTopBottom

    return newWorld
}