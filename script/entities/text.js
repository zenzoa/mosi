class Text {
    constructor(font, text, x, y, width, displayTime) {
        this.font = font
        this.charWidth = this.font.size.width
        this.charHeight = this.font.size.height

        this.x = x || 0
        this.y = y || 0

        this.padding = 4
        this.lineSpacing = 2
        this.w = width
        this.h = this.charHeight * 2 + this.padding * 2 + this.lineSpacing
        this.innerWidth = width - this.padding * 2

        this.bgColor = '#000'
        this.fgColor = '#fff'

        this.displayTime = displayTime || 100

        this.pages = this.prepareText(text)
        this.currentPage = 0
        this.doneWithPage = false
    }

    drawChar(context, charCode, x, y) {
        let data = this.font.characters[charCode]
        if (!data) return

        for (let tx = 0; tx < this.charWidth; tx++) {
            for (let ty = 0; ty < this.charHeight; ty++) {
                let pixel = data[ty * this.charWidth + tx]
                if (pixel) context.fillRect(x + tx, y + ty, 1, 1)
            }
        }
    }

    drawLine(context, text, x, y) {
        for (let i = 0; i < text.length; i++) {
            let charCode = text.charCodeAt(i)
            this.drawChar(context, charCode, x + i * this.charWidth, y)
        }
    }

    drawBackground(context) {
        context.fillStyle = this.bgColor
        context.fillRect(this.x, this.y, this.w, this.h)
    }

    drawPage(context, dt) {
        this.drawBackground(context)
        context.fillStyle = this.fgColor

        let lines = this.pages[this.currentPage]
        let numChars = Math.floor(dt / this.displayTime)
        if (this.doneWithPage) numChars = lines.join('').length
        else if (numChars >= lines.join('').length) this.doneWithPage = true

        lines.forEach((line, i) => {
            let partialLine = numChars >= line.length ? line : line.slice(0, numChars)
            let lx = this.x + this.padding
            let ly = this.y + this.padding + i * (this.charHeight + this.lineSpacing)
            this.drawLine(context, partialLine, lx, ly)
            numChars = Math.max(0, numChars - line.length)
        })

        if (this.currentPage < this.pages.length - 1) {
            context.fillRect(this.w - 4, this.h - 4, 2, 2)
        }
    }

    firstPage() {
        this.doneWithPage = false
        this.currentPage = 0
    }

    nextPage() {
        if (this.doneWithPage) {
            this.doneWithPage = false
            this.currentPage++
            if (this.currentPage > this.pages.length - 1) {
                this.currentPage = this.pages.length - 1
                return true
            }
        } else {
            this.doneWithPage = true
        }
    }

    prepareText(text) {
        let linebreaks = text.split(/\n/g)
        text = linebreaks.join(' {br} ')
        text = text.replace(/{.+?}/g, ' $& ')
        let words = text.split(/\s/g)

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
            if (lines.length === 2) newPage()
        }

        let addText = word => {
            if (lineSoFar) lineSoFar += ' '
            lineSoFar += word
            lineWidthSoFar += this.charWidth * (word.length + 1)
        }

        words.forEach(word => {
            if (word.toLowerCase() === '{br}') {
                newLine()
            }
            else if (word.toLowerCase() === '{p}') {
                newLine()
                newPage()
            }
            else if (lineWidthSoFar + this.charWidth * word.length > this.innerWidth) {
                newLine()
                addText(word)
            }
            else {
                addText(word)
            }
        })

        if (lineSoFar) newLine()
        if (lines.length > 0) newPage()

        return pages
    }
}