let { h, render, Component } = preact

let div = (...args) => h('div', ...args)
let span = (...args) => h('span', ...args)
let a = (...args) => h('a', ...args)
let img = (...args) => h('img', ...args)
let button = (...args) => h('button', ...args)
let input = (...args) => h('input', ...args)
let canvas = (...args) => h('canvas', ...args)
let table = (...args) => h('table', ...args)
let tr = (...args) => h('tr', ...args)
let td = (...args) => h('td', ...args)
let select = (...args) => h('select', ...args)
let option = (...args) => h('option', ...args)
let label = (...args) => h('label', ...args)
let hr = () => h('hr')
let vr = () => div({ class: 'vr' })

let textbox = props => {
    let update = props.onchange ? e => props.onchange(e.target.value) : null
    return input({
        class: props.class,
        style: props.style,
        type: props.type || 'text',
        value: props.value,
        placeholder: props.placeholder,
        onkeydown: debounce(update, 500),
        onchange: update
    })
}

let textarea = props => {
    let update = props.onchange ? e => props.onchange(e.target.value) : null
    return h('textarea', {
        value: props.value,
        onkeydown: debounce(update, 500),
        onchange: update
    })
}

let numbox = props => {
    let update = props.onchange ? e => {
        let value = parseInt(e.target.value)
        if (isInt(value)) {
            if (exists(props.min)) value = Math.max(value, props.min)
            if (exists(props.max)) value = Math.min(value, props.max)
            props.onchange(value)
            e.target.value = value
        } else {
            e.target.value = exists(props.min) ? props.min : 0
        }
    } : null
    return input({
        class: props.class,
        style: props.style,
        type: 'number',
        value: props.value,
        placeholder: props.placeholder,
        onchange: update
    })
}

let searchBox = props => {
    return div({ class: 'search-box' }, [
        textbox(props),
        div({ class: 'search-icon' }, '🔍')
    ])
}

let toggle = (props, contents) => {
    return button({
        class: 'toggle toggle-' + (props.value ? 'on' : 'off'),
        onclick: props.onclick ? () => props.onclick(!props.value) : null
    }, contents)
}

let multiButton = contents => {
    return div({ class: 'multi-button' }, contents)
}

let dropdown = (props, contents) => {
    return select({
        class: props.class,
        value: props.value,
        onchange: props.onchange ? e => props.onchange(e.target.value) : null
    }, contents)
}

let fileInput = ({ onupload, filetype }) => {
    let onchange = event => {
        getFileData(event, data => onupload(data))
    }
    return h('input', { type: 'file', accept: filetype, onchange })
}

let modal = (contents) => {
    return div({ class: 'modal' },
        div({ class: 'modal-contents'}, contents)
    )
}

let menuModal = (contents) => {
    return div({ class: 'modal menu' },
        div({ class: 'modal-contents'}, contents)
    )
}

let buttonRow = (className, contents) => {
    return div(
        { class: 'button-row ' + (contents ? className : '') },
        contents ? contents : className
    )
}