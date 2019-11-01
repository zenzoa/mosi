let scriptorium = {
    'dialog': [
        {
            name: 'line break',
            text: '{b}',
            args: []
        },
        {
            name: 'page break',
            text: '{p}',
            args: []
        },
        {
            name: 'wavy text',
            text: '{wavy}{/wavy}',
            args: []
        },
        {
            name: 'shaky text',
            text: '{shaky}{/shaky}',
            args: []
        },
        {
            name: 'color text',
            text: '{color ?}{/color}',
            args: ['color']
        },
        {
            name: 'dialog box position',
            text: '{position ?}{/position}',
            args: ['dialog-position']
        }
    ],
    'world': [
        {
            name: 'world\'s name',
            text: '{world-name}',
            args: []
        }
    ],
    'avatar': [
        {
            name: 'avatar\'s name',
            text: '{avatar-name}',
            args: []
        },
        {
            name: 'avatar\'s x-position (column)',
            text: '{avatar-x}',
            args: []
        },
        {
            name: 'avatar\'s y-position (row)',
            text: '{avatar-y}',
            args: []
        },
        {
            name: 'move avatar',
            text: '{move-avatar ?}',
            args: ['room', 'x', 'y']
        },
        {
            name: 'transform avatar\'s sprite',
            text: '{transform-avatar ?}',
            args: ['sprite']
        }
    ],
    'sprite': [
        {
            name: 'sprite\'s name',
            text: '{sprite-name}',
            args: [],
            spriteOnly: true
        },
        // {
        //     name: 'sprite\'s room name',
        //     text: '{sprite-room}',
        //     spriteOnly: true
        // },
        {
            name: 'sprite\'s x-position (column)',
            text: '{sprite-x}',
            args: [],
            spriteOnly: true
        },
        {
            name: 'sprite\'s y-position (row)',
            text: '{sprite-y}',
            args: [],
            spriteOnly: true
        },
        {
            name: 'is sprite a wall?',
            text: '{sprite-wall}',
            args: [],
            spriteOnly: true
        },
        {
            name: 'is sprite an item?',
            text: '{sprite-item}',
            args: [],
            spriteOnly: true
        },
        {
            name: 'move sprite',
            text: '{move-sprite ?}',
            args: ['room', 'x', 'y'],
            spriteOnly: true
        },
        {
            name: 'place new sprite',
            text: '{place-sprite ?}',
            args: ['sprite', 'room', 'x', 'y']
        },
        {
            name: 'transform sprite into another sprite',
            text: '{transform-sprite ?}',
            args: ['sprite'],
            spriteOnly: true
        },
        {
            name: 'remove sprite',
            text: '{remove-sprite}',
            args: [],
            spriteOnly: true
        },
        {
            name: 'set sprite color',
            text: '{set-sprite-color ?}',
            args: ['color'],
            spriteOnly: true
        },
        {
            name: 'set whether sprite is a wall',
            text: '{set-sprite-wall ?}',
            args: ['bool'],
            spriteOnly: true
        },
        {
            name: 'set whether sprite is an item',
            text: '{set-sprite-item ?}',
            args: ['bool'],
            spriteOnly: true
        }
    ],
    'room': [
        {
            name: 'current room\'s name',
            text: '{room-name}',
            args: []
        },
        {
            name: 'set room\'s palette',
            text: '{set-palette ?}',
            args: ['room', 'palette']
        },
        {
            name: 'set room\'s music',
            text: '{set-music ?}',
            args: ['room', 'music']
        }
    ],
    'math': [
        {
            name: 'add',
            text: '{add ?}',
            args: ['num', 'num']
        },
        {
            name: 'subtract',
            text: '{sub ?}',
            args: ['num', 'num']
        },
        {
            name: 'multiply',
            text: '{mul ?}',
            args: ['num', 'num']
        },
        {
            name: 'divide',
            text: '{div ?}',
            args: ['num', 'num']
        },
        {
            name: 'modulo',
            text: '{mod ?}',
            args: ['num', 'num']
        },
        {
            name: 'random number',
            text: '{random ?}',
            args: ['num', 'num']
        }
    ],
    'logic': [
        {
            name: 'if true, do a thing',
            text: '{if ?}{/if}',
            args: ['bool']
        },
        {
            name: 'equals',
            text: '{eq ?}',
            args: ['str', 'str']
        },
        {
            name: 'greater than',
            text: '{gt ?}',
            args: ['num', 'num']
        },
        {
            name: 'greater than or equal to (at least)',
            text: '{gte ?}',
            args: ['num', 'num']
        },
        {
            name: 'less than',
            text: '{lt ?}',
            args: ['num', 'num']
        },
        {
            name: 'less than or equal to (no more than)',
            text: '{lte ?}',
            args: ['num', 'num']
        },
        {
            name: 'not (true if false, false if true)',
            text: '{not ?}',
            args: ['bool']
        },
        {
            name: 'all arguments are "true"',
            text: '{all-true ?}',
            args: ['bool', 'bool']
        },
        {
            name: 'any arguments are "true"',
            text: '{any-true ?}',
            args: ['bool', 'bool']
        },
        {
            name: 'no arguments are "true"',
            text: '{none-true ?}',
            args: ['bool', 'bool']
        }
    ],
    'variables': [
        {
            name: 'get value of variable',
            text: '{var ?}',
            args: ['str']
        },
        {
            name: 'set value of variable',
            text: '{set-var ?}',
            args: ['str', 'str']
        },
        {
            name: 'increment variable',
            text: '{inc-var ?}',
            args: ['str', 'num']
        },
        {
            name: 'decrement variable',
            text: '{dec-var ?}',
            args: ['str', 'num']
        }
    ],
    'inventory': [
        {
            name: 'get count of an inventory item',
            text: '{item-count ?}',
            args: ['sprite']
        },
        {
            name: 'set count of an inventory item',
            text: '{set-item-count ?}',
            args: ['sprite', 'num']
        },
        {
            name: 'add item to inventory',
            text: '{inc-item-count ?}',
            args: ['sprite', 'num']
        },
        {
            name: 'remove item from inventory',
            text: '{dec-item-count ?}',
            args: ['sprite', 'num']
        }
    ]
}

let scriptScript = `
return {
    run: (script, game, context) => {
        let parsedScript = Script.parse(script)

        let dialogNodes = []

        // default text settings
        let defaultTextPosition = game.avatarY < game.world.roomHeight / 2 ? 'bottom' : 'top'
        let defaultTextSettings = {
            color: 'white',
            style: 'normal',
            position: defaultTextPosition
        }

        // some helper functions
        let isStr = x => typeof x === 'string'
        let isInt = x => !isNaN(x) && parseInt(x) === parseFloat(x)
        let isArr = x => Array.isArray(x)

        // add a chunk of formatted dialog
        let addDialogNode = (text = '', { color, style, position }) => {
            text = text.toString().replace(/^\\n+/g, '').replace(/\\n+$/g, '')
            if (!text) return
            let lastNode = dialogNodes[dialogNodes.length - 1]
            if (lastNode && lastNode.color === color && lastNode.style === style && lastNode.position === position) {
                lastNode.text += text
            } else {
                let currentPalette = game.world.paletteList[game.currentPaletteIndex]
                let colorCode = currentPalette.colorList[color] || 'white'
                dialogNodes.push({
                    type: 'text',
                    color: colorCode,
                    text, style, position
                })
            }
        }

        let calcExpression = (node) => {
            if (node.func) {
                let { func, args = [] } = node

                args = args.map(arg => calcExpression(arg))

                if (func === 'world-name') {
                    return game.world.worldName
                }

                else if (func === 'room-name' || func === 'avatar-room') {
                    return game.currentRoom.name
                }

                else if (func === 'avatar-x') {
                    return game.avatarX
                }

                else if (func === 'avatar-y') {
                    return game.avatarY
                }

                else if (func === 'avatar-name') {
                    return game.avatar.name
                }

                else if (func === 'sprite-room' && context) {
                    let room = game.world.roomList[context.roomIndex]
                    return room.name
                }

                else if (func === 'sprite-x' && context) {
                    return context.tile.x
                }

                else if (func === 'sprite-y' && context) {
                    return context.tile.y
                }

                else if (func === 'sprite-name' && context) {
                    return context.sprite.name
                }

                else if (func === 'sprite-wall' && context) {
                    return context.sprite.isWall
                }

                else if (func === 'sprite-item' && context) {
                    return context.sprite.isItem
                }

                else if (func === 'add') {
                    return args.reduce((prev, curr) => {
                        if (isInt(curr)) return prev + curr
                        else return prev
                    }, 0)
                }

                else if (func === 'sub') {
                    if (!isInt(args[0])) return 0
                    return args.slice(1).reduce((prev, curr) => {
                        if (isInt(curr)) return prev - curr
                        else return prev
                    }, args[0])
                }

                else if (func === 'mul') {
                    return args.reduce((prev, curr) => {
                        if (isInt(curr)) return prev * curr
                        else return prev
                    }, 1)
                }

                else if (func === 'div') {
                    let result = Math.floor(args[0] / args[1])
                    if (!isInt(result)) return 0
                    return result
                }

                else if (func === 'mod') {
                    let result = args[0] % args[1]
                    if (!isInt(result)) return 0
                    return 0
                }

                else if (func === 'random') {
                    let min = isInt(args[0]) ? args[0] : 0
                    let max = isInt(args[1]) ? args[1] : 1
                    if (min > max) max = min
                    return Math.floor(Math.random() * (max - min + 1)) + min
                }

                else if (func === 'eq') {
                    return args[0] === args[1]
                }

                else if (func === 'gt') {
                    if (!isInt(args[0]) || !isInt(args[1])) return false
                    return args[0] > args[1]
                }

                else if (func === 'gte') {
                    if (!isInt(args[0]) || !isInt(args[1])) return false
                    return args[0] >= args[1]
                }

                else if (func === 'lt') {
                    if (!isInt(args[0]) || !isInt(args[1])) return false
                    return args[0] < args[1]
                }

                else if (func === 'lte') {
                    if (!isInt(args[0]) || !isInt(args[1])) return false
                    return args[0] <= args[1]
                }

                else if (func === 'not') {
                    return args[0].toString() !== 'true'
                }

                else if (func === 'all-true') {
                    return !args.find(arg => arg.toString() !== 'true')
                }

                else if (func === 'any-true') {
                    return !!args.find(arg => arg.toString() === 'true')
                }

                else if (func === 'none-true') {
                    return !args.find(arg => arg.toString() === 'true')
                }

                else if (func === 'var') {
                    if (isStr(args[0])) {
                        let varValue = game.variables[args[0]]
                        if (isStr(varValue) || isInt(varValue)) {
                            return varValue
                        } else {
                            return ''
                        }
                    } else {
                        return ''
                    }
                }

                else if (func === 'item-count') {
                    if (isStr(args[0])) {
                        let itemCount = game.inventory[args[0]] || 0
                        return itemCount
                    } else {
                        return 0
                    }
                }

                else {
                    return ''
                }

            } else {
                return node
            }
        }

        // run the next bit of script
        let runNode = (node, textSettings) => {
            if (isStr(node)) {
                addDialogNode(node, textSettings)

            } else if (node.func) {
                let { func, args = [] } = node

                args = args.map(arg => calcExpression(arg))

                if (func === 'b') {
                    dialogNodes.push({ type: 'line-break' })
                }

                else if (func === 'p') {
                    dialogNodes.push({ type: 'page-break' })
                }

                else if (func === 'wavy') {
                    runNodes(args[0], { ...textSettings, style: 'wavy' })
                }

                else if (func === 'shaky') {
                    runNodes(args[0], { ...textSettings, style: 'shaky' })
                }

                else if (func === 'color') {
                    let color = calcExpression(args[0])
                    if (!isInt(color)) color = textSettings.color
                    runNodes(args[1], { ...textSettings, color })
                }

                else if (func === 'position') {
                    let position = calcExpression(args[0])
                    let positionList = ['top', 'center', 'bottom', 'fullscreen']
                    if (!positionList.includes(position)) position = textSettings.position
                    runNodes(args[1], { ...textSettings, position })
                }

                else if (func === 'move-avatar') {
                    let roomIndex = -1, x = 0, y = 0
                    if (isInt(args[0]) && isInt(args[1])) {
                        roomIndex = game.currentRoomIndex
                        x = args[0] || 0
                        y = args[1] || 0
                    }
                    else if (isStr(args[0]) && isInt(args[1]) && isInt(args[2])) {
                        roomIndex = game.world.roomList.findIndex(r => r.name === args[0])
                        x = args[1] || 0
                        y = args[2] || 0
                    }
                    if (roomIndex >= 0) {
                        x = Math.max(Math.min(x, game.world.roomWidth - 1), 0)
                        y = Math.max(Math.min(y, game.world.roomHeight - 1), 0)
                        game.moveAvatar(roomIndex, x, y)
                    }
                }

                else if (func === 'move-sprite' && context) {
                    let roomIndex = -1, x = 0, y = 0
                    if (isInt(args[0]) && isInt(args[1])) {
                        roomIndex = game.currentRoomIndex
                        x = args[0] || 0
                        y = args[1] || 0
                    }
                    else if (isStr(args[0]) && isInt(args[1]) && isInt(args[2])) {
                        roomIndex = game.world.roomList.findIndex(r => r.name === args[0])
                        x = args[1] || 0
                        y = args[2] || 0
                    }
                    if (roomIndex >= 0) {
                        x = Math.max(Math.min(x, game.world.roomWidth - 1), 0)
                        y = Math.max(Math.min(y, game.world.roomHeight - 1), 0)
                        if (game.checkTileForSprite(roomIndex, x, y)) {
                            let room = game.world.roomList[roomIndex]
                            room.tileList.push({ spriteName: context.sprite.name, x, y })
                            context.tile.removeMe = true
                        }
                    }
                }

                else if (func === 'place-sprite') {
                    let roomIndex = -1, x = 0, y = 0
                    let sprite = game.world.spriteList.find(s => s.name === args[0])
                    if (isStr(args[0]) && isInt(args[1]) && isInt(args[2])) {
                        roomIndex = game.currentRoomIndex
                        x = args[1] || 0
                        y = args[2] || 0
                    }
                    else if (isStr(args[0]) && isStr(args[1]) && isInt(args[2]) && isInt(args[3])) {
                        roomIndex = game.world.roomList.findIndex(r => r.name === args[1])
                        x = args[2] || 0
                        y = args[3] || 0
                    }
                    if (sprite && roomIndex >= 0) {
                        x = Math.max(Math.min(x, game.world.roomWidth - 1), 0)
                        y = Math.max(Math.min(y, game.world.roomHeight - 1), 0)
                        if (game.checkTileForSprite(roomIndex, x, y)) {
                            let room = game.world.roomList[roomIndex]
                            room.tileList.push({ spriteName: sprite.name, x, y })
                            game.updateCache()
                        }
                    }
                }

                else if (func === 'transform-avatar') {
                    let newSprite = game.world.spriteList.find(s => s.name === args[0])
                    if (newSprite) {
                        game.avatar = newSprite
                        game.updateCache()
                    }
                }

                else if (func === 'transform-sprite' && context) {
                    let newSprite = game.world.spriteList.find(s => s.name === args[0])
                    if (newSprite) {
                        context.tile.spriteName = newSprite.name
                        game.updateCache()
                    }
                }

                else if (func === 'remove-sprite' && context) {
                    context.tile.removeMe = true
                }

                else if (func === 'set-sprite-color' && context) {
                    if (isInt(args[0]) && args[0] > 0) {
                        context.sprite.colorIndex = args[0]
                        game.updateCache()
                    }
                    else if (isInt(args[1]) && args[1] > 0) {
                        let sprite = game.world.spriteList.find(s => s.name === args[0])
                        if (sprite) {
                            sprite.colorIndex = args[1]
                            game.updateCache()
                        }
                    }
                }

                else if (func === 'set-sprite-wall' && context) {
                    if (args.length === 1) {
                        context.sprite.isWall = args[0] === 'true'
                    }
                    else if (args.length === 2) {
                        let sprite = game.world.spriteList.find(s => s.name === args[0])
                        if (sprite) sprite.isWall = args[1] === 'true'
                    }
                }

                else if (func === 'set-sprite-item' && context) {
                    if (args.length === 1) {
                        context.sprite.isItem = args[0] === 'true'
                    }
                    else if (args.length === 2) {
                        let sprite = game.world.spriteList.find(s => s.name === args[0])
                        if (sprite) sprite.isItem = args[1] === 'true'
                    }
                }

                else if (func === 'set-var') {
                    if (isStr(args[0]) && (isInt(args[1]) || isStr(args[1]))) {
                        game.variables[args[0]] = args[1]
                    }
                }

                else if (func === 'inc-var') {
                    if (isStr(args[0])) {
                        let varValue = game.variables[args[0]] || 0
                        if (isInt(varValue)) {
                            let incValue = isInt(args[1]) ? args[1] : 1
                            game.variables[args[0]] = varValue + incValue
                        }
                    }
                }

                else if (func === 'dec-var') {
                    if (isStr(args[0])) {
                        let varValue = game.variables[args[0]] || 0
                        if (isInt(varValue)) {
                            let decValue = isInt(args[1]) ? args[1] : 1
                            game.variables[args[0]] = varValue - decValue
                        }
                    }
                }

                else if (func === 'set-item-count') {
                    if (isStr(args[0]) && isInt(args[1])) {
                        let itemCount = Math.max(0, args[1])
                        game.inventory[args[0]] = itemCount
                    }
                }

                else if (func === 'inc-item-count') {
                    if (isStr(args[0])) {
                        let itemCount = game.inventory[args[0]] || 0
                        let incValue = isInt(args[1]) ? args[1] : 1
                        game.inventory[args[0]] = itemCount + incValue
                    }
                }

                else if (func === 'dec-item-count') {
                    if (isStr(args[0])) {
                        let itemCount = game.inventory[args[0]] || 0
                        let incValue = isInt(args[1]) ? args[1] : 1
                        game.inventory[args[0]] = Math.max(0, itemCount - incValue)
                    }
                }

                else if (func === 'set-palette') {
                    let room, palette
                    if (isStr(args[0]) && isStr(args[1])) {
                        room = game.world.roomList.find(r => r.name === args[0])
                        palette = game.world.paletteList.find(p => p.name === args[1])
                    }
                    else if (isStr(args[0])) {
                        room = game.currentRoom
                        palette = game.world.paletteList.find(p => p.name === args[0])
                    }
                    if (room && palette) {
                        room.paletteName = palette.name
                        game.updateCache()
                    }
                }

                else if (func === 'set-music') {
                    let room, music
                    if (isStr(args[0]) && isStr(args[1])) {
                        room = game.world.roomList.find(r => r.name === args[0])
                        music = game.world.musicList.find(m => m.name === args[1])
                    }
                    else if (isStr(args[0])) {
                        room = game.currentRoom
                        music = game.world.musicList.find(m => m.name === args[0])
                    }
                    if (room && music) {
                        room.musicName = music.name
                        game.updateMusic()
                    }
                }

                else if (func === 'if') {
                    if (args.length >= 2) {
                        let result = (args[0].toString() === 'true')
                        if (result && isArr(args[1])) {
                            runNodes(args[1], textSettings)
                        }
                        else if (!result && isArr(args[2])) {
                            runNodes(args[2], textSettings)
                        }
                    }
                }

                else {
                    addDialogNode(calcExpression(node), textSettings)
                }
            }
        }

        // run a list of scripts
        let runNodes = (nodes = [], textSettings) => {
            nodes.forEach(node => {
                runNode(node, textSettings)
            })
        }

        // run the actual script already
        runNodes(parsedScript, defaultTextSettings)

        // display any dialog created from the script
        if (dialogNodes.length > 0) game.startDialog(dialogNodes)
    },

    parse: (text) => {
        let i = 0

        let parseTextNode = (closingFunc) => {
            let nodes = []
            let textSoFar = ''

            let finalizeNode = () => {
                if (textSoFar) nodes.push(textSoFar)
                textSoFar = ''
            }

            while (i < text.length) {
                let char = text.charAt(i)
                i++
                if (char === '{') {
                    finalizeNode()
                    let funcNode = parseFuncNode(text)
                    if (closingFunc && funcNode.func === closingFunc) {
                        return nodes
                    }
                    nodes.push(funcNode)
                } else {
                    textSoFar += char
                }
            }

            finalizeNode()
            return nodes
        }

        let parseFuncNode = () => {
            let funcName = ''
            while (i < text.length) {
                let char = text.charAt(i)
                if (char === ' ' || char === '\\n' || char === '\\t') {
                    i++
                    break
                } else if (char === '{' || char === '}') {
                    break
                } else {
                    funcName += char
                }
                i++
            }
            funcName = funcName.trim()

            let funcArgs = []
            let nextArg = ''

            let addArg = () => {
                nextArg = nextArg.trim()
                if (!nextArg) return
                if (parseInt(nextArg) === parseFloat(nextArg) && !isNaN(parseInt(nextArg))) {
                    nextArg = parseInt(nextArg)
                }
                funcArgs.push(nextArg)
                nextArg = ''
            }

            let finalizeNode = () => {
                return {
                    func: funcName,
                    args: funcArgs
                }
            }

            let insideQuote = false
            while (i < text.length) {
                let char = text.charAt(i)
                i++
                if (insideQuote) {
                    if (char === '"') {
                        insideQuote = false
                        addArg()
                    } else if (char === '\\\\' && text.charAt(i) === '"') {
                        i++
                        nextArg += '"'
                    } else {
                        nextArg += char
                    }
                } else {
                    if (char === '"') {
                        insideQuote = true
                    } else if (char === ' ' || char === '\\n' || char === '\\t') {
                        addArg()
                    } else if (char === '{') {
                        addArg()
                        funcArgs.push(parseFuncNode(text))
                    } else if (char === '}') {
                        addArg()
                        if (funcName === 'if') {
                            let ifNodes = parseTextNode('/if')
                            let elseNodes = []
                            let elseIndex = ifNodes.findIndex(n => n.func === 'else')
                            if (elseIndex > -1) {
                                elseNodes = ifNodes.slice(elseIndex + 1)
                                ifNodes = ifNodes.slice(0, elseIndex)
                            }
                            funcArgs.push(ifNodes)
                            if (elseNodes.length) funcArgs.push(elseNodes)
                        } else if (funcName === 'color') {
                            funcArgs.push(parseTextNode('/color'))
                        } else if (funcName === 'wavy') {
                            funcArgs.push(parseTextNode('/wavy'))
                        } else if (funcName === 'shaky') {
                            funcArgs.push(parseTextNode('/shaky'))
                        } else if (funcName === 'position') {
                            funcArgs.push(parseTextNode('/position'))
                        }
                        return finalizeNode()
                    } else {
                        nextArg += char
                    }
                }
            }

            return finalizeNode()
        }

        return parseTextNode()
    }
}
`

let generateScriptScript = new Function(scriptScript)
let Script = generateScriptScript()