let gameTemplate = `
<!DOCTYPE html>

<html>

<head>
<title>//TITLE//</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">

<style>
html, body {
    overflow: hidden;
    height: 100%;
    margin: 0;
    padding: 0;
    background: black;
}

#game-wrapper {
    max-width: 100vh;
    max-height: 100vw;
    margin: 0 auto;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

canvas {
    display: block;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    image-rendering: -moz-crisp-edges;
}

canvas:focus {
    outline: none;
}

</style>

<script>
window.GAME_DATA = //GAME_DATA//
</script>

<script>
let Text = (() => {
//TEXT_SCRIPT//
})()
</script>

<script>
let MusicPlayer = (() => {
//MUSIC_SCRIPT//
})()
</script>

<script>
let Script = (() => {
//SCRIPT_SCRIPT//
})()
</script>

<script>
let Game = (() => {
//GAME_SCRIPT//
})()
</script>

<script>
window.onload = () => {
    let wrapper = document.getElementById('game-wrapper')
    this.game = new Game(window.GAME_DATA, wrapper)
    this.game.begin()
}
</script>

</head>

<body>
<div id='game-wrapper'></div>
</body>

</html>
`