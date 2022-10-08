////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////Test code
////////////////////////////////////////////////////////////////////////////////////////////////////////
var WFC_TEMPLATE_1 = null;//WFC_getKernels();
var templatePossibilities = [
  {key: "0", r: 0, g: 0, b: 0},
  {key: "1", r: 255, g: 255, b: 255},
  {key: "2", r: 60, g: 60, b: 255},
  {key: "3", r: 163, g: 73, b: 164},
  {key: "4", r: 255, g: 2, b: 2},
  {key: "5", r: 255, g: 127, b: 9},
  {key: "6", r: 255, g: 242, b: 0},
  {key: "7", r: 34, g: 177, b: 76},
  {key: "8", r: 0, g: 162, b: 232},
  {key: "9", r: 129, g: 60, b: 18}
]

//Template variables
var template_grid_size = 8
var template_kernel_size = 3
var template_ui_paintBrush = 0
var template_current_grid = [
  [0,0,0,0,0,0,0,0],
  [0,2,2,0,2,2,0,0],
  [0,2,2,0,2,2,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,2,2,0],
  [0,2,2,0,0,2,2,0],
  [0,2,2,0,0,0,0,0],
  [0,0,0,0,0,0,0,0]
]

var WFC_TEMPLATE_2 = null;//WFC_initGenerator();


//Output generation variables
var output_grid_size = 28
var output_ui_kernel_x = 0
var output_ui_kernel_y = 0
var output_ui_kernels_test_positive = 0
var output_ui_atleast_one_kernel_good = false



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
        nuKernel[ii][jj] = g[(xx + ii)%g.length][(yy + jj)%g[(xx + ii)%g.length].length]
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
        
        //if(i < the_grid.length - (kRange-1)){
        //  if(j < the_grid[i].length - (kRange-1)){
            
        let nuKurnel = newKernelFrom(the_grid, kRange, i, j)
        accumulatedKernelsSoFar.push(
          nuKurnel
        )

        kernelValueExtraction(nuKurnel, T1.possible_values)
            
        //  } 
        //}

      }
    }

    T1.kernels[b] = {n: kRange, ks: accumulatedKernelsSoFar}
  }

  return T1
}



function WFC_initGenerator(WFC_1, output_grid_size, randoSeed){

  let T2 = {
    t1: WFC_1,
    cr: new PseudRand(343+Math.floor(Math.random()*80834218)),
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

      //Adding in the kernels punch card - list of 
      //kernel sizes and each index inside the list that correlates w all the kernels
      cellOutputPossibilty.topLeftOfKernelsLeft = new Array(T2.t1.kernels.length)
      for(let ii = 0;ii < cellOutputPossibilty.topLeftOfKernelsLeft.length;ii++){
        let localIndicesOfKernels = new Array(T2.t1.kernels[ii].ks.length)
        for(let jj = 0;jj < localIndicesOfKernels.length;jj++){
          localIndicesOfKernels[jj] = jj
        }
        cellOutputPossibilty.topLeftOfKernelsLeft[ii] = localIndicesOfKernels
      }
      
      //Adding the possibility  DISTRIBUTION for these vals

      T2.output_possibility_grid[i][j] = cellOutputPossibilty;//{possibleValsLeft: [1,9,18], plugsLeft:[]}

      // if(i === 8 && j === 8){
      //   console.log(JSON.stringify(T2.output_possibility_grid[i][j]))
      // }
    }
  }


  return T2;
}








//Utilities
//____________________________________



function WFC_manualCollapse(WFC_2, x, y, value){
  
  WFC_2.output_possibility_grid[x][y].possibleValsLeft = [value];
  
  //WFC_castTheBigSweepingNet(WFC_2, x, y);//maybe go back to this one later ffs

  let kd = 0
  let dimOfSquareToCheck = (2 * WFC_2.t1.kernels[kd].n) - 1
  //x^2 comparisons of the kernel windows that fit around this pixel
  for(let xi = 0;xi < dimOfSquareToCheck;xi++){
    for(let yi = 0;yi < dimOfSquareToCheck;yi++){
      let farLeftX = x+xi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
      farLeftX = (farLeftX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
      let farTopY = y+yi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
      farTopY = (farTopY + WFC_2.output_possibility_grid[farLeftX].length) % WFC_2.output_possibility_grid[farLeftX].length
      //If kernel is in bounds
      if(xi + Math.floor(dimOfSquareToCheck/2) < dimOfSquareToCheck){
        if(yi + Math.floor(dimOfSquareToCheck/2) < dimOfSquareToCheck){
          let yesOrNo_needToUpdatePossibleVals = WFC_applyKernelShaveFromPossibleVals(WFC_2, farLeftX, farTopY, kd)
          
        }
      }

    }
  }//end of (2n-1)^2 kernel update

  //WFC_applyKernelShaveFromPossibleVals

  let yesOrNo_needToUpdatePossibleVals = WFC_applyKernelShaveFromPossibleVals(WFC_2, x, y, 0)
  if(yesOrNo_needToUpdatePossibleVals){
    WFC_updatePossibleValsFromKernelPossibilities(WFC_2, x, y)
  }
}

function WFC_getPossibleValuesOfCellFromSurroundingPossibleKernels(){
  //And depending on the possibleVals that cell turns out to be - 
  //Do big net around location, update the kernels - if change to possible value
  
}










//The New funcs
//_________________________________________



//function WFC_randomlyG//called (2n-1)^2 times (25 for an n=3 kernel)
//used for after the vals have been changed
function WFC_applyKernelShaveFromPossibleVals(W2, x, y, krnlIndex){

  let cell = W2.output_possibility_grid[x][y];

  for(let i = cell.topLeftOfKernelsLeft[krnlIndex].length-1;i > -1;i--){
    let kernToCheck = 
      W2.t1.kernels[krnlIndex].ks[
        cell.topLeftOfKernelsLeft[krnlIndex][i]
      ]

    let validKernStartingFromTopLeft = true
    for(let xxa = 0;xxa < kernToCheck.length;xxa++){
      let xxSpotInGrid = (x + xxa + W2.output_possibility_grid.length) % W2.output_possibility_grid.length
      for(let yya = 0;yya < kernToCheck[xxa].length;yya++){
        let yySpotInGrid = (y + yya + W2.output_possibility_grid[xxSpotInGrid].length) % W2.output_possibility_grid[xxSpotInGrid].length
        // looking at cell (1 of n*n), checking if
        let lCell = W2.output_possibility_grid[xxSpotInGrid][yySpotInGrid]
        if(lCell.possibleValsLeft.indexOf(kernToCheck[xxa][yya]) < 0){
          validKernStartingFromTopLeft = false
        }
      }
    }
    
    if(!validKernStartingFromTopLeft){
      cell.topLeftOfKernelsLeft[krnlIndex].splice(i, 1)
    }
  }

}

// So after a change to the kernel possibilities, update a particular cell's possible values
// EXLCUDING offLimitCells [{x:23,y:12}, {x:24,y:12} ... ] (the cells that were just changed)
function WFC_updatePossibleValsFromKernelPossibilities(WFC_2, x, y, offLimitCells, krnlIndex){

  let kernelSize = WFC_2.t1.kernels[krnlIndex].n
  let kernelCell = WFC_2.output_possibility_grid[x][y]

  // Loop through the possible values from this kernel , 
  // EXCLUDING the off limit, cells that just collapsed (kernelSize*kernelSize)
  for(let xi = 0;xi < kernelSize;xi++){
    for(let yi = 0;yi < kernelSize;yi++){
      let possValX = (x+xi + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
      let possValY = (y+yi + WFC_2.output_possibility_grid[possValX].length) % WFC_2.output_possibility_grid[possValX].length

      // Check if safety cell
      // If this cell is not a safety cell:
      // then collapse those values, TODO <- do we keep adding to the safety cells?
      let isThisASafetyCell = true;
      for(let h = 0;h < offLimitCells.length;h++){
        if(possValX === offLimitCells[h].x && possValY === offLimitCells[h].y){
          isThisASafetyCell = false;
        }
      }
      if(isThisASafetyCell){

        // Cell containing the possible values to update
        let cell = WFC_2.output_possibility_grid[possValX][possValY]
        // We just gon rest it right here then aight haha... i guess we end the program here?
        // Leap of faith ?!
        cell.possibleValsLeft = []
        // Loop through kernels that are left
        for(let i = 0;i < kernelCell.topLeftOfKernelsLeft[krnlIndex].length;i++){
          let krn = WFC_2.t1.kernels[krnlIndex].ks[
            kernelCell.topLeftOfKernelsLeft[krnlIndex][i]
          ];
          let valueThatIsPossible = krn[xi][yi]
          let indOfThisAllowedVal = cell.possibleValsLeft.indexOf(valueThatIsPossible)
          if(indOfThisAllowedVal < 0){// TODO can build statistics here!
            cell.possibleValsLeft.push(valueThatIsPossible)
          }
        }

        // Need to handle this case.
        if(cell.possibleValsLeft.length < 1){
          console.log("ERR - all the possible vals gone idek")
          console.error("NO VALS LEFT OVER...." + possValX +  " "+ possValY)
        }

      }
      


    }
  }

  

  
}


function WFC_collapseKernelAt_AndChangePossibleValues_AndChangeToTheOneKernelPossibility(WFC_2, x, y, kernReferenceIndex, actualKern){
  let cell = WFC_2.output_possibility_grid[x][y]

  // Kernel sizes always 0 for this WFC version
  let kd = 0

  // List of cells that just got collapsed 
  let safeCells = []

  // Set the only kernel possibility (because that's what its bout to collapse into)
  cell.topLeftOfKernelsLeft[kd] = [kernReferenceIndex];

  // Set all definite possible values left in these cells after the collapse:
  for(let xi = 0;xi < actualKern.length;xi++){
    for(let yi = 0;yi < actualKern[xi].length;yi++){
      // Account for wrapping (maybe not even necessary for this function)
      let realX = (x+xi + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
      let realY = (y+yi + WFC_2.output_possibility_grid[realX].length) % WFC_2.output_possibility_grid[realX].length

      WFC_2.output_possibility_grid[realX][realY].possibleValsLeft = [actualKern[xi][yi]]

      safeCells.push({x: realX, y: realY});

    }

  }

  return safeCells;

}

function WFC_bigSquareUpdate_KernelsFromTheCollapse(WFC_2, x, y){
  // Kernel sizes always 0 for this WFC version
  let kd = 0

  let dimOfSquareToCheck = (2 * WFC_2.t1.kernels[kd].n) - 1

  
  //x^2 comparisons of the kernel windows that fit around this pixel
  for(let xi = 0;xi < dimOfSquareToCheck;xi++){
    for(let yi = 0;yi < dimOfSquareToCheck;yi++){
      let farLeftX = x+xi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
      farLeftX = (farLeftX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
      let farTopY = y+yi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
      farTopY = (farTopY + WFC_2.output_possibility_grid[farLeftX].length) % WFC_2.output_possibility_grid[farLeftX].length

      WFC_applyKernelShaveFromPossibleVals(WFC_2, farLeftX, farTopY, kd);

    }

  }
}

// Loop through the kernels just updated and change their effected cells' possibleVals array
//   * EXCLUDING the safety cells that just collapsed
function WFC_bigSquareUpdate_PossibleValsFromPreviousKernelCollapses(WFC_2, x, y, cellsPossibleValJustCollapsed){
  // Kernel sizes always 0 for this WFC version
  let kd = 0

  let dimOfSquareToCheck = (2 * WFC_2.t1.kernels[kd].n) - 1
  //x^2 comparisons of the kernel windows that fit around this pixel
  for(let xi = 0;xi < dimOfSquareToCheck;xi++){
    for(let yi = 0;yi < dimOfSquareToCheck;yi++){
      let kernelCellX = x+xi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
      kernelCellX = (kernelCellX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
      let kernelCellY = y+yi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
      kernelCellY = (kernelCellY + WFC_2.output_possibility_grid[kernelCellX].length) % WFC_2.output_possibility_grid[kernelCellX].length
      
      WFC_updatePossibleValsFromKernelPossibilities(WFC_2, kernelCellX, kernelCellY, cellsPossibleValJustCollapsed, kd);

    }

  }
}


//Interesting cells are added manually and change 
// Too start everything is possible, at all kernels (all possible values ) so just find the lowest kernel
function WFC_collapseLowestEntropyKernel(WFC_2){

  //Get random from the lowest possible entropy cells that aren't 1
  let randoOffsetX = Math.floor(WFC_2.cr.random() * WFC_2.output_possibility_grid.length)
  let randoOffsetY = Math.floor(WFC_2.cr.random() * WFC_2.output_possibility_grid[0].length)
  let xxx = -1
  let yyy = -1
  let leastUncertainCell = null
  let lowestKernelCountYet = 9999999

  // Start at random location and grab the lowest value of possible kernels
  for(let i = 0;i < WFC_2.output_possibility_grid.length;i++){
    let ii = (i+randoOffsetX) % WFC_2.output_possibility_grid.length;
    for(let j = 0;j < WFC_2.output_possibility_grid[ii].length;j++){
      let jj = (j+randoOffsetY) % WFC_2.output_possibility_grid[ii].length;
      
      let sus = WFC_2.output_possibility_grid[ii][jj]
      if(sus.topLeftOfKernelsLeft[0].length < lowestKernelCountYet && sus.possibleValsLeft.length > 1){
        leastUncertainCell = sus
        lowestKernelCountYet = sus.topLeftOfKernelsLeft[0].length//where do u pick it? checkj ciollapse vlaue
        xxx = ii
        yyy = jj
      }
    }
  }

  //Get random distribution pick of value from available kernels left :)
  if(leastUncertainCell){
    // This ends up being random + in statistical proportion to the template image
    let randomValFromRemainingIndexArray = Math.floor([WFC_2.cr.random() * leastUncertainCell.topLeftOfKernelsLeft[0].length]);
    let indexLookUpReference = leastUncertainCell.topLeftOfKernelsLeft[0][randomValFromRemainingIndexArray]
    // Get the actual kernel from the lookup reference
    let kernToCollapseInto = WFC_2.t1.kernels[0].ks[indexLookUpReference];

    
    // Collapse the ONE cell to its one kernel possibility + change the possible values for the n^2 squares
    let cells_PossibleValsJustCollapsed = 
      WFC_collapseKernelAt_AndChangePossibleValues_AndChangeToTheOneKernelPossibility(
        WFC_2,
        xxx, yyy,
        indexLookUpReference,
        kernToCollapseInto
      );
    
    // Go around the BIG square update all the possible kernels
    // Look at "WFC_ReferenceImage1.png" for a visualization
    WFC_bigSquareUpdate_KernelsFromTheCollapse(WFC_2, xxx, yyy)

    // Go around the BIG square update all the possible kernels from updating all the possible values
    WFC_bigSquareUpdate_PossibleValsFromPreviousKernelCollapses(WFC_2, xxx, yyy, cells_PossibleValsJustCollapsed)

    // Collapse into KERNEL

  }
  else{
    console.log("==>>>> NO UNCERTAIN CELLS <<<<<==")
  }

  
  return null
}






