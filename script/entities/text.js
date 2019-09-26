// let textScript = `
let generateTextScript = () => {
return {

    nodesToPages: (dialogNodes, fontData, pageWidth, linesPerPage) => {
        let lastPosition

        // break individual nodes up based on line breaks
        let newNodes = []
        dialogNodes.forEach(node => {
            if (node.type === 'text') {
                // if new position is defined, create a new page
                if (!lastPosition) lastPosition = node.position
                if (node.position !== lastPosition) {
                    newNodes.push({ type: 'page-break' })
                }

                // break by newlines
                let lines = node.text.split('\n')

                // break long lines up into smaller lines
                let allLines = []
                lines.forEach(line => {
                    let subLines = Text.breakIntoLines(fontData, line, pageWidth)
                    subLines.forEach(subLine => allLines.push(subLine))
                })

                // add nodes for lines and line breaks
                allLines.forEach((line, i) => {
                    if (i > 0 && i <= allLines.length - 1) {
                        newNodes.push({ type: 'line-break' })
                    }
                    newNodes.push({ ...node, text: line })
                })
            } else {
                newNodes.push(node)
            }
        })

        let pageList = []
        let lineList = []
        let nodesOnLine = []
        let spacingSoFar = 0

        newNodes.forEach(node => {
            if (node.type === 'page-break') {
                if (nodesOnLine.length) lineList.push(nodesOnLine)
                if (lineList.length) pageList.push(lineList)
                lineList = []
                nodesOnLine = []
                spacingSoFar = 0
            }
            else if (node.type === 'line-break') {
                if (nodesOnLine.length) lineList.push(nodesOnLine)
                if (lineList.length >= linesPerPage) {
                    if (lineList.length) pageList.push(lineList)
                    lineList = []
                }
                nodesOnLine = []
                spacingSoFar = 0
            }
            else {
                let nodeWidth = Text.textWidth(fontData, node.text)
                if (spacingSoFar + nodeWidth > pageWidth) {
                    if (nodesOnLine.length) lineList.push(nodesOnLine)
                    if (lineList.length >= linesPerPage) {
                        if (lineList.length) pageList.push(lineList)
                        lineList = []
                    }
                    nodesOnLine = [node]
                    spacingSoFar = nodeWidth
                } else {
                    nodesOnLine.push(node)
                    spacingSoFar += nodeWidth
                }
            }
        })

        if (nodesOnLine.length) lineList.push(nodesOnLine)
        if (lineList.length) pageList.push(lineList)

        return pageList
    },

    breakIntoLines: (fontData, text, pageWidth) => {
        let lines = []

        let words = text.split(' ')
        let wordsOnLine = []
        let spacingSoFar = 0
        let spaceWidth = fontData.width

        words.forEach(word => {
            let wordWidth = Text.textWidth(fontData, word)
            if (spacingSoFar + spaceWidth + wordWidth > pageWidth) {
                lines.push(wordsOnLine.join(' '))
                wordsOnLine = [word]
                spacingSoFar = wordWidth
            } else {
                wordsOnLine.push(word)
                spacingSoFar += spaceWidth + wordWidth
            }
        })

        if (wordsOnLine.length) lines.push(wordsOnLine.join(' '))

        return lines
    },

    textWidth: (fontData, text) => {
        let { width, characterList } = fontData
        let textWidth = 0
        for (let i = 0; i < text.length; i++) {
            let charCode = text.charCodeAt(i)
            let charData = characterList[charCode]
            if (!charData) continue
            let charWidth = !isNaN(charData.width) ? charData.width : width
            textWidth += charWidth
        }
        return textWidth
    },

    drawPage: (context, fontData, fontDirection, lineList, timestamp, maxChars) => {
        let lineHeight = Math.floor(fontData.height * 2)
        let position = lineList[0][0].position

        let bgWidth = context.canvas.width - (fontData.width * 2)
        let bgHeight = Math.floor(fontData.height * 7)
        let bgX = fontData.width
        let bgY
        if (position === 'top') {
            bgY = fontData.width
        } else if (position === 'center' || position === 'fullscreen') {
            bgY = Math.floor(context.canvas.height / 2 - bgHeight / 2)
        } else {
            bgY = context.canvas.height - bgHeight - fontData.width
        }

        if (position === 'fullscreen') {
            context.fillStyle = 'black'
            context.fillRect(0, 0, context.canvas.width, context.canvas.height)
        } else {
            context.fillStyle = 'black'
            context.fillRect(bgX, bgY, bgWidth, bgHeight)
        }

        
        let x = bgX + fontData.width * 2
        let y = bgY + fontData.height * 2

        lineList.forEach((nodeList, lineIndex) => {

            let charIndex = 0
            let spacingSoFar = 0

            nodeList.forEach(node => {
                let nodeText = node.text.slice(0, maxChars)

                let seqWidth = Text.drawSeq(
                    context,
                    fontData,
                    fontDirection,
                    nodeText,
                    node.color,
                    node.style,
                    x + spacingSoFar,
                    y + (lineIndex * lineHeight),
                    timestamp,
                    charIndex
                )

                maxChars -= nodeText.length
                charIndex += nodeText.length
                spacingSoFar += seqWidth
            })
        })
    },

    drawSeq: (context, fontData, fontDirection, text, color, style, x, y, timestamp, i = 0) => {
        context.fillStyle = color

        let numChars = text.length
        let spacingSoFar = 0

        for (let j = 0; j < numChars; j++) {
            let charCode = text.charCodeAt(j)
            let xOffset = (fontDirection === 'rtl') ? x - spacingSoFar : x + spacingSoFar
            let newSpacing = Text.drawChar(context, fontData, charCode, xOffset, y, style, timestamp, i + j)
            spacingSoFar += newSpacing
        }

        return spacingSoFar
    },

    drawChar: (context, fontData, charCode, x, y, style, timestamp, i) => {
        let { width, height, characterList } = fontData

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

        let styleX = 0
        let styleY = 0
        if (style === 'wavy') {
            styleY = Math.floor(Math.sin(timestamp / (300) + (i / 2)) * (height / 3))
        }
        else if (style === 'shaky') {
            styleX = Math.floor(Math.cos(timestamp / (20) + i) * (width / 10))
            styleY = Math.floor(Math.sin(timestamp / (10) + i) * (height / 10))
        }

        for (let cx = 0; cx < width; cx++) {
            for (let cy = 0; cy < height; cy++) {
                let pixel = charData.data[cy * width + cx]
                if (pixel) {
                    context.fillRect(x + cx + offsetX + styleX, y + cy + offsetY + styleY, 1, 1)
                }
            }
        }

        return spacing
    }

}
}
// `

// let generateTextScript = new Function(textScript)
let Text = generateTextScript()