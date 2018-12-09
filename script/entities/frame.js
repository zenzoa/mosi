class Frame {
    static new(w, h) {
        return {
            w: w,
            h: h,
            pixels: Array(w * h).fill(0)
        }
    }

    static import(obj, w, h) {
        let frame = Frame.new(w, h)

        if (isArr(obj.pixels) && obj.pixels.length === w * h) {
            frame.pixels = obj.pixels.slice()
        }

        return frame
    }

    static export(frame) {
        return {
            pixels: frame.pixels
        }
    }

    static clone(frame) {
        return Frame.import(frame, frame.w, frame.h)
    }

    static clear(frame) {
        frame.pixels = Array(frame.w * frame.h).fill(0)
        return frame
    }

    static flip(frame, horizontal) {
        let rows = []
        loopUpTo(frame.h, row => {
            rows.push(frame.pixels.slice(row * frame.h, row * frame.h + frame.w))
        })

        if (horizontal) {
            rows.forEach(row => row.reverse())
        } else {
            rows.reverse()
        }

        frame.pixels = rows.reduce((prev, curr) => prev.concat(curr), [])
        return frame
    }

    static rotate(frame) {
        if (frame.w !== frame.h) return // can't rotate non-square frame
        let newPixels = Array(frame.w * frame.h).fill(0)
        loopUpTo(frame.w, x => {
            loopUpTo(frame.h, y => {
                newPixels[x + (y * frame.w)] = frame.pixels[y + (x * frame.h)]
            })
        })
        frame.pixels = newPixels
        return frame
    }

    static random(w, h) {
        let frame = Frame.new(w, h)
        let randomPixels = Array(w * h).fill(0).map(() => randomInt(0, 2))

        let style = randomItem(['left-right', 'top-bottom', 'corners'])

        loopUpTo(w, x => {
            loopUpTo(h, y => {
                let xA = x
                let yA = y
                if (style === 'left-right' || style === 'corners') {
                    if (x >= w / 2) xA = (w - x - 1)
                }
                if (style === 'top-bottom' || style === 'corners') {
                    if (y >= h / 2) yA = (h - y - 1)
                }
                frame.pixels[x + (y * w)] = randomPixels[xA + (yA * w)]
            })
        })

        return frame
    }

    static getPixel(frame, x, y) {
        let i = x + (y * frame.w)
        return frame.pixels[i]
    }

    static setPixel(frame, x, y, value) {
        let i = x + (y * frame.w)
        frame.pixels[i] = value
        return frame
    }

    static draw(frame, context, x, y) {
        for (let fx = 0; fx < frame.w; fx++) {
            for (let fy = 0; fy < frame.h; fy++) {
                let pixel = Frame.getPixel(frame, fx, fy)
                if (pixel) context.fillRect(x + fx, y + fy, 1, 1)
            }
        }
    }
}