let { h, render, Component } = preact

window.onload = () => {
    render(
        h(Editor),
        document.getElementById('editor')
    )
}