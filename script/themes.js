let Theme = {
    apply: (theme) => {
        Object.keys(theme).forEach(key => {
            let value = theme[key]
            document.body.style.setProperty(key, value)
        })
    },

    reset: () => {
        let numStyles = document.body.style.length
        for (let i = numStyles - 1; i >= 0; i--) {
            let key = document.body.style[i]
            document.body.style.setProperty(key, null)
        }
    },

    lavender: {
        '--panel-bg-color': '#E09CD6',
        '--world-panel-color': '#C2E0FC',
        '--sprite-panel-color': '#B7BCEE',
        '--color-panel-color': '#B29CE0',
        '--music-panel-color': '#B170C6',
        '--play-panel-color': '#AD45AA'
    }
}