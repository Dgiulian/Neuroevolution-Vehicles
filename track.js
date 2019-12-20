class Track {
  constructor() {
    this.checkpoints = [];
    this.walls = [];
    let noiseMax = 6;

    const pathwidth = 30;
    const inside = [];
    const outside = [];
    const startX = random(1000);
    const startY = random(1000);
    this.checkPoints = [];
    this.walls = [];
    for (let i = 0; i < TOTAL_POINTS; i++) {
      const a = map(i, 0, TOTAL_POINTS, 0, TWO_PI);
      let xoff = map(cos(a), -1, 1, 0, noiseMax) + startX;
      let yoff = map(sin(a), -1, 1, 0, noiseMax) + startY;
      let r = map(noise(xoff, yoff), 0, 1, 80, height / 2);

      let x1 = width / 2 + (r + pathwidth) * cos(a);
      let y1 = height / 2 + (r + pathwidth) * sin(a);
      let x2 = width / 2 + (r - pathwidth) * cos(a);
      let y2 = height / 2 + (r - pathwidth) * sin(a);
      inside.push(createVector(x1, y1));
      outside.push(createVector(x2, y2));
      this.checkPoints.push(new Boundary(x1, y1, x2, y2));
    }
    start = this.getStart();
    this.connectBoundaries(inside);
    this.connectBoundaries(outside);
    //checkPoints.pop();
    const lastInside = inside[inside.length - 1];
    const lastOutside = outside[inside.length - 1];
    /*   walls.push(
    new Boundary(lastInside.x, lastInside.y, lastOutside.x, lastOutside.y)
  ); */
  }

  show() {
    for (let wall of track.walls) wall.show();
    //  for (let wall of track.checkPoints) wall.show();
  }

  connectBoundaries(array) {
    for (let i = 0; i < array.length; i++) {
      let a = array[i];
      let b = array[(i + 1) % array.length];
      this.walls.push(new Boundary(a.x, a.y, b.x, b.y));
    }
  }
  getStart() {
    return this.checkPoints[0].midpoint();
  }
  getNext(index) {
    return this.checkPoints[index];
  }

  getSize() {
    return this.checkPoints.length - 1;
  }
}
