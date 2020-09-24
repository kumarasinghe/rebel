const fs = require('fs')
const path = require('path')
const os = require('os')

let NOTES_DIR = path.join(os.homedir(), '.rebel')
let SESSION_FILE = path.join(NOTES_DIR, 'session')

class App {


    async init() {

        // init window
        this.nativeWindow = await new Promise((resolve) => {
            nw.Window.open(
                'client/index.html',
                {},
                (nativeWindow) => { resolve(nativeWindow) }
            )
        })

        // force close window on exit
        nw.Window.get().on('close', function () {
            this.hide()
            this.close(true)
        })

        // resize and position window
        nw.Screen.Init()
        let width = Math.round(nw.Screen.screens[0].bounds.width * 0.75)
        let height = Math.round(nw.Screen.screens[0].bounds.height * 0.7)
        this.nativeWindow.resizeTo(width, height)
        this.nativeWindow.setPosition('center')

        // wait till document is laoded
        await new Promise((resolve) => {
            this.nativeWindow.on('loaded', resolve)
        })

        // get client's window object
        this.clientWindow = this.nativeWindow.window

        // expose backend functions to client
        this.clientWindow.getNoteSource = this.getNoteSource
        this.clientWindow.createNewNote = this.createNewNote
        this.clientWindow.saveNote = this.saveNote.bind(this)
        this.clientWindow.removeNote = this.removeNote.bind(this)
        this.clientWindow.printCurrentNote = this.printCurrentNote.bind(this)

        // create notes directory
        if (!fs.existsSync(NOTES_DIR)) {
            fs.mkdirSync(NOTES_DIR)
            fs.copyFileSync('./client/default.md', path.join(NOTES_DIR, 'default.md'))
            fs.writeFileSync(SESSION_FILE, JSON.stringify({
                lastViewedNote: 'default.md',
                lastViewedNotePosition: 0,
                darkMode: false
            }))
        }

        this.loadNotesFromDisk()

        // restore previous sesion
        if (fs.existsSync(SESSION_FILE)) {
            let sessionData = JSON.parse(fs.readFileSync(SESSION_FILE))
            this.clientWindow.openNote(sessionData.lastViewedNote)
            this.clientWindow.setCurrentNotePosition(sessionData.lastViewedNotePosition)
            this.clientWindow.setDarkMode(sessionData.darkMode)
        }

    }


    loadNotesFromDisk() {

        // list note files from disk
        let notesFiles = fs.readdirSync(NOTES_DIR).filter((file) => {
            return file.endsWith('.md')
        })

        // make notes metadata
        let notesMetadata = notesFiles.map((file) => {

            let firstLine = fs.readFileSync(path.join(NOTES_DIR, file), { encoding: 'utf-8' })
            firstLine = firstLine
                .substring(0, firstLine.indexOf('\n'))
                .replace(/^\s*#+/g, '')
                .trim()

            let noteTitle = firstLine ? firstLine : 'Untitled'
            return { file: file, title: noteTitle }

        })

        // add note list to UI
        notesMetadata.forEach((noteData) => {
            this.clientWindow.addNoteEntry(noteData.title, noteData.file)
        })

    }


    getNoteSource(file) {

        return fs.readFileSync(path.join(NOTES_DIR, file), { encoding: 'utf-8' })

    }


    createNewNote() {

        let file = `${Date.now()}.md`
        let noteFile = path.join(NOTES_DIR, file)
        fs.writeFileSync(noteFile, '')
        return file

    }


    removeNote(file) {

        fs.unlinkSync(path.join(NOTES_DIR, file))

    }


    printCurrentNote() {

        this.nativeWindow.print({
            headerFooterEnabled: false,
            shouldPrintBackgrounds: true,
            scaleFactor: 70,
        })

    }


    saveNote(file, markdownSrc) {

        fs.writeFileSync(
            path.join(NOTES_DIR, file),
            markdownSrc
        )

        // save session data
        let sessionData = {
            lastViewedNote: file,
            lastViewedNotePosition: this.clientWindow.getCurrentNotePosition(),
            darkMode: this.clientWindow.getDarkMode()
        }

        fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData))

    }

}

new App().init()
