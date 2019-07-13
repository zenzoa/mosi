let Color = {

    addPalette: (that, colorList) => {
        let paletteList = that.state.paletteList.slice()
        let palette = {
            name: 'palette 1',
            colorList
        }

        // get a unique name
        let baseName = palette.name
        let number = parseInt(baseName.split(' ').slice(-1)[0])
        if (isInt(number)) {
            let numberLength = (number).toString().length + 1
            baseName = baseName.slice(0, -numberLength)
        } else {
            number = 2
        }
        while (paletteList.find(p => p.name === palette.name)) {
            palette.name = baseName + ' ' + number
            number++
        }

        paletteList.push(palette)
        that.setState({ paletteList })

        return palette.name
    },

    renamePalette: (that, paletteIndex, newName) => {
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

    removePalette: (that, paletteIndex) => {
        let paletteList = that.state.paletteList.slice()
        let oldName = paletteList[paletteIndex].name
        paletteList.splice(paletteIndex, 1)
        let newName = paletteList[0].name

        let roomList = that.state.roomList.slice()
        roomList.forEach(room => {
            if (room.paletteName === oldName) {
                room.paletteName = newName
            }
        })

        that.setState({ paletteList, roomList })
    },

    contrastingColors: () => {
        let bgColor = chroma.random()
        let fgColor = chroma.random()
        while (chroma.contrast(bgColor, fgColor) < 4.5) {
            bgColor = chroma.random()
            fgColor = chroma.random()
        }
        return [
            bgColor.hex(),
            fgColor.hex()
        ]
    },

    randomPalette: (that, paletteIndex) => {
        let paletteList = that.state.paletteList.slice()
        let palette = paletteList[paletteIndex]
        let extraColors = palette.colorList.length - 2
        palette.colorList = Color.contrastingColors()
        while (extraColors > 0) {
            palette.colorList.push(chroma.random().hex())
            extraColors--
        }
        that.setState({ paletteList })
    },

    addColor: (that, paletteIndex, color) => {
        let paletteList = that.state.paletteList.slice()
        let palette = paletteList[paletteIndex]
        palette.colorList = palette.colorList.slice()
        palette.colorList.push(color)
        that.setState({ paletteList })
    },

    updateColor: (that, paletteIndex, colorIndex, newValue) => {
        let paletteList = that.state.paletteList.slice()
        let palette = paletteList[paletteIndex]
        palette.colorList = palette.colorList.slice()
        palette.colorList[colorIndex] = newValue
        that.setState({ paletteList })
    },

    removeColor: (that, paletteIndex, colorIndex) => {
        let paletteList = that.state.paletteList.slice()
        let palette = paletteList[paletteIndex]
        palette.colorList = palette.colorList.slice()
        palette.colorList.splice(colorIndex, 1)
        that.setState({ paletteList })
    }

}
