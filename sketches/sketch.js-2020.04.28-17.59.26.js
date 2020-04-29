const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const palettes = require('nice-color-palettes')

const settings = {
  suffix: random.getSeed(),
  dimensions: [ 2048, 2048 ]
};

const seed = random.getRandomSeed()
console.log(`seed: ${seed}`)
random.setSeed(seed)

const sketch = () => {
  const range = (min, max) => Array.from(new Array(max - min)).map((_, i) => i + min)

  const mult = ([a, b], [c, d]) => [a * c, b * d]
  const ratio = (a, b) => b <= 1 ? 0.5 : a / (b - 1)
  const toUv = ([x, y], [width, height]) => [ratio(x, width), ratio(y, height)]
  const lerp2 = ([a, b], [c, d], [t1, t2]) => [lerp(a, c, t1), lerp(b, d, t2)]
  // -1 ... 1 to 0 ... 1
  const normalise = (v) => v * 0.5 + 0.5

  // Applies a margin in UV space to p, effectively shrinking its bounding box
  const margin = ([mw, mh], p) => lerp2([mw, mh], [1 - mw, 1 - mh], p)

  const createGrid = (count) => 
    range(0, count)
      .flatMap(x => 
        range(0, count)
          .map(y => [x, y])
          .map(p => toUv(p, [count, count]))
      )

  return ({ context: c, width, height }) => {
    // random.setSeed('abc')
    const palette = random.pick(palettes).slice(0, 3)
    const MARGIN = [0.1, 0.1]
    const dims = [width, height]
    c.fillStyle = 'white';
    c.fillRect(0, 0, width, height);
    
    createGrid(50)
      .map(p => ({
        position: p,
        radius: normalise(random.noise2D(p[0], p[1])) * 0.05,
        color: random.pick(palette),
        rotation: normalise(random.noise2D(p[0], p[1])) * Math.PI 
      }))
      .filter(() => random.value() > 0.5)
      .forEach(data => {
        const { position: p, radius: r, color, rotation } = data
        const [x, y] = mult(margin(MARGIN, p), dims)
        c.fillStyle = color

        c.save()

        c.font = `${r * width}px Helvetica`
        c.translate(x, y)
        c.rotate(rotation)
        c.fillText('()', 0, 0)

        c.restore()

        // c.beginPath()
        // c.arc(x, y, width * r, 0, Math.PI * 2, false)
        // c.fill()
      })
  };
};

canvasSketch(sketch, settings);
