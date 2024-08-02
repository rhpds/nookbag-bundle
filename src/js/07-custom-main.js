;(function () {
  'use strict'
  var preElements = document.querySelectorAll('pre.highlight')
  preElements.forEach(function (preElement) {
    var codeElement = preElement.querySelector('code')

    if (codeElement && codeElement.classList.contains('language-text')) {
      var contentDiv = preElement.closest('.content')
      var sourceToolbox = contentDiv.querySelector('.source-toolbox')
      if (sourceToolbox) {
        sourceToolbox.style.display = 'none'
      }
    }
  })
})()
