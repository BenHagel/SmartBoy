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
      p.background(23);
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
      p.ellipseMode(p.CENTER)
      p.frameRate(30)
      p.smooth()
    };
  
    p.draw = function() {
      p.background(23);
      
      
      //Draw the grid
      p.noStroke()
  
      //TODO only if T2s possibility grid is developed
      if(WFC_TEMPLATE_2){
  
  
        
  
  
        
        //Paint brush when mouse down
        if(p.mouseIsPressed){
          
          
  
          
        }
  
  
        if(WFC_TEMPLATE_2.output_possibility_grid){
  
          let gridPixels = p.width / WFC_TEMPLATE_2.output_possibility_grid.length
          let possibilitySquaresPixels = gridPixels / 4
  
          for(let i = 0;i < WFC_TEMPLATE_2.output_possibility_grid.length;i++){
            for(let j = 0;j < WFC_TEMPLATE_2.output_possibility_grid[i].length;j++){
  
              let gridOutputPossibility = WFC_TEMPLATE_2.output_possibility_grid[i][j]
              
              //Draw no solutoins
              if(gridOutputPossibility.possibleValsLeft.length === 0){
                p.noStroke();
                p.fill(25, 0, 0)
  
                p.push()
                p.translate(i*gridPixels + gridPixels/2, j*gridPixels + gridPixels/2)
                p.rotate(1)
                p.rect(0, 0, gridPixels/2, gridPixels/5)
                p.pop()
                
                p.push()
                p.translate(i*gridPixels + gridPixels/2, j*gridPixels + gridPixels/2)
                p.rotate(-1)
                p.rect(0, 0, gridPixels/2, gridPixels/5)
                p.pop()
              }
              //Draw one large big square
              else if(gridOutputPossibility.possibleValsLeft.length === 1){
                let cellType = templatePossibilities[gridOutputPossibility.possibleValsLeft[0]];
                if(cellType){
                  p.noStroke();
                  p.fill(cellType.r, cellType.g, cellType.b)
                  p.rect(i*gridPixels + gridPixels/2, j*gridPixels + gridPixels/2, gridPixels, gridPixels)
                }
              }
              //Draw a bunch of possibilities
              else{
                let diffPossibilitiesToBeDrawn = gridOutputPossibility.possibleValsLeft.length
                let lengthOfEachPossibility = (gridPixels) / diffPossibilitiesToBeDrawn
  
                for(let k = gridOutputPossibility.possibleValsLeft.length-1;k > -1;k--){
                  let cellType = templatePossibilities[gridOutputPossibility.possibleValsLeft[k]];
                  p.noStroke();
                  p.fill(cellType.r, cellType.g, cellType.b)
                  p.ellipse(
                    i*gridPixels + gridPixels/2, 
                    j*gridPixels + gridPixels/2, 
                    (k+1)*lengthOfEachPossibility, (k+1)*lengthOfEachPossibility
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
  
  
  //Create the template canvas
  var sketch_kernel_visualization = function(p) {
  
    p.setup = function() {
      p.createCanvas(300, 300);
      p.rectMode(p.CENTER)
      p.frameRate(30)
      p.smooth()
    };
  
    p.draw = function() {
      p.background(23);
      if(WFC_TEMPLATE_1){
        //console.log(p.mouseX)
        let kernelCellSize = 5
        let topIndent = 20
        let leftIndent = 20
  
        for(let i = 0;i < WFC_TEMPLATE_1.kernels.length;i++){
          let miniatureStep = kernelCellSize * WFC_TEMPLATE_1.kernels[i].n + 12
          for(let j = 0;j < WFC_TEMPLATE_1.kernels[i].ks.length;j++){
  
            p.push()
            p.translate(leftIndent, topIndent)
            p.rotate(Math.sin(p.frameCount/20)*0.1)
  
            let krn = WFC_TEMPLATE_1.kernels[i].ks[j]
            p.noStroke()
  
            for(let xx = 0;xx < krn.length;xx++){
              for(let yy = 0;yy < krn[xx].length;yy++){
                let cellType = templatePossibilities[krn[xx][yy]];
                p.fill(cellType.r, cellType.g, cellType.b)
                p.rect(kernelCellSize*xx, kernelCellSize*yy, kernelCellSize, kernelCellSize)
              } 
            }
  
            p.pop()
  
            leftIndent+= miniatureStep;
            if(leftIndent > p.width - 34){
              leftIndent = 20
              topIndent += miniatureStep
            }
            
          }
        }
                               
  
      }
    };
  
    p.keyPressed = function(){
  
    };
  };
  
  var node_kernel_visualization = document.createElement("div");
  var KERNEL_TEMPLATE_P5 = new p5(sketch_kernel_visualization, node_kernel_visualization);
  document.getElementById("templateKernelVisualsLocation").appendChild(node_kernel_visualization);


