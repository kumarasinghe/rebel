/* renders a markdown source in a given container */
function render(html, renderContainer) {

    let match
    renderContainer.isHeading = false

    /************************* HEADINGS *************************/

    // heading 6
    if (match = html.match(/^###### .*/)) {
        html = html.replace(
            match,
            `<div class="heading-6">${match[0].substr(7)}</div>`
        )
        renderContainer.isHeading = true
    }

    // heading 5
    else if (match = html.match(/^##### .*/)) {
        html = html.replace(
            match,
            `<div class="heading-5">${match[0].substr(6)}</div>`
        )
        renderContainer.isHeading = true
    }

    // heading 4
    else if (match = html.match(/^#### .*/)) {
        html = html.replace(
            match,
            `<div class="heading-4">${match[0].substr(5)}</div>`
        )
        renderContainer.isHeading = true
    }

    // heading 3
    else if (match = html.match(/^### .*/)) {
        html = html.replace(
            match,
            `<div class="heading-3">${match[0].substr(4)}</div>`
        )
        renderContainer.isHeading = true
    }

    // heading 2
    else if (match = html.match(/^## .*/)) {
        html = html.replace(
            match,
            `<div class="heading-2">${match[0].substr(3)}</div>`
        )
        renderContainer.isHeading = true
    }

    // heading 1
    else if (match = html.match(/^# .*/)) {
        html = html.replace(
            match,
            `<div class="heading-1">${match[0].substr(2)}</div><hr>`
        )
        renderContainer.isHeading = true
    }

    /************************* CODE BLOCK *************************/

    if (match = html.match(/^(\t| {4})[^\-|\+|\*|\t| +].*/)) {
        html = html.replace(
            match[0],
            `<div class="code-block">${match[0].trim()}</div>`
        )
    }

    /************************* LISTS *************************/

    // bullet - level 3
    if (match = html.match(/^( {8}|\t\t)[*+-] /)) {
        match = match[0].match(/[*+-]/)
        html = html.replace(match[0], '▪')
    }

    // bullet - level 2
    else if (match = html.match(/^( {4}|\t)[*+-] /)) {
        match = match[0].match(/[*+-]/)
        html = html.replace(match[0], '○')
    }

    // bullet - level 1
    else if (match = html.match(/^[*+-] /)) {
        match = match[0].match(/[*+-]/)
        html = html.replace(match[0], '●')
    }

    // bullet - level unknown
    else if (match = html.match(/^( {9,}|\t{3,})[*+-] /)) {
        match = match[0].match(/[*+-]/)
        html = html.replace(match[0], '▫')
    }

    /************************* RULE *************************/

    html = html.replace(
        /^(\-{3,}|\*{3,}|\_{3,})$/,
        `<hr class="line"/>`
    )


    /************************* BOLD *************************/

    if (match = html.match(/(?<!\\)[*]{2}[^*]*[*]{2}/g)) {
        match.forEach(text => {
            html = html.replace(
                text,
                `<span class="bold">${text.substr(2, text.length - 4)}</span>`
            )
        })

    }

    /************************* ITALIC *************************/

    // do not match urls
    if (match = html.match(/(?<!\\|http[s]?:\/\/[^ ]+)_[^_]+_/g)) {
        match.forEach(text => {
            html = html.replace(
                text,
                `<span class="italic">${text.substr(1, text.length - 2)}</span>`
            )
        })
    }

    // do not match urls
    if (match = html.match(/(?<!\\|http[s]?:\/\/[^ ]+)\*[^\*]*\*/g)) {
        match.forEach(text => {
            html = html.replace(
                text,
                `<span class="italic">${text.substr(1, text.length - 2)}</span>`
            )
        })
    }

    /************************* CODE *************************/

    if (match = html.match(/`[^`]*`/g)) {
        match.forEach(text => {
            html = html.replace(
                text,
                `<span class="label">${text.substr(1, text.length - 2)}</span>`
            )
        })

    }

    /************************* BLOCK QUOTE *************************/

    if (match = html.match(/^\s*> .*/)) {
        match = html.match(/> .*/)
        html = html.replace(
            match[0],
            `<div class="block-quote">${match[0].substr(2)}</div>`
        )
    }

    /************************* IMAGES *************************/

    if (match = html.match(/!\[[^\]]+]\([^\)]+\)/g)) {

        match.forEach((matchedInstance) => {

            let fragments = matchedInstance.split('](')
            let imageTitle = fragments[0].substr(2).trim()
            let url = fragments[1].substr(0, fragments[1].length - 1).trim()
            // inverts image in dark mode
            let invertStyle = darkMode ? "filter:invert(1) hue-rotate(180deg)":""
            html = html.replace(
                matchedInstance,
                `<img src="${url}" alt="${imageTitle}" class="image" style="${invertStyle}"/>`
            )
        })

    }

    /************************* URLS *************************/

    // title masked url
    if (match = html.match(/\[[^\]]*\]\([^\)]*\)/g)) {

        match.forEach((matchedInstance) => {
            let fragments = matchedInstance.split('](')
            let urlTitle = fragments[0].substr(1).trim()
            let url = fragments[1].substr(0, fragments[1].length - 1).trim()
            html = html.replace(
                matchedInstance,
                `<a href="${url}" class="anchor" target="_blank">${urlTitle}</a>`
            )
        })

    }

    // naked url
    if (match = html.match(/<http[s]?:\/\/[^>]+>/g)) {

        match.forEach((matchedInstance) => {
            let URL = matchedInstance.substr(1, matchedInstance.length - 2).trim()
            html = html.replace(
                matchedInstance,
                `<a href='${URL}' class="anchor" target="_blank">${URL}</a>`
            )
        })

    }

    // mail to url
    if (match = html.match(/<[a-z0-1\-\.\_]+\@[a-z0-1\-\.\_]+\.[a-z\.]+>/g)) {

        match.forEach((matchedInstance) => {
            let email = matchedInstance.substr(1, matchedInstance.length - 2).trim()
            html = html.replace(
                matchedInstance,
                `<a href='mailto:${email}' class="anchor" target="_blank">${email}</a>`
            )
        })

    }

    /************************* ROW *************************/

    if (match = html.match(/^\|.*\|.*\|$/m)) {

        html = html.replace(
            /^\|/,
            '<table class="table"><tr class="table-row"><td class="table-data">'
        )
        html = html.replace(
            /\|$/m,
            '</td></tr></table>'
        )
        html = html.replace(
            /\|/g,
            '</td><td class="table-data">'
        )
    }

    /************************* SLASH *************************/
    html = html.replace(
        /(?<!\\)\\/g,
        ''
    )


    renderContainer.innerHTML = html

    // trigger nav-link update on heading changes
    if (renderContainer.isHeading) { updateNavLinks() }

}