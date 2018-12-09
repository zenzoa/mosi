class ImportComponent extends Component {
    render({ onupload, filetype, description, children }) {
        let modalOpenButton = button({
            onclick: () => this.setState({ modalOpen: true })
        }, children)

        let modalCloseButton = button({
            class: 'icon close',
            onclick: () => this.setState({ modalOpen: false })
        }, '×')

        let errorDiv = this.state.errorMessage ?
            div({ class: 'error-message' }, this.state.errorMessage)
            : null

        let fileModal = modal([
            modalCloseButton,

            div({ class: 'import-modal' }, [
                errorDiv,

                div({}, 'upload a ' + filetype + ' file'),
                fileInput({
                    filetype,
                    onupload: data => {
                        if (data) {
                            try {
                                onupload(data)
                                this.setState({ modalOpen: false })
                            } catch (e) {
                                this.setState({ errorMessage: e })
                            }
                            
                        } else {
                            this.setState({ errorMessage: 'unable to load file' })
                        }
                    }
                }),
    
                div({}, '-OR-'),
    
                div({}, 'paste ' + description + ' data'),
                textarea({
                    value: this.state.textData,
                    onchange: textData => this.setState({ textData })
                }),
                button({
                    onclick: () => {
                        try {
                            onupload(this.state.textData)
                            this.setState({ modalOpen: false })
                        } catch (e) {
                            this.setState({ errorMessage: e })
                        }
                    }
                }, 'import from text')
            ])
        ])

        return div({}, [
            modalOpenButton,
            this.state.modalOpen ? fileModal : null
        ])
    }
}