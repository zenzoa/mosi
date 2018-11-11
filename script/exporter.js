class ResourceLoader {
    constructor() {
        this.resources = {}
    }

    load(filename, onready) {
        let client = new XMLHttpRequest()
		client.open('GET', './../' + filename)
		client.onreadystatechange = () => {
			this.resources[filename] = client.responseText
			if (onready) onready()
		}
		client.send()
    }

    get(filename) {
        return this.resources[filename]
    }
}

class Exporter {
    static downloadFile(filename, contents) {
        let blob = new Blob( [contents] )
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

    static exportGame(resources, world) {
        let html = resources.get('exportTemplate.html').substr()

        let title = world.name
        let gameData

        try {
            gameData = JSON.stringify(world)
        } catch(e) {
            console.error('Unable to encode game data', e)
            return
        }

        html = this.fillTemplate(html, '//TITLE//', title)
        html = this.fillTemplate(html, '//GAME_DATA//', gameData)
        html = this.fillTemplate(html, '//HELPER_SCRIPTS//', resources.get('script/helpers.js'))
        html = this.fillTemplate(html, '//MAIN_SCRIPTS//', resources.get('script/play.js'))

        let filename = (world.name || 'index') + '.html'
        this.downloadFile(filename, html)
    }
}