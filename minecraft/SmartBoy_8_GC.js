
//Requried before running:

//SmartBoy_8_GC_HelperFuncs.js
//SmartBoy_8_GC_Logic_Blueprint.js


class SmartBoy8 {

	constructor( grid_size, desireableFPS, seed, p5CanvsIdToUse ) {
		// ID tracker for generating neurons
		this.NEURON_ID_STAMP = -1;

		// Custom random
        this.seed = seed;
		this.rand = new PseudRand( seed );
        this.vanityFPS = desireableFPS;

        // Decay variability
        this.decVar = 0.1;//       0.1 = 10% (so 0.9-0.999 decary rate)

        // Intensity of juice excretions (Excretion Magnitude)
        this.excMag = this.rand.GET_GENE()*0.9;

        this.counter = 0;//BigInt(1);

        // List of agent-wide (shared among PUs) attributes
        this.body_juice_types = SB8_LU.GET_AGENT_JUICE_TYPES(this);
        console.log(this.body_juice_types);

        this.grid_size = grid_size;
        this.num_of_PUs = this.grid_size * this.grid_size

////////// Blueprint do nothing
////////// Blueprint for input meta to track connection health

        this.input_meta_depth = SB8_LU.GET_INPUT_META_DEPTH_LENGTH(this);
        

////////// Develop PU types and PU grid
////////// Each PU type

        this.pu_type_amt = SB8_LU.GET_NUM_DIFFERENT_TYPES_LOBES(this);

        

        this.pu_types = new Array(this.pu_type_amt);
        for(let h = 0;h < this.pu_types.length;h++){

            let lobeId = h;
            // Create new PU Type object
            this.pu_types[h] = SB8_LU.GET_NEW_PU_TYPE(this, lobeId);

        }


////////// Populate iterable grid
////////// 

        let currPuTypeIndex = 0
        let currPopulation = this.pu_types[currPuTypeIndex].population;
		this.all_PUs = new Array( grid_size );
        for( let i = 0; i < this.all_PUs.length; i++ ){
            this.all_PUs[i] = new Array(grid_size);
            for( let j = 0; j < this.all_PUs[i].length; j++ ){

                let NUPU = new PU( this, currPuTypeIndex );

                this.all_PUs[i][j] = NUPU;
                this.pu_types[currPuTypeIndex].PUs.push(NUPU);    //add PU

                currPopulation--;
                if(currPopulation < 1) {
                    currPuTypeIndex++;
                    currPopulation = 
                        (currPuTypeIndex < this.pu_types.length)
                        ?
                        this.pu_types[currPuTypeIndex].population 
                        : 
                        0;
                }
            }
        }

////////// Connect all the PUs
////////// 

        // Per each lobe
        for(let i = 0;i < this.pu_types.length;i++){
            // Curr lobe will now refer to all the PUs that are instantiated with this pu type
            let currLobe = this.pu_types[i].PUs
            let cohesion_attempts = this.pu_types[i].cohesionOutputs_min
            let adhesion_attempts = this.pu_types[i].adhesionOutputs_min

            // For each PU in the lobe (not including itself)
            for(let j = 0;j < currLobe.length;j++){
                let individualCell = currLobe[j];

                for(let b = 0;b < cohesion_attempts;b++){
                    let ind = Math.floor((currLobe.length-1) * this.rand.GET_GENE())
                    ind = (j + 1 + ind) % currLobe.length;
                    Bond.CONNECT_TO(individualCell, currLobe[ind], 0.15 + this.rand.GET_GENE()*0.8)
                }


                // For each lobe that is not the current lobe
                for(let h = 1;h < this.pu_types.length;h++){
                    let hh = (i + h) % this.pu_types.length;
                    let toLobe = this.pu_types[hh].PUs;

                    for(let b = 0;b < adhesion_attempts;b++){
                        let ind = Math.floor(toLobe.length * this.rand.GET_GENE());
                        Bond.CONNECT_TO(individualCell, toLobe[ind], 0.15 + this.rand.GET_GENE()*0.8)
                    }
                    
                }


            }
        }

////////// Update the thresholds based on # of connections
////////// 

        for (let i = 0; i < this.all_PUs.length; i++) {
            for (let j = 0; j < this.all_PUs[i].length; j++) {

                // Last check to make sure at least one boy is connected 
                while(this.all_PUs[i][j].in_bonds.length < 1){
                    Bond.CONNECT_TO(
                        this.all_PUs[i][j].pu_bp.PUs[
                            Math.floor(this.all_PUs[i][j].pu_bp.PUs.length * this.rand.GET_GENE())
                        ],
                        this.all_PUs[i][j],
                        0.15 + this.rand.GET_GENE()*0.8
                    )
                }

                // Now update the base threshoold
                PU.SET_BASE_THRESHOLD(this.all_PUs[i][j]);

            }
        }
        // Contains the global meta info on the whole network
        this.oracle = {
			"timeindex": 0,		//increases one per time step (signals take one time step to leave cellA and be received by CellB)
			"nexts": []			//{"o": object pointer to where signal is going, "v": value of the signal}
		};


        // Save the gene made
        this.totalGene = this.rand.END_GENE()
        console.log('total gene for this boy:');
        console.log(this.totalGene);

        // Create the threshold





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

                    p.PUSize = 20;
                };

                p.draw = function() {
                    if( BOY && BOY.all_PUs){
                        p.background( 20, 10, 10 );

                        let readGrid = BOY.all_PUs;//BOY.oracle.timeindex % 2 === 0 ? BOY.the_grid_COPY : BOY.the_grid;

                        for (let i = 0; i < readGrid.length; i++) {
                            for (let j = 0; j < readGrid[i].length; j++) {
                                p.drawSingleGridUnit(readGrid[i][j], i, j);
                            }
                        }

                        // Draw in the joos values 
                        let jooses = BOY.body_juice_types;
                        for(let i = 0;i < jooses.length;i++){
                            p.drawSingleJoosObject(jooses[i], 200 + i * 50, 210);
                        }

                        // // Draw the one PU in detail
                        // if(INVESTIGATIVE_PU){
                        //     p.drawDetailsOfGridUnit(INVESTIGATIVE_PU)
                        // }


                    } else {
                        console.log('errrr ---------------no boy!');
                    }
                };

                p.drawSingleGridUnit = function(gu, xx, yy) {
                    p.noStroke();

                    // Show base power (out of 255 white)
                    p.fill( (gu.potential / gu.threshold)*255 );

                    // Show the fire juice
                    p.push();
                        p.translate(xx * p.PUSize + p.PUSize/2, yy * p.PUSize + p.PUSize/2);
                        p.rect(0, 0, p.PUSize, p.PUSize);

                        p.fill(gu.fireJuice*255, 0, 0);
                        p.ellipse(0, 0, 5, 5);

                    p.pop();
                };

                p.drawDetailsOfGridUnit = function(gu){

                    p.push();
                        p.translate(230, 40);

                        p.fill(255);
                        let pot = Math.floor(gu.potential/gu.threshold*1000)
                        p.text("potential: " + pot, 0, 0)
                        p.text("threshold: " + gu.threshold, 0, 25)
                        //p.text("inbox: " + gu.inbox_g.length + "  " + gu.outbox_g.length, 0, 25)

                    p.pop();
                };

                p.drawSingleJoosObject = function(joos, xx, yy) {
                    p.noStroke();
                    let maxHeight = 80;
                    let widttth = 32;
                    let barHeight = joos.juice_concentration*maxHeight;
                    let ghostHeight = joos.ghost_concentration*maxHeight;


                    // Show the fire juice
                    p.push();
                        p.translate(xx, yy);
                        // Show the background
                        p.fill( 255 );
                        p.rect(0, 0, widttth, maxHeight);


                        // Show base power (out of 255 white)
                        p.fill( joos.r, joos.g, joos.b );
                        p.rect(0, barHeight/2, widttth, barHeight);

                        p.fill(175);
                        p.ellipse(0, ghostHeight, widttth/2, 5);

                    p.pop();
                }

                p.keyPressed = function(){
                    // if( ! isNaN(p.key) ){
                    //     BOY.pulseStep(Number(p.key), [1, 1, 1, 1, 1] );
                    // }
                }

                p.mouseClicked = function(){
                    
                    if( BOY && BOY.all_PUs){
                        let ii = Math.floor(p.mouseX / p.PUSize);
                        let jj = Math.floor(p.mouseY / p.PUSize);
                        if(BOY.all_PUs[ii]){
                            if(BOY.all_PUs[jj]){
                                INVESTIGATIVE_PU = BOY.all_PUs[ii][jj];
                            }
                        }
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
    // newEmptyCell(){
    //     return {

    //     };
    //     //return (new Array( this.body_juice_types.length )).fill( 0 );
    // }

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


    // Step oracle index again with the input from the environment:
    step(agentsInputs, isThiSWholeGridUpdate) {
        //if(this.oracle.timeindex %50===0) console.log(agentsInputs)

        // Update the timeindex here, so STEP_PU for the agentsInputs dont get updated
        // twice if a signal is also in the "this.oracle.nexts"
        this.oracle.timeindex++;


        // Updating via whole grid update
        if(isThiSWholeGridUpdate){
            // Just shove them into the nearest lobe (always the first one)
            for(let z = 0;z < agentsInputs.length;z++){
                let inputPU = this.pu_types[0].PUs[z];
                inputPU.potential += agentsInputs[z];
                
            }

            let readGrid = this.all_PUs;//BOY.oracle.timeindex % 2 === 0 ? BOY.the_grid_COPY : BOY.the_grid;

            for (let i = 0; i < readGrid.length; i++) {
                for (let j = 0; j < readGrid[i].length; j++) {
                    PU.STEP_PU_as_whole_grid_update( readGrid[i][j] );
                }
            }

            for (let i = 0; i < readGrid.length; i++) {
                for (let j = 0; j < readGrid[i].length; j++) {
                    PU.STEP_PU_transfer_outboxes_to_in( readGrid[i][j] );
                }
            }
        }

        // Updating via signal architecture
        else{
            // Just shove them into the nearest lobe (always the first one)
            for(let z = 0;z < agentsInputs.length;z++){
                let inputPU = this.pu_types[0].PUs[z];
                inputPU.potential += agentsInputs[z];
                PU.STEP_PU(inputPU);

                

                //if(z===3) console.log(inputPU.potential)

                // for(let g = 0;g < inputPU.out_bonds.length;g++){

                //     let inputSignal = new Nexter(
                //         inputPU.out_bonds[g], 
                //         agentsInputs[z]
                //     );
                //     this.oracle.nexts.push(inputSignal);

                // }
            }



            let PUs2Check = [];
            // Sum up the signals and track which neurons are to be checked
            while ( this.oracle.nexts.length > 0 ){
                let nexter_signal =    this.oracle.nexts.shift();
                let puReceiving =       nexter_signal.bond.to;

                if ( PUs2Check.indexOf( puReceiving ) === -1 ) {
                    PUs2Check.push( puReceiving );
                }
                
                // TODO input NN:
                puReceiving.potential += nexter_signal.bond.weight * nexter_signal.value;
            }



            // While there are neurons to fire?
            for(let k = 0;k < PUs2Check.length;k++){
                PU.STEP_PU(PUs2Check[k])
                PUs2Check[k].inbox_g = [];
                PUs2Check[k].outbox_g = [];
            }
        }
        


        // Update the juices of the agent
        for( let h = 0; h < this.body_juice_types.length; h++ ){
            Juice.update(this.body_juice_types[h])
        }
        // Should be the last thing of the whole agent algoirithms

    }

    // Step the normal connected way

	






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
