class Editor extends Component {
    constructor() {
        super()

        this.store = new Store()

        this.set = (path, value, permanent) => {
            if (isArr(path)) return this.setMany(path, value)
            
            // if (!permanent) this.store.add(this.state.world)
            if (DEBUG) console.log(`set < ${path} > to`, value)
            let world = path ? deepSet(this.state.world, path, value) : value

            this.setState({ world })
            this.save(world)
        }

        this.setMany = (pathList, permanent) => {
            // if (!permanent) this.store.add(this.state.world)

            let world = this.state.world
            pathList.forEach(({ path, value }) => {
                if (DEBUG) console.log(`set < ${path} > to`, value)
                world = path ? deepSet(world, path, value) : value
            })

            this.setState({ world })
            this.save(world)
        }

        this.save = world => {
            try {
                window.localStorage.setItem('world', JSON.stringify(world))
            } catch(e) {
                console.error('unable to save world', e)
            }
        }

        this.load = () => {
            try {
                let worldString = window.localStorage.getItem('world')
                if (worldString) return JSON.parse(worldString)
            } catch(e) {
                console.error('unable to load world', e)
            }
        }

        this.undo = () => {
            this.setState({
                world: this.store.undo(this.state.world)
            })
        }

        this.redo = () => {
            this.setState({
                world: this.store.redo(this.state.world)
            })
        }

        this.resize = () => {
            let el = document.getElementsByTagName('main')[0]
            el.style.width = window.innerWidth + 'px'
            el.style.height = window.innerHeight + 'px'
        }

        this.state = {
            world: this.load() || World.new()
        }
    }

    componentDidMount() {
        window.onresize = this.resize
        this.resize()
    }

    render(_, { world }) {
        let worldPanel = h(WorldPanel, {
            world: world,
            path: '',
            set: this.set,
            // undo: this.store.undoStates.length ? this.undo : null,
            // redo: this.store.redoStates.length ? this.redo : null
        })

        return worldPanel
    }
}