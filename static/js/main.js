// Nav scroll effect (matches the old React Nav's `scrolled` state).
const navHeader = document.getElementById('nav-header')
function onScroll() {
  if (window.scrollY > 12) {
    navHeader.classList.add('bg-ink/80', 'border-b', 'border-line', 'backdrop-blur-lg')
    navHeader.classList.remove('bg-transparent')
  } else {
    navHeader.classList.remove('bg-ink/80', 'border-b', 'border-line', 'backdrop-blur-lg')
    navHeader.classList.add('bg-transparent')
  }
}
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

// Mobile menu toggle.
const menuBtn = document.getElementById('mobile-menu-btn')
const menuPanel = document.getElementById('mobile-menu')
const menuIconOpen = document.getElementById('mobile-menu-icon-open')
const menuIconClose = document.getElementById('mobile-menu-icon-close')

function setMobileMenu(open) {
  menuPanel.classList.toggle('hidden', !open)
  menuIconOpen.classList.toggle('hidden', open)
  menuIconClose.classList.toggle('hidden', !open)
}

menuBtn.addEventListener('click', () => {
  setMobileMenu(menuPanel.classList.contains('hidden'))
})

document.querySelectorAll('[data-close-mobile-menu]').forEach((el) => {
  el.addEventListener('click', () => setMobileMenu(false))
})
