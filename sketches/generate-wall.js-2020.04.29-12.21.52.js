const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const palettes = require('nice-color-palettes')

const settings = {
  suffix: random.getSeed(),
  dimensions: [ 2048, 2048 ]
};

const seed = random.getRandomSeed()
random.setSeed('82317')
console.log(`seed: ${random.getSeed()}`)

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
  const eq = ([a, b], [c, d]) => a === c && b === d

  const createGrid = (count) => 
    range(0, count)
      .flatMap(x => 
        range(0, count)
          .map(y => [x, y])
          .map(p => toUv(p, [count, count]))
      )

  return ({ context: c, width, height }) => {
    // random.setSeed('abc')
    const palette = random.pick(palettes)
    const MARGIN = [0.1, 0.1]
    const dims = [width, height]
    c.fillStyle = 'white';
    c.fillRect(0, 0, width, height);
    
    const grid = random.shuffle(createGrid(6))
      // sequential pairs
      .map((v, i, arr) => i < arr.length - 1 ? [v, arr[i + 1]] : false)
      // remove unpaired elements
      .filter(x => x)
      // remove overlapping pairs
      .filter((_, i) => i % 2 === 0)
      // layer by average y
      .sort(([[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]) => (y1 + y2) / 2 - (y3 - y4) / 2)
      .forEach(([p1, p2]) => {
        const [q1, q2] = [mult(margin(MARGIN, p1), dims), mult(margin(MARGIN, p2), dims)]
        const [x1, y1] = q1
        const [x2, y2] = q2

        c.save()
        c.beginPath()
        c.moveTo(x1, height)
        c.lineTo(x1, y1)
        c.lineTo(x2, y2)
        c.lineTo(x2, height)
        c.closePath()
        c.fillStyle = random.pick(palette)
        c.strokeStyle = 'white'
        c.lineWidth = 30
        c.fill()
        c.stroke()
        c.restore()
      })
  };
};

canvasSketch(sketch, settings);
