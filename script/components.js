class Textbox extends Component {
    constructor(props) {
        super()
        this.handleInput = (text) => props.onchange && props.onchange(text)
    }

    render(props) {
        props = deepClone(props)
        props.type = props.type || 'text'
        props.value = props.text
        props.oninput = (event) => this.handleInput(event.target.value)
        props.onchange = null

        let input = h('input', props)
        if (!props.label) return input

        return h('label', null, [
            h('span', null, props.label),
            input
        ])
    }
}

class BigTextbox extends Component {
    constructor(props) {
        super()
        this.state = { text: props.text }
        this.handleInput = (text) => this.setState({ text })
        this.handleChange = (text) => props.onchange && props.onchange(text)
    }

    render(props, state) {
        let textarea = h('textarea', {
            class: props.class,
            style: props.style,
            value: state.text,
            placeholder: props.placeholder,
            oninput: (event) => this.handleInput(event.target.value),
            onchange: (event) => this.handleChange(event.target.value)
        })
        if (!props.label) return textarea

        return h('label', null, [
            h('span', null, props.label),
            textarea
        ])
    }
}

class Button extends Component {
    render(props) {
        return h('button', {
            type: 'button',
            class: props.class,
            style: props.style,
            disabled: props.disabled,
            onclick: () => props.onclick && props.onclick()
        }, props.children)
    }
}

class Toggle extends Component {
    constructor() {
        super()
        this.onclick = () => this.props.onchange(!this.props.value)
    }

    render(props) {
        let label
        if (props.children.length > 1) label = props.value ? props.children[1] : props.children[0]
        else label = props.children

        return h('button', {
            type: 'button',
            class: 'toggle ' + (props.value ? 'on' : 'off') + ' ' + (props.class || ''),
            onclick: this.onclick
        }, label)
    }
}

class Modal extends Component {
    render(props) {
        if (props.open) return h('div', { class: 'modal' }, h('div', { class: 'modal-contents' }, props.children))
        else return null
    }
}

class Filler extends Component {
    render() {
        return h('div', { class: 'filler' })
    }
}

class CloseButton extends Component {
    render(props) {
        return h(Button, {
            class: 'icon-button close-button',
            onclick: props.onclick
        }, '🞭')
    }
}

class BackButton extends Component {
    render(props) {
        return h(Button, {
            class: 'icon-button',
            onclick: props.onclick
        }, '⯇')
    }
}

class RemoveButton extends Component {
    constructor() {
        super()
        this.state = { confirmModal: false }
    }

    render(props, state) {
        let removeButton = h(Button, {
            class: props.class,
            style: props.style,
            disabled: props.disabled,
            onclick: () => this.setState({ confirmModal: true })
        }, props.children)

        let modalLabel = h('header', null, 'Are you sure?')

        let buttonClose = h(CloseButton, {
            onclick: () => this.setState({ confirmModal: false })
        })

        let confirmButton = h(Button, {
            onclick:  () => {
                props.onclick && props.onclick()
                this.setState({ confirmModal: false })
            }
        }, 'yes, remove it')

        let cancelButton = h(Button, {
            onclick: () => this.setState({ confirmModal: false })
        }, 'nevermind')

        let modal = h(Modal, { open: state.confirmModal }, [buttonClose, modalLabel, confirmButton, cancelButton])

        return state.confirmModal ? modal : removeButton
    }
}

class MoreActions extends Component {
    constructor(props) {
        super()

        this.state = { open: props.open }

        this.open = () => this.setState({ open: true })
        this.close = () => this.setState({ open: false })
    }

    componentWillReceiveProps(newProps) {
        this.setState({ open: newProps.open })
    }

    render(props, state) {
        let buttonOpen = h(Button, { class: 'icon-button', onclick: this.open }, '🞴')
        let buttonClose = h(CloseButton, { onclick: this.close })
        let modal = h(Modal, { open: state.open }, [ buttonClose, props.children ])
        return h('div', { class: 'more-actions' }, [ buttonOpen, modal ])
    }
}

class ButtonRow extends Component {
    render(props) {
        return h('div', { class: 'button-row' }, props.children)
    }
}

class Panel extends Component {
    render(props) {
        let header = h('header', { class: 'button-row' }, props.header)
        let content = h('div', { class: 'panel-content' }, props.content)
        let footer = h('footer', { class: 'button-row' }, props.footer)
        let filler = props.centered ? h(Filler) : null
        return h('section', null, [header, filler, content, h(Filler), footer])
    }
}

class Grid extends Component {
    render(props) {
        let rows = []
        for (let y = 0; y < props.size; y++) {
            let cells = []
            for (let x = 0; x < props.size; x++) {
                let id = XYtoID(x, y, props.size)
                cells.push(h('div', { class: 'grid-cell' }, props.cell(id, x, y)))
            }
            rows.push(h('div', { class: 'grid-row' }, cells))
        }
        return h('div', { class: 'grid' }, rows)
    }
}

class DrawingGrid extends Component {
    constructor() {
        super()

        this.drawing = false
        this.erasing = false

        this.startDrawing = (event) => {
            event.preventDefault()
            if (this.drawing) return
    
            let id = parseInt(event.target.getAttribute('data-id'))
            let cell = this.props.getCell(id)
            this.drawing = true
            this.erasing = this.props.canEraseCell(id)
            this.props.setCell(id, !cell)
        }
    
        this.endDrawing = () => {
            this.drawing = false
            this.erasing = false
        }
    
        this.setCell = (event) => {
            let realEvent = event.touches ? event.touches[0] : event
            let target = document.elementFromPoint(realEvent.clientX, realEvent.clientY)
            if (!target || target.className !== 'grid-cell-contents') return
    
            let id = parseInt(target.getAttribute('data-id'))
            if (this.drawing) this.props.setCell(id, !this.erasing)
        }
    
        this.renderCell = (id) => {
            let contents = this.props.renderCell(id)
            return h('div', {
                class: 'grid-cell-contents',
                'data-id': id,
                ontouchstart: this.startDrawing,
                onmousedown: this.startDrawing
            }, contents)
        }
    }

    componentDidMount() {
        document.addEventListener('mouseup', this.endDrawing)
        document.addEventListener('mousemove', this.setCell)

        document.addEventListener('touchend', this.endDrawing)
        document.addEventListener('touchcancel', this.endDrawing)
        document.addEventListener('touchmove', this.setCell)
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.endDrawing)
        document.removeEventListener('mousemove', this.setCell)

        document.removeEventListener('touchend', this.endDrawing)
        document.removeEventListener('touchcancel', this.endDrawing)
        document.removeEventListener('touchmove', this.setCell)
    }

    render(props) {
        return h(Grid, { size: props.size, cell: this.renderCell })
    }
}

class SpriteCanvas extends Component {
    constructor() {
        super()

        this.frameId = 0
        this.animationLoop = null
        this.animationStart = null

        this.updateCanvas = (timestamp) => {
            let sprite = this.props.sprite
            let frames = sprite.frames
            let frameId = typeof this.props.frameId === 'number' ? this.props.frameId : this.frameId

            if (!this.animationStart) this.animationStart = timestamp
            let dt = timestamp - this.animationStart
            if (dt >= this.props.frameRate && typeof this.props.frame !== 'number') {
                this.animationStart = timestamp
                this.frameId = (this.frameId >= frames.length - 1) ? 0 : this.frameId + 1
            }

            if (frames[frameId]) {
                let backgroundColor = this.props.backgroundColor || '#fff'
                clearCanvas(this.base, this.props.transparent ? null : backgroundColor)
                renderFrame(this.base, frames[frameId], { color: this.props.color })
            }

            this.animationLoop = window.requestAnimationFrame(this.updateCanvas)
        }
    }

    componentDidMount() {
        this.animationLoop = window.requestAnimationFrame(this.updateCanvas)
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.animationLoop)
    }

    render(props) {
        return h('canvas', { class: 'sprite-canvas ' + (props.class || ''), width: props.size, height: props.size })
    }
}