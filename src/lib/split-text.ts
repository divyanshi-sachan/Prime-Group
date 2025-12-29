// This is a simplified version of GSAP's SplitText for demo purposes
class SplitText {
    chars: HTMLSpanElement[] = []
    
    constructor(element: HTMLElement | null, options: { type: string }) {
      if (!element) return
      
      const text = element.textContent || ''
      element.textContent = ''
      
      this.chars = text.split('').map(char => {
        const span = document.createElement('span')
        span.style.display = 'inline-block'
        span.style.opacity = '0'
        span.textContent = char
        element.appendChild(span)
        return span
      })
    }
  }
  
  export default SplitText
  
  