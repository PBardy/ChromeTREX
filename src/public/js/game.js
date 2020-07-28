import { CANVAS_WIDTH, CANVAS_HEIGHT, FONT, KEYS } from './constants.js'
import { Runner, Landscape, Pterodactyl, Cactus, Cloud } from './sprites.js'
import { Hitbox } from './shapes.js'

export default class Game {

  static ACCELERATION = 0.1

  sprites = []
  obstacles = []
  keyboard = {}

  ref = null
  paused = false
  stopped = true

  fps = 60
  fpsInterval = 1000 / this.fps
  lastTime = 0

  chunks = 1
  scrollX = 0
  scrollSpeed = 10
  useAI = false
  started = false
  gameOver = false
  showHitboxes = false
  enableCollisions = true
  groundLevel = CANVAS_HEIGHT

  constructor(canvas, spritesheet) {
    this.canvas = canvas
    this.spritesheet = spritesheet
    this.canvas.width = CANVAS_WIDTH
    this.canvas.height = CANVAS_HEIGHT
    this.context = canvas.getContext('2d')
    this.start = this.start.bind(this)
    this.onkeyup = this.onkeyup.bind(this)
    this.onkeydown = this.onkeydown.bind(this)
    this.mainloop = this.mainloop.bind(this)

    this.runner = new Runner(this.spritesheet, 0, 0)
    this.landscape = new Landscape(this.spritesheet, 0, 0)
    this.sprites.push(this.runner)
    this.sprites.push(this.landscape)
    this.positionSprites()
    this.update(0) // render first frame
  }

  // game logic
  
  addCacti() {
    for(let i = 0; i < 6; i++) {
      const n = Math.floor(Math.random() * 2) + 1
      const x = this.scrollX + CANVAS_WIDTH + (i * 400) + (Math.floor(Math.random() * 100) - 100)
      for(let m = 0; m < n; m++) {
        const obstacle = Cactus.getRandomCactus(this.spritesheet, x, this.runner.y)
        obstacle.x += (m * obstacle.width)
        obstacle.y = (this.groundLevel + this.runner.height) - obstacle.height
        this.sprites.push(obstacle)
        this.obstacles.push(obstacle)
      }
    }
  }

  addClouds() {
    const cloud1 = new Cloud(this.spritesheet, this.scrollX, 0)
    cloud1.y = cloud1.height + 4
    const cloud2 = cloud1.clone()
    cloud2.x += CANVAS_WIDTH
    const cloud3 = cloud2.clone()
    cloud3.x += CANVAS_WIDTH
    this.sprites.push(cloud1)
    this.sprites.push(cloud2)
    this.sprites.push(cloud3)
  }

  addPterodactyl() {
    const dy = Math.floor(Math.random() * 2)
    const x = this.scrollX + CANVAS_WIDTH + (Math.floor(Math.random() * this.landscape.width))
    const ptero = new Pterodactyl(this.spritesheet, x, 0)
    ptero.y += ptero.height * dy
    this.sprites.push(ptero)
    this.obstacles.push(ptero)
  }

  displayScore() {
    this.context.beginPath()
    this.context.font = FONT;
    this.context.fillText(Math.floor(this.scrollX / 10), this.scrollX + CANVAS_WIDTH - 50, 50);
    this.context.closePath()
  }

  positionSprites() {
    this.groundLevel = CANVAS_HEIGHT - (this.runner.height + this.landscape.height) + 18
    this.runner.y = this.groundLevel
    this.runner.groundLevel = this.groundLevel
    this.landscape.y = CANVAS_HEIGHT - (this.landscape.height)
  }

  withinBounds(sprite) {
    return sprite.hitbox.overlaps(new Hitbox(this.scrollX, 0, CANVAS_WIDTH, CANVAS_HEIGHT))
  }

  checkCollision(sprite) {
    if(!(this.runner.hitbox.overlaps(sprite.hitbox))) return
    this.started = false
    this.gameOver = true
    this.runner.die()
    this.runner.render(this.context)
    this.stop()
  }

  removeObsoleteObjects() {
    this.sprites.forEach((sprite, index) => {
      if(!this.withinBounds(sprite) && !(sprite instanceof Runner)) { 
        this.sprites.splice(index, 1)
        const objIndex = this.obstacles.indexOf(sprite)
        if(objIndex < 0) return
        this.obstacles.splice(objIndex, 1)
      }
    })
  }

  generateChunk() {
    const rightmost = this.scrollX + this.scrollSpeed + CANVAS_WIDTH
    const threshold = this.chunks * this.landscape.width

    // generate a new chunk before the landscape runs out of width
    if(rightmost > 0 && rightmost > threshold) {
      this.removeObsoleteObjects()
      const clone = this.landscape.clone()
      clone.x = rightmost // place abut the landscape
      this.chunks++
      this.scrollSpeed += Game.ACCELERATION
      this.sprites.push(clone)
      this.addCacti()
      this.addClouds()
      this.addPterodactyl()
    }
  }

  think() {
    if(!this.useAI) return
    const jump = Math.random() > 0.5
    if(!jump) return
    this.runner.jump()
  }

  // event handlers
  onkeyup(event) {
    if(this.gameOver) return
    if(this.sprites.length === 0) return
    if(event.keyCode === KEYS.S || KEYS.DOWN) (this.runner.unduck())
  }

  onkeydown(event) {
    if(this.started) {
      if(this.gameOver) return
      if(this.sprites.length === 0) return
      if(event.keyCode === KEYS.W || event.keyCode === KEYS.UP) (this.runner.jump())
      if(event.keyCode === KEYS.S || event.keyCode === KEYS.DOWN) (this.runner.duck())
    } else {
      this.start()
    }
  }

  // rendering methods

  start() {
    this.stop()
    this.started = true
    this.paused = false
    this.stopped = false
    this.runner.run()
    this.mainloop()
  }

  stop() {
    cancelAnimationFrame(this.ref)
    this.lastTime = 0
    this.stopped = true
  }

  pause() {
    this.paused = true
  }

  unpause() {
    this.paused = false
  }

  update(delta) {
    this.scrollX += this.scrollSpeed
    this.runner.x = this.scrollX
    this.context.translate(-this.scrollSpeed, 0)
    this.context.clearRect(this.scrollX, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    this.think()
    this.displayScore()
    this.generateChunk()

    this.sprites.forEach(sprite => {
      sprite.update(delta)
      sprite.render(this.context)
      if(this.showHitboxes) sprite.hitbox.render(this.context)
      if(!this.enableCollisions) return
      if(!this.obstacles.includes(sprite)) return
      this.checkCollision(sprite)
    })

  }

  mainloop(delta) {
    if(this.stopped) return
    this.ref = requestAnimationFrame(this.mainloop)
    if(this.paused) return

    const elapsed = delta - this.lastTime
    if(elapsed < this.fpsInterval) return
    this.lastTime = delta

    // ... logic below here runs at the 60 fps
    this.update(delta)

  }

}