let Palette = {
    create: ({ name, colorList }) => {
        if (!colorList || colorList.length < 8) {
            colorList = Palette.randomColors(8)
        }

        let newPalette = {
            name: name || 'palette-1',
            colorList
        }

        return newPalette
    },

    select: (that, paletteIndex, nextTab) => {
        let currentPaletteIndex = paletteIndex
        if (nextTab) that.setCurrentTab(nextTab)
        that.setState({ currentPaletteIndex })
    },

    add: (that, palette) => {
        let paletteList = that.state.paletteList ? that.state.paletteList.slice() : []
        palette = !(palette instanceof MouseEvent) ? deepClone(palette) :
            Palette.create({
                name: 'palette-1'
            })

        // get a unique name
        let baseName = palette.name
        let number = parseInt(baseName.split('-').slice(-1)[0])
        if (isInt(number)) {
            let numberLength = (number).toString().length + 1
            baseName = baseName.slice(0, -numberLength)
        } else {
            number = 8
        }
        while (paletteList.find(p => p.name === palette.name)) {
            palette.name = baseName + '-' + number
            number++
        }

        paletteList.push(palette)
        let currentPaletteIndex = paletteList.length - 1
        that.setCurrentTab('palette')
        that.setState({ paletteList, currentPaletteIndex })
    },

    import: (that, paletteData) => {
        try {
            let palette = JSON.parse(paletteData)

            // check for color list
            if (!palette.colorList || !palette.colorList.length) {
                throw('this palette does not have a valid list of colors')
            }

            // check for number of colors
            if (palette.colorList.length < 2) {
                throw('this palette has too few colors, you need at least 2')
            }

            Palette.add(that, palette)
        }
        catch (e) {
            console.error('unable to import palette!', e)
            that.setState({ showErrorOverlay: true, errorMessage: 'unable to import palette!' })
        }
    },

    export: (that, paletteIndex) => {
        let palette = that.state.paletteList[paletteIndex]
        let paletteData = JSON.stringify(palette)
        return paletteData
    },

    rename:  (that, paletteIndex, newName) => {
        let paletteList = that.state.paletteList.slice()
        let palette = paletteList[paletteIndex]
        let oldName = palette.name
        
        if (newName === '') {
            that.setState({
                showErrorOverlay: true,
                errorMessage: `a palette's name can't be empty!`
            })
        } else if (paletteList.find(p => p.name === newName)) {
            that.setState({
                showErrorOverlay: true,
                errorMessage: `another palette is already named "${newName}"!`
            })
        } else {
            let roomList = that.state.roomList.slice()
            roomList.forEach(room => {
                if (room.paletteName === oldName) {
                    room.paletteName = newName
                }
            })

            palette.name = newName
            that.setState({ paletteList, roomList })
        }
    },

    remove: (that, paletteIndex) => {
        let paletteList = that.state.paletteList.slice()
        let roomList = that.state.roomList.slice()
        let currentPaletteIndex = that.state.currentPaletteIndex
        
        // update current palette index
        if (currentPaletteIndex >= paletteIndex && currentPaletteIndex > 0) {
            currentPaletteIndex--
        }

        // remove palette from list
        let oldName = paletteList[paletteIndex].name
        paletteList.splice(paletteIndex, 1)
        let newName = paletteList[0].name
        
        // remove palette from rooms
        roomList.forEach(room => {
            if (room.paletteName === oldName) {
                room.paletteName = newName
            }
        })

        if (that.state.oneTabMode) that.closeTab('palette')

        that.setState({ paletteList, roomList, currentPaletteIndex })
    },

    contrastingColors: (initialColor) => {
        initialColor = typeof initialColor === 'string' ? chroma(initialColor) : null
        let bgColor = initialColor || chroma.random()
        let fgColor = chroma.random()
        while (chroma.contrast(bgColor, fgColor) < 4.5) {
            bgColor = initialColor || chroma.random()
            fgColor = chroma.random()
        }
        return [
            bgColor.hex(),
            fgColor.hex()
        ]
    },

    randomColors: (colorCount) => {
        let colorList = Palette.contrastingColors()
        colorCount =- 8
        while (colorCount > 0) {
            palette.colorList.push(chroma.random().hex())
            colorCount--
        }
        return colorList
    },

    random: (that, paletteIndex) => {
        let paletteList = that.state.paletteList.slice()
        let palette = paletteList[paletteIndex]
        let colorCount = palette.colorList.length
        palette.colorList = Palette.randomColors(colorCount)
        that.setState({ paletteList })
    },

    addColor: (that, paletteIndex) => {
        let paletteList = that.state.paletteList.slice()
        let palette = paletteList[paletteIndex]
        let bgColor = palette.colorList[0]
        let newColor = Palette.contrastingColors(bgColor)[1]
        palette.colorList = palette.colorList.slice()
        palette.colorList.push(newColor)
        that.setState({ paletteList })
    },

    updateColor: (that, paletteIndex, colorIndex, newColor) => {
        let paletteList = that.state.paletteList.slice()
        let palette = paletteList[paletteIndex]
        palette.colorList = palette.colorList.slice()
        palette.colorList[colorIndex] = newColor
        that.setState({ paletteList })
    },

    removeColor: (that, paletteIndex, colorIndex) => {
        let paletteList = that.state.paletteList.slice()
        let palette = paletteList[paletteIndex]
        palette.colorList = palette.colorList.slice()
        palette.colorList.splice(colorIndex, 1)
        that.setState({ paletteList })
    },

    findIndex: (paletteName, paletteList) => {
        return paletteList.findIndex(p => p.name === paletteName)
    },

    find: (paletteName, paletteList) => {
        return paletteList.find(p => p.name === paletteName)
    }
}
