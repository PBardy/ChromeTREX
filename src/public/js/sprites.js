import { CANVAS_WIDTH, ACCELERATION } from './constants.js'
import { Rectangle, Hitbox } from './shapes.js'

class Animation {

  delay = 1
  updates = this.delay
  currentIndex = 0
  currentFrame = null

  constructor(...args) {
    this.frames = args
    if(this.frames.length > 0) {
      this.currentFrame = this.frames[0]
    }
  }

  update() {
    if(this.frames == null) return
    if(this.frames.length === 0) return
    this.updates++
    if(this.updates <= this.delay) return
    this.updates = 0
    this.currentIndex = this.currentIndex < this.frames.length - 1 ? this.currentIndex + 1 : 0
    this.currentFrame = this.frames[this.currentIndex]
  }

}

 
export class Sprite {

  static animations = {
    intial: null
  }

  hidden = false
  stopped = false
  hitboxScale = 1

  speed = { x: 1, y: 1 }

  constructor(spritesheet, animations, x, y, scale) {
    this.spritesheet = spritesheet
    this.animations = animations
    this.animation = animations.initial
    this.x = x 
    this.y = y
    this.scale = scale
  }

  get centerX() {
    return this.x + (this.width * 0.5)
  }

  get centerY() {
    return this.y + (this.height * 0.5)
  }

  get width() {
    return this.animation.currentFrame.width * this.scale
  }

  get height() {
    return this.animation.currentFrame.height * this.scale
  }
 
  get hitbox() {
    const hitbox = new Hitbox(this.x, this.y, this.width, this.height)
    hitbox.scale(this.hitboxScale)
    return hitbox
  }

  stop() {
    this.stopped = true
  }

  hide() {
    this.hidden = true
  }

  show() {
    this.hidden = false
  }

  update() {}

  render(ctx) {
    if(this.hidden) return
    this.animation.update()
    const { x, y, width, height } = this.animation.currentFrame
    ctx.drawImage(this.spritesheet, x, y, width, height, this.x, this.y, this.width, this.height)
  }

}


export class Runner extends Sprite {

  static scale = 0.5
  static animations = {
    initial: new Animation(new Rectangle(76, 6, 88, 90)),
    running: new Animation(new Rectangle(1338, 2 , 88, 90), new Rectangle(1514, 2, 88, 90), new Rectangle(1602, 2, 88, 90)),
    ducking: new Animation(new Rectangle(1866, 2, 118, 90), new Rectangle(1984, 2, 118, 90)),
    jumping: new Animation(new Rectangle(1338, 2 , 88, 90)),
    dead: new Animation(new Rectangle(1694, 6 , 80, 86)),
  }

  startTime = 0
  lastDelta = 0
  groundLevel = 0

  constructor(spritesheet, x, y) {
    super(spritesheet, Runner.animations, x, y, Runner.scale)

    this.hitboxScale = 0.5
  }

  get jumping() {
    return this.animation === this.animations.jumping
  }

  get ducking() {
    return this.animation === this.animations.ducking
  }

  die() {
    this.animation = this.animations.dead
  }

  jump() {
    if(this.jumping) return
    this.speed.y = 100
    this.startTime = this.lastDelta
    this.animation = this.animations.jumping
  }

  run() {
    if(this.jumping) return
    this.animation = this.animations.running
  }

  duck() {
    if(this.jumping) return
    this.animation = this.animations.ducking
  }

  unduck() {
    this.animation = this.jumping ? this.animations.jumping : this.animations.running
  }

  update(delta) {
    this.lastDelta = delta
    if(!this.jumping) return
    const t = (delta - this.startTime) / 1000
    const dy = (this.speed.y * t) + (ACCELERATION * t * t)
    if(this.y - dy > this.groundLevel) {
      this.y = this.groundLevel
      this.animation = this.animations.running
    } else {
      this.y -= dy
    }
  }
 
}


export class Landscape extends Sprite { 

  static scale = 1
  static animations = {
    initial: new Animation(new Rectangle(0, 104, 2400, 26))
  }

  constructor(spritesheet, x, y) {
    super(spritesheet, Landscape.animations, x, y, Landscape.scale)
  }

  clone() {
    return new Landscape(this.spritesheet, this.x, this.y)
  }

}


export class Cloud extends Sprite {

  static animations = {
    initial: new Animation(new Rectangle(166, 2, 92, 27))
  }

  static get scale() {
    return Math.floor(Math.random() * (1.2 - 0.6)) + 0.6 
  }

  constructor(spritesheet, x, y) {
    super(spritesheet, Cloud.animations, x, y, Cloud.scale)
  }

  clone() {
    return new Cloud(this.spritesheet, this.x, this.y)
  }

}


export class Pterodactyl extends Sprite {

  static scale = 0.5
  static animations = {
    initial: new Animation(new Rectangle(264, 18, 84, 60), new Rectangle(264, 18, 84, 60), new Rectangle(264, 18, 84, 60), new Rectangle(356, 6, 84, 52), new Rectangle(356, 6, 84, 52), new Rectangle(356, 6, 84, 52))
  }

  constructor(spritesheet, x, y) {
    super(spritesheet, Pterodactyl.animations, x, y, Pterodactyl.scale)
  }

}


export class Cactus extends Sprite {

  static scale = 0.6
  static animations = [
    { initial: new Animation(new Rectangle(448, 4, 30, 66)) },
    { initial: new Animation(new Rectangle(482, 4, 30 ,66)) },
    { initial: new Animation(new Rectangle(516, 4, 30, 66)) },
    { initial: new Animation(new Rectangle(550, 4, 30, 66)) },
    { initial: new Animation(new Rectangle(584, 4, 30, 66)) },
    { initial: new Animation(new Rectangle(618, 4, 30, 66)) },
    { initial: new Animation(new Rectangle(654, 4, 46, 92)) },
    { initial: new Animation(new Rectangle(704, 4, 44, 92)) },
    { initial: new Animation(new Rectangle(754, 4, 46, 92)) },
    { initial: new Animation(new Rectangle(804, 4, 46, 92)) },
    { initial: new Animation(new Rectangle(852, 8, 98, 94)) },
  ]

  static getRandomCactus(spritesheet, x, y) {
    return new Cactus(spritesheet, x, y, Math.floor(Math.random() * (Cactus.animations.length - 1)))
  }

  constructor(spritesheet, x, y, type) {
    super(spritesheet, Cactus.animations[type], x, y, Cactus.scale)
  }

}