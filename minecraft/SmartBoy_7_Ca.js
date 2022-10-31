//var path1 = require('path');
//const fs1 = require('fs');
//var {SHA3} = require('sha3');

//const {GPU} = require('gpu.js');

class SmartBoy7 {

	constructor( grid_size, seed, p5CanvsIdToUse ) {
		// ID tracker for generating neurons
		this.NEURON_ID_STAMP = -1;

		// Custom random
        this.seed = seed;
		this.rand = new PseudRand( seed );
        // Decay variability
        this.decVar = 0.5;//       0.1 = 10% (so 0.9-0.999 decary rate)

        // Intensity of juice excretions (Excretion Magnitude)
        this.excMag = this.rand.random()*0.9;

        // Cell chemicals released
        // juices decay at the rate of: this.variabiltiy *100 = %
        this.body_juice_count = 0;  // first 'x' juices are reserved for body
        this.juice_types = [
            // Body 
            //     Signal input
            {val: 0, decay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.random()},
            //     Yummy juice
            {val: 1, decay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.random()},
            //     Pain juice
            {val: 2, decay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.random()},
            //     Sleepy juice
            {val: 3, decay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.random()},

            // Rando other infos
            {val: 4, decay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.random()},
            {val: 5, decay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.random()},
            {val: 6, decay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.random()}
        ];

        // How the juice propogates through cell
        this.excreteJuices = new StdNn(
            [ this.juice_types.length, this.juice_types.length - this.body_juice_count],
            this.seed + 3131
        );

		// Grid Size
        this.grid_size = grid_size;
		this.the_grid = new Array( grid_size );
        for( let i = 0; i < this.the_grid.length; i++ ){
            this.the_grid[i] = new Array(grid_size);
            for( let j = 0; j < this.the_grid[i].length; j++ ){
                this.the_grid[i][j] = this.newEmptyCell();
            }
        }

        // Grid Size copy
        this.the_grid_COPY = new Array( grid_size );
        for( let i = 0; i < this.the_grid_COPY.length; i++ ){
            this.the_grid_COPY[i] = new Array(grid_size);
            for( let j = 0; j < this.the_grid_COPY[i].length; j++ ){
                this.the_grid_COPY[i][j] = this.newEmptyCell();
            }
        }

        // Contains the global meta info on the whole network
        this.oracle = {
			"timeindex": 0,		//increases one per time step (signals take one time step to leave cellA and be received by CellB)
			"nexts": []			//{"o": object pointer to where signal is going, "v": value of the signal}
		};

        // P5JS canvas reference
        this.p5Ref = null;
        
        // Set up the visuals
        if( p5CanvsIdToUse ){
            let sketch = function( p ) {

                p.setup = function() {
                    p.createCanvas( 400, 400 );
                    p.background( 20, 10, 10 );
                    p.rectMode( p.CENTER );
                    p.ellipseMode( p.CENTER );
                    p.frameRate( 24 );
                };

                p.draw = function() {
                    if( BOY ){
                        p.background( 20, 10, 10 );

                        let readGrid = BOY.oracle.timeindex % 2 === 0 ? BOY.the_grid_COPY : BOY.the_grid;

                        for (let i = 0; i < readGrid.length; i++) {
                            for (let j = 0; j < readGrid[i].length; j++) {
                                p.drawSingleGridUnit(readGrid[i][j], i, j);
                            }
                        }



                    } else {
                        console.log('errrr ---------------no boy!');
                    }
                };

                p.drawSingleGridUnit = function(gu, xx, yy) {
                    p.noStroke();
                    p.fill( gu[gu.length-3]*255, gu[gu.length-2]*255, gu[gu.length-1]*255 );

                    p.push();
                        p.translate(40 + xx * 16, 40 + yy * 16);
                        p.rect(0, 0, 12, 12);

                        p.fill(gu[0]*255, 0, 0);
                        p.ellipse(-4, -4, 5, 5);
                        
                        p.fill(gu[1]*255, gu[1]*127, 0);
                        p.ellipse(4, -4, 5, 5);
                        
                        p.fill(0, gu[2]*255, 0);
                        p.ellipse(-4, 4, 5, 5);
                        
                        p.fill(0, 0, gu[3]*255);
                        p.ellipse(4, 4, 5, 5);
                    p.pop();
                };

                p.keyPressed = function(){
                    if( ! isNaN(p.key) ){
                        BOY.pulseStep(Number(p.key), [1, 1, 1, 1, 1] );
                    }
                }
            };

            this.p5Ref = new p5( sketch, p5CanvsIdToUse );
        }
	}

    // Get neuron by ID (as aligned by grid)
    getN(supposedID){
        return this.the_grid[Math.floor(supposedID / this.grid_size)][supposedID % this.grid_size]
    }

    // Get empty cell w correct values
    newEmptyCell(){
        return (new Array( this.juice_types.length )).fill( 0 );
    }

	// By default just stimulates the first neurons it finds to its connections
	activate(inputs){
		this.step(inputs);
	}

    // Pulse step, switch to different
    pulseStep(juiceindex, inputs) {
        let diag = 1;
        let readGrid = this.oracle.timeindex % 2 === 1 ? this.the_grid_COPY : this.the_grid;

        for(let u = 0;u < inputs.length;u++){
            readGrid[diag][diag][juiceindex] = inputs[u];
            diag += 2;
        }

        this.step();
    }

    // Step oracle timeindex
	step() {
		this.oracle.timeindex++;

        // First time running, time index is '1'
        let readGrid = this.oracle.timeindex % 2 === 0 ? this.the_grid_COPY : this.the_grid;
        let writeGrid = this.oracle.timeindex % 2 === 1 ? this.the_grid_COPY : this.the_grid;

        // Loop through the read grid 
        for(let i = 0;i < readGrid.length;i++){
            for(let j = 0;j < readGrid[i].length;j++){

                let currCellToRead = readGrid[i][j];
                // Juice Totals
                let juiceTotals = this.newEmptyCell();
                // Negate self cell juices
                for(let h = 0;h < currCellToRead.length;h++) juiceTotals[h] = -currCellToRead[h];
                
                let sx = i - 1;
                let sy = j - 1;

                for( var iii = 0;iii < 3; iii++ ){
                    for( var jjj = 0;jjj < 3; jjj++ ){
                        var x = (iii + sx + readGrid.length) % readGrid.length;
                        var y = (jjj + sy + readGrid[x].length) % readGrid[x].length;

                        let cell2Aggregate = readGrid[x][y];
                        for(let h = 0;h < cell2Aggregate.length;h++){
                            juiceTotals[h] += cell2Aggregate[h];
                        }

                    }
                }

                
                let currCellToWrite = writeGrid[i][j];
                // Output the last juice_types that are not manafactured by the body
                let outputJuices = this.excreteJuices.activate(juiceTotals);
                for( let h = 0; h < outputJuices.length; h++ ){
                    currCellToWrite[h + this.body_juice_count] = 
                        currCellToRead[h + this.body_juice_count] + this.excMag * outputJuices[h];
                }

                //Decay juices
                for( let h = 0; h < currCellToWrite.length; h++ ){
                    currCellToWrite[h] *= this.juice_types[h].decay;
                }


                if(i === 5 && j === 6){
                    console.log(outputJuices);
                    console.log(currCellToRead);
                }

            }
        }

        
    }

	






	// Literally shuffles an array
	static shuffler( array ) {
		let currentIndex = array.length,  randomIndex;

		// While there remain elements to shuffle...
		while (currentIndex != 0) {

			// Pick a remaining element...//boyy.rand.random_pre()
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
		}

		return array;
	}


	// Utility functions
	static new_clearOutGoingHiddenConnections( boyy ){
		for(let yy = 0; yy < 3;yy++){
			for(let i = 0;i < boyy.layers[yy].length;i++){
				boyy.layers[yy][i].outgoing = [];
				boyy.layers[yy][i].incoming = [];
			}
		}
	}

    // Recall weight arrows
	static new_recalWeightArrows( boyy ){
		for(let i = 0;i < boyy.all_neurons.length;i++){
			let n = boyy.all_neurons[i];
			for(let j = 0;j < n.incoming.length;j++){
				let angleRadians = Math.atan2(n.incoming[j].n.p5_y - n.p5_y, 
					n.incoming[j].n.p5_x - n.p5_x);
				n.incoming[j].p5_offsetx = Math.cos(angleRadians) * ((n.p5_diam/2)*1.2);
				n.incoming[j].p5_offsety = Math.sin(angleRadians) * ((n.p5_diam/2)*1.2);
			}
		}
	}

	
}
