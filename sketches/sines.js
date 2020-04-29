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
  const unlerp = (min, max, val) => (val - min) / (max - min)
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

  const createRow = (count) => 
    range(0, count)
      .flatMap(x => 
        range(0, 1)
          .map(y => [x, y])
          .map(p => toUv(p, [count, count]))
      )

    
  const palette = random.pick(palettes).slice(0, 3)
  return ({ context: c, width, height }) => {
    console.log(lerp)
    const MARGIN = [0.1, 0.1]
    const dims = [width, height]
    c.fillStyle = 'black';
    c.fillRect(0, 0, width, height);

    const freq = 4
    const amp = 100

    range(0, 48)
      .map(n => ratio(n, 48))
      .map((t, i) => {
        console.log(t * (height - 2 * MARGIN[1]))
        createRow(300)
          .forEach(p => {
            const [u, v] = p
            const [x, y] = mult(margin(MARGIN, p), dims)
            
            const freq = random.noise1D(t, 3) * Math.cos(t * Math.PI * 2) * lerp(4, 15, t)
            c.strokeStyle = `hsl(${lerp(0, 360, t * u * normalise(random.noise1D(t, freq)))}, 50%, ${(1 - normalise(random.noise1D(t, freq))) * 100}%)`
            
            c.save()
            c.translate(x, y + (t - MARGIN[1]) * height + amp * Math.sin(freq * u * Math.PI * 2))
            c.beginPath()
            // c.arc(0, 0, normalise(random.noise1D(t, 3)) * 3, 0, Math.PI * 2)
            c.moveTo(0, 0)
            c.lineWidth = normalise(random.noise1D(t, 3)) * 6 + 1
            c.lineTo(64 * normalise(random.noise1D(u, 3)) * Math.cos(freq * u * Math.PI * 2 - Math.PI / 2), 64 * normalise(random.noise1D(u, 3)) * Math.sin(freq * u * Math.PI * 2 - Math.PI / 2))
            c.stroke()
            // c.font = `${normalise(random.noise1D(t, 3)) * 24}px "Iosevka SS05"`
            // c.fillText('!', 0, 0)
            c.fill()

            c.restore()
          })
      })
  };
};

canvasSketch(sketch, settings);
