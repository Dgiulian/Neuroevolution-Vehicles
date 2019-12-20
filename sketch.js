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



let track;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  tf.setBackend('cpu');

  speedSlider = createSlider(1, 50, 1);
  createTrack();

  start = track.getStart();
  for (let i = 0; i < TOTAL; i++) {
    let p = new Particle();
    population.push(p);
  }
}
function createTrack() {
  track = new Track();
}


function draw() {
  background(0);
  const cycles = speedSlider.value();
  for (let n = 0; n < cycles; n++) {
    for (let p of population) {
      p.look(track.walls);
      p.check(track.getNext(p.index));
      p.checkFinished(track.getSize());
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

  track.show();

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
    const next = track.getNext(bestP.index).midpoint();

    if(DEBUG.next) ellipse(next.x, next.y, 8);
    bestP.show();
  }
  fill(255);
  if(DEBUG.generation) text(`Generation: ${generationCount}`, 20, height - 50);
  if(DEBUG.maxCheckpoint) text(`Bigest checkpoint ${biggestIndex}`, 20, height - 30);

}
