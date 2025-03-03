/**
 * Browser fingerprinting utility
 * Creates a unique identifier based on browser characteristics
 */

export async function generateFingerprint(): Promise<string> {
  try {
    // Collect browser information
    const userAgent = navigator.userAgent
    const language = navigator.language
    const platform = navigator.platform
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height
    const screenDepth = window.screen.colorDepth
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const touchSupport = 'ontouchstart' in window

    // Check for available plugins
    const plugins = Array.from(navigator.plugins || [])
      .map((plugin) => plugin.name)
      .join(',')

    // Check for canvas fingerprint
    let canvasFingerprint = ''
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = 200
        canvas.height = 50

        // Text with different styles
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillStyle = '#f60'
        ctx.fillRect(125, 1, 62, 20)
        ctx.fillStyle = '#069'
        ctx.fillText('Fingerprint', 2, 15)
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
        ctx.fillText('Fingerprint', 4, 17)

        canvasFingerprint = canvas.toDataURL().slice(0, 100)
      }
    } catch (e) {
      canvasFingerprint = 'canvas-not-supported'
    }

    // Combine all values
    const values = [
      userAgent,
      language,
      platform,
      `${screenWidth}x${screenHeight}x${screenDepth}`,
      timezone,
      touchSupport ? 'touch' : 'no-touch',
      plugins,
      canvasFingerprint,
    ].join('###')

    // Create a hash of the combined values
    const encoder = new TextEncoder()
    const data = encoder.encode(values)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return hashHex
  } catch (error) {
    console.error('Error generating fingerprint:', error)
    // Fallback to a random ID if fingerprinting fails
    return crypto.randomUUID()
  }
}
