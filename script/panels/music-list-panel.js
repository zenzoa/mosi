class MusicListPanel extends Component {
    render ({ closeTab }) {
        return panel({ header: 'musiclist', className: 'music-list-panel', closeTab }, [
            h(MusicList, this.props)
        ])
    }
}

class MusicList extends Component {
    constructor() {
        super()
        this.scales = Music.getScales()
    }

    render ({
        backButton,
        selectMusic,
        editMusic,
        addMusic,
        importMusic,
        currentMusicIndex,
        musicList = []
    }, {
        showImportOverlay
    }) {
        let musicButtonList = musicList.map((music, i) => {

            let voiceItemList = []
            for (let voiceIndex = 0; voiceIndex < 4; voiceIndex++) {
                let noteItemList = []
                for (let noteIndex = 0; noteIndex < 16; noteIndex++) {
                    let voice = music.voiceList[voiceIndex]
                    let freq = voice.noteList[noteIndex]
                    let scale = this.scales[voiceIndex]
                    let colorIndex = scale.findIndex(f => f === freq)
                    let color = colorIndex >= 0 ? Music.noteColors[colorIndex] : null
                    noteItemList.push(
                        div({
                            className: 'music-button-grid-item',
                            style: { background: color }
                        })
                    )
                }
                voiceItemList.push(
                    div({ className: 'music-button-grid-row' }, noteItemList)
                )
            }
            let musicGrid = div({ className: 'music-button-grid' }, voiceItemList)
            
            return button({
                className: 'music-button ' + (i === currentMusicIndex ? 'selected initial-focus' : ''),
                onclick: () => selectMusic(i, 'music'),
                // isSelected: (i === currentMusicIndex),
                // music
            }, musicGrid)
        })

        let editMusicButton = !editMusic ? null :
            iconButton({ title: 'edit music', onclick: editMusic }, 'edit')

        let addMusicButton = !addMusic ? null :
            iconButton({ title: 'add music', onclick: addMusic }, 'add')

        let importMusicButton = !importMusic ? null :
            iconButton({
                title: 'import music',
                onclick: () => this.setState({ showImportOverlay: true })
            }, 'import')

        let importOverlay = !showImportOverlay ? null :
            h(ImportOverlay, {
                header: 'import music',
                onImport: data => {
                    importMusic(data)
                    this.setState({ showImportOverlay: false })
                },
                fileType: '.mosimusic',
                closeOverlay: () => this.setState({ showImportOverlay: false })
            })

        return div({ className: 'content' }, [
            row([ backButton ]),
            div({ className: 'musicList' }, [
                musicButtonList
            ]),
            hr(),
            row([
                importMusicButton,
                fill(),
                editMusicButton,
                addMusicButton
            ]),
            importOverlay
        ])
    }
}