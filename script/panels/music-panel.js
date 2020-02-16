class MusicPanel extends Component {
    constructor() {
        super()

        this.state = {
            currentNoteIndex: 5
        }

        this.scales = Music.getScales()

        this.updateBeatIndicator = (noteIndex) => {
            this.beatIndicator.style.left = ((noteIndex + 0.5) / 16 * 100) + '%'
        }
    }

    componentWillUnmount() {
        MusicPlayer.stopSong()
    }

    render({
        closeTab,
        renameMusic,
        removeMusic,
        randomMusic,
        clearMusic,
        exportMusic,
        duplicateMusic,
        setNote,
        setBeat,
        musicList,
        music,
    }, {
        currentNoteIndex,
        showExportOverlay,
        showRemoveOverlay,
        showRandomOverlay,
        showClearOverlay,
        showExtrasOverlay,
        isPlaying
    }) {
        let nameButton = button({
            class: 'fill',
            onclick: () => this.setState({ showExtrasOverlay: true })
        }, music.name)

        let nameTextbox = textbox({
            placeholder: 'music name',
            value: music.name,
            onchange: e => renameMusic(e.target.value)
        })
    
        let exportButton = button({
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
            button({
                title: 'remove music',
                onclick: () => this.setState({ showExtrasOverlay: false, showRemoveOverlay: true }),
            }, 'remove song')

        let removeOverlay = !showRemoveOverlay ? null :
            h(RemoveOverlay, {
                header: 'remove music?',
                closeOverlay: () => this.setState({ showRemoveOverlay: false }),
                remove: () => {
                    removeMusic()
                    this.setState({ showRemoveOverlay: false })
                }
            })

        let duplicateButton = button({
            title: 'duplicate music',
            onclick: () => {
                this.setState({ showExtrasOverlay: false })
                duplicateMusic()
            }
        }, 'duplicate')

        let randomButton = button({
            onclick: () => this.setState({ showExtrasOverlay: false, showRandomOverlay: true })
        }, 'randomize')

        let randomOverlay = !showRandomOverlay ? null :
            h(RemoveOverlay, {
                header: 'randomize music?',
                closeOverlay: () => this.setState({ showRandomOverlay: false }),
                remove: () => {
                    randomMusic()
                    this.setState({ showRandomOverlay: false })
                }
            })
    
        let clearButton = button({
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

        let extrasOverlay = !showExtrasOverlay ? null :
            h(ExtrasOverlay, {
                header: 'music actions',
                buttons: [
                    nameTextbox,
                    hr(),
                    exportButton,
                    randomButton,
                    duplicateButton,
                    clearButton,
                    removeButton
                ],
                closeOverlay: () => this.setState({ showExtrasOverlay: false })
            })

        let gridCount = 4 * 16
        let gridItems = []
        for (let i = 0; i < gridCount; i++) {
            let voiceIndex = Math.floor(i / 16)
            let noteIndex = Math.floor(i % 16)
            let voice = music.voiceList[voiceIndex]
            let freq = voice.noteList[noteIndex]
            let scale = this.scales[voiceIndex]
            let colorIndex = scale.findIndex(f => f === freq)
            let color = colorIndex >= 0 ? Music.noteColors[colorIndex] : null
            gridItems.push(
                div({ className: 'music-grid-item', style: { background: color } },
                    button({
                        onclick: () => {
                            let scale = this.scales[voiceIndex]
                            let newFreq = scale[currentNoteIndex]
                            if (freq) {
                                setNote(voiceIndex, noteIndex, null)
                            } else {
                                setNote(voiceIndex, noteIndex, newFreq)
                            }
                        }
                    })
                )
            )
        }

        let beatIndicator = !isPlaying ? null :
            div({
                className: 'beat-indicator',
                ref: node => this.beatIndicator = node
            })

        let musicGrid = div({ className: 'music-grid' }, [
            gridItems,
            beatIndicator
        ])
        
        let beats = [ 1, 0.75, 0.5, 0.428, 0.375 ]
        let beatIcons = ['very-slow-beat', 'slow-beat', 'medium-beat', 'fast-beat', 'very-fast-beat']
        let beatButtons = []
        beats.forEach((beat, i) => {
            beatButtons.push(
                iconButton({
                    className: 'simple' + (music.beat === beat ? ' selected' : ''),
                    onclick: () => setBeat(beat),
                    title: Math.floor(60 / beat) + ' bpm'
                }, beatIcons[i])
            )
        })

        let noteButtons = []
        let noteNames = ['C', 'E-flat', 'F', 'G', 'B-flat']
        this.scales[0].forEach((freq, i) => {
            let isSelected = (i === currentNoteIndex)
            noteButtons.push(
                colorButton({
                    isSelected,
                    onclick: () => {
                        let voice = music.voiceList && music.voiceList[0]
                        let instrument = voice && voice.instrument
                        if (instrument) MusicPlayer.playNote(freq, instrument)
                        this.setState({ currentNoteIndex: i })
                    },
                    color: Music.noteColors[i],
                    title: noteNames[i % 5]
                })
            )
        })

        let playButton = iconButton({
            onclick: () => {
                if (isPlaying) {
                    this.setState({ isPlaying: false })
                    MusicPlayer.stopSong()
                } else {
                    this.setState({ isPlaying: true })
                    MusicPlayer.playSong(music, this.updateBeatIndicator)
                }
            }
        }, isPlaying ? 'pause-music' : 'play-music')

        return panel({ header: 'song', id: 'musicPanel', closeTab }, [
            row([
                nameButton,
                playButton
            ]),
            row([
                icon('beat'),
                vr(),
                beatButtons
            ]),
            musicGrid,
            row([
                icon('high-note'),
                noteButtons.slice(5)
            ]),
            row([
                icon('low-note'),
                noteButtons.slice(0, 5)
            ]),
            helpLink('music'),
            extrasOverlay,
            exportOverlay,
            removeOverlay,
            randomOverlay,
            clearOverlay
        ])
    }
}