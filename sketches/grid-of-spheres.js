const canvasSketch = require('canvas-sketch')
const d3g = require('d3-geo')
const d3c = require('d3-color')
const shuffle = require('shuffle-array')
const {grid} = require('../utils/grid')
const {palette} = require('../utils/palette')

const settings = {
  dimensions: [12 * 72, 12 * 72],
  pixelRatio: devicePixelRatio,
  exportPixelRatio: devicePixelRatio
}

const CELL_COUNT = 10

canvasSketch(() => {
  return ({context: ctx, width, height}) => {
    ctx.clearRect(0, 0, width, height)
    const palettes = palette(10)
    const pcolors = palettes.random()
    const baseColor = shuffle.pick(pcolors)
    const colors = pcolors.filter(c => c !== baseColor)

    const graticule = d3g.geoGraticule().step([15, 15])
    const projection = d3g.geoOrthographic().translate([width / 2, height / 2])
    const path = d3g
      .geoPath()
      .projection(projection)
      .context(ctx)

    const circle = d3g.geoCircle()
    const rstep = 360 / CELL_COUNT
    const bgColor = d3c.color(baseColor)
    const lineColor = d3c.color(shuffle.pick(colors))
    const eclipseColor = lineColor.brighter(0.2)
    const shadowColor = lineColor.darker()

    eclipseColor.opacity = 0.5
    shadowColor.opacity = 0.5

    ctx.lineWidth = 0
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    for (const {x, y, xsize, ysize, i} of grid(CELL_COUNT, width, height)) {
      const radius = Math.floor(Math.min(xsize, ysize) / 2)
      projection
        .translate([x + xsize / 2, y + ysize / 2])
        .scale(radius * 0.8)
        .rotate([rstep * i, 45, rstep * i])

      ctx.beginPath()
      ctx.fillStyle = eclipseColor
      path(circle())
      ctx.fill()

      ctx.beginPath()
      ctx.fillStyle = shadowColor
      ctx.fillStyle = ctx.ellipse(x + xsize / 2, y + ysize - 25, radius * 0.2, radius * 0.01, 0, Math.PI * 2, false)
      ctx.fill()

      ctx.beginPath()
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 0.5
      path(graticule())
      ctx.stroke()

      ctx.beginPath()
      path({type: 'Sphere'})
      ctx.strokeStyle = lineColor.darker()

      ctx.lineWidth = 1
      ctx.stroke()
    }
  }
}, settings)
