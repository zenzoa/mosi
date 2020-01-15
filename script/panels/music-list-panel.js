class MusicListPanel extends Component {
    render ({ closeTab }) {
        return panel({ header: 'music', id: 'musicListPanel', closeTab }, [
            h(MusicList, this.props)
        ])
    }
}

class MusicList extends Component {
    render ({
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
            return musicButton({
                className: (i === currentMusicIndex ? 'initial-focus' : ''),
                onclick: () => {
                    if (currentMusicIndex === i) {
                        editMusic()
                    } else {
                        selectMusic(i, 'music')
                    }
                },
                isSelected: (i === currentMusicIndex),
                music
            })
        })

        let addMusicButton = !addMusic ? null :
            iconButton({
                title: 'add music',
                onclick: addMusic
            }, 'add')

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
            row([
                importMusicButton,
                fill(),
                addMusicButton
            ]),
            hr(),
            div({ className: 'musicList' }, [
                musicButtonList
            ]),
            importOverlay
        ])
    }
}