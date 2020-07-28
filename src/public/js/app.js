import Game from './game.js'

const js = Array.from(document.querySelectorAll('.js'))
const ui = Object.fromEntries(js.map(val => [val.id, val]))

const game = new Game(ui.Canvas, ui.Spritesheet)

ui.UseAI.addEventListener('input', e => {
  game.useAI = e.target.checked
})

ui.ShowHitboxes.addEventListener('input', e => {
  game.showHitboxes = e.target.checked
})

ui.EnableCollisions.addEventListener('input', e => {
  game.enableCollisions = e.target.checked
})

window.addEventListener('keyup', game.onkeyup, false)
window.addEventListener('keydown', game.onkeydown, false)