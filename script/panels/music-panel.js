class MusicPanel extends Component {
    constructor() {
        super()
    }

    render({
        backButton,
        closeTab,
        renameMusic,
        removeMusic,
        randomMusic,
        exportMusic,
        duplicateMusic,
        currentMusicIndex,
        musicList,
        music,
    }, {
        showExportOverlay,
        showRemoveOverlay,
        showRandomOverlay,
        showExtrasOverlay
    }) {
        let nameTextbox = textbox({
            placeholder: 'music name',
            value: music.name,
            onchange: e => renameMusic(e.target.value)
        })
    
        let exportButton = iconButton({
            title: 'export music',
            onclick: () => this.setState({ showExtrasOverlay: false, showExportOverlay: true })
        }, 'export')

        let exportOverlay = !showExportOverlay ? null :
            h(ExportOverlay, {
                header: 'export music',
                fileName: `${music.name || 'untitled'}.mosicolors`,
                data: exportMusic(),
                closeOverlay: () => this.setState({ showExportOverlay: false })
            })
    
        let removeButton = musicList.length < 2 ? null :
            iconButton({
                title: 'remove music',
                onclick: () => this.setState({ showExtrasOverlay: false, showRemoveOverlay: true }),
            }, 'delete')

        let removeOverlay = !showRemoveOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove music?',
                closeOverlay: () => this.setState({ showRemoveOverlay: false }),
                remove: () => {
                    removeMusic()
                    this.setState({ showRemoveOverlay: false })
                }
            })

        let duplicateButton = iconButton({
            title: 'duplicate music',
            onclick: () => {
                this.setState({ showExtrasOverlay: false })
                duplicateMusic()
            }
        }, 'duplicate')

        let randomButton = iconButton({
            className: 'icon',
            title: 'randomize music',
            onclick: () => this.setState({ showExtrasOverlay: false, showRandomOverlay: true })
        }, 'random')

        let randomOverlay = !showRandomOverlay ? null :
            h(RemoveOverlay, {
                header: 'randomize music?',
                closeOverlay: () => this.setState({ showRandomOverlay: false }),
                remove: () => {
                    randomMusic()
                    this.setState({ showRandomOverlay: false })
                }
            })

        let extrasButton = iconButton({
            title: 'music actions',
            onclick: () => this.setState({ showExtrasOverlay: true })
        }, 'extras')

        let extrasOverlay = !showExtrasOverlay ? null :
            h(ExtrasOverlay, {
                header: 'music actions',
                buttons: [
                    duplicateButton,
                    removeButton,
                    exportButton,
                    randomButton
                ],
                closeOverlay: () => this.setState({ showExtrasOverlay: false })
            })

        return panel({ header: 'music', className: 'music-panel', closeTab }, [
            row([
                backButton,
                nameTextbox
            ]),
            row([
                extrasButton
            ]),
            exportOverlay,
            removeOverlay,
            randomOverlay,
            extrasOverlay
        ])
    }
}