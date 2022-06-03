








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
  output_possibility_grid_size = Math.ceil(
    Number(document.getElementById("outputSize").value)
  )
  document.getElementById("outputSize_display").innerHTML = output_possibility_grid_size
  
  //reshape the "output_possibility_grid"
  if(output_possibility_grid_size !== output_possibility_grid.length){
    if(output_possibility_grid_size < output_possibility_grid.length){
      while(output_possibility_grid.length > output_possibility_grid_size){
        output_possibility_grid.pop()
        for(let i = 0;i < output_possibility_grid.length;i++){
          output_possibility_grid[i].pop()
        }
      }
    }
    else{
      while(output_possibility_grid.length < output_possibility_grid_size){
        let newArrayAndItsSize = new Array(output_possibility_grid.length+1);
        for(let i = 0;i < newArrayAndItsSize.length;i++) newArrayAndItsSize[i] = 0;
        output_possibility_grid.push(newArrayAndItsSize)
        for(let i = output_possibility_grid.length-2;i > -1;i--){
          output_possibility_grid[i].push(0)
        }
      }
    }
  }
}
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
var template_grid_size = 1
var template_ui_paintBrush = 1
var template_current_grid = [[0]]
var template_kernel_size = 1

var WFC_TEMPLATE_2 = null;//WFC_initGenerator();


//Output generation variables
var output_seed = "googoogaga1"
var output_cr = new CustomRandom(""+output_seed,  1);
var output_possibility_grid_size = 1
var output_possibility_grid = [[0]]



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
  output_cr = new CustomRandom(""+randoSeed, 1);

  for(let w = 0;w < output_possibility_grid.length;w++){
    for(let y = 0;y < output_possibility_grid[w].length;y++){
      //output_possibility_grid[w][y] = 
    }
  }


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
  };

  p.draw = function() {
    p.background(34, 0, 0);
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
    p.noStroke()
    for(let i = 0;i < template_current_grid.length;i++){
      for(let j = 0;j < template_current_grid[i].length;j++){
        let cellType = templatePossibilities[template_current_grid[i][j]]
        p.fill(cellType.r, cellType.g, cellType.b)
        p.rect(i*gridPixels + gridPixels/2, j*gridPixels + gridPixels/2, gridPixels+2, gridPixels+2)
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
  };

  p.draw = function() {
    p.background(0, 255, 0);
    
    let gridPixels = p.width / output_possibility_grid.length

    //Draw the grid
    p.noStroke()
    for(let i = 0;i < output_possibility_grid.length;i++){
      for(let j = 0;j < output_possibility_grid[i].length;j++){
        let cellType = templatePossibilities[output_possibility_grid[i][j]]
        p.fill(cellType.r, cellType.g, cellType.b)
        p.rect(i*gridPixels + gridPixels/2, j*gridPixels + gridPixels/2, gridPixels+2, gridPixels+2)
      }  
    }
  };
};

var node_example = document.createElement("div");
var EXAMPLE_P5 = new p5(sketch_example, node_example);
document.getElementById("outputCanvasLocation").appendChild(node_example);