class ExportComponent extends Component {
    render({ getData, description, children }) {
        let modalOpenButton = button({
            onclick: () => this.setState({ modalOpen: true })
        }, children)

        let modalCloseButton = button({
            class: 'icon close',
            onclick: () => this.setState({ modalOpen: false })
        }, '×')

        let fileModal = () => {
            let data = getData()
            return modal([
                modalCloseButton,

                div({ class: 'export-modal' }, [
                    button({
                        onclick: () => Exporter.exportEntity(data)
                    }, 'download ' + description + ' file'),
    
                    div({}, '-OR-'),
    
                    textarea({ value: JSON.stringify(data) }),
                    button({
                        onclick: () => {
                            this.base.querySelector('textarea').select()
                            document.execCommand('copy')
                        }
                    }, 'copy ' + description + ' data')
                ])
            ])
        }

        return div({}, [
            modalOpenButton,
            this.state.modalOpen ? fileModal() : null
        ])
    }
}