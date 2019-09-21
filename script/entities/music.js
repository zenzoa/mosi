let Music = {

    frequencies: {
        'C2': 65.41,    'Db2': 69.30,   'D2': 73.42,    'Eb2': 77.78,   'E2': 82.41,    'F2': 87.31,
        'Gb2': 92.50,   'G2': 98.00,    'Ab2': 103.83,  'A2': 110.00,   'Bb2': 116.54,  'B2': 123.47,

        'C3': 130.81,   'Db3': 138.59,  'D3': 146.83,   'Eb3': 155.56,  'E3': 164.81,   'F3': 174.61,
        'Gb3': 185.00,  'G3': 196.00,   'Ab3': 207.65,  'A3': 220.00,   'Bb3': 233.08,  'B3': 246.94,

        'C4': 261.63,   'Db4': 277.18,  'D4': 293.66,   'Eb4': 311.13,  'E4': 329.63,   'F4': 349.23,
        'Gb4': 369.99,  'G4': 392.00,   'Ab4': 415.30,  'A4': 440.00,   'Bb4': 466.16,  'B4': 493.88,

        'C5': 523.25,   'Db5': 554.37,  'D5': 587.33,   'Eb5': 622.25,  'E5': 659.25,   'F5': 698.46,
        'Gb5': 739.99,  'G5': 783.99,   'Ab5': 830.61,  'A5': 880.00,   'Bb5': 932.33,  'B5': 987.77,

        'C6': 1046.50,  'Db6': 1108.73, 'D6': 1174.66,  'Eb6': 1244.51, 'E6': 1318.51,  'F6': 1396.91,
        'Gb6': 1479.98, 'G6': 1567.98,  'Ab6': 1661.22, 'A6': 1760.00,  'Bb6': 1864.66, 'B6': 1975.53
    },

    getScales: () => {
        let scale = ['C', 'Eb', 'F', 'G', 'Bb'] // minor pentatonic scale
        let octaveLow = ['4', '4', '3', '2']
        let octaveHigh = ['5', '5', '4', '3']
        return Array(4).fill(0).map((_, i) => {
            return scale.map(note => note + octaveLow[i])
                .concat(scale.map(note => note + octaveHigh[i]))
                .map(note => Music.frequencies[note])
        })
    },

    noteColors: [
        '#453C5C', '#51647A', '#31ADA1', '#59D999', '#BEED80',
        '#9A6A80', '#D37982', '#FC8775', '#FEB379', '#FFD96E',
    ],

    instruments: [
        { wave: 'sine', attack: 0, decay: 0.5, sustain: 0, release: 0 },
        { wave: 'triangle', attack: 0, decay: 0.5, sustain: 0.1, release: 0.1 },
        { wave: 'triangle', attack: 0, decay: 0.5, sustain: 0.5, release: 0.3 },
        { wave: 'square', attack: 0, decay: 0.2, sustain: 0, release: 0, volume: 0.5 }
    ],

    create: ({ name, beat, voiceList, randomStart }) => {
        let scales = Music.getScales()
        let newMusic = {
            name: name || 'song 1',
            beat: beat || 0.5,
            voiceList: voiceList ||
                Array(4).fill(0).map((_, i) => {
                    return {
                        instrument: Music.instruments[i],
                        noteList: randomStart ? Music.randomNotes(16, scales[i]) : Array(16)
                    }
                })
        }

        return newMusic
    },

    select: (that, musicIndex, nextTab) => {
        let currentMusicIndex = musicIndex
        if (nextTab) that.setCurrentTab(nextTab)
        that.setState({ currentMusicIndex })
    },

    add: (that, music) => {
        let musicList = that.state.musicList ? that.state.musicList.slice() : []
        music = !(music instanceof MouseEvent) ? deepClone(music) :
            Music.create({
                name: 'song 1'
            })

        // get a unique name
        let baseName = music.name
        let number = parseInt(baseName.split(' ').slice(-1)[0])
        if (isInt(number)) {
            let numberLength = (number).toString().length + 1
            baseName = baseName.slice(0, -numberLength)
        } else {
            number = 2
        }
        while (musicList.find(p => p.name === music.name)) {
            music.name = baseName + ' ' + number
            number++
        }

        musicList.push(music)
        let currentMusicIndex = musicList.length - 1
        that.setCurrentTab('music')
        that.setState({ musicList, currentMusicIndex })
    },

    import: (that, musicData) => {
        try {
            let music = JSON.parse(musicData)

            Music.add(that, music)
        }
        catch (e) {
            console.error('unable to import song!', e)
            that.setState({ showErrorOverlay: true, errorMessage: 'unable to import song!' })
        }
    },

    export: (that, musicIndex) => {
        let music = that.state.musicList[musicIndex]
        let musicData = JSON.stringify(music)
        return musicData
    },

    rename:  (that, musicIndex, newName) => {
        let musicList = that.state.musicList.slice()
        let music = musicList[musicIndex]
        let oldName = music.name
        if (newName === '') {
            that.setState({
                showErrorOverlay: true,
                errorMessage: `a song's name can't be empty!`
            })
        } else if (musicList.find(p => p.name === newName)) {
            that.setState({
                showErrorOverlay: true,
                errorMessage: `another song is already named "${newName}"!`
            })
        } else {
            let roomList = that.state.roomList.slice()
            roomList.forEach(room => {
                if (room.musicName === oldName) {
                    room.musicName = newName
                }
            })

            music.name = newName
            that.setState({ musicList, roomList })
        }
    },

    remove: (that, musicIndex) => {
        let musicList = that.state.musicList.slice()
        let roomList = that.state.roomList.slice()
        let currentMusicIndex = that.state.currentMusicIndex
        
        // update current music index
        if (currentMusicIndex >= musicIndex && currentMusicIndex > 0) {
            currentMusicIndex--
        }

        // remove music from list
        let oldName = musicList[musicIndex].name
        musicList.splice(musicIndex, 1)
        let newName = musicList[0].name
        
        // remove music from rooms
        roomList.forEach(room => {
            if (room.musicName === oldName) {
                room.musicName = newName
            }
        })

        if (that.state.oneTabMode) that.closeTab('music')

        that.setState({ musicList, roomList, currentMusicIndex })
    },

    randomNotes: (noteCount, frequencies) => {
        return Array(noteCount).fill(0).map(_ => {
            if (Math.random() < 0.5) return null
            let freqCount = frequencies.length
            let freqIndex = Math.floor(Math.random() * freqCount)
            let freq = frequencies[freqIndex]
            return freq
        })
    },

    random: (that, musicIndex) => {
        let scales = Music.getScales()
        let musicList = that.state.musicList.slice()
        let music = musicList[musicIndex]

        let voiceList = Array(4).fill(0).map((_, i) => {
            return {
                instrument: Music.instruments[i],
                noteList: Music.randomNotes(16, scales[i])
            }
        })
        music.voiceList = voiceList

        that.setState({ musicList })
    },

    clear: (that, musicIndex) => {
        let musicList = that.state.musicList.slice()
        let { name, beat } = musicList[musicIndex]
        musicList[musicIndex] = Music.create({ name, beat })
        that.setState({ musicList })
    },

    setNote: (that, musicIndex, voiceIndex, noteIndex, freq) => {
        let musicList = that.state.musicList.slice()
        let music = musicList[musicIndex]
        if (!music.voiceList) music.voiceList = []
        let voiceList = music.voiceList
        if (!voiceList[voiceIndex]) voiceList[voiceIndex] = []
        let voice = voiceList[voiceIndex]
        if (!voice.noteList) voice.noteList = []
        let noteList = voice.noteList
        noteList[noteIndex] = freq
        that.setState({ musicList })
    },

    setBeat: (that, musicIndex, beat) => {
        let musicList = that.state.musicList.slice()
        let music = musicList[musicIndex]
        music.beat = beat
        that.setState({ musicList })
    }
}

let MusicPlayer = {
    audioContext: null,

    audioLoop: null,

    init: () => {
        let AudioContext = window.AudioContext || window.webkitAudioContext
        MusicPlayer.audioContext = new AudioContext()
    },

    playNote: (freq, { wave = 'triangle', attack = 0, decay = 0.5, sustain = 0, release = 0, volume = 1 }, beat = 1) => {
        if (!freq) return
        if (!MusicPlayer.audioContext) MusicPlayer.init()

        let t = MusicPlayer.audioContext.currentTime
    
        let osc = MusicPlayer.audioContext.createOscillator()
        osc.type = wave
        osc.frequency.value = freq
    
        let env = MusicPlayer.audioContext.createGain()
        env.connect(MusicPlayer.audioContext.destination)
        env.gain.cancelScheduledValues(t)
        env.gain.setValueAtTime(0, t)
    
        env.gain.linearRampToValueAtTime(volume, t + (attack * beat))
        env.gain.linearRampToValueAtTime(sustain * volume, t + (attack * beat) + (decay * beat))
        env.gain.linearRampToValueAtTime(sustain * volume, t + beat)
        env.gain.linearRampToValueAtTime(0, t + beat + (release * beat))
    
        osc.connect(env)
        osc.start()
        osc.stop(t + beat + (release * beat))
    },

    playSong: ({ beat, voiceList }) => {
        let noteIndex = 0
        let noteCount = voiceList[0] && voiceList[0].noteList ? voiceList[0].noteList.length : 0
        MusicPlayer.audioLoop = window.setInterval(() => {
            voiceList.forEach(({ instrument, noteList }) => {
                let freq = noteList[noteIndex]
                if (freq) {
                    MusicPlayer.playNote(freq, instrument, beat)
                }
            })
            noteIndex++
            if (noteIndex >= noteCount) noteIndex = 0
        }, beat * 1000)
    },

    stopSong: () => {
        window.clearInterval(MusicPlayer.audioLoop)
    }
}