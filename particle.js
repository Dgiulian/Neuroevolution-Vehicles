class Particle {
  constructor(brain) {
    this.pos = createVector(start.x, start.y);
    this.vel = createVector();
    this.acc = createVector();
    this.sight = SIGHT;
    this.maxSpeed = 5;
    this.maxForce = 0.1;
    this.fitness = 0;
    this.rays = [];
    this.finished = false;
    this.dead = false;
    this.best = false;
    this.index = 0;
    this.counter = 0;

    for (let a = -45 ; a < 45; a += 5) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(
        this.rays.length + 2,
        this.rays.length + 2,
        1
      );
    }
  }

  show() {
    if (this.best) {
      fill(0, 255, 0);
    } else {
      fill(255, 100);
    }
    noStroke();

    push();
    rectMode(CENTER);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rect(0, 0, 10, 5);
    pop();
    
    if (DEBUG) {
      if (checkPoints[this.index]) checkPoints[this.index].show();
      for (let ray of this.rays) ray.show();
    }
  }
  move(x, y) {
    this.pos.set(x, y);
  }
  applyForce(force) {
    this.acc.add(force);
  }
  update() {
    if (this.dead) return;
    if (this.finished) return;

    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.acc.set(0, 0);
    this.counter++;
    if (this.counter > LIFESPAN) {
      this.dead = true;
      console.log('Dead by snu snu');
    }
    for (let ray of this.rays) ray.rotate(this.vel.heading());
  }
  look(walls) {
    const inputs = [];
    for (let i = 0; i < this.rays.length; i++) {
      let ray = this.rays[i];
      let record = this.sight; // Infinity;
      let closest = null;
      for (let wall of walls) {
        let pt = ray.cast(wall);
        if (pt) {
          let d = p5.Vector.dist(this.pos, pt);
          if (d < record && d < this.sight) {
            record = d;
            closest = pt;
          }
        }
      }
      if (record < this.maxSpeed) {
        this.dead = true;
      }
      inputs[i] = map(record, 0, 50, 1, 0);

      if (DEBUG && closest) {
        stroke(255, 100);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
        noStroke();
        stroke(255, 0, 0, 100);
        fill(255, 0, 0, 100);
        ellipse(closest.x, closest.y, 3);
      }
    }
    const vel = this.vel.copy();
    vel.normalize();
    inputs.push(vel.x);
    inputs.push(vel.y);

    const output = this.brain.predict(inputs);
    const angle = map(output[0], 0, 1, 0, TWO_PI);
    const steering = p5.Vector.fromAngle(angle);
    steering.setMag(this.maxSpeed);
    steering.sub(this.vel);
    steering.limit(this.maxForce);
    this.applyForce(steering);
  }

  check(target) {
    //let d = p5.Vector.dist(this.pos, target);
    let d = pldistance(target.a, target.b, this.pos);
    if (d < 5) {
      this.index++;
      this.counter = 0;
    }
  }
  checkFinished(size) {
    if (this.index === size) {
      this.finished = true;
    }
  }
  calculateFitness(target) {
    if (!this.finished) {
      this.fitness = pow(this.index, 2);
    }
    /* if (this.finished) {
      this.fitness = 1;
    } else {
      const d = p5.Vector.dist(this.pos, target);
      this.fitness = constrain(1 / d, 0, 1);
    } */
  }
  mutate() {
    this.brain.mutate(MUTATION_RATE);
  }
  dispose() {
    this.brain.dispose();
  }
  bounds() {
    const { x, y } = this.pos;
    if (x <= 0 || x >= width || y <= 0 || y >= height) {
      this.dead = true;
    }
  }
}

function pldistance(p1, p2, { x, y }) {
  const num = abs(
    (p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x
  );
  const den = p5.Vector.dist(p1, p2);
  return num / den;
}

function getNormapPoint(p, a, b) {
  // Vector from a to p
  let ap = p5.Vector.sub(p, a);

  // Vector from a to b
  let ab = p5.Vector.sub(b, a);
  ab.normalize();
  ab.mult(ap.dot(ab));
  let normalPoint = p5.Vector.add(a, ab);
  return normalPoint;
}
