function addEditableElement(elem) {

    let editableElem = createEditableElement()

    // elem defined => add editable after elem
    if (elem) {
        elem.after(editableElem)
    }
    // append editable to the end
    else {
        noteContainer.appendChild(editableElem)
    }

    editableElem.click()

}


function createEditableElement(markdownCode) {

    // element to input markdown code
    let sourceInput = document.createElement('div')
    sourceInput.contentEditable = true
    sourceInput.tabIndex = -1
    sourceInput.className = 'element-source'

    // element to contain rendered markdown
    let renderContainer = document.createElement('div')
    renderContainer.className = 'element'

    // if markdown source is given => render element
    if (markdownCode) {
        sourceInput.style.display = 'none'
        renderContainer.style.display = 'block'
        sourceInput.innerText = markdownCode
        sourceInput.setAttribute('value', markdownCode)  // store source inline
        render(sourceInput.innerText, renderContainer)
    }
    // no markdown source given => put to edit mode
    else {
        sourceInput.style.display = 'block'           // make a block element
        renderContainer.style.display = 'none'        // initially hidden
    }

    // on markdown input loose focus => render markdown
    sourceInput.onblur = (e) => {

        // prevent blank lines from hiding
        if (sourceInput.textContent == '') {
            sourceInput.innerText = ' '
        }

        render(sourceInput.innerText, renderContainer)
        sourceInput.style.display = 'none'                          // hide markdown input
        renderContainer.style.display = 'block'                     // show rendered content
        sourceInput.setAttribute('value', sourceInput.textContent)  // store value inline

        // update note title when first element is changed
        if (!sourceInput.parentElement.previousElementSibling &&
            sourceInput.textContent != ' ') {
            currentNoteEntry.innerText = sourceInput.textContent.replace(/^\s*#+/g, '')
        }

    }


    sourceInput.onfocus = () => {

        // move caret to end
        let range = document.createRange()
        range.selectNodeContents(sourceInput)
        range.collapse(false)   // collapse to end

        let selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)

    }


    // keydown on markdownInput
    sourceInput.onkeydown = (event) => {

        // enter => exit edit mode
        if (event.key == 'Enter') {

            event.preventDefault()  // prevents adding new line to the current editable

            // get caret position
            let caret = window.getSelection().getRangeAt(0)
            let rangeToCaret = caret.cloneRange()
            rangeToCaret.selectNodeContents(sourceInput)
            rangeToCaret.setEnd(caret.endContainer, caret.endOffset)
            let caretStart = rangeToCaret.toString().length

            // get text after the the caret
            let rightText = sourceInput.textContent.substr(caretStart)

            // nothing right to care
            if (rightText == "") {

                // add a new editable line under current
                addEditableElement(sourceInput.parentNode)

            }
            else {

                // clear text after the caret
                sourceInput.innerText = rangeToCaret.toString()

                // take text on caret's right to a new line
                let newEditable = createEditableElement(rightText)
                sourceInput.parentNode.after(newEditable)

                // move caret to left end
                newEditable.click()
                window.getSelection().collapse(newEditable.sourceInput, 0)

            }

        }
        // tab => stop foucs change and convert to 4 spaces
        else if (event.key == 'Tab') {

            // insert a tab
            event.preventDefault()                 // prevent focus switch
            let range = window.getSelection().getRangeAt(0)
            range.deleteContents()
            range.insertNode(document.createTextNode('\t'))
            range.collapse(false)

        }
        // backspace
        else if (event.key == 'Backspace') {

            let selection = window.getSelection()

            // caret is at begining
            if (selection.getRangeAt(0).startOffset == 0) {

                let previousEditable = editable.previousElementSibling

                // has a previous sibiling editable
                if (previousEditable) {

                    event.preventDefault()  // prevent default character removal

                    // empty editable
                    if (editable.sourceInput.textContent == '') {
                        editable.remove()
                        previousEditable.click()
                    }
                    // non-empty editable
                    else {
                        // append current editable source to previous
                        previousEditable.click()
                        let range = selection.getRangeAt(0)
                        range.insertNode(document.createTextNode(sourceInput.textContent))
                        range.collapse(true)
                        editable.remove()
                    }

                }

            }

        }

    }

    // element to hold markdownInput and renderContainer
    let editable = document.createElement('div')
    editable.className = 'editable'
    editable.appendChild(sourceInput)
    editable.sourceInput = sourceInput
    editable.appendChild(renderContainer)

    // click on editable => enter edit mode
    editable.onclick = () => {
        // blank line editing
        if (sourceInput.innerText == ' ') {
            sourceInput.innerText = ''
        }
        sourceInput.style.display = 'block'       // show markdown input
        renderContainer.style.display = 'none'    // hide render container
        sourceInput.focus()                       // activate caret
    }

    return editable

}