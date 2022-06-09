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
  
                let totalR = 0
                let totalG = 0
                let totalB = 0

                for(let k = diffPossibilitiesToBeDrawn-1;k > -1;k--){
                  let cellType = templatePossibilities[gridOutputPossibility.possibleValsLeft[k]];
                  totalR += cellType.r
                  totalG += cellType.g
                  totalB += cellType.b
                }


                p.fill(
                  Math.floor(totalR/diffPossibilitiesToBeDrawn), 
                  Math.floor(totalG/diffPossibilitiesToBeDrawn), 
                  Math.floor(totalB/diffPossibilitiesToBeDrawn)
                )
                p.noStroke()
                p.rect(i*gridPixels + gridPixels/2, j*gridPixels + gridPixels/2, gridPixels, gridPixels)
              }
              
              
                
              
              
            }  
          }


          //what u highligting
          output_ui_kernel_x = Math.floor(p.mouseX / gridPixels)
          output_ui_kernel_y = Math.floor(p.mouseY / gridPixels)

          document.getElementById("outputMouseXAndY").innerHTML = output_ui_kernel_x + "  " + output_ui_kernel_y

          p.noFill()
          p.strokeWeight(2)
          if(output_ui_atleast_one_kernel_good) p.stroke(255)
          else p.stroke(255, 0, 0)
          p.rect(output_ui_kernel_x*gridPixels + (gridPixels*template_kernel_size)/2, output_ui_kernel_y*gridPixels + (gridPixels*template_kernel_size)/2,
           (gridPixels*template_kernel_size), (gridPixels*template_kernel_size))
        }
  
      }
  
      
    };
  
    p.mouseClicked = function(){
      if(WFC_TEMPLATE_2){
  
        let gridPixels = p.width / WFC_TEMPLATE_2.output_possibility_grid.length
        let firstInd = Math.floor(p.mouseX / gridPixels)
        let secondInd = Math.floor(p.mouseY / gridPixels)

        if(p.mouseX < 0) return null
        if(p.mouseX > p.width-1) return null
        if(p.mouseY < 0) return null
        if(p.mouseY > p.height-1) return null
  
        if(WFC_TEMPLATE_2.output_possibility_grid[firstInd]){
          if(secondInd < WFC_TEMPLATE_2.output_possibility_grid[firstInd].length){

            if(WFC_TEMPLATE_2.output_possibility_grid[firstInd][secondInd].possibleValsLeft.length > 1)
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


            
            
            //Is currently the section being highlighted
            let sectionBeingHighlighted = true
            if(WFC_TEMPLATE_2.output_possibility_grid[output_ui_kernel_x] && WFC_TEMPLATE_2.output_possibility_grid[output_ui_kernel_x][output_ui_kernel_y]){
              let gridToCheck = WFC_TEMPLATE_2.output_possibility_grid[output_ui_kernel_x][output_ui_kernel_y]
              for(let ax = 0;ax < krn.length;ax++){
                for(let ay = 0;ay < krn[ax].length;ay++){
                  if(WFC_TEMPLATE_2.output_possibility_grid[output_ui_kernel_x+ax]
                    && WFC_TEMPLATE_2.output_possibility_grid[output_ui_kernel_x+ax][output_ui_kernel_y+ay] &&
                    WFC_TEMPLATE_2.output_possibility_grid[output_ui_kernel_x+ax][output_ui_kernel_y+ay].possibleValsLeft.indexOf(krn[ax][ay]) < 0){

                    sectionBeingHighlighted = false
                  }
                }
              }

              if(sectionBeingHighlighted){
                output_ui_kernels_test_positive++
                p.stroke(240, 0, 0)
                p.strokeWeight(2)
                p.noFill()
                p.rect(kernelCellSize*krn.length/2 - kernelCellSize/2, kernelCellSize*krn[0].length/2 - kernelCellSize/2, kernelCellSize*krn.length, kernelCellSize*krn[0].length)
              }
            }

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



      //Test the kernels testing postibe
      if(output_ui_kernels_test_positive > 0){
        output_ui_atleast_one_kernel_good = true
      }
      else{
        output_ui_atleast_one_kernel_good = false
      }
      output_ui_kernels_test_positive = 0
    };
  
    p.keyPressed = function(){
  
    };
  };
  
  var node_kernel_visualization = document.createElement("div");
  var KERNEL_TEMPLATE_P5 = new p5(sketch_kernel_visualization, node_kernel_visualization);
  document.getElementById("templateKernelVisualsLocation").appendChild(node_kernel_visualization);


