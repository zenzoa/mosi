class MusicListPanel extends Component {
    render ({ closeTab }) {
        return panel({ header: 'musiclist', className: 'music-list-panel', closeTab }, [
            h(MusicList, this.props)
        ])
    }
}

class MusicList extends Component {
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
            return button({
                // className: i === currentMusicIndex ? 'initial-focus' : '',
                onclick: () => selectMusic(i, 'music'),
                // isSelected: (i === currentMusicIndex),
                // music
            }, music.name)
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