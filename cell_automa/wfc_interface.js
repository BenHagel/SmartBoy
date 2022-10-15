var VOICE_GOOD_TO_GO = false;
var VOCAL = null;
if ('speechSynthesis' in window) {
  VOICE_GOOD_TO_GO = true;
  VOCAL = window.speechSynthesis;
  if(!VOCAL.getVoices()){ // They dony be loading?!

  }
}

///// https://www.educative.io/answers/how-to-convert-text-to-speech-in-javascript

function say(msg){
  if(VOICE_GOOD_TO_GO){
    var fff = new SpeechSynthesisUtterance(""+msg);
    VOCAL.speak(fff);
  }

}


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

  say("OYE");
  
  //Get the value settings
  //Get settings from html objects

  //Get the grid from the templat sketch
  WFC_TEMPLATE_1 = WFC_getKernels(template_current_grid, [template_kernel_size] )

  document.getElementById("kernelsFoundDeeper").innerHTML = WFC_TEMPLATE_1.kernels[0].ks.length
  document.getElementById("possibleValsFound").innerHTML = JSON.stringify(WFC_TEMPLATE_1.possible_values)

  let randomSeed = 343+Math.floor(Math.random()*80834218);
  console.log("Seed:");
  console.log(randomSeed);

  WFC_TEMPLATE_2 = WFC_initGenerator(WFC_TEMPLATE_1, output_grid_size, randomSeed)

  console.log("Starting entropy:", WFC_getTotalEntropy(WFC_TEMPLATE_2));

  updateOutputGeneratorUI(WFC_TEMPLATE_2)

}



function stepExistingT2(WFC_2){

  
  //WFC_collapseLowestEntropyCell(WFC_2) 
  WFC_collapseLowestEntropyCell_JUST_ONE_CELL_THOUGH(WFC_2)

  //Option: switch the reading of the kernels to wrapping: ON/OFF
  //For kernels that are 3x3 (nxn)
  //Manual start off:::
  //  Start with one definite cell and change its possible values to something certain
  //  Add cell to list of interesting cells (based on surround possible vals change all surrounding kernels)

  //For each cell of interest
  //  do a nxn kernel check so an area of : (2n-1)*(2n-1), for each cell that changed:
  //    if # of possible krnl's change - recompute possible values,
  //    if # of possible values change - add it to cell of interest

  //Example n = 3 - which cells have kernel objects:
  //  output: 8x8
  /*
  OOOOOOX   XX
  OOOOOOX   XX
  OOOOOOX   XX
  OOOOOOX   XX
  OOOOOOX   XX
  OOOOOOX   XX
   
  XXXXXXX   XX
  XXXXXXX   XX
  */
 //O = has an nxn kernel object (3x3)
 //X = has no nxn kernel object (UNLESS WRAP IS ENABLED)

 //If cellsof interest runs out - find lowest entropy cell and pick random value
 //If cells of interest runs - and now cells w >1 entropy - you're done!
 
 //TODO - Kernel parsing wraps
 //TODO - WFC_reUpdatePossibleKernelsAroundCell wraps the window Line 317
 
 //TODO lock in line 291 and make <2 possibility kernels the one - add changed cells to possible values
 

 //TODO if cell of interest smaller than 0
 //   loop through all and solidify all cells w only one possible kernel - add changed cells to possible values

  


 ////X all  that, new plan
 //cell of interest: do a run around sweep of all kernels directly offended by the NET
 //casting the NET - where at every possible hole in the net (n*2-1)^2 checks its entropy distance from each kernel.
 //Lowest one gets chosen - any cells that changed get added to cell of interest

  updateOutputGeneratorUI(WFC_2)
}


function stepExistingT2_80(WFC_2){
  for(let j = 0;j < 80;j++){
    stepExistingT2(WFC_2);
  }
}



//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


function updateOutputGeneratorUI(WFC_2){
  document.getElementById("stepCountDisplay").innerHTML = WFC_2.elapsed_steps
}

function wrapChange(){
  let cbox = document.getElementById("outputWraps");
  console.log(cbox.checked)
}


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function getCellsKernelEntropy(WFC_2, x, y){
  let count = 0
  let cel = WFC_2.output_possibility_grid[x][y]

  for(let i = 0;i < cel.topLeftOfKernelsLeft.length;i++){
    count += cel.topLeftOfKernelsLeft[i].length
  }

  return count
}

function getValsPossibleEntropy(WFC_2, x, y){
  let count = 0;
  let cel = WFC_2.output_possibility_grid[x][y]

  return cel.possibleValsLeft.length
}

function bruteForceT2CheckForMisses(WFC_2){

  let posValEnt = 0
  for(let i = 0;i < WFC_2.output_possibility_grid.length;i++){
    for(let j = 0;j < WFC_2.output_possibility_grid[i].length;j++){
      posValEnt += getValsPossibleEntropy(WFC_2, i, j)
    }
  }
  
  console.log("positive value entropy:", posValEnt)


}