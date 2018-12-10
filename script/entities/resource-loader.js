class ResourceLoader {
    constructor() {
        this.resources = {}
    }

    load(filename, onready) {
        let client = new XMLHttpRequest()
		client.open('GET', './' + filename)
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