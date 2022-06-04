









////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////Test code
////////////////////////////////////////////////////////////////////////////////////////////////////////
var WFC_TEMPLATE_1 = null;//WFC_getKernels();
var templatePossibilities = [
  {key: "0", r: 0, g: 0, b: 0},
  {key: "1", r: 255, g: 255, b: 255},
  {key: "2", r: 244, g: 11, b: 254},
  {key: "3", r: 136, g: 0, b: 21},
  {key: "4", r: 255, g: 2, b: 2},
  {key: "5", r: 255, g: 127, b: 9},
  {key: "6", r: 255, g: 242, b: 0},
  {key: "7", r: 34, g: 177, b: 76},
  {key: "8", r: 0, g: 162, b: 232},
  {key: "9", r: 152, g: 134, b: 3}
]

//Template variables
var template_grid_size = 2
var template_kernel_size = 1
var template_ui_paintBrush = 1
var template_current_grid = [[0,0],[0,0]]

var WFC_TEMPLATE_2 = null;//WFC_initGenerator();


//Output generation variables
var output_seed = "googoogaga1"
var output_cr = new CustomRandom(""+output_seed,  1);
var output_grid_size = 2



//Get the ball rolliung - simulate click
propogateNewTemplateObjectWRandomSeed()





////////////////////////////////////////////////////////////////////////////////////////////////////////
//Actual WFC
////////////////////////////////////////////////////////////////////////////////////////////////////////

//Chain of functions that pass off the object to one another 
function WFC_getKernels(the_grid, kernel_range){//2d array of integers, array of integers of desired kernel sizes 

  let T1 = {
    grid: the_grid,
    kernels: kernel_range, //List of: {n: 1-x, ks: [{}]}
    possible_values: []
  };

  let newKernelFrom = function(g, kr, xx, yy){
    let nuKernel = new Array(kr);
    for(let v = 0;v < kr;v++){
      nuKernel[v] = new Array(kr);
    }
    for(let ii = 0;ii < kr;ii++){
      for(let jj = 0;jj < kr;jj++){
        nuKernel[ii][jj] = g[xx + ii][yy + jj]
      }
    }
    return nuKernel;
  };

  let kernelValueExtraction = function(kernel, listOfValues){
    for(let i = 0;i < kernel.length;i++){
      for(let j = 0;j < kernel[i].length;j++){
        if(listOfValues.indexOf(kernel[i][j]) < 0) listOfValues.push(kernel[i][j])
      }
    }
  };

  for(let b = 0;b < T1.kernels.length;b++){
    let accumulatedKernelsSoFar = []
    let kRange = 0 + T1.kernels[b]
    for(let i = 0;i < the_grid.length;i++){
      for(let j = 0;j < the_grid[i].length;j++){
        
        if(i < the_grid.length - (kRange-1)){
          if(j < the_grid[i].length - (kRange-1)){
            
            let nuKurnel = newKernelFrom(the_grid, kRange, i, j)
            accumulatedKernelsSoFar.push(
              nuKurnel
            )

            kernelValueExtraction(nuKurnel, T1.possible_values)
            
          } 
        }

      }
    }

    T1.kernels[b] = {n: kRange, ks: accumulatedKernelsSoFar}
  }

  return T1
}



function WFC_initGenerator(WFC_1, output_grid_size, randoSeed){

  let T2 = {
    t1: WFC_1,
    cr: new CustomRandom(""+randoSeed, 1),
    output_grid_size: output_grid_size,
    output_possibility_grid: [],  //the current state of the possibilities grid
    cells_of_interest: [], //the next cells to collapse
    elapsed_steps: 0
  };

  T2.output_possibility_grid = new Array(T2.output_grid_size)
  for(let i = 0;i < T2.output_possibility_grid.length;i++){//Creates null array w the dimensions of the outut_grid_size
    T2.output_possibility_grid[i] = new Array(T2.output_grid_size)
  }


  for(let i = 0;i < T2.output_possibility_grid.length;i++){
    for(let j = 0;j < T2.output_possibility_grid[i].length;j++){

      let cellOutputPossibilty = {}
      //Possible options left for this grid cell
      cellOutputPossibilty.possibleValsLeft = new Array(T2.t1.possible_values.length)
      for(let k = 0;k < cellOutputPossibilty.possibleValsLeft.length;k++){
        cellOutputPossibilty.possibleValsLeft[k] = T2.t1.possible_values[k];
      }

      //Adding in the kernels punch card
      cellOutputPossibilty.kernelsLeft = new Array(T2.t1.kernels.length)
      for(let k = 0;k < T2.t1.kernels.length;k++){

        let lengthArray = new Array(T2.t1.kernels[k].ks.length)
        for(let b = 0;b < lengthArray.length;b++) lengthArray[b] = b;

        cellOutputPossibilty.kernelsLeft[k] = lengthArray;
      }
      
      T2.output_possibility_grid[i][j] = cellOutputPossibilty;//{possibleValsLeft: [1,9,18], kernelsLeft:[[1,4,7], [0,1,2]]}

    }
  }
  
  


  return T2;
}

function WFC_addCellsOfInterestAroundThisCell(WFC_2, x, y){
  if(x > 0) WFC_2.cells_of_interest.push({x: x-1, y: y})
  if(x < WFC_2.output_possibility_grid.length-1) WFC_2.cells_of_interest.push({x: x+1, y: y})

  if(y > 0) WFC_2.cells_of_interest.push({x: x, y: y-1})
  if(y < WFC_2.output_possibility_grid[0].length-1) WFC_2.cells_of_interest.push({x: x, y: y+1})
}

function WFC_manualCollapse(WFC_2, x, y, value){
  WFC_2.output_possibility_grid[x][y].possibleValsLeft = [value]
  WFC_2.output_possibility_grid[x][y].kernelsLeft = []
  //Add the cells of interest around this wfc
  WFC_addCellsOfInterestAroundThisCell(WFC_2, x, y);
}


function WFC_kernelAtAllValidHere(WFC_2, x, y, kernel){
  console.log("kernel checkinL")
  console.log(kernel)

  let kernelCombinations = kernel.length * kernel[0].length

  let possibilitiesFromThisKernelSoFar = []

  //Check every angle of every kernel
  for(let b = 0;b < kernelCombinations;b++){

    //Modify position of the kernel
    let offX = b % kernel.length;               //start kernel this far from the left
    let offY = Math.floor(b / kernel[0].length) //start kernel this far from the top
    let farLeftX = x-offX //must be at least 0
    let farRightX = x-offX+kernel.length-1//must be smaller than width length
    let farTopY = y-offY //must be at least 0
    let farDownY = y-offY+kernel[0].length-1//must be smaller than width length

    //Make sure this variation of the kernel is in bounds
    if(farLeftX > -1 && 
      farRightX < WFC_2.output_possibility_grid.length && 
      farTopY > -1 && 
      farDownY < WFC_2.output_possibility_grid[farLeftX].length){

      //Kernel template matches the possibilities for each number around it
      let thisVariantIsPossible = true;
      let theValueDerivedFromThisKernelVariant = null
      for(let i = 0;i < kernel.length;i++){
        for(let j = 0;j < kernel[i].length;j++){

          if(WFC_2.output_possibility_grid[farLeftX+i][farTopY+j].possibleValsLeft.indexOf(kernel[i][j]) < 0){
            thisVariantIsPossible = false;  
          }
          else if(farLeftX+i === x && farTopY+j === y){
            theValueDerivedFromThisKernelVariant = kernel[i][j]
          }
        }
      }

      if(thisVariantIsPossible){//then also the value derived mustve been set so that's the value this kernel proves
        if(possibilitiesFromThisKernelSoFar.indexOf(theValueDerivedFromThisKernelVariant) < 0){
          possibilitiesFromThisKernelSoFar.push(theValueDerivedFromThisKernelVariant)
        }
      }
      //else{}//Just move on to the next position of this kernel
      
    }
  }

  return possibilitiesFromThisKernelSoFar;
}


function WFC_refreshPossibilitiesBasedOnKernels(WFC_2, x, y){

  let posValsPunchCard = new Array(WFC_2.t1.possible_values.length)
  for(let i = 0;i < posValsPunchCard.length;i++){
    posValsPunchCard[i] = 0
  }

  let examiningGrid = WFC_2.output_possibility_grid[x][y]

  let kernels = WFC_2.t1.kernels
  for(let i = 0;i < kernels.length;i++){
    //let kVal = kernels[i].n
    for(let j = 0;j < kernels[i].ks.length;j++){

      let possibleValuesMadePossibleByKernel = 
        WFC_kernelAtAllValidHere(WFC_2, x, y, kernels[i].ks[j])

      //The possible values this kernel enables
      for(let u = 0;u < possibleValuesMadePossibleByKernel.length;u++){
        posValsPunchCard[possibleValuesMadePossibleByKernel[u]] = 1//punch the hole
      }

    }
  }

  examiningGrid.possibleValsLeft = []
  for(let i = 0;i < posValsPunchCard.length;i++){
    if(posValsPunchCard[i] > 0){
      examiningGrid.possibleValsLeft.push(i)
    }
  }
}

function WFC_crossCheckRemainingKernels(WFC_2, x, y){

  let gridCellObject = WFC_2.output_possibility_grid[x][y]
  if(gridCellObject.possibleValsLeft.length < 2) return null;

  let possibilitiesBeforeChange = 0 + gridCellObject.possibleValsLeft.length

  //Changes the possibilities of this grid cell based on most recent possible values around
  WFC_refreshPossibilitiesBasedOnKernels(WFC_2, x, y)
      
  if(possibilitiesBeforeChange !== gridCellObject.possibleValsLeft.length){
    //Add next cells of interest
    WFC_addCellsOfInterestAroundThisCell(WFC_2, x, y);
  }
}

function WFC_collapseNextCells(WFC_2){

  let starting_cells = WFC_2.cells_of_interest.length;// = null

  while(starting_cells > 0){
    let xell = WFC_2.cells_of_interest.shift()
    WFC_crossCheckRemainingKernels(WFC_2, xell.x, xell.y)
    starting_cells--
  }

  WFC_2.elapsed_steps += 1;
  
  return WFC_2.cells_of_interest.length
}







////////////////////////////////////////////////////////////////////////////////////////////////////////
//Add P5JS
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////P5 JS bullshi
////////////////////////////////////////////////////////////////////////////////////////////////////////


//Create the template canvas
var sketch_template = function(p) {

  p.setup = function() {
    p.createCanvas(300, 300);
    p.rectMode(p.CENTER)
    p.frameRate(30)
    p.smooth()
  };

  p.draw = function() {
    p.background(34, 0, 0);
    if(template_current_grid){
      //console.log(p.mouseX)
      let gridPixels = p.width / template_current_grid.length

      //Paint brush when mouse down
      if(p.mouseIsPressed){
        let firstInd = Math.floor(p.mouseX / gridPixels)
        let secondInd = Math.floor(p.mouseY / gridPixels)
        if(template_current_grid[firstInd]){
          if(secondInd < template_current_grid[firstInd].length){
            template_current_grid[firstInd][secondInd] = template_ui_paintBrush
          }
        }
      
        
      }

      //Draw the grid
      for(let i = 0;i < template_current_grid.length;i++){
        for(let j = 0;j < template_current_grid[i].length;j++){
          let cellType = templatePossibilities[template_current_grid[i][j]]
          p.noStroke()
          p.fill(cellType.r, cellType.g, cellType.b)
          p.rect(i*gridPixels + gridPixels/2, j*gridPixels + gridPixels/2, gridPixels, gridPixels)

        }  
      }

    }
  };

  p.keyPressed = function(){
    for(let i = 0;i < templatePossibilities.length;i++){
      if(templatePossibilities[i].key === ""+p.key){
        template_ui_paintBrush = i
        break;
      }
    }

  };
};

var node_template = document.createElement("div");
var TEMPLATE_P5 = new p5(sketch_template, node_template);
document.getElementById("templateCanvasLocation").appendChild(node_template);



//Create the example canvas
var sketch_example = function(p) {

  p.setup = function() {
    p.createCanvas(500, 500);
    p.rectMode(p.CENTER)
    p.frameRate(30)
    p.smooth()
  };

  p.draw = function() {
    p.background(70, 77, 77);
    
    
    //Draw the grid
    p.noStroke()

    //TODO only if T2s possibility grid is developed
    if(WFC_TEMPLATE_2){


      let gridPixels = p.width / WFC_TEMPLATE_2.output_possibility_grid.length
      let possibilitySquaresPixels = gridPixels / 4


      
      //Paint brush when mouse down
      if(p.mouseIsPressed){
        
        

        
      }


      if(WFC_TEMPLATE_2.output_possibility_grid){

        for(let i = 0;i < WFC_TEMPLATE_2.output_possibility_grid.length;i++){
          for(let j = 0;j < WFC_TEMPLATE_2.output_possibility_grid[i].length;j++){

            let gridOutputPossibility = WFC_TEMPLATE_2.output_possibility_grid[i][j]
            
            //Draw one large big square
            if(gridOutputPossibility.possibleValsLeft.length < 2){
              let cellType = templatePossibilities[gridOutputPossibility.possibleValsLeft[0]];
              p.noStroke();
              p.fill(cellType.r, cellType.g, cellType.b)
              p.rect(i*gridPixels + gridPixels/2, j*gridPixels + gridPixels/2, gridPixels, gridPixels)
            }
            //Draw a bunch of possibilities
            else{
              for(let k = 0;k < gridOutputPossibility.possibleValsLeft.length;k++){
                let cellType = templatePossibilities[gridOutputPossibility.possibleValsLeft[k]];
                p.noStroke();
                p.fill(cellType.r, cellType.g, cellType.b)
                p.rect(
                  i*gridPixels + possibilitySquaresPixels/2 + (k%4)*possibilitySquaresPixels, 
                  j*gridPixels + possibilitySquaresPixels/2 + Math.floor(k/4)*possibilitySquaresPixels, 
                  possibilitySquaresPixels, possibilitySquaresPixels
                )
                
              }
              p.noFill()
              p.stroke(255)
              p.strokeWeight(1)
              p.rect(i*gridPixels + gridPixels/2, j*gridPixels + gridPixels/2, gridPixels, gridPixels)
            }
            
            
              
            
            
          }  
        }
      }

    }

    
  };

  p.mouseClicked = function(){
    if(WFC_TEMPLATE_2){

      let gridPixels = p.width / WFC_TEMPLATE_2.output_possibility_grid.length
      let firstInd = Math.floor(p.mouseX / gridPixels)
      let secondInd = Math.floor(p.mouseY / gridPixels)

      if(WFC_TEMPLATE_2.output_possibility_grid[firstInd]){
        if(secondInd < WFC_TEMPLATE_2.output_possibility_grid[firstInd].length){
          WFC_manualCollapse(WFC_TEMPLATE_2, firstInd, secondInd, template_ui_paintBrush)
        }
      }
      
    }
    
  };


};

var node_example = document.createElement("div");
var EXAMPLE_P5 = new p5(sketch_example, node_example);
document.getElementById("outputCanvasLocation").appendChild(node_example);