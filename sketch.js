const TOTAL = 200;
const MUTATION_RATE = 0.05;
const LIFESPAN = 50;
const SIGHT = 50;
const TOTAL_POINTS = 30;
const DEBUG = { boundary: false, ray: false, best: true, next: true, maxCheckpoint: false, generation: true } ;
let startP = null;
let start, end;
var population = [];
var savedParticles = [];
let generationCount = 0;
let speedSlider;
let biggestIndex = 0;

let walls = [];
let checkPoints = [];

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  tf.setBackend('cpu');

  speedSlider = createSlider(1, 50, 1);
  createTrack();

  start = checkPoints[0].midpoint();
  for (let i = 0; i < TOTAL; i++) {
    let p = new Particle();
    population.push(p);
  }
}
function createTrack() {
  let noiseMax = 4;
  
  const pathwidth  = 40;
  const inside = [];
  const outside = [];
  const startX = random(1000);
  const startY = random(1000);
  checkPoints = [];
  walls =  [];
  for (let i = 0; i < TOTAL_POINTS; i++) {
    const a = map(i, 0, TOTAL_POINTS, 0, TWO_PI);
    let xoff = map(cos(a), -1, 1, 0, noiseMax) + startX;
    let yoff = map(sin(a), -1, 1, 0, noiseMax) + startY;
    let r = map(noise(xoff, yoff), 0, 1, 80, height / 2 );

    let x1 = width / 2 + (r + pathwidth) * cos(a);
    let y1 = height / 2 + (r + pathwidth) * sin(a);
    let x2 = width / 2 + (r - pathwidth) * cos(a);
    let y2 = height / 2 + (r - pathwidth) * sin(a);
    inside.push(createVector(x1, y1));
    outside.push(createVector(x2, y2));
    checkPoints.push(new Boundary(x1, y1, x2, y2));
    
  }
  start = checkPoints[0].midpoint();
  connectBoundaries(inside);
  connectBoundaries(outside);
  //checkPoints.pop();
  const lastInside = inside[inside.length - 1];
  const lastOutside = outside[inside.length - 1];
/*   walls.push(
    new Boundary(lastInside.x, lastInside.y, lastOutside.x, lastOutside.y)
  ); */
}
function connectBoundaries(array) {
  for (let i = 0; i < array.length; i++) {
    let a = array[i];
    let b = array[(i + 1) % array.length];
    walls.push(new Boundary(a.x, a.y, b.x, b.y));
  }
}

function draw() {
  background(0);
  const cycles = speedSlider.value();
  for (let n = 0; n < cycles; n++) {
    for (let p of population) {
      p.look(walls);
      p.check(checkPoints[p.index]);
      p.checkFinished(checkPoints.length - 1);
      p.bounds();
      p.update();
    }

    for (let i = population.length - 1; i >= 0; i--) {
      const particle = population[i];

      if (particle.dead || particle.finished) {
        let [p] = population.splice(i, 1);
        savedParticles.push(p);
      }
    }
    if (population.length === 0) {
      createTrack()
      
      nextGeneration();
      generationCount++;
    }
  }
  
  noStroke();
  fill(255, 0, 0);
  ellipse(start.x, start.y, 8);

  for (let wall of walls) wall.show();
//  for (let wall of checkPoints) wall.show();
  let bestFitness = 0;
  let bestP = null;
  for (let p of population) {
    p.best = false;
    //p.calculateFitness();
    if (p.fitness > bestFitness) {
      bestP = p;
      bestFitness = p.fitness;
    }
    biggestIndex = max(biggestIndex, p.index);
    p.show();
  }
  if ( bestP) {
    bestP.best = DEBUG.best;
    const next = checkPoints[bestP.index].midpoint();

    if(DEBUG.next) ellipse(next.x, next.y, 8);
    bestP.show();
  }
  fill(255);
  if(DEBUG.generation) text(`Generation: ${generationCount}`, 20, height - 50);
  if(DEBUG.maxCheckpoint) text(`Bigest checkpoint ${biggestIndex}`, 20, height - 30);

}
