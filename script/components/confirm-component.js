class ConfirmComponent extends Component {
    render({ onconfirm, onclose, description, children }) {
        let modalOpenButton = children.length ? button({
            class: this.props.class,
            onclick: () => this.setState({ modalOpen: true })
        }, children) : null

        let modalCloseButton = button({
            class: 'icon close',
            onclick: () => onclose ? onclose() : this.setState({ modalOpen: false })
        }, '×')

        let okButton = button({
            onclick: () => {
                this.setState({ modalOpen: false })
                onconfirm()
            }
        }, 'yes do it')

        let cancelButton = button({
            class: 'simple',
            onclick: () => onclose ? onclose() : this.setState({ modalOpen: false })
        }, 'cancel')

        let confirmModal = modal([
            modalCloseButton,
            div({ class: 'confirm-modal' }, [
                div({}, description),
                okButton,
                cancelButton
            ])
        ])

        return div({}, [
            modalOpenButton,
            this.state.modalOpen || !modalOpenButton ? confirmModal : null
        ])
    }
}