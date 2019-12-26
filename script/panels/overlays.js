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
    render({ header, content, buttons, closeOverlay }) {
        return overlay({ closeOverlay, header },
            div({ className: 'content' }, 
                content ? content : row(buttons)
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

class FontOverlay extends Component {
    render({
        closeOverlay,
        setFontResolution,
        setFontDirection,
        setFontData,
        fontResolution,
        fontDirection,
        fontData
    }, {
        showImportFontOverlay,
        showResetFontOverlay
    }) {
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

        let resetFontButton =
            button({
                className: 'fill',
                onclick: () => this.setState({ showResetFontOverlay: true })
            }, 'reset font')

        let resetFontOverlay = !showResetFontOverlay ? null :
            h(RemoveOverlay, {
                header: 'reset to default font?',
                closeOverlay: () => this.setState({ showResetFontOverlay: false }),
                remove: () => {
                    let fontData = Font.parse(ASCII_TINY)
                    setFontData(fontData)
                    this.setState({ showResetFontOverlay: false })
                }
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

        return overlay({ closeOverlay, header: 'font settings' }, [
            row([ span({}, ['current font: ', strong(fontData.name)]) ]),
            row([
                span({ className: 'label' }, 'text resolution'),
                fontResolutionDropdown
            ]),
            row([
                span({ className: 'label' }, 'text direction'),
                fontDirectionButton
            ]),
            row([ importFontButton, resetFontButton ]),
            importFontOverlay,
            resetFontOverlay
        ])
    }
}

class ResizeWorldOverlay extends Component {
    constructor({ worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight }) {
        super()
        this.state = {
            worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight
        }
    }

    render({
        closeOverlay,
        resize
    }, {
        worldWidth,
        worldHeight,
        roomWidth,
        roomHeight,
        spriteWidth,
        spriteHeight,
        showConfirmResizeOverlay
    }) {
        let worldResized = worldWidth !== this.props.worldWidth || worldHeight !== this.props.worldHeight
        let roomResized = roomWidth !== this.props.roomWidth || roomHeight !== this.props.roomHeight
        let spriteResized = spriteWidth !== this.props.spriteWidth || spriteHeight !== this.props.spriteHeight
        let resizedString = ''
        if (worldResized && roomResized && spriteResized) resizedString = 'world, rooms, and sprites'
        else if (worldResized && roomResized) resizedString = 'world and rooms'
        else if (worldResized && spriteResized) resizedString = 'world and sprites'
        else if (roomResized && spriteResized) resizedString = 'room and sprites'
        else if (worldResized)  resizedString = 'world'
        else if (roomResized)  resizedString = 'rooms'
        else if (spriteResized)  resizedString = 'sprites'
        
        let resizeButton =
            button({
                className: 'fill',
                disabled: !resizedString,
                onclick: () => this.setState({ showConfirmResizeOverlay: true })
            }, 'resize')

        let confirmResizeOverlay = !showConfirmResizeOverlay ? null :
            h(RemoveOverlay, {
                header: `are you sure you want to resize your ${resizedString}?`,
                closeOverlay: () => this.setState({ showConfirmResizeOverlay: false }),
                remove: () => {
                    resize(this.state)
                    this.setState({ showConfirmResizeOverlay: false })
                }
            })

        return overlay({ closeOverlay, header: 'resize world' }, [
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
            confirmResizeOverlay
        ])
    }
}

class ScriptoriumOverlay extends Component {
    render({ closeOverlay, insertText, spriteOnly }, { currentSection }) {
        let scriptSections = Object.keys(scriptorium).map(sectionName => {
            let isOpen = currentSection === sectionName

            let scriptItems = scriptorium[sectionName].map(scriptItem => {
                if (scriptItem.spriteOnly && !spriteOnly) return null
                let argText = scriptItem.args.map(a => '[' + a + ']').join(' ')
                let scriptText = scriptItem.text.replace('?', argText)
                return div({},
                    a({
                        href: '',
                        onclick: e => {
                            e.preventDefault()
                            insertText(scriptText)
                        }
                    }, scriptItem.name)
                )
            })

            return div({ className: 'script-section ' + (isOpen || !currentSection ? 'open' : 'closed') }, [
                row([
                    button({
                        className: 'fill',
                        onclick: () => {
                            this.setState({ currentSection: (isOpen ? null : sectionName) })
                        }
                    }, row([
                        span({}, sectionName),
                        fill(),
                        span({}, (isOpen ? '▲' : '▼'))
                    ]))
                ]),
                div({ className: 'script-item-list ' + (isOpen ? 'open' : 'closed') },
                    scriptItems
                )
            ])

        })

        let moreInfoLink = currentSection ? null :
            div({ className: 'welcome-links' }, [
                a({ href: 'https://github.com/zenzoa/mosi/wiki/scripts', target: '_blank' }, 'more info on scripts'),
            ])

        return overlay({ closeOverlay, header: 'insert script' }, [
            scriptSections,
            moreInfoLink
        ])
    }
}

class ModsOverlay extends Component {
    render({ closeOverlay, modList = [], addMod, renameMod, changeModType, updateModCode, removeMod }, { currentModIndex = 0, showRemoveModOverlay }) {
        if (modList.length === 0) {
            return overlay({ closeOverlay, header: 'custom scripts' }, [
                row([
                    button({
                        class: 'fill',
                        onclick: () => addMod()
                    }, 'add script')
                ])
            ])
        }

        let currentMod = modList[currentModIndex]

        let modDropdown = dropdown({
            class: 'fill',
            value: currentModIndex,
            onchange: e => this.setState({ currentModIndex: e.target.value })
        },
            modList.map((mod, modIndex) => {
                return option({ value: modIndex }, mod.name)
            })
        )

        let addButton = iconButton({
            onclick: () => addMod()
        }, 'add')

        let nameTextbox = textbox({
            placeholder: 'script name',
            value: currentMod.name,
            onchange: e => renameMod(currentModIndex, e.target.value)
        })

        let typeButton = button({
            class: 'fill',
            onclick: () => {
                let newType = ''
                if (currentMod.type === 'function') {
                    newType = 'expression'
                } else {
                    newType = 'function'
                }
                changeModType(currentModIndex, newType)
            }
        }, currentMod.type)

        let removeButton = iconButton({
            title: 'remove script',
            onclick: () => this.setState({ showRemoveModOverlay: true }),
        }, 'delete')

        let removeModOverlay = !showRemoveModOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove script?',
                closeOverlay: () => this.setState({ showRemoveModOverlay: false }),
                remove: () => {
                    removeMod(currentModIndex)
                    this.setState({ currentModIndex: 0, showRemoveModOverlay: false })
                }
            })

        let codeTextarea = textarea({
            value: currentMod.code,
            onchange: e => updateModCode(currentModIndex, e.target.value),
            rows: 10
        })

        return overlay({ closeOverlay, header: 'custom scripts' }, [
            row([ modDropdown, addButton ]),
            hr(),
            div({}, [
                row([ nameTextbox, typeButton, removeButton ]),
                codeTextarea
            ]),
            removeModOverlay
        ])
    }
}