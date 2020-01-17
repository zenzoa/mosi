class RoomSlice extends Component {
    constructor() {
        super()

        this.drawFrame = (frame, width, context) => {
            frame.forEach((pixel, i) => {
                let x = Math.floor(i % width)
                let y = Math.floor(i / width)
                if (pixel) context.fillRect(x, y, 1, 1)
            })
        }

        this.cacheSprites = () => {
            let { spriteList, tileList, colorList } = this.props
            if (!tileList) return

            this.spriteFrameList = {}

            tileList.forEach(tile => {
                let { spriteName } = tile
                let sprite = spriteList.find(sprite => sprite.name === spriteName)

                let colorIndex = sprite.colorIndex
                while (colorIndex > 0 && !colorList[colorIndex]) colorIndex--
                let color = colorList[colorIndex]
                let bgColor = colorList[0]
                
                if (sprite && !this.spriteFrameList[sprite.name]) {
                    this.spriteFrameList[sprite.name] = sprite.frameList.map(frame => {
                        let frameCanvas = document.createElement('canvas')
                        frameCanvas.width = sprite.width
                        frameCanvas.height = sprite.height

                        let context = frameCanvas.getContext('2d')

                        if (!sprite.isTransparent) {
                            context.fillStyle = bgColor
                            context.fillRect(0, 0, sprite.width, sprite.height)
                        }
                        
                        context.fillStyle = color
                        this.drawFrame(frame, sprite.width, context)
                        
                        let frameData = frameCanvas
                        return frameData
                    })
                }
            })
        }

        this.update = () => {
            let {
                roomWidth,
                roomHeight,
                spriteWidth,
                spriteHeight,
                spriteList,
                tileList,
                colorList,
                sliceHorizontal,
                sliceVertical,
                sliceIndex
            } = this.props

            let width = sliceHorizontal ? (spriteWidth * roomWidth) : spriteWidth
            let height = sliceVertical ? (spriteHeight * roomHeight) : spriteHeight
            
            let context = this.canvas.getContext('2d')

            context.clearRect(0, 0, this.canvas.width, this.canvas.height)

            if (!tileList || !colorList) return

            context.fillStyle = colorList[0]
            context.fillRect(0, 0, width, height)

            tileList.forEach(tile => {
                let { spriteName, x, y } = tile
                let sprite = spriteList.find(sprite => sprite.name === spriteName)
                if (sprite) {
                    if ((sliceVertical && sliceIndex === x) || (sliceHorizontal && sliceIndex === y)) {
                        let xOffset = sliceVertical ? 0 : x * sprite.width
                        let yOffset = sliceHorizontal ? 0 : y * sprite.height
                        let frameList = this.spriteFrameList[sprite.name]
                        let frameData = frameList[0]
                        context.drawImage(frameData, xOffset, yOffset)
                    }
                } else {
                    console.error('sprite "' + spriteName + '" not found')
                }
            })
        }
    }

    componentDidMount() {
        this.cacheSprites()
        this.update()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return checkForUpdates(nextProps, this.props) || checkForUpdates(nextState, this.state)
    }

    componentDidUpdate() {
        this.cacheSprites()
        this.update()
    }

    render({ className, spriteWidth, spriteHeight, roomWidth, roomHeight, sliceVertical, sliceHorizontal, onclick, arrow }) {
        let width = spriteWidth * roomWidth
        let height = spriteHeight * roomHeight

        let tileWidth = 100 / (roomWidth + 2)
        let tileHeight = tileWidth * (spriteWidth / spriteHeight)
        
        let canvasWidth = tileWidth * roomWidth
        let canvasHeight = tileHeight * roomHeight

        return div({
            className: 'slice grid room-grid ' + className,
            style: {
                width: (sliceHorizontal ? canvasWidth : tileWidth) + '%',
                paddingTop: (sliceVertical ? canvasHeight : tileHeight) + '%'
            },
            ref: node => { this.node = node },
            onclick
        }, [
            canvas({
                width: sliceHorizontal ? width : spriteWidth,
                height: sliceVertical ? height : spriteHeight,
                ref: node => { this.canvas = node }
            }),
            div({ className: 'arrow-overlay' }, arrow)
        ])
    }
}