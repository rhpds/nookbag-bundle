;(function () {
  'use strict'

  var lightboxOverlay
  var lightboxImage
  var lightboxClose
  var currentImageIndex = 0
  var images = []

  function initLightbox () {
    // Create lightbox overlay
    lightboxOverlay = document.createElement('div')
    lightboxOverlay.className = 'lightbox-overlay'
    lightboxOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; ' +
      'background-color: rgba(0, 0, 0, 0.8); z-index: 9999; display: none; ' +
      'justify-content: center; align-items: center; cursor: pointer;'

    // Create lightbox container
    var lightboxContainer = document.createElement('div')
    lightboxContainer.className = 'lightbox-container'
    lightboxContainer.style.cssText = 'position: relative; max-width: 90%; max-height: 90%; cursor: default;'

    // Create lightbox image
    lightboxImage = document.createElement('img')
    lightboxImage.className = 'lightbox-image'
    lightboxImage.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain; display: block;'

    // Create close button
    lightboxClose = document.createElement('button')
    lightboxClose.className = 'lightbox-close'
    lightboxClose.innerHTML = '×'
    lightboxClose.setAttribute('title', 'Close lightbox')
    lightboxClose.style.cssText = 'position: absolute; top: -15px; right: -15px; background: #fff; ' +
      'border: none; border-radius: 50%; width: 30px; height: 30px; font-size: 18px; ' +
      'font-weight: bold; cursor: pointer; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); z-index: 10000;'

    // Assemble lightbox
    lightboxContainer.appendChild(lightboxImage)
    lightboxContainer.appendChild(lightboxClose)
    lightboxOverlay.appendChild(lightboxContainer)
    document.body.appendChild(lightboxOverlay)

    // Add event listeners
    lightboxOverlay.addEventListener('click', closeLightbox)
    lightboxContainer.addEventListener('click', function (e) {
      e.stopPropagation()
    })
    lightboxClose.addEventListener('click', closeLightbox)
    document.addEventListener('keydown', handleKeydown)

    // Use event delegation to handle image clicks (works with dynamically added images)
    document.addEventListener('click', handleImageClick)
  }

  function collectImages () {
    // Find all images in the document content area
    var imageElements = document.querySelectorAll('.doc img, .article img, img')
    images = []

    imageElements.forEach(function (img) {
      // Skip small images (likely icons)
      if (img.naturalWidth < 50 || img.naturalHeight < 50) return

      // Skip images with specific classes that shouldn't be lightboxed
      if (img.classList.contains('no-lightbox') ||
          img.classList.contains('copy-icon') ||
          img.classList.contains('paste-icon')) return

      images.push(img)
      img.style.cursor = 'pointer'
    })

    return images
  }

  function handleImageClick (e) {
    var target = e.target

    // Check if the clicked element is an image
    if (target.tagName !== 'IMG') return

    // Skip images with specific classes that shouldn't be lightboxed
    if (target.classList.contains('no-lightbox') ||
        target.classList.contains('copy-icon') ||
        target.classList.contains('paste-icon')) return

    // Skip small images (likely icons) - only check if image is loaded
    if (target.complete && target.naturalWidth > 0 && target.naturalHeight > 0 &&
        (target.naturalWidth < 50 || target.naturalHeight < 50)) return

    // Refresh the image collection to include any newly added images
    collectImages()

    // Find the index of the clicked image in the current collection
    var imageIndex = images.indexOf(target)
    if (imageIndex !== -1) {
      e.preventDefault()
      openLightbox(imageIndex)
    }
  }

  function openLightbox (imageIndex) {
    currentImageIndex = imageIndex
    var targetImage = images[currentImageIndex]

    if (!targetImage) return

    lightboxImage.src = targetImage.src
    lightboxImage.alt = targetImage.alt || 'Image'
    lightboxOverlay.style.display = 'flex'
    document.body.style.overflow = 'hidden'

    // Add fade-in animation
    lightboxOverlay.style.opacity = '0'
    setTimeout(function () {
      lightboxOverlay.style.transition = 'opacity 0.3s ease'
      lightboxOverlay.style.opacity = '1'
    }, 10)
  }

  function closeLightbox () {
    lightboxOverlay.style.opacity = '0'
    setTimeout(function () {
      lightboxOverlay.style.display = 'none'
      lightboxOverlay.style.transition = ''
      document.body.style.overflow = ''
    }, 300)
  }

  function handleKeydown (e) {
    if (lightboxOverlay.style.display === 'flex') {
      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          if (currentImageIndex > 0) {
            openLightbox(currentImageIndex - 1)
          }
          break
        case 'ArrowRight':
          if (currentImageIndex < images.length - 1) {
            openLightbox(currentImageIndex + 1)
          }
          break
      }
    }
  }

  // Initialize lightbox when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initLightbox()
      collectImages()
    })
  } else {
    initLightbox()
    collectImages()
  }
})()
