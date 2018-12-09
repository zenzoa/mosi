class Exporter {
    static downloadFile(filename, contents) {
        let blob = new Blob([contents], { type: 'plain/text' })
        let blobURL = URL.createObjectURL(blob)

        let downloadLink = document.createElement('a')
        downloadLink.download = filename
        downloadLink.href = blobURL
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
    }

    static fillTemplate(template, marker, text) {
        let markerIndex = template.indexOf(marker)
        let before = template.substr(0, markerIndex)
        let after = template.substr(markerIndex + marker.length)
        return before + text + after
    }

    static exportEntity(entity) {
        let data
        try {
            data = JSON.stringify(entity)
        } catch(e) {
            console.error('unable to encode data', e)
            return
        }

        let filetype = entity.type ? '.mosi' + entity.type : '.mosi'
        let filename = entity.name ? encodeURI(entity.name) : 'untitled'

        this.downloadFile(filename + filetype, data)
    }

    static exportGame(resources, world) {
        let html = resources.get('exportTemplate.html').substr()

        let title = world.name || 'a môsi world'

        let gameData
        try {
            gameData = JSON.stringify(World.export(world))
        } catch(e) {
            console.error('Unable to encode game data', e)
            return
        }

        html = this.fillTemplate(html, '//TITLE//', title)
        html = this.fillTemplate(html, '//GAME_DATA//', gameData)
        html = this.fillTemplate(html, '//HELPER_SCRIPTS//', resources.get('script/helpers.js'))
        html = this.fillTemplate(html, '//TEXT_SCRIPT//', resources.get('script/entities/text.js'))
        html = this.fillTemplate(html, '//ACTION_SCRIPT//', resources.get('script/entities/action.js'))
        html = this.fillTemplate(html, '//FRAME_SCRIPT//', resources.get('script/entities/frame.js'))
        html = this.fillTemplate(html, '//SPRITE_SCRIPT//', resources.get('script/entities/sprite.js'))
        html = this.fillTemplate(html, '//PALETTE_SCRIPT//', resources.get('script/entities/palette.js'))
        html = this.fillTemplate(html, '//ROOM_SCRIPT//', resources.get('script/entities/room.js'))
        html = this.fillTemplate(html, '//WORLD_SCRIPT//', resources.get('script/entities/world.js'))
        html = this.fillTemplate(html, '//GAME_SCRIPT//', resources.get('script/entities/game.js'))

        let filename = world.name ? encodeURI(world.name) : 'index'
        this.downloadFile(filename + '.html', html)
    }
}