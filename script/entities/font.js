class Font {
    static parse(string) {
        let size
        let characters = {}
        let lines = string.split('\n')
        let i = 0
        while (i < lines.length) {
            let line = lines[i].toLowerCase()
            let parts = line.split(' ')

            if (parts[0] === 'size' && parts.length === 3) {
                let width = parseInt(parts[1])
                let height = parseInt(parts[2])
                if (!isNaN(width) && !isNaN(height)) {
                    size = { width, height }
                }

            } else if (parts[0] === 'char' && parts.length === 2 && size) {
                let char = parts[1]
                let data = Array(size.width * size.height).fill(0)
                for (let y = 0; y < size.height; y++) {
                    i++
                    let row = lines[i]
                    for (let x = 0; x < size.width; x++) {
                        let pixel = parseInt(row && row[x])
                        if (pixel) data[y * size.width + x] = 1
                    }
                }
                characters[char] = data
            }

            i++
        }
        return { size, characters }
    }
}