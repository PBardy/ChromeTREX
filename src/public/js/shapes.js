export class Rectangle {

  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  get Top() {
    return this.y
  }

  get Bottom() {
    return this.y + this.height
  }

  get Left() {
    return this.x
  }

  get Right() {
    return this.x + this.width
  }

  render(ctx, color = 'red') {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.rect(this.x, this.y, this.width, this.height)
    ctx.stroke()
    ctx.closePath()
  }

}


export class Hitbox extends Rectangle {

  constructor(x, y, width, height) {
    super(x, y, width, height)
  }

  scale(value) {
    const nw = this.width * value
    const nh = this.height * value
    const dw = this.width - nw
    const dh = this.height - nh
    this.x += (dw * 0.5)
    this.y += (dh * 0.5)
    this.width = nw
    this.height = nh
  }

  overlaps(other) {
    if(this.Top > other.Bottom || this.Bottom < other.Top) return false
    if(this.Right < other.Left || this.Left > other.Right) return false
    return true
  }

}