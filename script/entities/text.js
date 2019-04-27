class Text {

    constructor(props) {
        let { string, fontData, fontDirection, wrapper, padding, width, height, displayAtBottom } = props

        this.string = string
        this.fontData = fontData
        this.fontDirection = fontDirection
        this.wrapper = wrapper
        this.width = width
        this.height = Math.floor(fontData.height * 2.5) + Math.floor(padding * 1.5)
        this.linesPerPage = 2

        this.x = 0
        this.y = displayAtBottom ? height - this.height - Math.floor(padding / 2) : Math.floor(padding / 2)
        this.innerX = this.x + padding
        this.innerY = this.y + Math.floor(padding * 0.75)
        this.innerWidth = this.width - (padding * 2)

        this.wrapper.style.position = 'relative'
        this.canvas = document.createElement('canvas')
        this.canvas.width = width
        this.canvas.height = height
        this.canvas.style.position = 'absolute'
        this.canvas.style.top = '0'
        this.canvas.style.left = '0'
        this.context = this.canvas.getContext('2d')

        this.numCharsToShow = 0
        this.currentPageIndex = 0
        this.pageComplete = false

        this.begin = () => {
            this.wrapper.appendChild(this.canvas)
            this.pageList = this.preparePages(this.string)
        }

        this.end = () => {
            this.wrapper.removeChild(this.canvas)
        }

        this.preparePages = () => {
            let { width, characterList } = this.fontData

            let textData = this.string
            let linebreaks = textData.split(/\n/g)
            textData = linebreaks.join(' {br} ')
            textData = textData.replace(/{.+?}/g, ' $& ')
            let words = textData.split(/\s/g)

            let pages = []
    
            let lines = []
            let lineSoFar = ''
            let lineWidthSoFar = 0
    
            let newPage = () => {
                pages.push(lines)
                lines = []
            }
    
            let newLine = () => {
                lines.push(lineSoFar)
                lineSoFar = ''
                lineWidthSoFar = 0
                if (lines.length === this.linesPerPage) newPage()
            }
    
            let addText = (word, wordLength) => {
                if (lineSoFar) lineSoFar += ' '
                lineSoFar += word
                lineWidthSoFar += wordLength + width
            }
    
            words.forEach(word => {
                let wordLength = 0
                for (let i = 0; i < word.length; i++) {
                    let charCode = word.charCodeAt(i)
                    let charData = characterList[charCode]
                    if (!charData) return
                    let spacing = charData.spacing ? charData.spacing : width
                    wordLength += spacing
                }

                if (word.toLowerCase() === '{br}') {
                    newLine()
                }
                else if (word.toLowerCase() === '{p}') {
                    newLine()
                    newPage()
                }
                else if (lineWidthSoFar + wordLength > this.innerWidth) {
                    newLine()
                    addText(word, wordLength)
                }
                else {
                    addText(word, wordLength)
                }
            })
    
            if (lineSoFar) newLine()
            if (lines.length > 0) newPage()
    
            return pages
        }

        this.draw = (timestamp) => {
            let dt = !this.lastCharTimestamp ? 1000 : timestamp - this.lastCharTimestamp

            let page = this.pageList[this.currentPageIndex]

            if (dt >= 50 && !this.pageComplete) {
                this.numCharsToShow++
                this.lastCharTimestamp = timestamp
            }

            // draw background
            this.context.fillStyle = 'black'
            this.context.fillRect(
                this.x,
                this.y,
                this.width,
                this.height
            )

            // draw characters
            this.context.fillStyle = 'white'
            let numCharsLeft = this.pageComplete ? 10000 : this.numCharsToShow
            let y = this.innerY
            page.forEach(line => {
                let x = this.fontDirection === 'rtl' ? this.innerWidth : this.innerX
                let numCharsOnLine = Math.min(numCharsLeft, line.length)
                for (let i = 0; i < numCharsOnLine; i++) {
                    let charCode = line.charCodeAt(i)
                    let charSpacing = this.drawChar(charCode, x, y)
                    if (this.fontDirection === 'rtl') x -= charSpacing
                    else x += charSpacing
                }
                numCharsLeft -= numCharsOnLine
                y += Math.floor(this.fontData.height * 1.5)
            })

            // draw pagination mark
            if (this.currentPageIndex < this.pageList.length - 1) {
                let pageMarkX = this.x + this.width - padding
                let pageMarkY = this.y + this.height - padding
                let pageMarkSize = this.fontData.width
                for (let i = 0; i < pageMarkSize; i++) {
                    this.context.fillRect(pageMarkX + pageMarkSize - i, pageMarkY + i, i + 1, 1)
                }
            }

            // mark page as complete
            if (numCharsLeft > 0) {
                this.pageComplete = true
            }
        }

        this.drawChar = (charCode, x, y) => {
            let { width, height, characterList } = this.fontData

            let charData = characterList[charCode]
            if (!charData) return 0

            if (!isNaN(charData.width)) width = charData.width
            if (!isNaN(charData.height)) height = charData.height

            let offsetX = 0
            let offsetY = 0
            if (!isNaN(charData.offsetX)) offsetX = charData.offsetX
            if (!isNaN(charData.offsetY)) offsetY = charData.offsetY

            let spacing = width
            if (!isNaN(charData.spacing)) spacing = charData.spacing

            for (let cx = 0; cx < width; cx++) {
                for (let cy = 0; cy < height; cy++) {
                    let pixel = charData.data[cy * width + cx]
                    if (pixel) this.context.fillRect(x + cx + offsetX, y + cy + offsetY, 1, 1)
                }
            }

            return spacing
        }
        
        this.finishPage = () => {
            if (this.pageComplete) {
                if (this.currentPageIndex < this.pageList.length - 1) {
                    this.currentPageIndex++
                    this.numCharsToShow = 0
                    this.pageComplete = false
                }
            } else {
                this.pageComplete = true
            }
        }

        this.isComplete = () => {
            let isOnLastPage = this.currentPageIndex === this.pageList.length - 1
            return isOnLastPage && this.pageComplete
        }

    }

}