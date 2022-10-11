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
//////////WFC logic
////////////////////////////////////////////////////////////////////////////////////////////////////////

//Chain of functions that pass off the object to one another 
function WFC_getKernels(the_grid, kernel_range){//2d array of integers, array of integers of desired kernel sizes 

  let T1 = {
    grid: the_grid,
    kernels: kernel_range, //List of: {n: 1-x, ks: [{}]}
    possible_values: [],
    last_kern_placed: -1
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
    cr: new PseudRand(randoSeed),
    output_grid_size: output_grid_size,
    output_possibility_grid: [],  //the current state of the possibilities grid
    elapsed_steps: 0,
    dead_cells: []//grows as time goes on
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

//   let kd = 0
//   let dimOfSquareToCheck = (2 * WFC_2.t1.kernels[kd].n) - 1
//   //x^2 comparisons of the kernel windows that fit around this pixel
//   for(let xi = 0;xi < dimOfSquareToCheck;xi++){
//     for(let yi = 0;yi < dimOfSquareToCheck;yi++){
//       let farLeftX = x+xi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
//       farLeftX = (farLeftX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
//       let farTopY = y+yi-Math.floor(dimOfSquareToCheck/2) //must be at least 0
//       farTopY = (farTopY + WFC_2.output_possibility_grid[farLeftX].length) % WFC_2.output_possibility_grid[farLeftX].length
//       //If kernel is in bounds
//       if(xi + Math.floor(dimOfSquareToCheck/2) < dimOfSquareToCheck){
//         if(yi + Math.floor(dimOfSquareToCheck/2) < dimOfSquareToCheck){
//           let yesOrNo_needToUpdatePossibleVals = WFC_applyKernelShaveFromPossibleVals(WFC_2, farLeftX, farTopY, kd)
          
//         }
//       }

//     }
//   }//end of (2n-1)^2 kernel update

//   //WFC_applyKernelShaveFromPossibleVals

//   let yesOrNo_needToUpdatePossibleVals = WFC_applyKernelShaveFromPossibleVals(WFC_2, x, y, 0)
//   if(yesOrNo_needToUpdatePossibleVals){
//     WFC_updatePossibleValsFromKernelPossibilities(WFC_2, x, y)
//   }
}

// Returns a -1 if it's not even possible, 
// and 0 would be returned if all the values are already collapsed
function WFC_measurePotentialKernelDestruction(WFC_2, kern, x, y, dispX, dispY){
  let destructionTotal = 0
  for(let xi = 0;xi < kern.length;xi++){  //xi, and yi variables just go through all effected cells that could have their pVal count changed
    for(let yi = 0;yi < kern[xi].length;yi++){
      
      let farLeftX = x+xi-dispX
      farLeftX = (farLeftX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
      let farTopY = y+yi-dispY
      farTopY = (farTopY + WFC_2.output_possibility_grid[farLeftX].length) % 
        WFC_2.output_possibility_grid[farLeftX].length
      
      // If not even possible for this kernel to be here, just return -1 
      let possibleValsLeft = WFC_2.output_possibility_grid[farLeftX][farTopY].possibleValsLeft
      if(possibleValsLeft.indexOf(kern[xi][yi]) < 0){
        return -1
      } else {
        //console.log("dest:", possibleValsLeft)
        destructionTotal += possibleValsLeft.length - 1;//  This is a measure of how many possible values 
        //would be destroyed for this cell were the kernel to be placed here with these dispX and dispY values
      }



    }
  }

  return destructionTotal;
}

function WFC_getTotalEntropy(WFC_2){
    let total = 0;
    for(let i = 0;i < WFC_2.output_possibility_grid.length;i++){
        for(let j = 0;j < WFC_2.output_possibility_grid[i].length;j++){
            total += WFC_2.output_possibility_grid[i][j].possibleValsLeft.length;
        }
    }
    return total;
}

// Collapses the possible value space according to the kernel, the location, and the displacement
function WFC_actuallyPlaceKernel(WFC_2, kern, x, y, dispX, dispY){

  let protectedCells = [];

  for(let xi = 0;xi < kern.length;xi++){  //xi, and yi variables just go through all effected cells that could have their pVal count changed
    for(let yi = 0;yi < kern[xi].length;yi++){
      let adjustedX = x+xi-dispX
      adjustedX = (adjustedX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
      let adjustedY = y+yi-dispY
      adjustedY = (adjustedY + WFC_2.output_possibility_grid[adjustedX].length) % WFC_2.output_possibility_grid[adjustedX].length
      
      // Collapse these values
      WFC_2.output_possibility_grid[adjustedX][adjustedY].possibleValsLeft = [kern[xi][yi]];

      protectedCells.push({x:adjustedX, y: adjustedY});

    }
  }

  // Returns list of cell coordinates that were just set in stone and cannot be modified
  return protectedCells
}

// This updates the possible values around the last placed kernel - 
// will need to update (kernSize+2)^2 - (kernToSize)^2 cells 
function WFC_updateThePossibleValsOfCellsAroundLastPlacedKernel(WFC_2, kSize, x, y, dispX, dispY, protectedCells){
  let checkLength = 3;//2*kSize - 1

  // Sliding the kernel around the perimeter always makes 9 iterations
  for(let sx = 0;sx < checkLength;sx++){
    for(let sy = 0;sy < checkLength;sy++){

      // DO EFFICIENTLY: these are the target possible values left for each of these 
      // if the new filtered values ever all equal these sizes, then just abort and dont bother
      // checking the rest of the kernels (because all the kernels get filtered)
      //let targetPossibleVals = new Array(kSize); for(let gog = 0;gog < targetPossibleVals.length;gog++) targetPossibleVals[gog] = new Array(kSize);

      let totalValidKernelsAtThis_DispWindow = [];

      // Loop through all possible kernels
      for(let r = 0;r < WFC_2.t1.kernels[0].ks.length;r++){
        let thisKern = WFC_2.t1.kernels[0].ks[r];
        let isKernelGood = true;

        // Loop through each spot the kernel will touch (to check if its valid)
        for(let xi = 0;xi < kSize;xi++){  //xi, and yi variables just go through all effected cells that could have their pVal count changed
          for(let yi = 0;yi < kSize;yi++){

            let adjustedX = x-dispX+xi+sx - Math.floor(checkLength/2);//1   //Needs to move one left to cover perimeter
            adjustedX = (adjustedX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
            let adjustedY = y-dispY+yi+sy - Math.floor(checkLength/2);//1   //Needs to move one up   to cover perimeter
            adjustedY = (adjustedY + WFC_2.output_possibility_grid[adjustedX].length) % WFC_2.output_possibility_grid[adjustedX].length
            
            //If even one value of kernel is not contained in even one of the cells, whole kernel bad
            if(WFC_2.output_possibility_grid[adjustedX][adjustedY].possibleValsLeft.indexOf(thisKern[xi][yi]) < 0){
              isKernelGood = false;
              xi = kSize;
              yi = kSize;
            }
            // Collapse these values
            //WFC_2.output_possibility_grid[adjustedX][adjustedY].possibleValsLeft = [kern[xi][yi]];
      
      
      
          }
        }

        // If this kern is good valid here, add the possibilities to their respective spots over the space of kSize^2
        // ^^^ (SAME LOOP AS ABOVE) ^^^ 
        if(isKernelGood){
          totalValidKernelsAtThis_DispWindow.push(thisKern);
        }

      }


      // if some  kernels are valid here, set possible vals to nothing (except if a protected cell)
      if(totalValidKernelsAtThis_DispWindow.length > 0){
        for(let xi = 0;xi < kSize;xi++){  //xi, and yi variables just go through all effected cells that could have their pVal count changed
          for(let yi = 0;yi < kSize;yi++){
            let adjustedX = x-dispX+xi+sx - Math.floor(checkLength/2);//1   //Needs to move one left to cover perimeter
            adjustedX = (adjustedX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
            let adjustedY = y-dispY+yi+sy - Math.floor(checkLength/2);//1   //Needs to move one up   to cover perimeter
            adjustedY = (adjustedY + WFC_2.output_possibility_grid[adjustedX].length) % WFC_2.output_possibility_grid[adjustedX].length

            let isProtectedCell = false;
            for(let h = 0;h < protectedCells.length;h++){
              if(adjustedX === protectedCells[h].x && adjustedY === protectedCells[h].y){ 
                isProtectedCell = true; 
                h = protectedCells.length;
              }
            }

            if(!isProtectedCell){
              WFC_2.output_possibility_grid[adjustedX][adjustedY].possibleValsLeft = []
            }


          }
        }
      }


      // Loop through all the valid kernels, for this kernel offset (sx, sy) and if not a 
      // protected cell, if it is : re calculate the possible vals
      for(let r = 0;r < totalValidKernelsAtThis_DispWindow.length;r++){
        let theValidKern = totalValidKernelsAtThis_DispWindow[r];

        for(let xi = 0;xi < kSize;xi++){
          for(let yi = 0;yi < kSize;yi++){
            let adjustedX = x-dispX+xi+sx - Math.floor(checkLength/2);//1
            adjustedX = (adjustedX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
            let adjustedY = y-dispY+yi+sy - Math.floor(checkLength/2);//1
            adjustedY = (adjustedY + WFC_2.output_possibility_grid[adjustedX].length) % WFC_2.output_possibility_grid[adjustedX].length

            // Now we need to make sure that it is NOT a protected cell - and aggregate those
            let isProtectedCell = false;
            for(let h = 0;h < protectedCells.length;h++){
              if(adjustedX === protectedCells[h].x && adjustedY === protectedCells[h].y){ 
                isProtectedCell = true; 
                h = protectedCells.length;
              }
            }

            if(!isProtectedCell){
              let vals = WFC_2.output_possibility_grid[adjustedX][adjustedY].possibleValsLeft
              if(vals.indexOf(theValidKern[xi][yi]) < 0){
                vals.push(theValidKern[xi][yi]);
                //if(vals.length > 20)
              }
            }

            // else{
            //     WFC_2.output_possibility_grid[adjustedX][adjustedY].possibleValsLeft = []
            // }

            

          }
        }

      }

      
      


    } // sliding kern window y
  } // sliding kern window x

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
          console.log("====ERR==== - all the possible vals gone idek")
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

  // List of cells that just got collapsed - so dont bother computing their new possible values (happens 2 functions later)
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

  // Just do the 4 cardinal squares around the kernel that collapsed (smoller more subtle)
  // let cc = [
  //   {x: -1, y: 0},
  //   {x: 0, y: -1},
  //   {x: 1, y: 0},
  //   {x: 0, y: 1},
    
  //   {x: -1, y: -1},
  //   {x: 1, y: -1},
  //   {x: 1, y: 1},
  //   {x: -1, y: 1}
  // ]

  // for(let i = 0;i < cc.length;i++){
  //   let farLeftX = x+cc[i].x //must be at least 0
  //   farLeftX = (farLeftX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
  //   let farTopY = y+cc[i].y //must be at least 0
  //   farTopY = (farTopY + WFC_2.output_possibility_grid[farLeftX].length) % WFC_2.output_possibility_grid[farLeftX].length

  //   WFC_applyKernelShaveFromPossibleVals(WFC_2, farLeftX, farTopY, kd);
  // }
      
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

  // let cc = [
  //   {x: -1, y: 0},
  //   {x: 0, y: -1},
  //   {x: 1, y: 0},
  //   {x: 0, y: 1},

  //   {x: -1, y: -1},
  //   {x: 1, y: -1},
  //   {x: 1, y: 1},
  //   {x: -1, y: 1}
  // ]

  // for(let i = 0;i < cc.length;i++){
  //     let kernelCellX = x+cc[i].x //must be at least 0
  //     kernelCellX = (kernelCellX + WFC_2.output_possibility_grid.length) % WFC_2.output_possibility_grid.length
  //     let kernelCellY = y+cc[i].y //must be at least 0
  //     kernelCellY = (kernelCellY + WFC_2.output_possibility_grid[kernelCellX].length) % WFC_2.output_possibility_grid[kernelCellX].length
      
  //     WFC_updatePossibleValsFromKernelPossibilities(WFC_2, kernelCellX, kernelCellY, cellsPossibleValJustCollapsed, kd);
  // }

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
    let randomValFromRemainingIndexArray = 
      Math.floor([WFC_2.cr.random() * leastUncertainCell.topLeftOfKernelsLeft[0].length]);
    let indexLookUpReference = 
      leastUncertainCell.topLeftOfKernelsLeft[0][randomValFromRemainingIndexArray]
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
    
    WFC_2.elapsed_steps++;
  }
  else{
    console.log("==>>>> NO UNCERTAIN CELLS <<<<<==")
  }

  
  return null
}







///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
/////////////////////////  E  X  P  E  R  I  M  E  N  T  A  L
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function WFC_collapseLowestEntropyCell(WFC_2){
  //Get random from the lowest possible entropy cells that aren't 1
  let randoOffsetX = Math.floor(WFC_2.cr.random() * WFC_2.output_possibility_grid.length)
  let randoOffsetY = Math.floor(WFC_2.cr.random() * WFC_2.output_possibility_grid[0].length)
  let xxx = -1
  let yyy = -1
  let leastUncertainCell = null
  let lowestPossibilityCountYet = 9999999

  // Start at random location and grab the lowest value of possible VALUES (not kernels)
  for(let i = 0;i < WFC_2.output_possibility_grid.length;i++){
    let ii = (i+randoOffsetX) % WFC_2.output_possibility_grid.length;
    for(let j = 0;j < WFC_2.output_possibility_grid[ii].length;j++){
      let jj = (j+randoOffsetY) % WFC_2.output_possibility_grid[ii].length;
      
      let sus = WFC_2.output_possibility_grid[ii][jj]
      if(sus.possibleValsLeft.length < lowestPossibilityCountYet && sus.possibleValsLeft.length > 1){
        leastUncertainCell = sus
        lowestPossibilityCountYet = sus.possibleValsLeft.length//where do u pick it? checkj ciollapse vlaue
        xxx = ii
        yyy = jj
      }
    }
  }

  // Found a cell that is OR is tied with having the lowest possible value count
  if(leastUncertainCell){
    // console.log("lowest entrpopy cell found @", xxx, yyy, "w entropy", lowestPossibilityCountYet)
    let listOfKernels = WFC_2.t1.kernels[0].ks;
    let kernelSize = WFC_2.t1.kernels[0].n;

    // TODO -  Rank order the possible kernels 

    let leastDestructiveKernelIndex = -1;
    let associatedDispX = -1;
    let associatedDispY = -1;
    let leastDestructiveKernelsValue = -1;

    // BUT for now - just start at random index until a kernel + its position is discovered, and choose that one
    let randomStartIndex = Math.floor(WFC_2.cr.random() * listOfKernels.length);

    // Loop through all the kernels, and if you fin d
    let endedUpPlacingAKern = false;
    console.log("======");
    console.log("Starting entropy: ", WFC_getTotalEntropy(WFC_2));
    for(let i = 0;i < listOfKernels.length;i++){
      let ri = (i + randomStartIndex) % listOfKernels.length;
      let kernToCheck = listOfKernels[ri];

      // Loop through all configurations of this kernel on the "xxx", "yyy" spot
      // and find the least "destructive" configuration that still removes >0 possible vals
      let leastDestructiveDispX = -1;
      let leastDestructiveDispY = -1;
      let currentDestructionValue = Number.MAX_SAFE_INTEGER;

      // Double loop tests all the possible configurations of this kernel at location "xxx", "yyy"
      for(let dispX = 0;dispX < kernelSize;dispX++){
        for(let dispY = 0;dispY < kernelSize;dispY++){
          // Destruction = measure of how many possible values across the kernel area will be removed 
          let potentialDestruction = WFC_measurePotentialKernelDestruction(WFC_2, kernToCheck, xxx, yyy, dispX, dispY);

          if(potentialDestruction > 0){  // Check if even valid  at all and it does somehting (-1 = not valid, 0 = no change)
            if(potentialDestruction < currentDestructionValue){  // Check if its an improvement over last measure AND if there would be any collapse at all
              leastDestructiveDispX = dispX;
              leastDestructiveDispY = dispY;
              currentDestructionValue = potentialDestruction;

            }
          }
        }
      }


      // If there are any valid displacement values for this kernel at all, place it - (this kernel was just picked from random distribution)
      if(leastDestructiveDispX !== -1 && leastDestructiveDispY !== -1){
        // console.log("Destruction amount:", currentDestructionValue)
        let protectedCells = WFC_actuallyPlaceKernel(WFC_2, kernToCheck, xxx, yyy, leastDestructiveDispX, leastDestructiveDispY);
        WFC_2.t1.last_kern_placed = ri;

        // TODO - Define function that loops through the perimeter cells 
        //WFC_loopThroughSingleCellPerimeterAroundPlacedKernels

        // This updates the possible values around the kernel placed, so that the next round can make a more informed decision
        // as to what kernel to place
        WFC_updateThePossibleValsOfCellsAroundLastPlacedKernel(
          WFC_2, kernelSize, 
          xxx, yyy, 
          leastDestructiveDispX, leastDestructiveDispY,
          protectedCells
        );
        
        endedUpPlacingAKern = true;
        // Break out of the loop
        i = listOfKernels.length;
      } else {
        //console.log(kernToCheck)
      }


    }

    if(endedUpPlacingAKern) 
        console.log("Placed kern, new entropy:", WFC_getTotalEntropy(WFC_2));

    
    WFC_2.elapsed_steps++;
  }
  else{
    console.log("==>>>> NO UNCERTAIN CELLS <<<<<==")
  }



}





