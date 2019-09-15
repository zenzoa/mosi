let Files = {

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

            filename = filename.replace(/\s+/g, '_')
            
            let downloadLink = document.createElement('a')
            downloadLink.download = encodeURIComponent(filename)
            downloadLink.href = blobURL
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)

        } catch (e) {
            console.error('unable to create file', e)
        }
    },

    fillTemplate: (template, dictionary) => {
        Object.keys(dictionary).forEach(key => {
            let value = dictionary[key]
            template = template.replace('//' + key + '//', value)
        })
        return template
    }

}
