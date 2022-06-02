
var cust_rand = new CustomRandom("googoogaga",  100);

//Make genes
var gridLength = 100;
var coorLength = 2;
var s_length = 6;
var grid;
var grid2;
var stepCount = 0;

//If true, iterate the grid based on the rules
var goTime = false;

//If true, train since last time u pressed space
var trainSinceLastTCapture = false
var trueImage = null

//Pattern Interpreter
var patternInterpreter = null


var cellColor = [
  {r: 20, g: 20, b: 20},
  {r: 255, g: 0, b: 0},
  {r: 0, g: 255, b: 0},
  {r: 0, g: 0, b: 255},
  {r: 0, g: 0, b: 0},
  {r: 240, g: 120, b: 10}
];

function newCell(coor){ //position in
  //return { v: 0, c: coor };
  //return 0;\

  

  let yy = cust_rand.random_pre();
  if(yy<0.25) return 1; 
  else if(yy<0.5) return 0;
  else if(yy<0.75) return 3;
  else return 2;
}

function setup(){
	createCanvas(windowWidth, windowHeight, WEBGL);

  //Grid
  grid = new Array(gridLength);
  for(let i = 0;i < grid.length;i++){
    grid[i] = new Array(gridLength);
    for(let j = 0;j < grid[i].length;j++){
      grid[i][j] = newCell([i, j]);
    }
  }

  //Grid 2
  grid2 = new Array(gridLength);
  for(let i = 0;i < grid2.length;i++){
    grid2[i] = new Array(gridLength);
    for(let j = 0;j < grid2[i].length;j++){
      grid2[i][j] = newCell([i, j]);
    }
  }

	ellipseMode(CENTER);
	rectMode(CORNER);
	//textAlign(LEFT, TOP);
	smooth();
  //stroke(230);
  noStroke()
	frameRate(60);
}

//Step the grid
function stepGrid(){
  stepCount++;

  
  let g = null;   //change grid
  let gR = null;  //read grid
  if(stepCount%2===0){ g = grid; gR = grid2;}
  else {g = grid2; gR = grid;}

  
  /*
  for(let i = 1;i < gR.length-1;i++){
    for(let j = 1;j < gR[i].length-1;j++){
      let ns = getNeighbours(gR, i, j);
      let c = gR[i][j];

      //Zero
      if(c === 0){
        if(ns === 3) g[i][j] = 1;
      }
      
      //One
      else if(c === 1){
        if(ns > 3){
          g[i][j] = 0;
          if(ns===4) g[i][j] = 2;
        }
        else if(ns < 2){
          g[i][j] = 0;
        }
      }

      //Two
      if(c === 2){
        if(ns > 5){
          g[i][j] = 3;
        }
        else if(ns < 2){
          g[i][j] = 0;
        }
      }

      //Three
      if(c === 3){
        if(ns > 8){
          g[i][j] = 1;
        }
        else if(ns === 3){//could be <8
          g[i][j] = 2;//Math.floor(cust_rand.random()*9)//5;
        }
      }


    }
  }
  */
  for(let i = patternInterpreter.observationRadius;i < gR.length-patternInterpreter.observationRadius;i++){
    for(let j = patternInterpreter.observationRadius;j < gR[i].length-patternInterpreter.observationRadius;j++){
      g[i][j] = patternInterpreter.getCell(i, j)
    }
  }


  //Copy
  for(let i = 1;i < gR.length-1;i++){
    for(let j = 1;j < gR[i].length-1;j++){
      gR[i][j] = g[i][j];
    }
  }
  if(stepCount%1===0){
    //console.log(stepCount, "ratio:");
  }
  
}

function getNeighbours(gr, i, j){
  let ns = 0;
  ns += gr[i][j-1];
  ns += gr[i+1][j-1];
  ns += gr[i+1][j];
  ns += gr[i+1][j+1];
  ns += gr[i][j+1];
  ns += gr[i-1][j+1];
  ns += gr[i-1][j];
  ns += gr[i-1][j-1];
  return ns;
}

//Draw
function draw(){

  background(88);

  //Iterate current grid
  if(goTime){
    for(let i=0;i<1;i++){
      stepGrid();
    }
  }
  else{
    for(let i=0;i<0;i++){
      stepGrid();
    }

  }

  //Iterate train of current grid
  if(trainSinceLastTCapture){

  }
  
  //Draw
  if(mouseIsPressed){
    //Get same grid that's being drawn rn
    let g = null;
    if(stepCount%2===1){g = grid;}
    else {g = grid2;}

    let x = Math.floor(mouseX/s_length);
    let y = Math.floor(mouseY/s_length);
    for(let u = 0;u < 10;u++){
      for(let ju = 0;ju < 10;ju++){
        g[x+u][y+ju] = 1;
      }
    }

  }

  drawGrid();
}
function drawGrid(){

  let g = null;   //change grid
  if(stepCount%2===1){g = grid;}
  else {g = grid2;}

  push();
  translate(-width/2, -height/2);
  for(let i = 0;i < g.length;i++){
    for(let j = 0;j < g[i].length;j++){
      let colourGot = cellColor[g[i][j]]
      
      fill(colourGot.r, colourGot.g, colourGot.b);

      //rectMode
      rect(i*s_length, j*s_length, s_length, s_length);
    }
  }
  pop();
}

function keyPressed(){
  //Run the current
  if(key === 'p'){
    goTime = !goTime;
  }

  //Switch to train mode
  else if(key === 't'){
    trainSinceLastTCapture = !trainSinceLastTCapture;
  }

  //Train from current pic, snap shot
  else if(key === ' '){
    let g = null;
    if(stepCount%2===1){g = grid;}
    else {g = grid2;}

    trueImage = new Array(gridLength);
    for(let i = 0;i < trueImage.length;i++){
      trueImage[i] = new Array(gridLength);
      for(let j = 0;j < trueImage[i].length;j++){
        trueImage[i][j] = g[i][j]
      }
    }

    
    patternInterpreter = new PatternInterpreter(trueImage, 3)
    patternInterpreter.analyzeOrTrain()

  }
}

function mousePressed(){
  // let ggg = null;

  // if(stepCount%2===1){ggg = grid;}
  // else {ggg = grid2;}
  // //Start
  // if(mouseX < s_length*gridLength && mouseY < s_length*gridLength){
  //     let x = Math.floor(mouseX/s_length);
  //     let y = Math.floor(mouseY/s_length);

  //     for(let u = 0;u < 10;u++) ggg[x+u][y] = 1;

  //   console.log(x, y);
  // }
}
