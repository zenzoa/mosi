let FRAME_RATE = 400

class Main extends Component {
    constructor() {
        super()

        this.state = World.create({
            worldWidth: 3,
            worldHeight: 3,
            roomWidth: 12,
            roomHeight: 12,
            spriteWidth: 8,
            spriteHeight: 8,
            randomStart: true
        })

        this.state.currentTab = 'welcome'
        this.state.tabVisibility = { welcome: true }
        this.state.tabHistory = []
        this.state.oneTabMode = true
        this.state.showErrorOverlay = false
        this.state.errorMessage = ''
        this.state.themeName = 'light'

        this.setCurrentTab = (tab, skipHistory) => {
            let { currentTab, tabVisibility, tabHistory, oneTabMode } = this.state
            if (oneTabMode) {
                Object.keys(tabVisibility).forEach(tab => {
                    tabVisibility[tab] = false
                })
            }
            if ((skipHistory instanceof MouseEvent || !skipHistory) && currentTab !== tab) {
                tabHistory.push(currentTab)
            }
            tabVisibility[tab] = true
            currentTab = tab
            this.setState({ currentTab, tabVisibility, tabHistory })
        } 

        this.closeTab = (tab) => {
            let { tabVisibility, tabHistory, oneTabMode } = this.state
            tabVisibility[tab] = false
            let newTab = tabHistory.pop() || 'welcome'
            if (!oneTabMode && !tabVisibility[newTab]) {
                Object.keys(tabVisibility).forEach(tab => {
                    if (tabVisibility[tab]) {
                        newTab = tab
                    }
                })
            }
            this.setCurrentTab(newTab, true)
            this.setState({ tabVisibility })
        }

        this.update = (newState) => {
            this.setState(newState)
        }

        this.resize = () => {
            let oneTabMode = window.innerWidth < 900
            let tabVisibility = this.state.tabVisibility
            if (oneTabMode) {
                tabVisibility = {}
                tabVisibility[this.state.currentTab] = true
                document.body.className = document.body.className.replace(' multi-tab-mode', '')
                if (!document.body.className.includes('one-tab-mode')) document.body.className += ' one-tab-mode'
            } else {
                document.body.className = document.body.className.replace(' one-tab-mode', '')
                if (!document.body.className.includes('multi-tab-mode')) document.body.className += ' multi-tab-mode'
            }
            this.setState({ oneTabMode, tabVisibility })
        }

        this.save = () => {
            try {
                window.localStorage.setItem('mosi-state', JSON.stringify(this.state))
            } catch(e) {
                console.error('unable to save editor state', e)
            }
        }

        this.load = () => {
            try {
                let data = window.localStorage.getItem('mosi-state')
                let oldData = window.localStorage.getItem('world')
                if (data) {
                    let newState = JSON.parse(data)
                    this.setState(newState)
                } else if (oldData) {
                    console.log('found world data from previous version of mosi', oldData)
                    World.import(this, oldData)
                }
                this.applyTheme(this.state.themeName)
            } catch(e) {
                console.error('unable to load editor state', e)
            }
        }

        this.updateWorld = (newWorldState) => {
            this.setState(newWorldState)
        }

        this.applyTheme = (themeName) => {
            let theme = THEMES[themeName]
            if (!theme) return
            Object.keys(theme).forEach(key => {
                let value = theme[key]
                document.body.style.setProperty(key, value)
            })
        }

        // TODO: remove once UI is added for changing themes
        window.changeTheme = (themeName) => {
            if (THEMES[themeName]) this.setState({ themeName })
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.resize, true)
        this.resize()
        this.load()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    componentDidUpdate(_, prevState) {
        if (prevState.themeName !== this.state.themeName) {
            this.applyTheme(this.state.themeName)
        }
        this.save()
    }

    render({}, {
        currentTab,
        tabVisibility,
        oneTabMode,

        showErrorOverlay,
        errorMessage,

        currentSpriteIndex,
        spriteList,
        spriteWidth,
        spriteHeight,

        currentRoomIndex,
        roomList,
        roomWidth,
        roomHeight,

        worldWidth,
        worldHeight,
        worldName,
        worldWrapHorizontal,
        worldWrapVertical,

        paletteList,

        fontResolution,
        fontDirection,
        fontData
    }) {
        let backButton = !oneTabMode ? null :
            button({
                title: 'back',
                onclick: this.closeTab.bind(this, currentTab)
            }, 'back')

        let playTab = !tabVisibility.play ? null :
            h(PlayPanel, {
                closeTab: this.closeTab.bind(this, 'play'),
                world: this.state
            })

        let welcomeTab = !tabVisibility.welcome ? null :
            h(WelcomePanel, {
                closeTab: this.closeTab.bind(this, 'welcome'),
                getStarted: () => this.setCurrentTab('world')
            })

        let worldTab = !tabVisibility.world ? null :
            h(WorldPanel, {
                closeTab: this.closeTab.bind(this, 'world'),
                updateWorld: this.updateWorld.bind(this),
                renameWorld: World.rename.bind(this, this),
                importWorld: World.import.bind(this, this),
                exportWorld: World.export.bind(this, this.state),
                setWrapHorizontal: World.setWrapHorizontal.bind(this, this),
                setWrapVertical: World.setWrapVertical.bind(this, this),
                selectRoom: Room.select.bind(this, this),
                startRoomIndex: Room.roomWithAvatar(this),
                currentRoomIndex,
                roomList,
                roomWidth,
                roomHeight,
                worldWidth,
                worldHeight,
                worldName,
                worldWrapHorizontal,
                worldWrapVertical,
                spriteList,
                spriteWidth,
                spriteHeight,
                paletteList
            })

        let roomTab = !tabVisibility.room ? null :
            h(RoomPanel, {
                backButton,
                closeTab: this.closeTab.bind(this, 'room'),
                renameRoom: Room.rename.bind(this, this, currentRoomIndex),
                importRoom: Room.import.bind(this, this, currentRoomIndex),
                exportRoom: Room.export.bind(this, this, currentRoomIndex),
                clearRoom: Room.clear.bind(this, this, currentRoomIndex),
                randomRoom: Room.random.bind(this, this, currentRoomIndex),
                setPaletteName: Room.setPaletteName.bind(this, this, currentRoomIndex),
                createRoomGif: Room.createGif.bind(this, this, currentRoomIndex),
                addTile: Room.addTile.bind(this, this, currentRoomIndex),
                clearTile: Room.clearTile.bind(this, this, currentRoomIndex),
                selectSprite: Sprite.select.bind(this, this),
                editSprite: Sprite.select.bind(this, this, currentSpriteIndex, 'sprite'),
                addSprite: Sprite.add.bind(this, this),
                importSprite: Sprite.import.bind(this, this),
                room: roomList[currentRoomIndex],
                roomWidth,
                roomHeight,
                spriteWidth,
                spriteHeight,
                spriteList,
                currentSpriteIndex,
                paletteList
            })

        let currentPaletteName = roomList[currentRoomIndex].paletteName
        let currentPalette = paletteList.find(p => p.name === currentPaletteName)

        let spriteListTab = !tabVisibility.spriteList ? null :
            h(SpriteListPanel, {
                closeTab: this.closeTab.bind(this, 'spriteList'),
                selectSprite: Sprite.select.bind(this, this),
                addSprite: Sprite.add.bind(this, this),
                importSprite: Sprite.import.bind(this, this),
                spriteList,
                currentSpriteIndex,
                colorList: currentPalette.colorList
            })

        let spriteTab = !tabVisibility.sprite ? null :
            h(SpritePanel, {
                backButton,
                closeTab: this.closeTab.bind(this, 'sprite'),
                renameSprite: Sprite.rename.bind(this, this, currentSpriteIndex),
                setSpriteIsWall: Sprite.setIsWall.bind(this, this, currentSpriteIndex),
                setSpriteIsItem: Sprite.setIsItem.bind(this, this, currentSpriteIndex),
                setSpriteIsTransparent: Sprite.setIsTransparent.bind(this, this, currentSpriteIndex),
                setColorIndex: Sprite.setColorIndex.bind(this, this, currentSpriteIndex),
                exportSprite: Sprite.export.bind(this, this, currentSpriteIndex),
                removeSprite: Sprite.remove.bind(this, this, currentSpriteIndex),
                duplicateSprite: Sprite.add.bind(this, this, spriteList[currentSpriteIndex]),
                addFrame: Sprite.addFrame.bind(this, this, currentSpriteIndex),
                removeFrame: Sprite.removeFrame.bind(this, this, currentSpriteIndex),
                updateFrame: Sprite.updateFrame.bind(this, this, currentSpriteIndex),
                openBehaviorTab: this.setCurrentTab.bind(this, 'behavior'),
                sprite: spriteList[currentSpriteIndex],
                colorList: currentPalette.colorList
            })

        let behaviorTab = !tabVisibility.behavior ? null :
            h(BehaviorPanel, {
                backButton,
                closeTab: this.closeTab.bind(this, 'behavior'),
                addEvent: Behavior.addEvent.bind(this, this, currentSpriteIndex),
                renameEvent: Behavior.renameEvent.bind(this, this, currentSpriteIndex),
                removeEvent: Behavior.removeEvent.bind(this, this, currentSpriteIndex),
                addAction: Behavior.addAction.bind(this, this, currentSpriteIndex),
                updateAction: Behavior.updateAction.bind(this, this, currentSpriteIndex),
                removeAction: Behavior.removeAction.bind(this, this, currentSpriteIndex),
                roomList,
                roomWidth,
                roomHeight,
                worldWidth,
                worldHeight,
                spriteList,
                spriteWidth,
                spriteHeight,
                currentSpriteIndex,
                paletteList,
                colorList: currentPalette.colorList
            })

        let colorTab = !tabVisibility.color ? null :
            h(ColorPanel, {
                closeTab: this.closeTab.bind(this, 'color'),
                addPalette: Color.addPalette.bind(this, this),
                renamePalette: Color.renamePalette.bind(this, this),
                removePalette: Color.removePalette.bind(this, this),
                randomPalette: Color.randomPalette.bind(this, this),
                addColor: Color.addColor.bind(this, this),
                updateColor: Color.updateColor.bind(this, this),
                removeColor: Color.removeColor.bind(this, this),
                paletteList
            })

        let fontTab = !tabVisibility.font ? null :
            h(FontPanel, {
                closeTab: this.closeTab.bind(this, 'font'),
                setFontResolution: fontResolution => this.setState({ fontResolution }),
                setFontDirection: fontDirection => this.setState({ fontDirection }),
                setFontData: fontData => this.setState({ fontData }),
                fontResolution,
                fontDirection,
                fontData
            })

        let errorOverlay = !showErrorOverlay ? null :
            h(ErrorOverlay, {
                errorMessage,
                closeOverlay: () => this.setState({ showErrorOverlay: false })
            })

        let header = tabVisibility.play ? null :
            div({ className: 'editor-header row' }, [
                button({
                    title: 'world',
                    className:
                        (tabVisibility.world || tabVisibility.room)
                        ? 'selected' : '',
                    onclick: () => this.setCurrentTab('world')
                }, 'world'),
                button({
                    title: 'sprites',
                    className:
                        (tabVisibility.sprite || tabVisibility.spriteList || tabVisibility.behavior)
                        ? 'selected' : '',
                    onclick: () => this.setCurrentTab('spriteList')
                }, 'sprites'),
                button({
                    title: 'colors',
                    className:
                        (tabVisibility.color)
                        ? 'selected' : '',
                    onclick: () => this.setCurrentTab('color')
                }, 'colors'),
                button({
                    title: 'music',
                    onclick: () => this.setCurrentTab('music')
                }, 'music'),
                button({
                    title: 'play',
                    onclick: () => this.setCurrentTab('play')
                }, 'play')
            ])

        if (tabVisibility.play) {
            return playTab
        }

        // main
        return div({ className: 'main' }, [
            header,
            div({ className: 'tabs' }, [
                welcomeTab,
                worldTab,
                roomTab,
                spriteListTab,
                spriteTab,
                behaviorTab,
                colorTab,
                fontTab
            ]),
            errorOverlay
        ])
    }
}

window.onload = () => {
    render(h(Main), document.body)

    window.resources = {}
    Files.loadResource('export-template.html', data => window.resources['export-template.html'] = data)
    Files.loadResource('script/entities/game.js', data => window.resources['game.js'] = data)
    Files.loadResource('script/entities/text.js', data => window.resources['text.js'] = data)
}
