class MusicPanel extends Component {
    constructor() {
        super()

        this.state = {
            currentVoiceIndex: 0,
            currentNoteIndex: 0
        }

        this.scales = Music.getScales()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.music !== nextProps.music) {
            this.setState({
                currentVoiceIndex: 0,
                currentNoteIndex: 0
            })
        }
    }

    componentWillUnmount() {
        MusicPlayer.stopSong()
    }

    render({
        backButton,
        closeTab,
        renameMusic,
        removeMusic,
        randomMusic,
        clearMusic,
        exportMusic,
        duplicateMusic,
        setNote,
        setBeat,
        currentMusicIndex,
        musicList,
        music,
    }, {
        currentVoiceIndex,
        currentNoteIndex,
        showExportOverlay,
        showRemoveOverlay,
        showRandomOverlay,
        showClearOverlay,
        showExtrasOverlay
    }) {
        let currentVoice = music.voiceList[currentVoiceIndex]
        let currentInstrument = currentVoice.instrument
        let currentFreq = currentVoice.noteList[currentNoteIndex]

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
                fileName: `${music.name || 'untitled'}.mosimusic`,
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
            className: 'initial-focus',
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
    
        let clearButton = iconButton({
            title: 'clear music',
            onclick: () => this.setState({ showExtrasOverlay: false, showClearOverlay: true })
        }, 'clear')

        let clearOverlay = !showClearOverlay ? null :
            h(RemoveOverlay, {
                header: 'clear music?',
                closeOverlay: () => this.setState({ showClearOverlay: false }),
                remove: () => {
                    clearMusic()
                    this.setState({ showClearOverlay: false })
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
                    randomButton,
                    clearButton
                ],
                closeOverlay: () => this.setState({ showExtrasOverlay: false })
            })

        let gridCount = 4 * 16
        let gridItems = []
        for (let i = 0; i < gridCount; i++) {
            let voiceIndex = Math.floor(i / 16)
            let noteIndex = Math.floor(i % 16)
            let isSelected = voiceIndex === currentVoiceIndex && noteIndex === currentNoteIndex
            let voice = music.voiceList[voiceIndex]
            let freq = voice.noteList[noteIndex]
            let scale = this.scales[voiceIndex]
            let colorIndex = scale.findIndex(f => f === freq)
            let color = colorIndex >= 0 ? Music.noteColors[colorIndex] : null
            gridItems.push(
                div({ className: 'music-grid-item', style: { background: color } },
                    button({
                        className: (isSelected ? 'selected initial-focus' : ''),
                        onclick: () => this.setState({
                            currentVoiceIndex: voiceIndex,
                            currentNoteIndex: noteIndex
                        })
                    })
                )
            )
        }
        let musicGrid = div({ className: 'music-grid' }, gridItems)
        
        let beats = [ 1, 0.75, 0.5, 0.428, 0.375 ]
        let beatButtons = []
        beats.forEach(beat => {
            beatButtons.push(
                button({
                    className: music.beat === beat ? 'selected' : '',
                    onclick: () => setBeat(beat)
                }, Math.floor(60 / beat))
            )
        })

        let noteButtons = []
        this.scales[currentVoiceIndex].forEach((freq, i) => {
            let isSelected = (freq === currentFreq)
            noteButtons.push(
                colorButton({
                    isSelected,
                    onclick: () => {
                        if (isSelected) {
                            setNote(currentVoiceIndex, currentNoteIndex, null)
                        } else {
                            setNote(currentVoiceIndex, currentNoteIndex, freq)
                            MusicPlayer.playNote(freq, currentInstrument, music.beat)
                        }
                    },
                    color: Music.noteColors[i]
                })
            )
        })

        let playButton = button({
            onclick: () => {
                if (this.isPlaying) {
                    this.isPlaying = false
                    MusicPlayer.stopSong()
                } else {
                    this.isPlaying = true
                    MusicPlayer.playSong(music)
                }
            }
        }, 'play')

        return panel({ header: 'music', className: 'music-panel', closeTab }, [
            row([
                backButton,
                nameTextbox
            ]),
            row([
                'beat', // icon('play'),
                beatButtons
            ]),
            musicGrid,
            row([
                'notes (lo)', // icon('play'),
                noteButtons.slice(0, 5)
            ]),
            row([
                'notes (hi)', // icon('play'),
                noteButtons.slice(5)
            ]),
            row([
                extrasButton,
                fill(),
                playButton
            ]),
            exportOverlay,
            removeOverlay,
            randomOverlay,
            clearOverlay,
            extrasOverlay
        ])
    }
}