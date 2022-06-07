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
      
      
      T2.output_possibility_grid[i][j] = cellOutputPossibilty;//{possibleValsLeft: [1,9,18], plugsLeft:[]}

      // if(i === 8 && j === 8){
      //   console.log(JSON.stringify(T2.output_possibility_grid[i][j]))
      // }
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
  //Add the cells of interest around this wfc
  //WFC_addCellsOfInterestAroundThisCell(WFC_2, x, y);
  WFC_2.cells_of_interest.push({x: x, y: y})
}


function WFC_kernelAttemptFitInAnyPosition(WFC_2, x, y, kernel){

  //Check every angle of every kernel
  //let kernelCombinations = kernel.length * kernel[0].length
  //let kernelPositionsOffset = Math.floor(WFC_2.cr.random() * kernelCombinations)
  //for(let bbb = 0;bbb < kernelCombinations;bbb++){
  //let b = (bbb+kernelPositionsOffset) % kernelCombinations//The offset
  let b = 0
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

    
    //Count all the selected squares
    let thisVariantIsPossible = true;
    let howManyNonAmbiguousPartsInThisPossibility = 0
    for(let i = 0;i < kernel.length;i++){
      for(let j = 0;j < kernel[i].length;j++){
        if(WFC_2.output_possibility_grid[farLeftX+i][farTopY+j].possibleValsLeft.indexOf(kernel[i][j]) < 0){
          thisVariantIsPossible = false;  
        }
        else{
          if(WFC_2.output_possibility_grid[farLeftX+i][farTopY+j].possibleValsLeft.length === 1)
          howManyNonAmbiguousPartsInThisPossibility++
        }
      }
    }

    //Yes the kernel at this position made it through as a variant, now set the possible values
    if(thisVariantIsPossible && howManyNonAmbiguousPartsInThisPossibility > -1){
      for(let i = 0;i < kernel.length;i++){
        for(let j = 0;j < kernel[i].length;j++){
          WFC_2.output_possibility_grid[farLeftX+i][farTopY+j].possibleValsLeft = [kernel[i][j]]
          WFC_addCellsOfInterestAroundThisCell(WFC_2, farLeftX+i, farTopY+j)
        }
      }

      return {st: "woo"}
    }
    //else{}//Just move on to the next position of this kernel
    
  }
  //}//uncomment this to hold the for loop of checking all n*n different permutations of the thing

  //No combination of variants on this kernel at x,y could be matched succesfully
  return null;
}







//The New funcs
//_________________________________________

//Go through all kernels and try to find one possible one that fits -
//manually change 
function WFC_attemptHardPlaceOfRandomKernel(WFC_2, x, y){

  //random starting indices in the kernel
  let startingKernelOffset = Math.floor(WFC_2.cr.random() * WFC_2.t1.kernels.length)
  for(let ii = 0;ii < WFC_2.t1.kernels.length;ii++){
    let i = (startingKernelOffset+ii) % WFC_2.t1.kernels.length
    
    let startingInsideKernel = Math.floor(WFC_2.cr.random() * WFC_2.t1.kernels[i].ks.length)
    for(let jj = 0;jj < WFC_2.t1.kernels[i].ks.length;jj++){
      let j = (startingInsideKernel+jj) % WFC_2.t1.kernels[i].ks.length

      let kernToTry = WFC_2.t1.kernels[i].ks[j]
      
      let resultAndMeta = WFC_kernelAttemptFitInAnyPosition(WFC_2, x, y, kernToTry)
      if(resultAndMeta) return true
    }
  }

  return false
}

//With the current state of the grid of possible values - prune more kernels from x,y
function WFC_prunePossibleKernelsAroundCell(WFC_2, x, y, t1KernelSpaceIndex){
  let cell = WFC_2.output_possibility_grid[x][y]

  let totalPossibleKernsBefore = cell.topLeftOfKernelsLeft[t1KernelSpaceIndex].length;
  //Check remaining kernels in this kernel space
  for(let i = cell.topLeftOfKernelsLeft[t1KernelSpaceIndex].length-1;i > -1;i--){
    let kernToCheck = 
      WFC_2.t1.kernels[t1KernelSpaceIndex].ks[
        cell.topLeftOfKernelsLeft[t1KernelSpaceIndex][i]
      ]
    
    let validKernStartingFromTopLeft = true
    for(let xa = 0;xa < kernToCheck.length;xa++){
      let xSpotInGrid = (x+xa)%WFC_2.output_possibility_grid.length
      for(let ya = 0;ya < kernToCheck[xa].length;ya++){
        if(WFC_2.output_possibility_grid[xSpotInGrid]
          [(y+ya)%WFC_2.output_possibility_grid[xSpotInGrid].length].possibleValsLeft.
          indexOf(kernToCheck[xa][ya]) < 0){
            validKernStartingFromTopLeft = false
        }
      }
    }

    //If this kern is not valid - remove it from the list of possibilities
    if(!validKernStartingFromTopLeft){
      cell.topLeftOfKernelsLeft[t1KernelSpaceIndex].splice(i, 1)
    }

  }


  let totalPossibleKernsAfter = cell.topLeftOfKernelsLeft[t1KernelSpaceIndex].length;

  //Recalc possible values based on remaining kernels
  if(totalPossibleKernsBefore !== totalPossibleKernsAfter){
    let nuPossibleValues = []
    for(let h = 0;h < cell.topLeftOfKernelsLeft[t1KernelSpaceIndex].length;h++){
      let valueAtTopLeftOfKernel = cell.topLeftOfKernelsLeft[t1KernelSpaceIndex][h][0][0]
      if(nuPossibleValues.indexOf(valueAtTopLeftOfKernel) < 0){
        nuPossibleValues.push(valueAtTopLeftOfKernel)
      }
    }
  }

}

//THe possible values for the x,y may have changed so check all
//possible other kernels around
function WFC_reUpdatePossibleKernelsAroundCell(WFC_2, x, y){
  //Loop through all kernels
  for(let kd = 0;kd < WFC_2.t1.kernels.length;kd++){

    let dimOfSquareToCheck = (2 * WFC_2.t1.kernels[kd].n) - 1

    for(let xi = 0;xi < dimOfSquareToCheck;xi++){
      for(let yi = 0;yi < dimOfSquareToCheck;yi++){
        let farLeftX = x+xi-Math.floor(dimOfSquareToCheck) //must be at least 0
        let farRightX = x+xi+Math.floor(dimOfSquareToCheck)//must be smaller than width length
        let farTopY = y+yi-Math.floor(dimOfSquareToCheck) //must be at least 0
        let farDownY = y+yi+Math.floor(dimOfSquareToCheck)//must be smaller than width length

        //Make sure this variation of the kernel is in bounds
        if(farLeftX > -1 && farLeftX < WFC_2.output_possibility_grid.length && 
          farTopY > -1 && farTopY < WFC_2.output_possibility_grid[farLeftX].length){
          
          let possibleValuesForThisCellBefore = WFC_2.output_possibility_grid[farLeftX][farTopY].possibleValsLeft.length
          WFC_prunePossibleKernelsAroundCell(WFC_2, farLeftX, farTopY, kd)
          let possibleValuesForThisCellAfter = WFC_2.output_possibility_grid[farLeftX][farTopY].possibleValsLeft.length

          if(possibleValuesForThisCellBefore !== possibleValuesForThisCellAfter){
            //add this cell as a cell of interest because the kernel values changed
            WFC_2.cells_of_interest.push({x: farLeftX, y: farTopY})
          }

        }
      }
    }

  }

  //eofnc
}


function WFC_examineNextInterestingCell(WFC_2){


  console.log("starting cells_of_interest.length", WFC_2.cells_of_interest.length)

  //Get next interesting cell
  if(WFC_2.cells_of_interest.length > 0){
    let xell = WFC_2.cells_of_interest.shift()


    let gridCellObject = WFC_2.output_possibility_grid[xell.x][xell.y]

    //console.log("Checking x,y", xell.x, xell.y, "vals left", gridCellObject.possibleValsLeft.length)
    //if(gridCellObject.possibleValsLeft.length < 2)  return null;
    //let possibilitiesBeforeChange = 0 + gridCellObject.possibleValsLeft.length

    //Gotta update each gridCellObject's:
    //possibleValsLeft
    //topLeftOfKernelsLeft
    
    //For each possible Kernel dimension length (only 1 for now though)
    //If the possible vals for 
    WFC_reUpdatePossibleKernelsAroundCell(WFC_2, xell.x, xell.y);


  }


  console.log("ending cells_of_interest.length", WFC_2.cells_of_interest.length)

  
  return null
}






//Kinda old funcs
//_____________________________________________
/*
function WFC_refreshPossibilitiesBasedOnKernels(WFC_2, x, y){

  //Each index is literally the ID of the thing being placed
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
        WFC_kernelAttemptFitInAnyPosition(WFC_2, x, y, kernels[i].ks[j])

      //The possible values this kernel enables
      for(let u = 0;u < possibleValuesMadePossibleByKernel.length;u++){
        posValsPunchCard[WFC_2.t1.possible_values.indexOf(possibleValuesMadePossibleByKernel[u])] = 1//punch the hole
      }

    }
  }

  examiningGrid.possibleValsLeft = []
  for(let i = 0;i < posValsPunchCard.length;i++){
    if(posValsPunchCard[i] > 0){
      examiningGrid.possibleValsLeft.push(WFC_2.t1.possible_values[i])
    }
  }
}

function WFC_crossCheckAllKernelsAtCell(WFC_2, x, y){

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
    WFC_crossCheckAllKernelsAtCell(WFC_2, xell.x, xell.y)
    starting_cells--


    //Add the cells of interest around this wfc
    WFC_addCellsOfInterestAroundThisCell(WFC_2, xell.x, xell.y);
  }

  WFC_2.elapsed_steps += 1;
  
  return WFC_2.cells_of_interest.length
}
*/






