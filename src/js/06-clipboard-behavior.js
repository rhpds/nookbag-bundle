;(function () {
  'use strict'

  var CMD_RX = /^\$ (\S[^\\\n]*(\\\n(?!\$ )[^\\\n]*)*)(?=\n|$)/gm
  var LINE_CONTINUATION_RX = /( ) *\\\n *|\\\n( ?) */g
  var TRAILING_SPACE_RX = / +$/gm

  var supportsCopy = window.navigator.clipboard

  ;[].slice.call(document.querySelectorAll('.doc pre.highlight, .doc .literalblock pre')).forEach(function (pre) {
    var code, language, lang, copy, paste, toast, pasteToast, toolbox

    if (pre.classList.contains('highlight')) {
      code = pre.querySelector('code')
      if ((language = code.dataset.lang) && language !== 'console') {
        ;(lang = document.createElement('span')).className = 'source-lang'
        lang.appendChild(document.createTextNode(language))
      }
    } else if (pre.innerText.startsWith('$ ')) {
      var block = pre.parentNode.parentNode
      block.classList.remove('literalblock')
      block.classList.add('listingblock')
      pre.classList.add('highlightjs', 'highlight')
      ;(code = document.createElement('code')).className = 'language-console hljs'
      code.dataset.lang = 'console'
      code.appendChild(pre.firstChild)
      pre.appendChild(code)
    } else {
      return
    }

    ;(toolbox = document.createElement('div')).className = 'source-toolbox'
    if (lang) toolbox.appendChild(lang)

    if (supportsCopy) {
      ;(copy = document.createElement('button')).className = 'copy-button'
      copy.setAttribute('title', 'Copy to clipboard')

      var img = document.createElement('img')
      img.src = '../_/img/octicons-16.svg#view-clippy'
      img.alt = 'copy icon'
      img.className = 'copy-icon'
      copy.appendChild(img)

      ;(toast = document.createElement('span')).className = 'copy-toast'
      toast.appendChild(document.createTextNode('Copied!'))
      copy.appendChild(toast)
      toolbox.appendChild(copy)
      copy.addEventListener('click', writeToClipboard.bind(copy, code))
    }

    if (supportsCopy && language === 'bash') {
      ;(paste = document.createElement('button')).className = 'paste-button'
      paste.setAttribute('title', 'Run into terminal')

      var img2 = document.createElement('img')
      img2.src = '../_/img/paste.svg'
      img2.alt = 'copy icon'
      img2.className = 'paste-icon'
      paste.appendChild(img2)

      ;(pasteToast = document.createElement('span')).className = 'paste-toast'
      pasteToast.appendChild(document.createTextNode('Executed!'))
      paste.appendChild(pasteToast)
      toolbox.appendChild(paste)
      paste.addEventListener('click', pasteToTerminal.bind(paste, code))
    }

    pre.parentNode.appendChild(toolbox)
  })

  function extractCommands (text) {
    var cmds = []
    var m
    while ((m = CMD_RX.exec(text))) cmds.push(m[1].replace(LINE_CONTINUATION_RX, '$1$2'))
    return cmds.join(' && ')
  }

  // eslint-disable-next-line no-unused-vars
  function writeToClipboard (code) {
    var text = code.innerText.replace(TRAILING_SPACE_RX, '')
    if (code.dataset.lang === 'console' && text.startsWith('$ ')) text = extractCommands(text)
    window.navigator.clipboard.writeText(text).then(
      function () {
        this.classList.add('clicked')
        this.offsetHeight // eslint-disable-line no-unused-expressions
        this.classList.remove('clicked')
      }.bind(this),
      function () {}
    )
  }

  function pasteToTerminal (code) {
    var text = code.innerText.replace(TRAILING_SPACE_RX, '')
    if (code.dataset.lang === 'console' && text.startsWith('$ ')) {
      text = extractCommands(text)
    }

    try {
      var iframe = window.parent.document.querySelector('.tabcontent.active .main-content')
      if (!iframe || !iframe.contentDocument) throw new Error('Terminal iframe not accessible.')
      var textArea = iframe.contentDocument.getElementsByTagName('textarea')[0]
      if (!textArea) throw new Error('Textarea not found in terminal iframe.')

      textArea.focus()
      // eslint-disable-next-line no-undef
      var inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: text,
        inputType: 'insertText',
      })

      textArea.dispatchEvent(inputEvent)
      // eslint-disable-next-line no-undef
      var event = new KeyboardEvent('keydown',
        { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', which: 13, keyCode: 13 })
      textArea.dispatchEvent(event)
      this.classList.add('clicked')
      this.offsetHeight // eslint-disable-line no-unused-expressions
      this.classList.remove('clicked')
    } catch (err) {
      console.error('Failed to paste to terminal:', err)
    }
  }
})()
