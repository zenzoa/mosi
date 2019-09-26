class ErrorOverlay extends Component {
    render({ errorMessage, closeOverlay }) {
        return overlay({ closeOverlay, header: 'oh no' }, [
            div({}, errorMessage),
            button({ onclick: closeOverlay, className: 'initial-focus' }, 'ok :(')
        ])
    }
}

class RemoveOverlay extends Component {
    render({ remove, closeOverlay, header, fileType }) {
        return overlay({ closeOverlay, header }, [
            row([
                button({ onclick: remove, className: 'initial-focus fill' }, 'yes!'),
                button({ onclick: closeOverlay, className: 'fill' }, 'no, keep it')
            ])
        ])
    }
}

class ExtrasOverlay extends Component {
    render({ header, buttons, closeOverlay }) {
        return overlay({ closeOverlay, header },
            div({ className: 'content' }, 
                row(buttons)
            )
        )
    }
}

class ImportOverlay extends Component {
    render({ onImport, closeOverlay, header, fileType, hideTextImport }) {
        let textImport = hideTextImport ? [] : [
            textarea({
                value: '',
                className: 'initial-focus',
                ref: node => { this.textarea = node },
                rows: 5
            }),
            row([
                button({
                    className: 'fill',
                    onclick: () => onImport(this.textarea.value)
                }, 'import from text')
            ]),
            hr()
        ]

        let fileImport = div({}, [
            div({}, 'import from file:'),
            fileinput({ onUpload: onImport, fileType })
        ])

        return overlay({ closeOverlay, header },
            div({ className: 'content' }, 
                textImport.concat(fileImport)
            )
        )
    }
}

class ExportOverlay extends Component {
    render({ data, closeOverlay, header, fileName }) {
        let textExport = div({ className: 'content' }, [
            textarea({
                value: data,
                ref: node => { this.textarea = node },
                rows: 5
            }),
            row([
                button({
                    className: 'initial-focus fill',
                    onclick: () => {
                        this.textarea.select()
                        document.execCommand('copy')
                    }
                }, 'copy text'),
            ]),
            hr()
        ])

        let fileExport = row([
            button({
                className: 'fill',
                onclick: () => Files.download(fileName, data)
            }, 'download file')
        ])

        return overlay({ closeOverlay, header }, [ textExport, fileExport ])
    }
}

class ShareOverlay extends Component {
    render({ closeOverlay, world }) {
        let downloadButton =
            button({
                className: 'fill',
                onclick: () => {
                    let data = Files.fillTemplate(gameTemplate, {
                        'TITLE': world.name || 'untitled',
                        'GAME_SCRIPT': gameScript,
                        'TEXT_SCRIPT': textScript,
                        'MUSIC_SCRIPT': musicScript,
                        'SCRIPT_SCRIPT': scriptScript,
                        'GAME_DATA': World.export(world)
                    })
                    let filename = (world.name || 'untitled') + '.html'
                    Files.download(filename, data)
                }
            }, 'download game file')

        return overlay({ closeOverlay, header: 'share' }, [
            row([ downloadButton ])
        ])
    }
}

class GifOverlay extends Component {
    constructor() {
        super()
        this.state = {
            scale: 2,
            imageUri: null
        }

        this.updateGif = (scale) => {
            this.setState({ scale })
            let { createGif, colorList } = this.props
            createGif(scale, colorList, blob => {
                let imageUri = URL.createObjectURL(blob)
                this.setState({ imageUri })
            })
        }
    }

    componentDidMount() {
        this.updateGif(2)
    }

    render({ closeOverlay, maxScale }, { scale, imageUri }) {
        let gif = imageUri ? img({ src: imageUri }) : null

        let scaleTextbox = label({}, [
            span({}, 'image scale'),
            numbox({
                value: scale,
                min: 1,
                max: maxScale,
                onchange: e => this.updateGif(parseInt(e.target.value))
            })
        ])

        return overlay({ closeOverlay, header: 'create gif' }, [
            div({}, gif),
            div({}, [ scaleTextbox ]),
        ])
    }
}

class MusicListOverlay extends Component {
    render({ closeOverlay }) {
        return overlay({ closeOverlay, header: 'choose music' }, [
            h(MusicList, this.props)
        ])
    }
}

class PaletteListOverlay extends Component {
    render({ closeOverlay }) {
        return overlay({ closeOverlay, header: 'choose palette' }, [
            h(PaletteList, this.props)
        ])
    }
}

class SpriteListOverlay extends Component {
    render({ closeOverlay }) {
        return overlay({ closeOverlay, header: 'choose sprite' }, [
            h(SpriteList, this.props)
        ])
    }
}

class RoomPickerOverlay extends Component {
    render({ closeOverlay }) {
        this.props.className = 'initial-focus'
        return overlay({ closeOverlay, header: 'choose room' }, [
            h(WorldGrid, this.props)
        ])
    }
}

class TilePickerOverlay extends Component {
    render({ closeOverlay }) {
        this.props.className = 'initial-focus'
        this.props.showBackground = true
        this.props.isAnimated = true
        return overlay({ closeOverlay, header: 'choose tile' }, [
            h(RoomGrid, this.props)
        ])
    }
}

class WorldSettingsOverlay extends Component {
    constructor({ worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight }) {
        super()
        this.state = {
            worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight
        }
    }

    render({
        resize,
        closeOverlay,
        worldWrapHorizontal,
        worldWrapVertical,
        setWrapHorizontal,
        setWrapVertical,
        setFontResolution,
        setFontDirection,
        setFontData,
        fontResolution,
        fontDirection,
        fontData
    }, {
        worldWidth,
        worldHeight,
        roomWidth,
        roomHeight,
        spriteWidth,
        spriteHeight,
        showConfirmResizeOverlay,
        showImportFontOverlay
    }) {
        let wrapHorizontalButton = button({
            className: 'fill toggle' + (worldWrapHorizontal ? ' selected' : ''),
            onclick: () => setWrapHorizontal(!worldWrapHorizontal)
        }, 'wrap horizontally')
    
        let wrapVerticalButton = button({
            className: 'fill toggle' + (worldWrapVertical ? ' selected' : ''),
            onclick: () => setWrapVertical(!worldWrapVertical)
        }, 'wrap vertically')

        let worldResized = worldWidth !== this.props.worldWidth || worldHeight !== this.props.worldHeight
        let roomResized = roomWidth !== this.props.roomWidth || roomHeight !== this.props.roomHeight
        let spriteResized = spriteWidth !== this.props.spriteWidth || spriteHeight !== this.props.spriteHeight
        let resizedString = ''
        if ((worldResized || roomResized) && !spriteResized) resizedString = 'rooms'
        else if ((worldResized || roomResized)) resizedString = 'rooms and sprites'
        else if (spriteResized)  resizedString = 'sprites'
        
        let resizeButton =
            button({
                className: 'fill',
                disabled: !resizedString,
                onclick: () => this.setState({ showConfirmResizeOverlay: true })
            }, 'resize')

        let confirmResizeOverlay = !showConfirmResizeOverlay ? null :
            h(RemoveOverlay, {
                header: `clear all ${resizedString}?`,
                closeOverlay: () => this.setState({ showConfirmResizeOverlay: false }),
                remove: () => {
                    resize(this.state)
                    this.setState({ showConfirmResizeOverlay: false })
                }
            })

        let importFontButton =
            button({
                className: 'fill',
                onclick: () => this.setState({ showImportFontOverlay: true })
            }, 'import new font')

        let importFontOverlay = !showImportFontOverlay ? null :
            h(ImportOverlay, {
                header: 'import font',
                onImport: data => {
                    let fontData = Font.parse(data)
                    setFontData(fontData)
                    this.setState({ showImportFontOverlay: false })
                },
                fileType: '.bitsyfont',
                hideTextImport: true,
                closeOverlay: () => this.setState({ showImportFontOverlay: false })
            })

        let fontResolutionDropdown = dropdown({
            value: fontResolution,
            onchange: e => setFontResolution(parseFloat(e.target.value))
        }, [
            option({ value: 0.125 }, '×1/16'),
            option({ value: 0.25 }, '×1/4'),
            option({ value: 0.5 }, '×1/2'),
            option({ value: 1 }, '×1'),
            option({ value: 2 }, '×2'),
            option({ value: 3 }, '×3'),
            option({ value: 4 }, '×4')
        ])
    
        let fontDirectionButton = button({
            className: 'fill',
            onclick: () => setFontDirection((fontDirection === 'ltr' ? 'rtl' : 'ltr'))
        }, (fontDirection === 'ltr' ? 'left to right' : 'right to left'))

        return overlay({ closeOverlay, header: 'world settings' }, [
            row([
                span({ className: 'label' }, 'world size'),
                numbox({
                    value: worldWidth,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ worldWidth: parseInt(e.target.value) })
                }),
                span({}, '×'),
                numbox({
                    value: worldHeight,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ worldHeight: parseInt(e.target.value) })
                })
            ]),
            row([
                span({ className: 'label' }, 'room size'),
                numbox({
                    value: roomWidth,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ roomWidth: parseInt(e.target.value) })
                }),
                span({}, '×'),
                numbox({
                    value: roomHeight,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ roomHeight: parseInt(e.target.value) })
                })
            ]),
            row([
                span({ className: 'label' }, 'sprite size'),
                numbox({
                    value: spriteWidth,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ spriteWidth: parseInt(e.target.value) }) }),
                span({}, '×'),
                numbox({
                    value: spriteHeight,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ spriteHeight: parseInt(e.target.value) }) })
            ]),
            row([ resizeButton ]),
            hr(),
            row([ span({}, ['current font: ', strong(fontData.name)]) ]),
            row([
                span({ className: 'label' }, 'text resolution'),
                fontResolutionDropdown
            ]),
            row([
                span({ className: 'label' }, 'text direction'),
                fontDirectionButton
            ]),
            row([ importFontButton ]),
            hr(),
            row([
                wrapHorizontalButton,
                wrapVerticalButton
            ]),
            confirmResizeOverlay,
            importFontOverlay
        ])
    }
}