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
            name: 'whether tile is empty',
            text: '{empty ?}',
            args: ['x', 'y']
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

        // define expressions
        let expressions = {

            'world-name': (game) => game.world.worldName,

            'room-name': (game) => game.currentRoom.name,

            'avatar-room': (game) => game.currentRoom.name,

            'avatar-x': (game) => game.avatarX,

            'avatar-y': (game) => game.avatarY,

            'avatar-name': (game) => game.avatar.name,

            'sprite-room': (game, context) => {
                if (!context) return
                let room = game.world.roomList[context.roomIndex]
                return room.name
            },

            'sprite-x': (game, context) => {
                if (!context) return
                return context.tile.x
            },

            'sprite-y': (game, context) => {
                if (!context) return
                return context.tile.y
            },

            'sprite-name': (game, context) => {
                if (!context) return
                return context.sprite.name
            },

            'sprite-wall': (game, context) => {
                if (!context) return
                return context.sprite.isWall
            },

            'sprite-item': (game, context) => {
                if (!context) return
                return context.sprite.isItem
            },

            'add': (game, context, args) => {
                if (args.length < 2) return 0
                return args.reduce((prev, curr) => {
                    if (isInt(curr)) return prev + curr
                    else return prev
                }, 0)
            },

            'sub': (game, context, args) => {
                if (args.length < 2) return 0
                if (!isInt(args[0])) return 0
                return args.slice(1).reduce((prev, curr) => {
                    if (isInt(curr)) return prev - curr
                    else return prev
                }, args[0])
            },

            'mul': (game, context, args) => {
                if (args.length < 2) return 0
                return args.reduce((prev, curr) => {
                    if (isInt(curr)) return prev * curr
                    else return prev
                }, 1)
            },

            'div': (game, context, args) => {
                if (args.length < 2) return 0
                let result = Math.floor(args[0] / args[1])
                if (!isInt(result)) return 0
                return result
            },

            'mod': (game, context, args) => {
                if (args.length < 2) return 0
                let result = args[0] % args[1]
                if (!isInt(result)) return 0
                return result
            },

            'random': (game, context, args) => {
                let min = isInt(args[0]) ? args[0] : 0
                let max = isInt(args[1]) ? args[1] : 1
                if (min > max) max = min
                return Math.floor(Math.random() * (max - min + 1)) + min
            },

            'eq': (game, context, args) => {
                if (args.length < 2) return false
                return args[0] === args[1]
            },

            'gt': (game, context, args) => {
                if (args.length < 2 || !isInt(args[0]) || !isInt(args[1])) return false
                return args[0] > args[1]
            },

            'gte': (game, context, args) => {
                if (args.length < 2 || !isInt(args[0]) || !isInt(args[1])) return false
                return args[0] >= args[1]
            },

            'lt': (game, context, args) => {
                if (args.length < 2 || !isInt(args[0]) || !isInt(args[1])) return false
                return args[0] < args[1]
            },

            'lte': (game, context, args) => {
                if (args.length < 2 || !isInt(args[0]) || !isInt(args[1])) return false
                return args[0] <= args[1]
            },

            'not': (game, context, args) => {
                if (args.length < 1) return false
                return args[0].toString() !== 'true'
            },

            'all-true': (game, context, args) => {
                return !args.find(arg => arg.toString() !== 'true')
            },

            'any-true': (game, context, args) => {
                return !!args.find(arg => arg.toString() === 'true')
            },

            'none-true': (game, context, args) => {
                return !args.find(arg => arg.toString() === 'true')
            },

            'var': (game, context, args) => {
                if (args.length > 0 && isStr(args[0])) {
                    let varValue = game.variables[args[0]]
                    if (isStr(varValue) || isInt(varValue)) {
                        return varValue
                    } else {
                        return ''
                    }
                } else {
                    return ''
                }
            },

            'item-count': (game, context, args) => {
                if (args.length > 0 && isStr(args[0])) {
                    let itemCount = game.inventory[args[0]] || 0
                    return itemCount
                } else {
                    return 0
                }
            },

            'empty': (game, context, args) => {
                if (args.length >= 2 && isInt(args[0]) && isInt(args[1])) {
                    let x = args[0] || 0
                    let y = args[1] || 0
                    let tilesInRoom = game.currentRoom.tileList
                    let tilesAtLocation = tilesInRoom.filter(t =>
                            t.x === x && t.y === y
                        )
                    return (tilesAtLocation.length === 0)
                }
            },

            'sprite-at': (game, context, args) => {
                if (args.length >= 2 && isInt(args[0]) && isInt(args[1])) {
                    let x = args[0] || 0
                    let y = args[1] || 0
                    let tilesInRoom = game.currentRoom.tileList
                    let tilesAtLocation = tilesInRoom.filter(t =>
                            t.x === x && t.y === y
                        )
                    return tilesAtLocation
                }
            },

            'sprites-in-room': (game, context) => {
                let currentTile = context ? context.tile : null
                let tilesInRoom = game.currentRoom.tileList
                let tilesExceptMe = tilesInRoom.filter(t => t !== currentTile)
                return tilesExceptMe
            },

            'sprites-named': (game, context, args) => {
                if (args.length > 0 && isStr(args[0])) {
                    let spriteName = args[0]
                    let currentTile = context ? context.tile : null
                    let tilesInRoom = game.currentRoom.tileList
                    let tilesWithName = tilesInRoom.filter(t =>
                            t.spriteName === spriteName && t !== currentTile
                        )
                    return tilesWithName
                }
            },

            'neighbors': (game, context) => {
                if (context && context.tile) {
                    let x = context.tile.x
                    let y = context.tile.y
                    let tilesInRoom = game.currentRoom.tileList
                    let adjacentTiles = tilesInRoom.filter(t =>
                            Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1 && t !== context.tile
                        )
                    return adjacentTiles
                }
            }

        }

        // define functions
        let funcs = {
            'b': (game, context, args, textSettings, pushDialog) => {
                pushDialog({ type: 'line-break' })
            },

            'p': (game, context, args, textSettings, pushDialog) => {
                pushDialog({ type: 'page-break' })
            },

            'wavy': (game, context, args, textSettings, pushDialog, runNodes) => {
                runNodes(args[0], { ...textSettings, style: 'wavy' })
            },

            'shaky': (game, context, args, textSettings, pushDialog, runNodes) => {
                runNodes(args[0], { ...textSettings, style: 'shaky' })
            },

            'color': (game, context, args, textSettings, pushDialog, runNodes) => {
                let color = args[0]
                if (!isInt(color)) color = textSettings.color
                runNodes(args[1], { ...textSettings, color })
            },

            'position': (game, context, args, textSettings, pushDialog, runNodes) => {
                let position = args[0]
                let positionList = ['top', 'center', 'bottom', 'fullscreen']
                if (!positionList.includes(position)) position = textSettings.position
                runNodes(args[1], { ...textSettings, position })
            },

            'move-avatar': (game, context, args) => {
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
            },

            'move-sprite': (game, context, args) => {
                if (!context) return
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
            },

            'place-sprite': (game, context, args) => {
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
            },

            'transform-avatar': (game, context, args) => {
                let newSprite = game.world.spriteList.find(s => s.name === args[0])
                if (newSprite) {
                    game.avatar = newSprite
                    game.updateCache()
                }
            },

            'transform-sprite': (game, context, args) => {
                if (!context) return
                let newSprite = game.world.spriteList.find(s => s.name === args[0])
                if (newSprite) {
                    context.tile.spriteName = newSprite.name
                    game.updateCache()
                }
            },

            'remove-sprite': (game, context) => {
                if (!context) return
                context.tile.removeMe = true
            },

            'set-sprite-color': (game, context, args) => {
                if (!context) return
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
            },

            'set-sprite-wall': (game, context, args) => {
                if (!context) return
                if (args.length === 1) {
                    context.sprite.isWall = args[0] === 'true'
                }
                else if (args.length === 2) {
                    let sprite = game.world.spriteList.find(s => s.name === args[0])
                    if (sprite) sprite.isWall = args[1] === 'true'
                }
            },

            'set-sprite-item': (game, context, args) => {
                if (!context) return
                if (args.length === 1) {
                    context.sprite.isItem = args[0] === 'true'
                }
                else if (args.length === 2) {
                    let sprite = game.world.spriteList.find(s => s.name === args[0])
                    if (sprite) sprite.isItem = args[1] === 'true'
                }
            },

            'set-var': (game, context, args) => {
                if (isStr(args[0]) && (isInt(args[1]) || isStr(args[1]))) {
                    game.variables[args[0]] = args[1]
                }
            },

            'inc-var': (game, context, args) => {
                if (isStr(args[0])) {
                    let varValue = game.variables[args[0]] || 0
                    if (isInt(varValue)) {
                        let incValue = isInt(args[1]) ? args[1] : 1
                        game.variables[args[0]] = varValue + incValue
                    }
                }
            },

            'dec-var': (game, context, args) => {
                if (isStr(args[0])) {
                    let varValue = game.variables[args[0]] || 0
                    if (isInt(varValue)) {
                        let decValue = isInt(args[1]) ? args[1] : 1
                        game.variables[args[0]] = varValue - decValue
                    }
                }
            },

            'set-item-count': (game, context, args) => {
                if (isStr(args[0]) && isInt(args[1])) {
                    let itemCount = Math.max(0, args[1])
                    game.inventory[args[0]] = itemCount
                }
            },

            'inc-item-count': (game, context, args) => {
                if (isStr(args[0])) {
                    let itemCount = game.inventory[args[0]] || 0
                    let incValue = isInt(args[1]) ? args[1] : 1
                    game.inventory[args[0]] = itemCount + incValue
                }
            },

            'dec-item-count': (game, context, args) => {
                if (isStr(args[0])) {
                    let itemCount = game.inventory[args[0]] || 0
                    let incValue = isInt(args[1]) ? args[1] : 1
                    game.inventory[args[0]] = Math.max(0, itemCount - incValue)
                }
            },

            'set-palette': (game, context, args) => {
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
            },

            'set-music': (game, context, args) => {
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
            },

            'if': (game, context, args, textSettings, pushDialog, runNodes) => {
                if (args.length >= 2) {
                    let result = (args[0].toString() === 'true')
                    if (result && isArr(args[1])) {
                        runNodes(args[1], textSettings)
                    }
                    else if (!result && isArr(args[2])) {
                        runNodes(args[2], textSettings)
                    }
                }
            },

            'pick': (game, context, args, textSettings, pushDialog, runNodes) => {
                if (args.length >= 2 && isArr(args[0])) {
                    let oldTile = context.tile
                    let oldSprite = context.sprite
                    let tiles = args[0]
                    let nodes = args[1]
                    tiles.forEach(t => {
                        context.tile = t
                        context.sprite = game.world.spriteList.find(s => s.name === t.spriteName)
                        if (context.sprite) {
                            runNodes(nodes, textSettings)
                        }
                    })
                    context.tile = oldTile
                    context.sprite = oldSprite
                }
            }

        }
        
        // add custom functions and expressions
        if (game.world.modList) {
            game.world.modList.forEach(mod => {
                if (mod.type === 'expression') {
                    expressions[mod.name] = new Function('game', 'context', 'args', mod.code)
                }
                else if (mod.type === 'function') {
                    expressions[mod.name] = new Function('game', 'context', 'args', 'textSettings', 'pushDialog', 'runNodes', mod.code)
                }
            })
        }

        // calculate the value of an expression
        let calcExpression = (node) => {
            if (node.func) {
                let { func, args = [] } = node

                args = args.map(arg => calcExpression(arg))

                if (expressions[func]) {
                    let result = expressions[func](game, context, args)
                    if (typeof result !== 'undefined') {
                        return result
                    } else {
                        return ''
                    }
                } else {
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

                let pushDialog = (dialogNode) => {
                    dialogNodes.push(dialogNode)
                }

                if (funcs[func]) {
                    funcs[func](game, context, args, textSettings, pushDialog, runNodes)
                } else {
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
                        } else if (funcName === 'pick') {
                            funcArgs.push(parseTextNode('/pick'))
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