class Store {
    constructor() {
        this.reset()
    }

    reset() {
        this.undoStates = []
        this.redoStates = []
    }

    add(state) {
        this.undoStates.push(clone(state))
        if (this.undoStates.length > 10) this.undoStates.shift()
        this.redoStates = []
    }

    undo(state) {
        if (this.undoStates.length > 0) {
            this.redoStates.push(clone(state))
            return this.undoStates.pop()
        }
    }

    redo(state) {
        if (this.redoStates.length > 0) {
            this.undoStates.push(clone(state))
            return this.redoStates.pop()
        }
    }
}