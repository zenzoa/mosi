let Mod = {
    create: ({ name, type, code }) => {
        return {
            name: name || 'my-script',
            type: type || 'function',
            code: code || ''
        }
    },

    add: (that, mod) => {
        let modList = that.state.modList ? that.state.modList.slice() : []
        mod = mod ? deepClone(mod) : Mod.create({})
        modList.push(mod)
        that.setState({ modList })
    },

    rename:  (that, modIndex, newName) => {
        let modList = that.state.modList.slice()
        let mod = modList[modIndex]
        mod.name = newName
        that.setState({ modList })
    },

    changeType:  (that, modIndex, newType) => {
        let modList = that.state.modList.slice()
        let mod = modList[modIndex]
        mod.type = newType
        that.setState({ modList })
    },

    updateCode:  (that, modIndex, newCode) => {
        let modList = that.state.modList.slice()
        let mod = modList[modIndex]
        mod.code = newCode
        that.setState({ modList })
    },

    remove: (that, modIndex) => {
        let modList = that.state.modList.slice()
        modList.splice(modIndex, 1)
        that.setState({ modList })
    }
}
