//var path1 = require('path');
//const fs1 = require('fs');
//var {SHA3} = require('sha3');

//const {GPU} = require('gpu.js');

class SmartBoy6 {

	constructor( grid_size, seed, p5CanvsIdToUse ) {
		// ID tracker for generating neurons
		this.NEURON_ID_STAMP = -1;

		// Custom random
        this.seed = seed;
		this.rand = new PseudRand( seed );

		// Setup the mega grid
        this.grid_size = grid_size;
		this.the_grid = new Array( grid_size );
        for( let i = 0; i < this.the_grid.length; i++ ){
            this.the_grid[i] = new Array(grid_size);
            for( let j = 0; j < this.the_grid[i].length; j++ ){
                this.the_grid[i][j] = this.createAndStampNewNeuron();
            }
        }

        // Contains the global meta info on the whole network
        this.oracle = {
			"timeindex": 0,		//increases one per time step (signals take one time step to leave cellA and be received by CellB)
			"nexts": []			//{"o": object pointer to where signal is going, "v": value of the signal}
		};

        // Boy-wide juices
        this.boy_juices = {
            reward: {
                val: 0.0,
                decay: this.rand.random() * 0.0499 + 0.95
            },
            pain: {
                val: 0.0,
                decay: this.rand.random() * 0.0499 + 0.95
            },
            sleepy: {
                val: 0.0,
                decay: this.rand.random() * 0.0499 + 0.95
            }
        };

        // Generate types of Neuron
        this.neuron_types = new Array( 4 + Math.floor( this.rand.random() * 6 ) );
        // Global juice modifier 
        let GJ = 0.04;
        for(let i = 0;i < this.neuron_types.length;i++){
            let NT = {};

            NT.threshold = this.rand.random() * 2.5;
            NT.potential = 0;
            
            // Neuron wide jusices
            NT.std_juices = { 
                // Release on just fired
                discharge: {
                    val: GJ,
                    decay: this.rand.random() * 0.0499 + 0.95
                },
                attention_up_100: {
                    val: GJ,
                    decay: this.rand.random() * 0.0499 + 0.95
                },
                attention_down_100: {
                    val: GJ,
                    decay: this.rand.random() * 0.0499 + 0.95
                }
            };
            NT.std_juices_keys = Object.keys( NT.std_juices );

            // Connections that are specific  to a connection
            NT.connection_juices = {
                // Released if it was the deciding factor
                direct_discharge: {
                    val: GJ,
                    decay: this.rand.random() * 0.0499 + 0.95
                },
                // Encouragement juice exagerates the weights to the positive or negative sides
                encouragement_juice: {
                    val: GJ,
                    decay: this.rand.random() * 0.0499 + 0.95
                }
            };
            NT.connection_juices_keys = Object.keys( NT.connection_juices );


            // Create std input
            NT.inputStdNn = new StdNn( [
                NT.std_juices_keys.length +
                NT.connection_juices_keys.length +
                1,
                1
            ], this.seed + Math.floor( i * 10 + 66));
            NT.processInput = () => {
                return NT.inputStdNn.activate( arguments );
            };

            // Create std modification of the values
            NT.modifyStdNn = new StdNn( [
                NT.std_juices_keys.length +
                NT.connection_juices_keys.length +
                1,
                1
            ], this.seed + Math.floor( i * 80 + 88));
            NT.modifyThreshold = () => {
                return NT.modifyStdNn.activate( arguments );
            };

            // NT.processInput = createStdNn( NT.std_juices.length, this.boy_juices.length, NT.connection_juices.length );
            //      Input strength is modified by state of neuron
            // NT.modifyThreshold = createStdNn( NT.std_juices.length, this.boy_juices.length );
            //      threshold modified by 25% - 300%
            // NT.changeWeight = createStdNn( NT.std_juices.length, this.boy_juices.length, NT.connection_juices.length );
            //      [0-1]  - 0.5  )*0.003
            // NT.fireOutput = createStdNn( NT.std_juices.length, this.boy_juices.length );
            //      fires a 1

            this.neuron_types[i] = NT;
        }

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

                        for (let i = 0; i < BOY.the_grid.length; i++) {
                            for (let j = 0; j < BOY.the_grid[i].length; j++) {
                                p.drawSingleGridUnit(BOY.the_grid[i][j], i, j);
                            }
                        }

                    } else {
                        console.log('errrr ---------------no boy!');
                    }
                };

                p.drawSingleGridUnit = function(gu, xx, yy) {

                    
                    p.noStroke();
                    p.fill( 120, 120, 120 );

                    p.push();
                    p.translate(40, 40);
                    p.rect(xx * 8, yy * 8, 6, 6);
                    p.pop();
                };
            };
            this.p5Ref = new p5( sketch, p5CanvsIdToUse );
        }
	}

    createAndStampNewNeuron() {
        this.NEURON_ID_STAMP ++;
        let n = new Neuron( this );
        n.id = this.NEURON_ID_STAMP;
        return n;
    }

    // Get neuron by ID (as aligned by grid)
    getN(supposedID){
        return this.the_grid[Math.floor(supposedID / this.grid_size)][supposedID % this.grid_size]
    }


	// By default just stimulates the first neurons it finds to its connections
	activate(inputs){
		for(let b = 0;b < inputs.length;b++){
            let neu = this.getN(b);
			//If the stimulatio nis 0, dont bother the outputs of this neuron, so don't stimulate...
			if(inputs[b] > 0){
				Neuron.Neuron_stimulate( this.oracle.nexts, neu, inputs[b] );
			}
			
		}
	}

	step() {
		this.oracle.timeindex++;
		let newDischarge = 0.0;
		let neuronsCheckedSoFar = [];

        // Sum up the signals and track which neurons are to be checked
		while ( this.oracle.nexts.length > 0 ){
			let signal =    this.oracle.nexts.shift();
			let neu =       signal.o;

			if ( neuronsCheckedSoFar.indexOf( neu ) === -1 ) {
				neuronsCheckedSoFar.push( neu );
			}
			
			// Add the val of this signal to the potential
			let ww = Neuron.Neuron_getWeight( neu, signal.f );
            // TODO threshold:
			neu.potential += ww.w * signal.v;
		}

		// While there are neurons to fire?
		for(let k = 0;k < neuronsCheckedSoFar.length;k++){

			if(neuronsCheckedSoFar[k].potential + neuronsCheckedSoFar[k].bias > neuronsCheckedSoFar[k].threshold){
				let spillage = neuronsCheckedSoFar[k].potential - neuronsCheckedSoFar[k].threshold;//TODO <- this could mean something

				let sigmoidX = Math.abs(neuronsCheckedSoFar[k].potential);
                // let modifiedThreshold = 
                // if()
				neuronsCheckedSoFar[k]._output = 0.0 + neuronsCheckedSoFar[k].output;
				neuronsCheckedSoFar[k].output = 1.0;//Util.relu(sigmoidX); //sigmoid(sigmoidX);// + spillage/neuronsCheckedSoFar[k].threshold;//neuronsCheckedSoFar[k].potential / neuronsCheckedSoFar[k].threshold;
				
				neuronsCheckedSoFar[k].potential = 0.0;//spillage/2.5;// 0;//+ spillage *0.01? lol maybe
				neuronsCheckedSoFar[k].timesfired++;
				neuronsCheckedSoFar[k].lastfired = this.oracle.timeindex;

				//Send nexts out
				for(let i = 0;i < neuronsCheckedSoFar[k].outgoing.length;i++){
					let valToAdd = {
                        // from
						f: neuronsCheckedSoFar[k],
                        // to
						o: neuronsCheckedSoFar[k].outgoing[i].n,
                        // value
						v: neuronsCheckedSoFar[k].output
					};
					this.oracle.nexts.push(valToAdd);
					newDischarge += valToAdd.v;
				}
			} else {

			}
		}

		let theOuts = [];
		for(let c = 0;c < this.layers[this.layers.length-1].length;c++){
			//console.log(this.layers[this.layers.length-1][c].id);
			theOuts.push(this.layers[this.layers.length-1][c].output + 0);
			this.layers[this.layers.length-1][c].output = 0;
		}
		return theOuts;
	}

	






	// literally shuffles an array
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


	//Utility functions
	static new_clearOutGoingHiddenConnections( boyy ){
		for(let yy = 0; yy < 3;yy++){
			for(let i = 0;i < boyy.layers[yy].length;i++){
				boyy.layers[yy][i].outgoing = [];
				boyy.layers[yy][i].incoming = [];
			}
		}
	}
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

class Neuron {
    constructor( boyref ){
        this.id = -1;

        this.boy = boyref;
        this.bias = 0;//OVERLORD_RAND.random()*2 - 1;
    
        //For recurrence 
        this.threshold = 0.0;//Gets overriden on creation
        this.timesfired = 0;
        this.lastfired = 0;
    
        //Connections
        this.incoming = [];
        this.outgoing = [];
    
        this.output = 0.0;
        this._output = 0.0;

        // Cell wide juice
        this.ct = null;//Cell Type

    }

    static Neuron_instantiate( neu , neuronType){
        neu.ct = neuronType;
    }

    // Get thing
    static Neuron_getWeight(neu, neuFrom){
        for( let i = 0; i < neu.incoming.length; i++ ) {
            if(neu.incoming[i].n === neuFrom) {
                return neu.incoming[i];
            }
        }
        return null;		
    }

    static Neuron_connect( neu_from, neu_to, weight ){
        let doesThisConnectionMakeADirectRecurssion = false;
        //Check if there exists the neu_to's input in your own incomings
        /*for(let h = 0;h < neu_from.incoming.length;h++){
            if(neu_from.incoming[h].n.id === neu_to.id) doesThisConnectionMakeADirectRecurssion = h;
        }*/
        //Check if there is already an outgoing connection to this neuron
        for(let h = 0;h < neu_from.outgoing.length;h++){
            //if(! neu_from.outgoing[h].n || ! neu_to){console.log("WEWW ERR");console.log(neu_from.outgoing[h].n);console.log(neu_to);}
            if( neu_from.outgoing[h].n.id === neu_to.id ) doesThisConnectionMakeADirectRecurssion = true;
        }
        //Cant connect to self?
        if( neu_from.id === neu_to.id ) doesThisConnectionMakeADirectRecurssion = true;
        //Failed test, abort
        if( doesThisConnectionMakeADirectRecurssion ) return;

        //Succees test, make weight
        //if(!weight){console.log("ERR", "NEED A WEIGHT");process.exit(1);}
        let _w = weight == undefined ? neu_from.boy.rand.random() : weight;
        neu_from.outgoing.push({
            n: neu_to
        });

        neu_to.incoming.push({
            n: neu_from,
            w: _w,
            m: 0.0, //  dk what this is for
            lpr: 0,//   last pulse received
            cr: 0//     connection ratio
        });
    }

    static Neuron_stimulate( nxts, neu, inp ){
        neu.timesfired++;
        neu.output = inp;
        for(let i = 0;i < neu.outgoing.length;i++){
            let valToAdd = {
                f: neu,
                o: neu.outgoing[i].n,
                v: neu.output
            };
            nxts.push(valToAdd);
        }
    }
	
}