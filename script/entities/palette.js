class Palette {
    static new() {
        return {
            name: '',
            colors: ['#594F4F', '#E5FCC2', '#9DE0AD', '#45ADA8', '#547980']
        }
    }

    static import(obj) {
        let palette = Palette.new()

        if (isStr(obj.name)) palette.name = obj.name
        if (isArr(obj.colors) && obj.colors.length >= 2) palette.colors = obj.colors

        return palette
    }

    static export(palette) {
        return {
            name: palette.name,
            colors: palette.colors
        }
    }

    static clone(palette) {
        return Palette.import(palette)
    }

    static addColor(palette) {
        let newColor = palette.colors[palette.colors.length - 1].substr()
        palette.colors.push(newColor)
        return palette
    }

    static delColor(palette, i) {
        if (palette.colors.length <= 2) return // can't delete last two colors
        palette.colors.splice(i, 1)
        return palette
    }
}