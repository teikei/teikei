/**
 * Conditionally loads Google Fonts only in development mode
 * In production, falls back to system fonts for compliance
 */
export function loadDevelopmentFonts() {
  // Only load Google Fonts in development mode
  if (import.meta.env.DEV) {
    // Create preconnect links for better performance
    const preconnect1 = document.createElement('link')
    preconnect1.rel = 'preconnect'
    preconnect1.href = 'https://fonts.googleapis.com'
    document.head.appendChild(preconnect1)

    const preconnect2 = document.createElement('link')
    preconnect2.rel = 'preconnect'
    preconnect2.href = 'https://fonts.gstatic.com'
    preconnect2.crossOrigin = 'anonymous'
    document.head.appendChild(preconnect2)

    const robotoFontLink = document.createElement('link')
    robotoFontLink.rel = 'stylesheet'
    robotoFontLink.href =
      'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&family=Roboto+Condensed:wght@300;400;700&display=swap'
    document.head.appendChild(robotoFontLink)

    console.log('Development mode: Google Fonts loaded')
  } else {
    console.log('Production mode: Fonts provided by host application')
  }
}
