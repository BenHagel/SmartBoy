//var path1 = require('path');
//const fs1 = require('fs');
//var {SHA3} = require('sha3');

//const {GPU} = require('gpu.js');


class Nexter{
    constructor(bond, value){
        this.bond = bond;
        this.value = value;
    }
}

class Slide {
    static up(sld, portion){
        sld.val += (1-val)*sld.portion * fctor
    }
    constructor(val, portion){
        this.val = val;
        this.portion = portion
    }
}

class Bond{

    // Check if bond already exists
    static BOND_EXISTS(from, to){
        for(let h = 0;h < from.out_bonds.length;h++){
            //if(! neu_from.outgoing[h].n || ! neu_to){console.log("WEWW ERR");console.log(neu_from.outgoing[h].n);console.log(neu_to);}
            if( from.out_bonds[h].from === from && from.out_bonds[h].to === to) return true;
        }
        return false;
    }

    // Connect unit
    static CONNECT_TO(from, to, weight){
        if( !(from===to) && !Bond.BOND_EXISTS(from, to) ){
            let nuBond = new Bond(from, to, weight );
            from.out_bonds.push(nuBond);
            to.in_bonds.push(nuBond);
        }
    }

    // Constructor
    constructor(from, to, weight){
        this.from = from;
        this.to = to;
        this.weight = weight;

        // Values nudge up n down based on how important they are
        this.rates = new Array(from.bf.input_meta.length);
        for(let k = 0;k < this.rates.length;k++) this.rates[k] = 0.0;//alsways nudged between 0 and 1
    }
}

class PU{
    static MAX_HEALTH = 1;
    static CURR_ID = 0;
    
    // Push up towards 1
    static NUDGE_UP_1(val, portion, fctor){
        return (1-val)*portion * fctor
    }

    // Push down towards 0
    static NUDGE_DOWN_0(val, portion, fctor){
        return -(val*portion * fctor)
    }

    // Update the threshold base don # of connections (usually done just once though)
    static SET_BASE_THRESHOLD(pu){
        pu.threshold = pu.pu_bp.thresholdPerWeight * pu.in_bonds.length
    }

    // Called once every update,
    static DECAY_ITERATIONS(pu, iters){
        for(let i = 0;i < iters;i++){

            // The potential
            pu.potential *= pu.pu_bp.potentialDecay

            // The pulse juice
            pu.fireJuice *= pu.pu_bp.postFireJuiceDecay


        }

    }

    // Update the health based 
    // Update to the newest threshold
    static UPDATE_THRESHOLD(pu){

    }

    // Pass the inputs through NN
    static RECEIVE_INPUT(pu){

    }

    static FIRE_PU(pu){

    }

    static STEP_PU(pu){
        // Receive all the inputs (added into potential)

        let boy = pu.bf;

        // Decay differences (needs to be done before processing the inputs, 
        // otherwise it is skipping time (would cause jumps/jiter between signals cause lots of time could have passed))
        let indexDifference = boy.oracle.timeindex - pu.lastObserved
        PU.DECAY_ITERATIONS(pu, indexDifference);

        // If this PU will fire
        if(pu.potential >= pu.threshold){

            //Send nexts out (if threshold)
            for(let i = 0;i < pu.out_bonds.length;i++){
                let nextSignal = new Nexter(pu.out_bonds[i], 1);
                boy.oracle.nexts.push(nextSignal);
            }

            pu.potential = 0;
            pu.fireJuice = 1;
        }



        
        

        pu.lastObserved = boy.oracle.timeindex;
        // Update input metas simultaneously^

        // 
        // Notify friends or not of being over threshold?

        // Frequency Update Threshold?
        // Freq. Udpate 
        //weightadj_FRQ
        //thresholdadj_FRQ

        // Boring ass decay at the end
        // 


    }
    

    constructor(boyRef, boyInd){
        this.bf = boyRef;// Refernce to the boy
        this.bi = boyInd;
        this.lastObserved = 0;//this.bf.oracle.timeindex;
        //this.physX = 
        this.id = PU.CURR_ID;
        PU.CURR_ID++;

        this.pu_bp = this.bf.pu_types[boyInd];//Processiong Unit blueprint

        // Collection of bonds to its nearest neighbours...
        this.in_bonds = [];     // this.pu_bp configs effects this array
        this.out_bonds = [];    // this.pu_bp configs NOT effect this array

        // state of instance of Processing Unit
        this.health = PU.MAX_HEALTH;
        this.reputation = 0.5;
        this.potential = 0.0;//potential
        this.threshold = 0.5;//this.pu_bp // Gets reset after all connections are hooked up
        this.fireJuice = 0;//Between 1 and 0, decay rate based off
    }
}


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
        this.body_juice_types = [
            {
                val: 0, 
                decay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.GET_GENE()
            },

            //     Pain juice
            {
                val: 0, 
                decay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.GET_GENE()
            },

            //     Sleepy juice
            {
                val: 0, 
                decay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.GET_GENE()
            }
        ];

        



        this.grid_size = grid_size;
        this.num_of_PUs = this.grid_size * this.grid_size
////////// Blueprint do nothing
////////// Blueprint for input meta to track connection health
        this.input_meta_depth = 9;
        this.input_meta = [];
        let fib1 = 1;
        let fib2 = 1;
        this.biggestInputDepth = fib2;
        for(let h = 0;h < this.input_meta_depth;h++){
            this.biggestInputDepth = fib2;

            this.input_meta.push(fib2 * 10);

            let nu = fib1 + fib2;
            fib1 = fib2;
            fib2 = nu;
        }

////////// Develop PU types and PU grid
////////// Each PU type
        this.pu_type_amt = 2//1 + Math.floor(this.rand.GET_GENE() * 2);

        let minSize = Math.floor(this.num_of_PUs / this.pu_type_amt)
        let remainder = this.num_of_PUs - (minSize * this.pu_type_amt)

        this.pu_types = new Array(this.pu_type_amt);
        for(let h = 0;h < this.pu_types.length;h++){

            // Create new PU Type object
            this.pu_types[h] = {

                population: h===0 ? minSize+remainder : minSize,

                // Connectivity
                cohesionOutputs_min: 2,
                //cohesionOutputs_weightRange: 1,
                adhesionOutputs_min: 1,
                //adhesionOutputs_weightRange: 3,

                globalNudgePortion: 0.3,      // PU.NUDGE_UP_1(val, 0.3, fctor){

                // Decay rates for the big 4 juices
                postFireJuiceDecay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.GET_GENE(), //0.9-0.999 decary rate)
                potentialDecay: (1-this.decVar) + (this.decVar - 0.001*this.decVar) * this.rand.GET_GENE(),

                // Called to massage every input
                input_NN: new StdNn(
                    [   // state of whole organism      //input
                        this.body_juice_types.length    + 1     , 
                        1
                    ],
                    this.seed + 3131),

                // Called to massage weight Nudge
                weightadj_NN: new StdNn(
                    [   // state of whole organism      //input //input meta
                        this.body_juice_types.length    + 1     + this.input_meta.length, 
                        1
                    ],
                    this.seed + 543),
                weightadj_FRQ: 2 + Math.floor(this.rand.GET_GENE() * (this.vanityFPS-2)),// 1 - 60

                // Threshold updates
                thresholdPerWeight: 0.15 + this.rand.GET_GENE() * 3,
                thresholdadj_NN: new StdNn(
                    [   // state of whole organism      //input //input meta
                        this.body_juice_types.length    + 1     + this.input_meta.length, 
                        1
                    ],
                    this.seed + 543),
                thresholdadj_FRQ: 2,

                health: 1,

                PUs: []
            };

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

////////// Connect
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
                        p.translate(40 + xx * 16, 40 + yy * 16);
                        p.rect(0, 0, 12, 12);

                        p.fill(gu.fireJuice*255, 0, 0);
                        p.ellipse(0, 0, 5, 5);

                    p.pop();
                };

                p.keyPressed = function(){
                    // if( ! isNaN(p.key) ){
                    //     BOY.pulseStep(Number(p.key), [1, 1, 1, 1, 1] );
                    // }
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
    step(agentsInputs) {
        //if(this.oracle.timeindex %50===0) console.log(agentsInputs)

        // Update the timeindex here, so STEP_PU for the agentsInputs dont get updated
        // twice if a signal is also in the "this.oracle.nexts"
        this.oracle.timeindex++;


        // Just shove them into the nearest lobe (always the first one)
        for(let z = 0;z < agentsInputs.length;z++){
            let inputPU = this.pu_types[0].PUs[z];
            inputPU.potential += agentsInputs[z];
            PU.STEP_PU(inputPU)

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
        }


        // Decay the juices
        for( let h = 0; h < this.body_juice_types.length; h++ ){
            this.body_juice_types[h].val *= this.body_juice_types[h].decay;
        }
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
