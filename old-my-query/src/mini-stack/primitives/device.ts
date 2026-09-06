class Device {
  static get isMobile(): boolean {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  }
  
  static get isTouch(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }
  
  static get language(): string {
    return navigator.language
  }
  
  static get isOnline(): boolean {
    return navigator.onLine
  }
  
  static async vibrate(pattern: number | number[]): Promise<void> {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }
}
