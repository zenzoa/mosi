let Files = {

    loadResource: (filename, onready) => {
        let client = new XMLHttpRequest()
        
        client.open('GET', './' + filename)
        client.responseType = 'text'

        client.onreadystatechange = () => {
            if (client.readyState === 4 && client.status === 200) {
                if (onready) onready(client.responseText)
            }
        }

        client.send()
    },

    upload: (fileEvent, callback) => {
        const file = fileEvent.target.files[0]
        if (!file) return
    
        const reader = new FileReader()
        reader.addEventListener('load',() => callback(reader.result), false)
        reader.addEventListener('error', () => callback())
    
        reader.readAsText(file)
    },

    download: (filename, contents) => {
        try {

            let blob = new Blob([contents], { type: 'plain/text' })
            let blobURL = URL.createObjectURL(blob)
            
            let downloadLink = document.createElement('a')
            downloadLink.download = filename
            downloadLink.href = blobURL
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)

        } catch (e) {
            console.error('unable to create file', e)
        }
    }

}