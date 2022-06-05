////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////Input updates
////////////////////////////////////////////////////////////////////////////////////////////////////////
function updateTemplateSize(){
  //Grab new template size
  template_grid_size = Math.ceil(
    Number(document.getElementById("templateInputSize").value)
  )
  document.getElementById("templateInputSize_display").innerHTML = template_grid_size
  
  //reshape the "template_current_grid"
  if(template_grid_size !== template_current_grid.length){
    if(template_grid_size < template_current_grid.length){
      while(template_current_grid.length > template_grid_size){
        template_current_grid.pop()
        for(let i = 0;i < template_current_grid.length;i++){
          template_current_grid[i].pop()
        }
      }
    }
    else{
      while(template_current_grid.length < template_grid_size){
        let newArrayAndItsSize = new Array(template_current_grid.length+1);
        for(let i = 0;i < newArrayAndItsSize.length;i++) newArrayAndItsSize[i] = 0;
        template_current_grid.push(newArrayAndItsSize)
        for(let i = template_current_grid.length-2;i > -1;i--){
          template_current_grid[i].push(0)
        }
      }
    }
  }
}

function updateKernelSize(){
  //Grab new kernel size
  template_kernel_size = Math.ceil(
    Number(document.getElementById("templateKernelSize").value)
  )
  document.getElementById("templateKernelSize_display").innerHTML = template_kernel_size
  
}

function updateOutputSize(){
  //Grab new kernel size
  output_grid_size = Math.ceil(
    Number(document.getElementById("outputSize").value)
  )
  document.getElementById("outputSize_display").innerHTML = output_grid_size
  
  WFC_TEMPLATE_2 = null;//RESETS the entire output so far
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////Get generating the output
////////////////////////////////////////////////////////////////////////////////////////////////////////

function propogateNewTemplateObjectWRandomSeed(){
  
  //Get the value settings
  //Get settings from html objects

  //Get the grid from the templat sketch
  WFC_TEMPLATE_1 = WFC_getKernels(template_current_grid, [template_kernel_size] )

  document.getElementById("kernelsFoundDeeper").innerHTML = WFC_TEMPLATE_1.kernels[0].ks.length
  document.getElementById("possibleValsFound").innerHTML = JSON.stringify(WFC_TEMPLATE_1.possible_values)

  WFC_TEMPLATE_2 = WFC_initGenerator(WFC_TEMPLATE_1, output_grid_size, "randoSeed1_0")

  updateOutputGeneratorUI(WFC_TEMPLATE_2)

}



function stepExistingT2(WFC_2){
  // console.log('interests:')
  // console.log(JSON.stringify(WFC_2.cells_of_interest))
  
  let resultingAmountOfInterestingCells = WFC_forceCollapseNextInterestingCell(WFC_2)//WFC_collapseNextCells(WFC_2)// 

  updateOutputGeneratorUI(WFC_2)
}
function stepExistingT2_80(WFC_2){
  // console.log('interests:')
  // console.log(JSON.stringify(WFC_2.cells_of_interest))
  for(let j = 0;j < 280;j++){
    let resultingAmountOfInterestingCells = 
      WFC_forceCollapseNextInterestingCell(WFC_2)
    updateOutputGeneratorUI(WFC_2)
  }
}



function updateOutputGeneratorUI(WFC_2){
  document.getElementById("stepCountDisplay").innerHTML = WFC_2.elapsed_steps
  document.getElementById("nextCellsDisplay").innerHTML = WFC_2.cells_of_interest.length
}
