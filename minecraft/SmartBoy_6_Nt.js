//var path1 = require('path');
//const fs1 = require('fs');
//var {SHA3} = require('sha3');

//const {GPU} = require('gpu.js');

class SmartBoy6 {//Neuro transmitter augmentation

	constructor(grid_size, seed, p5CanvsIdToUse){
		//ID tracker for generating neurons
		this.NEURON_ID_STAMP = -1;

		//Custom random
		this.rand = new PseudRand( seed );

		//Setup the mega grid
        this.grid_size = grid_size;
		this.the_grid = new Array(grid_size);
        for(let i = 0;i < this.the_grid.length;i++){
            this.the_grid[i] = new Array(grid_size);
            for(let j = 0;j < this.the_grid[i].length;j++){
                this.the_grid[i][j] = this.createAndStampNewNeuron();
            }
        }

        // Contains the global meta info on the whole network
        this.oracle = {
			"timeindex": 0,		//increases one per time step (signals take one time step to leave cellA and be received by CellB)
			"nexts": []			//{"o": object pointer to where signal is going, "v": value of the signal}
		};
        
        // Set up the visuals
        if( p5CanvsIdToUse ){
            let sketch = function( p ) {
                p.setup = function() {
                    p.createCanvas( 400, 400 );
                    p.background( 20, 10, 10 );
                    p.rectMode( p.CENTER );
                    p.ellipseMode( p.CENTER );
                };
                p.draw = function() {
                    if( BOY ){
                        p.background( 20, 10, 10 );
                        p.noStroke();
                        p.fill( 120, 120, 120 );
                        for (let i = 0; i < BOY.grid_size.length; i++) {
                            for (let j = 0; j < BOY.grid_size[i].length; j++) {
                                p.rect(i * 8, j * 8, 6, 6);
                            }
                        }
                    }
                };
            };
            new p5( sketch, p5CanvsIdToUse );
        }
	}

    createAndStampNewNeuron(){
        this.NEURON_ID_STAMP++;
        let n = new Neuron();
        n.id = this.NEURON_ID_STAMP;
        return n;
    }

    // Get neuron by ID (as aligned by grid)
    getN(supposedID){
        return this.the_grid[Math.floor(supposedID / this.grid_size)][supposedID % this.grid_size]
    }


	// By default just stimulates the first neurons it finds to its connections
	activate(inputs){
        console.log( 'inputs', inputs )
		for(let b = 0;b < inputs.length;b++){
            let neu = this.getN(b);
            console.log('stimulating', neu.id, 'with', inputs[b])
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

		while(this.oracle.nexts.length > 0){
			let signal = this.oracle.nexts.shift();
			let neu = signal.o;

			if(neuronsCheckedSoFar.indexOf(neu) === -1){
				neuronsCheckedSoFar.push(neu);
			}
			else{
			}
			
			//Add the val of this signal to the potential
			var getWeight = function(nnn, neufrom){
				for(let i = 0;i < nnn.incoming.length;i++) 
					if(nnn.incoming[i].n === neufrom) return nnn.incoming[i];
			};
			let ww = getWeight(neu, signal.f);
			neu.potential += ww.w * signal.v;
		}

		//While there are neurons to fire?
		for(let k = 0;k < neuronsCheckedSoFar.length;k++){
			if(neuronsCheckedSoFar[k].potential + neuronsCheckedSoFar[k].bias > neuronsCheckedSoFar[k].threshold){
				let spillage = neuronsCheckedSoFar[k].potential - neuronsCheckedSoFar[k].threshold;//TODO <- this could mean something

				let sigmoidX = Math.abs(neuronsCheckedSoFar[k].potential);
				neuronsCheckedSoFar[k]._output = 0.0 + neuronsCheckedSoFar[k].output;
				neuronsCheckedSoFar[k].output = Util.relu(sigmoidX); //sigmoid(sigmoidX);// + spillage/neuronsCheckedSoFar[k].threshold;//neuronsCheckedSoFar[k].potential / neuronsCheckedSoFar[k].threshold;//1.0;
				
				neuronsCheckedSoFar[k].potential = 0.0;//spillage/2.5;// 0;//+ spillage *0.01? lol maybe
				neuronsCheckedSoFar[k].timesfired++;
				neuronsCheckedSoFar[k].lastfired = this.oracle.timeindex;

				//Send nexts out
				for(let i = 0;i < neuronsCheckedSoFar[k].outgoing.length;i++){
					let valToAdd = {
						"f": neuronsCheckedSoFar[k],
						"o": neuronsCheckedSoFar[k].outgoing[i].n,
						"v": neuronsCheckedSoFar[k].output
					};
					this.oracle.nexts.push(valToAdd);
					newDischarge += valToAdd.v;
				}
			}
			//Neuron cannot fire!
			else{

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
	static shuffler(array) {
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
	static new_clearOutGoingHiddenConnections(boyy){
		for(let yy = 0; yy < 3;yy++){
			for(let i = 0;i < boyy.layers[yy].length;i++){
				boyy.layers[yy][i].outgoing = [];
				boyy.layers[yy][i].incoming = [];
			}
		}
	}
	static new_recalWeightArrows(boyy){
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
    constructor(theNeuronDefaultDiam){
        this.id = -1;

        this.bias = 0;//OVERLORD_RAND.random()*2 - 1;
    
        //For recurrence 
        this.potential = 0.0;
        this.threshold = 0.0;//Gets overriden on creation
        this.momentum = 0.0;//momentum (maybe needs to get reset at tf reset)
        this.timesfired = 0;
    
        //Connections
        this.incoming = [];
        this.outgoing = [];
    
        this.output = 0.0;
        this._output = 0.0;
        this.error = 0.0;
        this._error = 0.0;
    
        //Graphix variables
        this.p5_x = 0;
        this.p5_y = 0;
        this.p5_diam = theNeuronDefaultDiam;// p5_neuronDefaultDiam;
        this.p5_hover = 0.0;
        this.p5_type = 0;//0 = input, 1 = hidden, 2 = output
    }

    //TODO , dont let recurrent connections occur
    static Neuron_connect(neu_from, neu_to, weight, tipe){
        let doesThisConnectionMakeADirectRecurssion = -1;
        //Check if there exists the neu_to's input in your own incomings
        /*for(let h = 0;h < neu_from.incoming.length;h++){
            if(neu_from.incoming[h].n.id === neu_to.id) doesThisConnectionMakeADirectRecurssion = h;
        }*/
        //Check if there is already an outgoing connection to this neuron
        for(let h = 0;h < neu_from.outgoing.length;h++){
            //if(! neu_from.outgoing[h].n || ! neu_to){console.log("WEWW ERR");console.log(neu_from.outgoing[h].n);console.log(neu_to);}
            if(neu_from.outgoing[h].n.id === neu_to.id) doesThisConnectionMakeADirectRecurssion = h;
        }
        //Cant connect to self?
        if(neu_from.id === neu_to.id) doesThisConnectionMakeADirectRecurssion = 0;
        //Failed test, abort
        if(doesThisConnectionMakeADirectRecurssion !== -1) return;

        //Succees test, make weight
        //if(!weight){console.log("ERR", "NEED A WEIGHT");process.exit(1);}
        let w = weight == undefined ? OVERLORD_RAND.random() : weight;
        let tt = tipe ? tipe : 0;//0=normal neural connection,
        neu_from.outgoing.push({
            "n": neu_to
        });
        let anglee = Math.PI * Math.random();
        neu_to.incoming.push({
            "n": neu_from,
            "w": w,
            "m": 0.0,
            "t": tt,	//type of weight connection not sure what this is for yet
                "r": Math.floor(OVERLORD_RAND.random()*225) + 30,
                "g": Math.floor(OVERLORD_RAND.random()*225) + 30,
                "b": Math.floor(OVERLORD_RAND.random()*225) + 30,
            //Makes the arrow point to a cloud around the receiving neuron
            "p5_offsetx": Math.cos(anglee) * ((neu_to.p5_diam/2)*1.2),
            "p5_offsety": Math.sin(anglee) * ((neu_to.p5_diam/2)*1.2),
        });
    }

    static Neuron_stimulate(nxts, neu, inp){
        neu.timesfired++;
        neu.output = inp;
        for(let i = 0;i < neu.outgoing.length;i++){
            let valToAdd = {
                "f": neu,
                "o": neu.outgoing[i].n,
                "v": neu.output
            };
            nxts.push(valToAdd);
        }
    }
	
}