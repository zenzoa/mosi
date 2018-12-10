let DEBUG = false

window.onload = () => {
    let main = document.getElementsByTagName('main')[0]
    let editor = h(Editor)
    render(editor, main)
    
    window.resources = new ResourceLoader()
    window.resources.load('exportTemplate.html')
    window.resources.load('script/helpers.js')
    window.resources.load('script/entities/text.js')
    window.resources.load('script/entities/action.js')
    window.resources.load('script/entities/frame.js')
    window.resources.load('script/entities/sprite.js')
    window.resources.load('script/entities/palette.js')
    window.resources.load('script/entities/room.js')
    window.resources.load('script/entities/world.js')
    window.resources.load('script/entities/game.js')
}