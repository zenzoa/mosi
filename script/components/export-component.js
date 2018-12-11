class ExportComponent extends Component {
    render({ exportGame, getData, description, children }) {
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
                    exportGame ? div({}, [
                        div({}, h('strong', {}, 'DOWNLOAD GAME')),
                        button({ onclick: exportGame }, 'download HTML file')
                    ]) : null,

                    div({}, [
                        div({}, h('strong', {}, 'DOWNLOAD DATA')),
                        button({
                            onclick: () => Exporter.exportEntity(data)
                        }, 'download ' + description + ' file')
                    ]),

                    div({}, [
                        div({}, h('strong', {}, 'COPY DATA')),
                        textarea({ value: JSON.stringify(data) }),
                        button({
                            onclick: () => {
                                this.base.querySelector('textarea').select()
                                document.execCommand('copy')
                            }
                        }, 'copy ' + description + ' data')
                    ])
                ])
            ])
        }

        return div({}, [
            modalOpenButton,
            this.state.modalOpen ? fileModal() : null
        ])
    }
}