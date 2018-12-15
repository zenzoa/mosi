class RoomPicker extends Panel {
    constructor(props) {
        super()
        this.state = {
            roomId: props.roomId,
            x: props.x,
            y: props.y,
            roomChosen: false
        }
    }

    render({ world, selectTile }) {
        let roomPos = {
            x: Math.floor(this.state.roomId % world.worldWidth),
            y: Math.floor(this.state.roomId / world.worldWidth)
        }

        let tileCanvas, title, backButton

        if (!this.state.roomChosen) {
            title = div({ class: 'panel-title' }, 'choose room')
            tileCanvas = h(TileCanvas, {
                key: 'room-picker',
                w: world.worldWidth,
                h: world.worldHeight,
                sw: world.roomWidth,
                sh: world.roomHeight,
                highlight: roomPos,
                showGrid: true,
                draw: context => World.draw(context, world),
                move: ({ x, y }, destination) => {
                    let newX = destination.x
                    let newY = destination.y
                    if (x === newX && y === newY) {
                        this.setState({
                            roomId: x + (y * world.worldWidth),
                            roomChosen: true
                        })
                    }
                }
            })
            backButton = this.backButton()

        } else {
            title = div({ class: 'panel-title' }, 'choose tile')
            let room = world.rooms[this.state.roomId]
            let palette = world.palettes[room.paletteId]
            tileCanvas = h(TileCanvas, {
                key: 'tile-picker',
                w: world.roomWidth,
                h: world.roomHeight,
                sw: world.spriteWidth,
                sh: world.spriteHeight,
                highlight: { x: this.state.x, y: this.state.y },
                backgroundColor: palette.colors[0] + '99',
                showGrid: true,
                draw: context => Room.draw(context, { world, room }),
                move: ({ x, y }, destination) => {
                    let newX = destination.x
                    let newY = destination.y
                    if (x === newX && y === newY) {
                        this.setState({ x, y })
                        selectTile(this.state.roomId, x, y)
                    }
                }
            })
            backButton = button({
                class: 'icon',
                onclick: () => this.setState({ roomChosen: false })
            }, '←')
        }

        return div({ class: 'panel room-picker' }, [
            buttonRow([
                backButton,
                title
            ]),
            tileCanvas
        ])
    }
}