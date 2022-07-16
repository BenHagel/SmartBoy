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



function WFC_addCellsOfInterestAroundThisCell(WFC_2, x, y){
  WFC_2.cells_of_interest.push({x: (x-1+WFC_2.output_possibility_grid.length)%WFC_2.output_possibility_grid.length, y: y})
  WFC_2.cells_of_interest.push({x: (x+1)%WFC_2.output_possibility_grid.length, y: y})

  WFC_2.cells_of_interest.push({x: x, y: (y-1+WFC_2.output_possibility_grid[x].length)%WFC_2.output_possibility_grid[x].length})
  WFC_2.cells_of_interest.push({x: x, y: (y+1)%WFC_2.output_possibility_grid[x].length})
}

function WFC_manualCollapse(WFC_2, x, y, value){

  let proposedValue = value;
  
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

//This kernel is determined to be the only possibility of this cell - calculate the consequence of that
function WFC_onlyOneKernelPossibleHere(WFC_2, x, y, kernelSpaceIndex){
  
  let cell = WFC_2.output_possibility_grid[x][y]
  //Get the one kernel
  let leftOverKernels = cell.topLeftOfKernelsLeft[kernelSpaceIndex]

  if(leftOverKernels.length === 1){
    //Just double check stuff and then 
    let kernToCheck = 
      WFC_2.t1.kernels[kernelSpaceIndex].ks[
        cell.topLeftOfKernelsLeft[kernelSpaceIndex][0]
      ]

    let validKernStartingFromTopLeft = true
    for(let xa = 0;xa < kernToCheck.length;xa++){
      let xSpotInGrid = (x + xa) % WFC_2.output_possibility_grid.length
      for(let ya = 0;ya < kernToCheck[xa].length;ya++){
        let ySpotInGrid = (y + ya) % WFC_2.output_possibility_grid[xSpotInGrid].length
        if(WFC_2.output_possibility_grid[xSpotInGrid][ySpotInGrid].possibleValsLeft.indexOf(kernToCheck[xa][ya]) < 0){
          validKernStartingFromTopLeft = false
        }
      }
    }

    if(validKernStartingFromTopLeft){
      for(let xa = 0;xa < kernToCheck.length;xa++){
        let xSpotInGrid = (x + xa) % WFC_2.output_possibility_grid.length
        for(let ya = 0;ya < kernToCheck[xa].length;ya++){
          let ySpotInGrid = (y + ya) % WFC_2.output_possibility_grid[xSpotInGrid].length
          WFC_2.output_possibility_grid[xSpotInGrid][ySpotInGrid].possibleValsLeft = [kernToCheck[xa][ya]]
          //WFC_2.cells_of_interest.push({x: xSpotInGrid, y: ySpotInGrid})
        }
      }
    }

  }//If there's actually one kernel

}//eofnc

//With the current state of the grid of possible values - prune more kernels from x,y
function WFC_prunePossibleKernelsAroundCell(WFC_2, x, y, t1KernelSpaceIndex){//So the kSpace^2 of the top left of kernels affected
  let cell = WFC_2.output_possibility_grid[x][y]

  let totalPossibleKernsBefore = cell.topLeftOfKernelsLeft[t1KernelSpaceIndex].length;
  //Check remaining kernels in this kernel space
  for(let i = cell.topLeftOfKernelsLeft[t1KernelSpaceIndex].length-1;i > -1;i--){
    let kernToCheck = 
      WFC_2.t1.kernels[t1KernelSpaceIndex].ks[
        cell.topLeftOfKernelsLeft[t1KernelSpaceIndex][i]
      ]
    
    //Account for wrapping and check the next possible kernel and see if it's still valid
    let validKernStartingFromTopLeft = true
    for(let xa = 0;xa < kernToCheck.length;xa++){
      let xSpotInGrid = (x + xa) % WFC_2.output_possibility_grid.length
      for(let ya = 0;ya < kernToCheck[xa].length;ya++){
        let ySpotInGrid = (y + ya) % WFC_2.output_possibility_grid[xSpotInGrid].length
        if(WFC_2.output_possibility_grid[xSpotInGrid][ySpotInGrid].possibleValsLeft.
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

  // console.log("----cell.topLeftOfKernelsLeft[0]")
  // console.log("cell.topLeftOfKernelsLeft[0]", cell.topLeftOfKernelsLeft[0])

  let totalPossibleKernsAfter = cell.topLeftOfKernelsLeft[t1KernelSpaceIndex].length;

  //if(totalPossibleKernsAfter < 2) console.log("WHOA NELLY ONLY ONE POSSIBLITY AT", x,y, ":totalPossibleKernsAfter:", totalPossibleKernsAfter)
  //LOCK IN THAT BOY?!

  if(totalPossibleKernsBefore !== totalPossibleKernsAfter){
    //Set the new possible values
    let nuPossibleValues = []
    for(let h = 0;h < cell.topLeftOfKernelsLeft[t1KernelSpaceIndex].length;h++){
      let kernToEvaluateTopLeftOf = 
        WFC_2.t1.kernels[t1KernelSpaceIndex].ks[cell.topLeftOfKernelsLeft[t1KernelSpaceIndex][h]]
      let valueAtTopLeftOfKernel = kernToEvaluateTopLeftOf[0][0]
      if(nuPossibleValues.indexOf(valueAtTopLeftOfKernel) < 0){
        nuPossibleValues.push(valueAtTopLeftOfKernel)
      }
    }
    cell.possibleValsLeft = nuPossibleValues

    //If there is only one possible kernel it could be now, notify of this imminent collapse outside the function 
    if(totalPossibleKernsAfter === 1){
      return true//do we need to defenitively collapse
    }
  }

  return false//not necessarily needing to collapse

}

//THe possible values for the x,y may have changed so check all
//possible other kernels around
function WFC_reUpdatePossibleKernelsAroundCell(WFC_2, x, y){
  //Loop through all kernel indices
  for(let kd = 0;kd < WFC_2.t1.kernels.length;kd++){


    let dimOfSquareToCheck = (2 * WFC_2.t1.kernels[kd].n) - 1
    let totalTopLeftKernelsChcked = 0

    for(let xi = 0;xi < dimOfSquareToCheck;xi++){
      for(let yi = 0;yi < dimOfSquareToCheck;yi++){

        let farLeftX = x+xi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
        farLeftX = (farLeftX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
        let farTopY = y+yi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
        farTopY = (farTopY + WFC_2.output_possibility_grid[farLeftX].length) % WFC_2.output_possibility_grid[farLeftX].length

        //console.log("looking at", totalTopLeftKernelsChcked, farLeftX, farTopY )
        totalTopLeftKernelsChcked++
        
        //"farLeftX" and "farTopY"  are now wrapped to the possibility grid's dimensions
        let possibleValuesForThisCellBefore = WFC_2.output_possibility_grid[farLeftX][farTopY].possibleValsLeft.length
        let justCollapsedToOnePossibleKernel = WFC_prunePossibleKernelsAroundCell(WFC_2, farLeftX, farTopY, kd);//looping through the n^2 cells at the top left of the "dimOfSquareToCheck" grid
        let possibleValuesForThisCellAfter = WFC_2.output_possibility_grid[farLeftX][farTopY].possibleValsLeft.length

        //If possible values from the cells changed - update their kernels next time around
        if(possibleValuesForThisCellBefore !== possibleValuesForThisCellAfter){
          //add this cell as a cell of interest because the kernel values changed
          WFC_2.cells_of_interest.push({x: farLeftX, y: farTopY})
          //WFC_addCellsOfInterestAroundThisCell(WFC_2, farLeftX, farTopY)
        }

        //If the possible top left kernel is only one thing now and that's new - see which values changed and add them too
        if(justCollapsedToOnePossibleKernel){
          //WFC_onlyOneKernelPossibleHere(WFC_2, farLeftX, farTopY, kd)
        }

      }
    }




  }//end of kernel space n : [n=2,3,]
  
}//eofnc



//Go after lowest entropy possible values
function WFC_nudgeLeastTrickyPossibleVals(W2){

  let lowEntropyList = {e: 9999999999, locations: []}
  for(let i = 0;i < W2.output_possibility_grid.length;i++){
    for(let j = 0;j < W2.output_possibility_grid[i].length;j++){
      let kSum = W2.output_possibility_grid[i][j].possibleValsLeft.length 

      if(kSum < lowEntropyList.e && kSum > 1){
        lowEntropyList.e = kSum
        lowEntropyList.locations = [{x: i, y: j}]
      }
      else if(kSum === lowEntropyList.e){
        lowEntropyList.locations.push({x: i, y: j})
      }
    }
  }

  let lowEntCells = lowEntropyList.locations

  if(lowEntCells.length > 0){
    let xellToChange = lowEntCells[Math.floor(W2.cr.random()*lowEntCells.length)]
    let cell = W2.output_possibility_grid[xellToChange.x][xellToChange.y]
    
    let randoPossibleValueToSolidify = cell.possibleValsLeft[Math.floor(W2.cr.random()*cell.possibleValsLeft.length)]
    let vlBefore = cell.possibleValsLeft.length
    cell.possibleValsLeft = [randoPossibleValueToSolidify]
    let vlAfter = cell.possibleValsLeft.length

    if(vlBefore !== vlAfter){
      //console.log("forced change to:", JSON.stringify(xellToChange))
      W2.cells_of_interest.push(
        {x: xellToChange.x, y: xellToChange.y}
      )
      return 0;//SUCCESS
    }
  }

  return 1;//ERROR
}

//Get list of lowest kernel entropy
function WFC_nudgeLowestEntropyCells(W2){


  let lowEntropyList = {e: 9999999999, locations: []}
  for(let i = 0;i < W2.output_possibility_grid.length;i++){
    for(let j = 0;j < W2.output_possibility_grid[i].length;j++){
      let cell = W2.output_possibility_grid[i][j]
      let kSum = 0;//cell.possibleValsLeft.length//and this forloop below to add up the kernel possibilities
      for(let z = 0;z < cell.topLeftOfKernelsLeft.length;z++){
        kSum += cell.topLeftOfKernelsLeft[z].length
      }

      if(kSum < lowEntropyList.e && kSum > 1){
        lowEntropyList.e = kSum
        lowEntropyList.locations = [{x: i, y: j}]
      }
      else if(kSum === lowEntropyList.e){
        lowEntropyList.locations.push({x: i, y: j})
      }
    }
  }


  let lowEntCells = lowEntropyList.locations


  if(lowEntCells.length > 0){

    let xellToChange = lowEntCells[Math.floor(W2.cr.random()*lowEntCells.length)]
    let cell = W2.output_possibility_grid[xellToChange.x][xellToChange.y]

    //Place down rando kernel selcted
    //Get random cells kernel collapsed
    let kernsToChooseFrom = []
    for(let i = 0;i < cell.topLeftOfKernelsLeft.length;i++){
      for(let j = 0;j < cell.topLeftOfKernelsLeft[i].length;j++){
        kernsToChooseFrom.push(
          W2.t1.kernels[i].ks[cell.topLeftOfKernelsLeft[i][j]]
        )
      }
    }

    console.log(kernsToChooseFrom.length, "kerns of to choose from", "entrpy:", lowEntropyList.e)
    let randoKernToSelect = kernsToChooseFrom[Math.floor(W2.cr.random()*kernsToChooseFrom.length)]
    console.log("rando kernel---")
    console.log(randoKernToSelect)
    //Find most agreeable change to the possible values 
    // let forceCollapsedValue = cell.possibleValsLeft[Math.floor(W2.cr.random()*cell.possibleValsLeft.length)]
    // cell.possibleValsLeft = [forceCollapsedValue]


    let vlBefore = cell.possibleValsLeft.length
    cell.possibleValsLeft = [randoKernToSelect[0][0]]
    let vlAfter = cell.possibleValsLeft.length

    if(vlBefore !== vlAfter){
      //console.log("forced change to:", JSON.stringify(xellToChange))
      W2.cells_of_interest.push(
        {x: xellToChange.x, y: xellToChange.y}
      )
    }

    
    
    //Old code forcing entire kernel into slot
    /*
    for(let xxa = 0;xxa < randoKernToSelect.length;xxa++){
      let xxSpotInGrid = (xellToChange.x + xxa + W2.output_possibility_grid.length) % W2.output_possibility_grid.length
      for(let yya = 0;yya < randoKernToSelect[xxa].length;yya++){
        let yySpotInGrid = (xellToChange.y + yya + W2.output_possibility_grid[xxSpotInGrid].length) % W2.output_possibility_grid[xxSpotInGrid].length
        let lCell = W2.output_possibility_grid[xxSpotInGrid][yySpotInGrid]

        let vlBefore = lCell.possibleValsLeft.length
        lCell.possibleValsLeft = [randoKernToSelect[xxa][yya]]
        let vlAfter = lCell.possibleValsLeft.length

        if(vlBefore !== vlAfter){
          W2.cells_of_interest.push(
            {x: xxSpotInGrid, y: yySpotInGrid}
          )
        }

      }
    }
    */

    
  }

}

//So after a change to the possible vals, run this to update the kernel possiblities
function WFC_updatePossibleValsFromKernelPossibilities(W2, x, y){
  let cell = W2.output_possibility_grid[x][y]

  //We just gon rest it right here then aight haha... i guess we end the program here?
  cell.possibleValsLeft = []
  
  //TODO accomodate multi kern size vals fuck
  let krnlIndex = 0
  for(let i = 0;i < cell.topLeftOfKernelsLeft[krnlIndex].length;i++){
    let krn = W2.t1.kernels[krnlIndex].ks[
      cell.topLeftOfKernelsLeft[krnlIndex][i]
    ]
    let indOfThisAllowedVal = cell.possibleValsLeft.indexOf(krn[0][0])
    if(indOfThisAllowedVal < 0){
      let val = 0+krn[0][0]
      cell.possibleValsLeft.push(val)
    }
  }

  if(cell.possibleValsLeft.length < 1){
    console.log("ERR - all the possible vals gone idek")
    console.error("NO VALS LEFT OVER...." + x +  " "+ y)
  }
}

//function WFC_randomlyG//called (2n-1)^2 times (25 for an n=3 kernel)
//used for after the vals have been changed
function WFC_applyKernelShaveFromPossibleVals(W2, x, y, krnlIndex){

  let cell = W2.output_possibility_grid[x][y]

  console.log("shaving kernels: looking at ", x, y,"ks_left", cell.topLeftOfKernelsLeft[krnlIndex].length)
  let beforeVals = cell.topLeftOfKernelsLeft[krnlIndex].length

  //Run through all remaining kernels weed out the bad ones
  //If it changes at all - recalculate for all the cells in the area (which means just adding it to cells of interst)
  let possibleKernsBefore = cell.topLeftOfKernelsLeft[krnlIndex].length
  for(let i = cell.topLeftOfKernelsLeft[krnlIndex].length-1;i > -1;i--){
    let kernToCheck = 
      W2.t1.kernels[krnlIndex].ks[
        cell.topLeftOfKernelsLeft[krnlIndex][i]
      ]

    if(!kernToCheck){
      console.log("UDNEFINEDlooking at", kernToCheck)
      console.log("cell.topLeftOfKernelsLeft[krnlIndex].length", cell.topLeftOfKernelsLeft[krnlIndex].length)
    }

    let validKernStartingFromTopLeft = true
    for(let xxa = 0;xxa < kernToCheck.length;xxa++){
      let xxSpotInGrid = (x + xxa + W2.output_possibility_grid.length) % W2.output_possibility_grid.length
      for(let yya = 0;yya < kernToCheck[xxa].length;yya++){
        let yySpotInGrid = (y + yya + W2.output_possibility_grid[xxSpotInGrid].length) %  
          W2.output_possibility_grid[xxSpotInGrid].length
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


  //What's the new number of possibilities
  let possibleKernsAfter = cell.topLeftOfKernelsLeft[krnlIndex].length

  WFC_onlyOneKernelPossibleHere(W2, x, y, krnlIndex)

  if(possibleKernsAfter < 1){
    console.log("ERR - all the kerns gone here for some reasion - it's a blank space now idek")
    console.error("bro theres nothing she could be rn")
  }
  else{
    //do this>>>>>>
  }
  if(beforeVals !== cell.topLeftOfKernelsLeft[krnlIndex].length)
    console.log("beforeVals", beforeVals, "afterVals", cell.topLeftOfKernelsLeft[krnlIndex].length)

  //Kernels changed - update the possible vals to something similar
  return possibleKernsBefore !== possibleKernsAfter
}

//Just get rando distributed val from kernels left ()
function WFC_getRandoValFromKernelsLeft(WFC_2, x, y){
  let cell = WFC_2.output_possibility_grid[x][y]

  //TODO redo for multiple kernel size types
  if(cell.topLeftOfKernelsLeft[0].length > 0){
    let getKern = WFC_2.t1.kernels[0].ks[
      cell.topLeftOfKernelsLeft[0][
        Math.floor([WFC_2.cr.random() * cell.topLeftOfKernelsLeft[0].length])
      ]
    ];

    let row = Math.floor(getKern.length * WFC_2.cr.random());
    return getKern[row][
      Math.floor( getKern[row].length * WFC_2.cr.random() )
    ];
  }

  return null;
}


//The big sweeping net.
//Cast around a cell of interest - just simply updates all the kernels 
//that were effected by this on settling down on 
function WFC_castTheBigSweepingNet(WFC_2, x, y){

  //for(let kd = 0;kd < WFC_2.t1.kernels.length;kd++){
  let kd = 0

  let dimOfSquareToCheck = (2 * WFC_2.t1.kernels[kd].n) - 1
  console.log("dimOfSquareToCheck", dimOfSquareToCheck)
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
          console.log("bing", xi, yi)
          let yesOrNo_needToUpdatePossibleVals = WFC_applyKernelShaveFromPossibleVals(WFC_2, farLeftX, farTopY, kd)
          if(yesOrNo_needToUpdatePossibleVals){
            //Actually dont do that, just update the kernels like u did and the 
            //# of kernel possibilities left how new low entropy cells r found next time
            //manual collapse() is called upon
            //WFC_updatePossibleValsFromKernelPossibilities(WFC_2, farLeftX, farTopY)
          }
          
        }
      }

    }
  }//end of (2n-1)^2 kernel update

  //STEP 2 - change
  for(let xi = 0;xi < dimOfSquareToCheck;xi++){
    for(let yi = 0;yi < dimOfSquareToCheck;yi++){
      let farLeftX = x+xi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
      farLeftX = (farLeftX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
      let farTopY = y+yi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
      farTopY = (farTopY + WFC_2.output_possibility_grid[farLeftX].length) % WFC_2.output_possibility_grid[farLeftX].length

      //If kernel is in bounds
      if(xi + Math.floor(dimOfSquareToCheck/2) < dimOfSquareToCheck){
        if(yi + Math.floor(dimOfSquareToCheck/2) < dimOfSquareToCheck){
          
          WFC_updatePossibleValsFromKernelPossibilities(WFC_2, farLeftX, farTopY)
        }
      }

    }
  }//end of (2n-1)^2 kernel update


  //STEP 3 - now update the possible vals for the same boy


  //}//End of kernel size compartments

}


//Interesting cells are added manually and change 
function WFC_collapseAllPossibleCells(WFC_2){

  //Get random from the lowest possible entropy cells that aren't 1
  let leastUncertainCell = null
  let randoOffsetX = Math.floor(WFC_2.cr.random() * WFC_2.output_possibility_grid.length)
  let randoOffsetY = Math.floor(WFC_2.cr.random() * WFC_2.output_possibility_grid[0].length)
  let xxx = -1
  let yyy = -1
  let lowestKernelCountYet = 9999999
  for(let i = 0;i < WFC_2.output_possibility_grid.length;i++){
    let ii = (i+randoOffsetX) % WFC_2.output_possibility_grid.length
    for(let j = 0;j < WFC_2.output_possibility_grid[ii].length;j++){
      let jj = (j+randoOffsetY) % WFC_2.output_possibility_grid[ii].length
      let sus = WFC_2.output_possibility_grid[ii][jj]
      //TODO add on the multiple possibilty kernel size type
      if(sus.topLeftOfKernelsLeft[0].length < lowestKernelCountYet && sus.possibleValsLeft.length > 1){
        leastUncertainCell = sus
        lowestKernelCountYet = sus.topLeftOfKernelsLeft[0].length//where do u pick it? checkj ciollapse vlaue
        xxx = ii
        yyy = jj
      }
    }
  }

  if(leastUncertainCell){
    //Get random distribution pick of value from available kernels left :)
    let collapseValue = WFC_getRandoValFromKernelsLeft(WFC_2, xxx, yyy)//gotta look at this shit again fo show
    //leastUncertainCell.possibleValsLeft = [collapseValue]//From being [1,2,3,5,12,14]
    WFC_manualCollapse(WFC_2, xxx, yyy, collapseValue)
  }
  else{
    console.log("==>>>> NO UNCERTAIN CELLS <<<<<==")
  }

  //Get next interesting cell
  if(WFC_2.cells_of_interest.length > 0){
    //let xell = WFC_2.cells_of_interest.shift()
    

    

  }
  //Do a sweep to clean any kernel possibilities left
  else{

    // //Add the low entropy
    // let lowEntropyList = {e: 9999999999, locations: []}
    // for(let i = 0;i < WFC_2.output_possibility_grid.length;i++){
    //   for(let j = 0;j < WFC_2.output_possibility_grid[i].length;j++){
    //     let kSum = WFC_2.output_possibility_grid[i][j].possibleValsLeft.length 

    //     if(kSum < lowEntropyList.e && kSum > 1){
    //       lowEntropyList.e = kSum
    //       lowEntropyList.locations = [{x: i, y: j}]
    //     }
    //     else if(kSum === lowEntropyList.e){
    //       lowEntropyList.locations.push({x: i, y: j})
    //     }

    //   }
    // }
    // //If the possibiltiy value is a split decision
    // if( lowEntropyList.locations.length > 0){//lowEntropyList.e > 1 && lowEntropyList.e < 3 &&
    //   // let cellToPickOn = lowEntropyList.locations[Math.floor(WFC_2.cr.random()*lowEntropyList.locations.length)]
    //   // WFC_2.cells_of_interest.push({x: cellToPickOn.x, y: cellToPickOn.y})
    //   for(let t = 0;t < lowEntropyList.locations.length;t++){
    //     WFC_2.cells_of_interest.push({x: lowEntropyList.locations[t].x, y: lowEntropyList.locations[t].y})
    //   }
    // }

    

  }

  //If there are still cells w extremely low entropy
  //WFC_nudgeLowestEntropyCells(WFC_2)

  // let resultOfNudging = WFC_nudgeLeastTrickyPossibleVals(WFC_2)
  // console.log("resultOfNudging", resultOfNudging)


  //console.log("ending cells_of_interest.length", WFC_2.cells_of_interest.length)

  
  return null
}






//Kinda old funcs
//_____________________________________________
/*
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






