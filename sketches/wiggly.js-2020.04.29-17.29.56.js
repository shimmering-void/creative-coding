const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const palettes = require('nice-color-palettes')

const settings = {
  suffix: random.getSeed(), /// 909533
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

  const perimeter = (r, t) => [r * Math.cos(t), r * Math.sin(t)]

  const layerNoise2D = (x, y) => normalise(random.noise2D(x, y)) * normalise(random.noise2D(2 * x, 2 * y)) * normalise(random.noise2D(4 * x, 4 * y))

  const createGrid = (count) => 
    range(0, count)
      .flatMap(x => 
        range(0, count)
          .map(y => [x, y])
          .map(p => toUv(p, [count, count]))
      )

    
  const palette = random.pick(palettes).slice(0, 3)

  return ({ context: c, width, height }) => {
    // random.setSeed('abc')
    const MARGIN = [0.1, 0.1]
    const dims = [width, height]
    c.fillStyle = 'black';
    c.fillRect(0, 0, width, height);

    const noiseFreq = 1
    
    createGrid(100)
      .filter(([x, y ]) => y < 0.75 && y > 0.25)
      .map(p => ({
        position: p,
        radius: layerNoise2D(noiseFreq * p[0], noiseFreq * p[1]) * 0.2,
        color: random.pick(palette),
        rotation: layerNoise2D(noiseFreq * p[0], noiseFreq * p[1]) * Math.PI 
      }))
      // .filter(() => random.value() > 0.5)
      .forEach(data => {
        const { position: p, radius: r, color, rotation } = data
        const [x, y] = mult(margin(MARGIN, p), dims)
        c.fillStyle = color

        c.save()

        c.font = `${r * width}px "Iosevka SS05"`
        c.translate(x, y)
        c.rotate(rotation)
        const [ox, oy] = perimeter(20 * rotation, rotation)
        c.fillText('π', ox, oy)

        c.restore()

        // c.beginPath()
        // c.arc(x, y, width * r, 0, Math.PI * 2, false)
        // c.fill()
      })
  };
};

canvasSketch(sketch, settings);
