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
let textarea = (props, children) => h('textarea', props, children)
let option = (props, children) => h('option', props, children)
let dropdown = (props, children) => div({ className: 'dropdown' }, h('select', props, children))
let label = (props, children) => h('label', props, children)
let img = (props, children) => h('img', props, children)
let a = (props, children) => h('a', props, children)
let em = (children) => h('em', {}, children)
let strong = (children) => h('strong', {}, children)

class Panel extends Component {
    componentDidMount() {
        let focusEl = this.node.querySelector('.initial-focus')
        if (focusEl) focusEl.focus()
    }

    render(props) {
        props.className = 'panel'
        props.ref = node => { this.node = node }
        return div(props, [
            div({ className: 'panel-header' }, [
                span({}, props.header),
                span({}, button({ 
                    onclick: props.closeTab,
                    className: 'simple' 
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
        props.className = 'overlay'
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
                        className: 'simple'
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

class Menu extends Component {
    componentDidUpdate(_, prevState) {
        if (this.state.showOverlay && prevState.showOverlay) {
            this.setState({ showOverlay: false })
        }
    }

    render(props, { showOverlay }) {
        let menuOverlay = !showOverlay ? null :
            overlay({
                closeOverlay: () => this.setState({ showOverlay: false }),
                ...props
            }, props.children)
        return div({ className: 'menu' }, [
            button({
                onclick: () => {
                    if (showOverlay) this.setState({ showOverlay: false })
                    else this.setState({ showOverlay: true })
                }
            }, 'more'),
            menuOverlay
        ])
    }
}

let menu = (props, children) => {
    return h(Menu, props, children)
}

let spriteButton = ({ onclick, sprite, isSelected, colorList }) => {
    let avatarClass = sprite.isAvatar ? ' avatar' : ''
    let selectedClass = isSelected ? ' selected' : ''
    let spriteName = sprite.name
    if (spriteName.startsWith('sprite')) spriteName = ''

    let colorIndex = sprite.colorIndex
    while (colorIndex > 0 && !colorList[colorIndex]) colorIndex--
    let color = colorList[colorIndex]
    let backgroundColor = colorList[0]

    return button({
        className: 'sprite-button' + avatarClass + selectedClass,
        onclick,
    }, [
        span({}, h(SpriteCanvas, {
            width: sprite.width,
            height: sprite.height,
            frameList: sprite.frameList,
            color,
            backgroundColor
        })),
        span({ className: 'sprite-button-name' },
            spriteName
        )
    ])
}

class ColorPicker extends Component {
    componentDidMount() {
        this.colorPicker = new iro.ColorPicker(this.el, this.props)
        this.colorPicker.on('color:change', color => {
            if (this.props.onColorChange) this.props.onColorChange(color)
        })
    }

    shouldComponentUpdate(nextProps) {
        let { color, ...otherProps } = nextProps
        if (color) this.colorPicker.color.set( color)
        this.colorPicker.setState(otherProps)
        return false
    }
  
    render() {
        return div({ ref: el => { this.el = el } })
    }
}