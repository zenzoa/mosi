class ExportImageComponent extends Component {
    constructor() {
        super()
        this.state = { imageScale: 2 }

        this.updateImage = (imageScale) => {
            this.props.encodeImage(
                imageScale,
                imageUri => this.setState({ imageScale, imageUri })
            )
        }
    }

    componentDidMount() {
        this.updateImage(this.state.imageScale)
    }

    render({ children }) {
        let modalOpenButton = button({
            onclick: () => this.setState({ modalOpen: true })
        }, children)

        let modalCloseButton = button({
            class: 'icon close',
            onclick: () => this.setState({ modalOpen: false })
        }, '×')

        let gifModal = () => {
            let scaleNumbox = label({}, [
                span({}, 'image scale: '),
                numbox({
                    min: 1,
                    max: 10,
                    value: this.state.imageScale,
                    onchange: this.updateImage
                })
            ])
            
            let imageContainer = div({ class: 'image-container' }, [
                img({ src: this.state.imageUri })
            ])

            return modal([
                modalCloseButton,

                div({ class: 'gif-modal' }, [
                    scaleNumbox,
                    imageContainer
                ])
            ])
        }

        return div({}, [
            modalOpenButton,
            this.state.modalOpen ? gifModal() : null
        ])
    }
}