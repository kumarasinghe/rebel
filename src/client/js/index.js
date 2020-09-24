let noteContainer, navLinkContainer, noteList, currentNoteEntry, leftPanel, rightPanel, printStyleNode, darkMode


function onCreateNewNoteButtonClick() {

    // save the current note
    if (currentNoteEntry) {
        saveCurrentNote()
        // unhighlight current note entry
        currentNoteEntry.className = 'note-entry'
    }

    // create a new note
    let file = createNewNote()
    noteContainer.innerHTML = ''
    currentNoteEntry = addNoteEntry('Untitled', file)
    currentNoteEntry.className = 'note-entry-selected'
    addEditableElement()

}


function onRemoveNoteButtonClick() {

    if (currentNoteEntry && confirm(`Do you want to remove "${currentNoteEntry.innerText}" ?`)) {
        removeNote(currentNoteEntry.file)
        currentNoteEntry.remove()
        noteContainer.innerHTML = ''
        navLinkContainer.innerHTML = ''
        currentNoteEntry = undefined
    }

}


function getDarkMode() {
    return darkMode
}


function setDarkMode(value) {

    if (value) {
        document.body.style = "filter:invert(1) hue-rotate(180deg)"
        // invert images
        document.querySelectorAll('img').forEach((image) => {
            image.style = "filter:invert(1) hue-rotate(180deg)"
        })
    }
    else {
        document.body.style = ""
        // remove invert on images
        document.querySelectorAll('img').forEach((image) => {
            image.style = ""
        })
    }
    darkMode = value

}


function onToggleDarkModeClick() {
    setDarkMode(!darkMode)
}


function addNoteEntry(title, file) {

    let noteEntry = document.createElement('div')
    noteEntry.className = 'note-entry'
    noteEntry.innerHTML = title
    noteEntry.file = file
    noteEntry.onclick = onNoteEntryClicked

    noteList.appendChild(noteEntry)
    return noteEntry

}


function onNoteEntryClicked() {

    // save current note
    if (currentNoteEntry) {
        // unhilight current note entry
        currentNoteEntry.className = 'note-entry'
        saveCurrentNote()
    }

    // clear note container
    noteContainer.innerHTML = ''

    // load given note from disk
    let markdownSrcList = getNoteSource(this.file).split('\n')

    markdownSrcList.forEach((markdownSrc) => {
        let editable = createEditableElement(markdownSrc)
        noteContainer.appendChild(editable)
    })

    currentNoteEntry = this
    this.className = 'note-entry-selected'

    updateNavLinks()

}


function saveCurrentNote() {

    let markdownSource = ''
    let sourceInputs = noteContainer.querySelectorAll('.element-source')

    sourceInputs.forEach((sourceInput) => {
        markdownSource += sourceInput.textContent + '\n'
    })

    // remove new line at last
    markdownSource = markdownSource.substring(0, markdownSource.length - 1)

    saveNote(currentNoteEntry.file, markdownSource)

}


function openNote(file) {

    let noteEntryList = noteList.querySelectorAll('.note-entry')
    for (let noteEntry of noteEntryList) {
        if (noteEntry.file == file) {
            noteEntry.click()
            break
        }
    }

}


function setCurrentNotePosition(yPosition) {
    document.querySelector("#note-container").scrollTo(0, yPosition)
}


function getCurrentNotePosition() {
    return Math.round(document.querySelector("#note-container").scrollTop)
}


function updateNavLinks() {

    navLinkContainer.innerHTML = ''

    // get headings in page
    let headings = noteContainer.querySelectorAll(
        '.heading-1,.heading-2,.heading-3,.heading-4,.heading-5,.heading-6'
    )

    // create nav links for each header
    headings.forEach((heading) => {

        let navLink = document.createElement('a')
        navLink.className = 'nav-link'
        navLink.innerText = heading.innerText
        navLink.onclick = () => {
            heading.scrollIntoView()
        }
        navLinkContainer.appendChild(navLink)

    })

}


async function onPrintNoteButtonClick() {

    await setPrintMode(true)
    printCurrentNote()
    setPrintMode(false)

}


// prepare UI for printing by applying a special stylesheet
function setPrintMode(value) {

    return new Promise((resolve) => {

        if (value) {
            printStyleNode = document.createElement('link')
            printStyleNode.rel = 'stylesheet'
            printStyleNode.setAttribute('type', 'text/css')
            printStyleNode.href = 'print-theme.css'
            printStyleNode.onload = resolve
            document.body.appendChild(printStyleNode)
        }
        else {
            printStyleNode.remove()
        }

    })

}


// on load complete => bind UI events
window.onload = () => {

    noteContainer = document.getElementById('note-container')
    navLinkContainer = document.getElementById('navigation-container')
    noteList = document.getElementById('note-list')
    leftPanel = document.getElementById('left-panel')
    rightPanel = document.getElementById('right-panel')

    // btnNewNote click
    document.getElementById('btnNewNote').onclick = onCreateNewNoteButtonClick

    // btnRemoveNote click
    document.getElementById('btnRemoveNote').onclick = onRemoveNoteButtonClick

    // btnPrintNote click
    document.getElementById('btnPrintNote').onclick = onPrintNoteButtonClick

    // btnToggleDarkMode click
    document.getElementById('btnToggleDarkMode').onclick = onToggleDarkModeClick

}


// on window close => save current note
window.onunload = () => {

    if (currentNoteEntry) {
        saveCurrentNote()
    }

}