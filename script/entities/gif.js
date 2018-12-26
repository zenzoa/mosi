// GIF file format: http://www.matthewflickinger.com/lab/whatsinagif/bits_and_bytes.asp
// Bitsy GIF exporter code: https://github.com/le-doux/bitsy/blob/master/editor/shared/script/gif.js

class GIF {
    static encode(width, height, frames, frameRate, colors, callback) {
        let array = []

        // find color table size that fits palette
        let colorTableSize = 0
        while (colors.length > Math.pow(2, colorTableSize + 1)) colorTableSize++

        // pad out palette
        colors = colors.slice()
        loopUpTo(Math.pow(2, colorTableSize + 1), i => {
            if (!colors[i]) colors.push('#000000')
        })

        // header
        let header = this.header(width, height, colorTableSize)
        array = array.concat(header)

        // color table
        let colorTable = this.colorTable(colors)
        array = array.concat(colorTable)

        // image data
        if (frames.length === 1) {
            let imageData = this.encodeSingleFrame(width, height, colors, frames[0])
            array = array.concat(imageData)

        } else {
            let imageData = this.encodeAnimation(width, height, colors, frames, frameRate)
            array = array.concat(imageData)
        }

        // trailer
        array.push(0x3b)

        return this.dataURI(array, callback)
    }

    static header(width, height, colorTableSize) {
        let array = []

        this.pushStr(array, 'GIF') // id tag
        this.pushStr(array, '89a') // version
        this.pushU16(array, width)
        this.pushU16(array, height)

        let fields =
            (1 << 7) | // global color table
            (1 << 4) | // color resolution
            (0 << 3) | // sort flag
            (colorTableSize << 0)
        array.push(fields)

        array.push(0) // background color index
        array.push(0) // pixel aspect ratio

        return array
    }

    static colorTable(colors) {
        let array = []

        colors.forEach(color => {
            let r = parseInt('0x' + color.substring(1,3))
            let g = parseInt('0x' + color.substring(3,5))
            let b = parseInt('0x' + color.substring(5,7))
            array = array.concat([r, g, b])
        })

        return array
    }

    static imageDescriptor(width, height) {
        let array = []

        array.push(0x2c) // image separator

        this.pushU16(array, 0) // left
        this.pushU16(array, 0) // top
        this.pushU16(array, width)
        this.pushU16(array, height)

        array.push(0) // unused byte

        return array
    }

    static imageData(data, colors) {
        let array = []

        // find min code size
        let minCodeSize = 1
        while (Math.pow(2, minCodeSize) < colors.length) minCodeSize++
        array.push(minCodeSize)

        // write image blocks
        let imageBlocks = LZW.imageBlocks(data, colors, minCodeSize)
        array = array.concat(imageBlocks)

        // mark end of data
        array.push(0)

        return array
    }

    static encodeSingleFrame(width, height, colors, data) {
        let array = []

        let imageDescriptor = this.imageDescriptor(width, height)
        array = array.concat(imageDescriptor)

	    let imageData = this.imageData(data, colors)
        array = array.concat(imageData)

        return array
    }

    static encodeAnimation(width, height, colors, frames, frameRate) {
        let delayTime = Math.floor(frameRate / 10)
        let array = []

        // application extension block
        array.push(0x21) // block start
        array.push(0xff) // application extension id
        array.push(11) // how many bytes follow
        this.pushStr(array, 'NETSCAPE2.0')
    
        // application data
        array.push(3) // how many bytes follow
        array.push(1) // always 1
        this.pushU16(array, 0) // loop forever
        array.push(0) // block end

        frames.forEach(data => {
            // graphic control extension
            array.push(0x21) // block start
            array.push(0xf9) // graphic control extension id
            array.push(4) // how many bytes follow

            let packedByte = 
                (0 << 5) | // unused
                (1 << 2) | // disposal method (1 = keep, 2 = clear)
                (0 << 1) | // user input flag
                (0 << 0)   // transparency flag
            array.push(packedByte)

            array = this.pushU16(array, delayTime)
            array.push(0) // transparency color
            array.push(0) // block end

            // current frame data
            let imageDescriptor = this.imageDescriptor(width, height)
            array = array.concat(imageDescriptor)

            let imageData = this.imageData(data, colors)
            array = array.concat(imageData)
        })

        return array
    }

    static pushStr(array, str) {
        loopUpTo(str.length, i => {
            array.push(str.charCodeAt(i))
        })
    }

    static pushU16(array, num) {
        array.push((num >> 0) & 0x00ff)
        array.push((num >> 8) & 0x00ff)
        return array
    }

    static dataURI(array, callback) {
        let unicodeArray = new Uint8Array(array)
        let blob = new Blob([unicodeArray.buffer], { type: 'image/gif' })
        callback(blob)
    }
}

class LZW {
    static imageBlocks(data, colors, minCodeSize) {
        let imageBlocks = []

        // initialize code size
        let codeSize = minCodeSize + 1

        // initialize code table
        let codeMap = this.makeCodeMap(colors)

        // read first index
        let i = 0
        let buffer = data[i] + ','
        i++

        // initialize code stream
        let stream = this.startStream()

        // send clear code
        stream = this.packCode(stream, codeMap.get('clear_code'), codeSize)

        // LZW algorithm
        while (i < data.length) {
            // get next index
            let k = data[i]
            let newBuffer = buffer + k + ','

            // is buffer + k in code table?
            if (codeMap.has(newBuffer)) {
                // look for longer sequence
                buffer = newBuffer
                i++

            } else {
                // add new code
                let nextCode = codeMap.size
                codeMap.set(newBuffer, nextCode)

                // write current code
                stream = this.packCode(stream, codeMap.get(buffer), codeSize)

                // reset buffer
                buffer = data[i] + ','
                i++

                // increase code size
                if (nextCode === Math.pow(2, codeSize)) {
                    codeSize++

                    if (codeSize > 12) {
                        // write clear code
                        stream = this.packCode(stream, codeMap.get('clear_code'), 12)

                        // reset code size
                        codeSize = minCodeSize + 1

                        // reset code table
                        codeMap = this.makeCodeMap(colors)
                    }
                }
            }

            // reached the end of an image block
            if (stream.bytes.length > 255) {
                let completedBytes = stream.bytes
                
                let nextBytes = []
                while (completedBytes.length > 255) {
                    nextBytes.unshift(completedBytes.pop())
                }
                stream.bytes = nextBytes

                imageBlocks.push(completedBytes.length)
                imageBlocks = imageBlocks.concat(completedBytes)
            }
        }

        // end stream
        stream = this.packCode(stream, codeMap.get(buffer), codeSize)
        stream = this.packCode(stream, codeMap.get('end_code'), codeSize)

        imageBlocks.push(stream.bytes.length)
        imageBlocks = imageBlocks.concat(stream.bytes)

        return imageBlocks
    }

    static startStream() {
        return {
            bytes: [0],
            bitIndex: 0
        }
    }

    static makeCodeMap(colors) {
        let codeMap = new Map()
        colors.forEach((_, i) => {
            codeMap.set(i + ',', codeMap.size)
        })
        codeMap.set('clear_code', codeMap.size)
        codeMap.set('end_code', codeMap.size)
        return codeMap
    }

    static packCode(stream, code, codeSize) {
        // get last byte in stream
        let currentByte = stream.bytes.pop()

        for (let i = 0; i < codeSize; i++) {
            // get bit
            let bit = (code >> i) & 1
            if (bit === 1) currentByte = currentByte ^ (1 << stream.bitIndex)

            // go to next bit
            stream.bitIndex++

            // start new byte if needed
            if (stream.bitIndex >= 8) {
                stream.bytes.push(currentByte)
                currentByte = 0
                stream.bitIndex = 0
            }
        }

        // return byte to stream
        stream.bytes.push(currentByte)
        return stream
    }
}