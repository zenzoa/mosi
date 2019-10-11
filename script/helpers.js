let { h, render, Component } = preact

let exists = (x) => typeof x !== 'undefined' && x != null
let isStr = (x) => typeof x === 'string'
let isBool = (x) => typeof x === 'boolean'
let isArr = (x) => Array.isArray(x)
let isObj = (x) => typeof x === 'object' && !isArr(x)
let isNum = (x) => !isNaN(x) && parseFloat(x) === x
let isInt = (x) => isNum(x) && parseInt(x) === parseFloat(x)

let deepClone = (obj) => JSON.parse(JSON.stringify(obj))

let reorderList = (list, sourceId, insertId) => {
    insertId = Math.min(Math.max(0, insertId), list.length)
    let itemToMove = list[sourceId]

    if (insertId === 0) {
        return [itemToMove]
            .concat(list.slice(0, sourceId))
            .concat(list.slice(sourceId + 1))

    } else if (insertId < sourceId) {
        return list.slice(0, insertId)
            .concat([itemToMove])
            .concat(list.slice(insertId, sourceId))
            .concat(list.slice(sourceId + 1))

    } else if (sourceId < insertId) {
        return list.slice(0, sourceId)
            .concat(list.slice(sourceId + 1, insertId))
            .concat([itemToMove])
            .concat(list.slice(insertId))
            
    } else {
        return list
    }
}

let checkForUpdates = (nextProps, currentProps) => {
    let updatesMade = false
    Object.keys(nextProps).forEach(key => {
        if (nextProps[key] !== currentProps[key]) {
            updatesMade = true
        }
    })
    return updatesMade
}

let span = (props, children) => h('span', props, children)
let div = (props, children) => h('div', props, children)
let canvas = (props, children) => h('canvas', props, children)
let button = (props, children) => h('button', props, children)
let textbox = (props, children) => {
    props.type = 'text'
    return h('input', props, children)
}
let numbox = (props, children) => {
    props.type = 'number'
    props.step = 1
    props.pattern = '\d+'
    return h('input', props, children)
}
let fileinput = ({ onUpload, fileType }) => {
    let onchange = event => {
        Files.upload(event, data => onUpload(data))
    }
    return h('input', { type: 'file', accept: fileType, onchange })
}
let textarea = (props, children) => h('textarea', props, children)
let option = (props, children) => h('option', props, children)
let dropdown = (props, children) => div({ className: 'dropdown' }, h('select', props, children))
let label = (props, children) => h('label', props, children)
let img = (props, children) => h('img', props, children)
let a = (props, children) => h('a', props, children)
let em = (children) => h('em', {}, children)
let strong = (children) => h('strong', {}, children)
let row = (children) => div({ className: 'row' }, children)
let fill = () => div({ className: 'fill' })
let hr = () => h('hr')
let vr = () => div({ className: 'vertical-divider' })

class Panel extends Component {
    componentDidMount() {
        this.scrollIntoView()
        let focusEl = this.node.querySelector('.initial-focus')
        if (focusEl) focusEl.focus()
    }

    scrollIntoView() {
        if (document.body.className.includes('multi-tab-mode')) {
            this.node.scrollIntoView({ behavior: 'smooth', inline: 'center'})
        }
    }

    render(props) {
        props.className = 'panel ' + (props.className ? props.className : '')
        props.ref = node => { this.node = node }
        return div(props, [
            div({ className: 'panel-header' }, [
                span({}, icon(props.header)),
                span({}, button({
                    onclick: props.closeTab,
                    className: 'simple icon'
                }, '×'))
            ]),
            div({ className: 'panel-content' }, props.children)
        ])
    }
}

let panel = (props, children) => {
    return h(Panel, props, children)
}

class Overlay extends Component {
    componentDidMount() {
        let focusEl = this.node.querySelector('.initial-focus')
        if (focusEl) focusEl.focus()
        window.scrollTo(0, 0)
        document.body.className += ' no-scroll'
    }

    componentWillUnmount() {
        document.body.className = document.body.className.replace(' no-scroll', '')
    }

    render(props) {
        props.className = 'overlay ' + (props.className ? props.className : '')
        return div(
            {
                className: 'overlay-wrapper',
                ref: node => { this.node = node }
            },
            div(props, [
                div({ className: 'overlay-header' }, [
                    span({}, props.header),
                    span({}, button({
                        onclick: props.closeOverlay,
                        className: 'simple icon'
                    }, '×'))
                ]),
                div({ className: 'overlay-content' }, props.children)
            ])
        )
    }
}

let overlay = (props, children) => {
    return h(Overlay, props, children)
}

class IconButton extends Component {
    render(props) {
        if (!props.icon) return button(props)
        props.dangerouslySetInnerHTML = { __html: props.icon }
        return button(props)
    }
}

let iconButton = (props, iconName) => {
    props.icon = icons[iconName]
    return h(IconButton, props)
}

let spriteButton = ({ className, onclick, sprite, isSelected, colorList }) => {
    let avatarClass = sprite.isAvatar ? ' avatar' : ''
    let selectedClass = isSelected ? ' selected' : ''
    let spriteName = sprite.name
    if (spriteName.startsWith('sprite')) spriteName = ''

    let colorIndex = sprite.colorIndex
    while (colorIndex > 0 && !colorList[colorIndex]) colorIndex--
    let color = colorList[colorIndex]
    let backgroundColor = colorList[0]

    return button({
        title: spriteName,
        className: 'sprite-button ' + className + avatarClass + selectedClass,
        onclick,
    }, [
        span({}, h(SpriteCanvas, {
            width: sprite.width,
            height: sprite.height,
            frameList: sprite.frameList,
            color,
            backgroundColor
        }))
    ])
}

let paletteButton = ({ className, onclick, palette, isSelected }) => {
    let selectedClass = isSelected ? ' selected' : ''
    let paletteName = palette.name

    let colorBlocks = palette.colorList.map(color => {
        return div({ className: 'color-block', style: { backgroundColor: color }})
    })

    return button({
        title: paletteName,
        className: 'palette-button ' + className + selectedClass,
        onclick
    },
        div({ className: 'color-blocks'}, colorBlocks)
    )
}

let musicButton = ({ className, onclick, music, isSelected }) => {
    let selectedClass = isSelected ? ' selected' : ''
    let musicName = music.name

    let scales = Music.getScales()

    let voiceItemList = []
    for (let voiceIndex = 0; voiceIndex < 4; voiceIndex++) {
        let noteItemList = []
        for (let noteIndex = 0; noteIndex < 16; noteIndex++) {
            let voice = music.voiceList[voiceIndex]
            let freq = voice.noteList[noteIndex]
            let scale = scales[voiceIndex]
            let colorIndex = scale.findIndex(f => f === freq)
            let color = colorIndex >= 0 ? Music.noteColors[colorIndex] : null
            noteItemList.push(
                div({
                    className: 'music-button-grid-item',
                    style: { background: color }
                })
            )
        }
        voiceItemList.push(
            div({ className: 'music-button-grid-row' }, noteItemList)
        )
    }
    let musicGrid = div({ className: 'music-button-grid' }, voiceItemList)
    
    return button({
        title: musicName,
        className: 'music-button ' + className + selectedClass,
        onclick
    }, musicGrid)
}

let colorButton = ({ className, onclick, color, title, isSelected }) => {
    let selectedClass = isSelected ? ' selected' : ''
    let colorBlock = div({ className: 'color-block', style: { backgroundColor: color }})

    return button({
        title: title || color,
        className: 'color-button ' + className + selectedClass,
        onclick
    },
        div({ className: 'color-blocks'}, colorBlock)
    )
}
