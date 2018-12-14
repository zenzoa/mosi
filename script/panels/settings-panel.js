class SettingsPanel extends Panel {
    constructor(props) {
        super()
        this.state = {
            currentRoomId: 0,
            worldSize: props.world.worldWidth,
            roomSize: props.world.roomWidth,
            spriteSize: props.world.spriteWidth
        }
    }

    render({ world, set, undo, redo, back }) {

        let fontFileInput = h(ImportComponent, {
            description: 'font',
            filetype: '.bitsyfont',
            onupload: data => {
                try {
                    set('font', Font.parse(data))
                } catch (e) {
                    throw 'unable to import font'
                }
            }
        }, 'change font')

        let wrapValue
        if (world.wrapLeftRight && world.wrapTopBottom) wrapValue = 'wrap_all'
        else if (world.wrapLeftRight) wrapValue = 'wrap_left_right'
        else if (world.wrapTopBottom) wrapValue = 'wrap_top_bottom'
        else wrapValue = 'wrap_none'

        let wrapButton = dropdown({
            value: wrapValue,
            onchange: x => set([
                { path: 'wrapLeftRight', value: (x === 'wrap_left_right' || x === 'wrap_all') },
                { path: 'wrapTopBottom', value: (x === 'wrap_top_bottom' || x === 'wrap_all') }
            ])
        }, [
            option({ value: 'wrap_none' }, 'no wrapping'),
            option({ value: 'wrap_left_right' }, 'wrap left-right'),
            option({ value: 'wrap_top_bottom' }, 'wrap top-bottom'),
            option({ value: 'wrap_all' }, 'wrap all sides')
        ])

        let randomSpritesButton = toggle({
            value: world.randomSprites,
            onclick: x => {
                world.randomSprites = x
                set('', world)
                this.forceUpdate()
            }
        }, 'generate random sprites')

        let worldSize = label({}, [
            span({}, 'world size: '),
            numbox({
                value: this.state.worldSize,
                min: 2,
                max: 32,
                onchange: x => this.setState({ worldSize: x })
            })
        ])

        let roomSize = label({}, [
            span({}, 'room size: '),
            numbox({
                value: this.state.roomSize,
                min: 2,
                max: 32,
                onchange: x => this.setState({ roomSize: x })
            })
        ])

        let spriteSize = label({}, [
            span({}, 'sprite size: '),
            numbox({
                value: this.state.spriteSize,
                min: 2,
                max: 32,
                onchange: x => this.setState({ spriteSize: x })
            })
        ])

        let changeSizeButton = h(ConfirmComponent, {
            description: 'reset world to change sizes?',
            onconfirm: () => {
                let ws = this.state.worldSize
                let rs = this.state.roomSize
                let ss = this.state.spriteSize
                console.log(ws, rs, ss)
                set('', World.changeSize(clone(world), ws, ws, rs, rs, ss, ss))
            }
        }, 'change sizes')

        return div({ class: 'panel settings-panel' }, [
            buttonRow([
                this.backButton(),
                this.undoButton(),
                this.redoButton()
            ]),
            buttonRow(wrapButton),
            buttonRow(fontFileInput),
            buttonRow(randomSpritesButton),
            div({ class: 'settings-section'}, [
                buttonRow(worldSize),
                buttonRow(roomSize),
                buttonRow(spriteSize),
                buttonRow(changeSizeButton)
            ])
        ])
    }
}