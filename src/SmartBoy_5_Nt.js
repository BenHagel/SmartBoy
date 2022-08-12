//var path1 = require('path');
//const fs1 = require('fs');
//var {SHA3} = require('sha3');
var hasher1 = CHelper__B.hasher_256;// new SHA3(256);

//const {GPU} = require('gpu.js');

/*
const gpu = new GPU();
const multiplyMatrix = gpu.createKernel(function(a, b) {
	let sum = 0;
	for (let i = 0; i < 512; i++) {
		sum += a[this.thread.y][i] * b[i][this.thread.x];
	}
	return sum;
}).setOutput([512, 512]);
const c = multiplyMatrix(a, b);
*/

//Import "Util.js" class




class SmartBoy{//Neuro transmitter augmentation

	constructor(conf, seed){
		//ID tracker for generating neurons
		this.ID_TEMPLATE_ = 0;

		//Custom random
		this.rand = new CustomRandom(""+seed, CHelper__B.hasher_256);

		//Setup
		this.type = conf.type;
		this.layers;//array of neurons[[...4], [...49], [...4]]
		this.layer_schema = conf.layers;
		this.all_neurons = [];//just this.layers[0], this.layers[1], and this.layers[2] concatenated 
		this.std_neuron_diam = 20;	//cosmetic
		this.unit_distance = 50;	//ave arc length between neurons in the core
		this.unit_offset_x = 50;
		this.unit_offset_y = 50;

		//Unpack the gene and instantiate it into the smart boy's neural architecture
		//Array of numbers
		this.gene = conf.gene ? conf.gene : this.rand.precalced;

		//The object this agent's parameters are stored with a label 
		//and often mapped from the generated 0-1 to a custom range
		this.geneObject = {};
		
		//meta SmartBoy info, information about the state of the network
		this.oracle = {
			"timeindex": 0,		//increases one per time step (signals take one time step to leave cellA and be received by CellB)
			"nexts": []			//{"o": object pointer to where signal is going, "v": value of the signal}
		};

		//Scaffolding of neurons:		this.layers = [allInputs, allTheHiddens, allOutputNeurons]
		this.layers = new Array(conf.layers.length);
		//Define func to aggregate length of all neurons
		this.totalNeurons = () => {
			let totNeu = 0;
			for(let i = 0;i < this.layers.length;i++)
				totNeu += this.layers[i].length;
			return totNeu;
		};

		//Populate the memory with cells
		for(let i = 0;i < this.layers.length;i++){
			let lyr = [];
			for(let j = 0;j < conf.layers[i];j++){
				let cellToAdd = new Neuron(this.ID_TEMPLATE_, this.std_neuron_diam);//this.std_neuron_diam
				cellToAdd.p5_type = i;//0input;1hidden;2output
				cellToAdd.p5_x = this.unit_offset_x;
				cellToAdd.p5_y = this.unit_offset_y;
				lyr.push(cellToAdd);
				this.ID_TEMPLATE_++;
			}
			this.layers[i] = lyr;
		}

		//Now concat the layers into one referenceable list of all neurons in th e network
		this.all_neurons = this.layers[0].concat(this.layers[1]).concat(this.layers[2]);

		//Set hidden the core of the ring core
		let p5_sqRootOfHiddenCube = Math.floor(Math.sqrt(this.layer_schema[1]));//sqrt(49) = sidelength of 7

		//Place cells in ring core format
		for(let i = 0;i < this.layers[0].length;i++){//Input
			this.layers[0][i].p5_x += (p5_sqRootOfHiddenCube-1)*this.unit_distance / 2 + this.unit_distance * i
			this.layers[0][i].p5_y += 0
		}
		for(let i = 0;i < this.layers[1].length;i++){//Hidden
			this.layers[1][i].p5_x += (i % p5_sqRootOfHiddenCube) * this.unit_distance
			this.layers[1][i].p5_y += this.unit_distance * 1 + Math.floor(i / p5_sqRootOfHiddenCube) * this.unit_distance
		}
		for(let i = 0;i < this.layers[2].length;i++){//Output
			this.layers[2][i].p5_x += (p5_sqRootOfHiddenCube-1)*this.unit_distance / 2 + this.unit_distance * i
			this.layers[2][i].p5_y += this.unit_distance * 2 + p5_sqRootOfHiddenCube* this.unit_distance
		}

		//Reset the gene index tracker to 0
		this.geneIndexTracker = 0

		//Refresh the object that stores the descriptor keys for each gene
		SmartBoy.refresh_gene_object_v1(this)
		//Should only be called once
		SmartBoy.express_gene_object_v1(this)
	}

	//Get the gene
	static refresh_gene_object_v1(boyy, theGene){
		//If included theGene, reset the value if not just use the same
		if(theGene){
			boyy.gene = theGene
		}
		boyy.geReset()

		//Refresh the gene object
		boyy.geneObject = {
			//Model level attributes
			hookupRandomOrFromInput: boyy.ge(),
			hookupNeuronDistance: boyy.unit_distance*1.1 + boyy.ge() * 2 * boyy.unit_distance,
			hookupConnections: 3 + Math.floor(boyy.ge()*6),

			neuronTypes: 1,// + Math.floor(boyy.ge()*2),
			neuronType: [],	//Gets filled out by ^^^

			totalNeuronPortionSize: 0//Gets filled by ^

			
		}

		//Need neuron types
		let totalPortion = 0
		for(let j = 0;j < boyy.geneObject.neuronTypes;j++){

			let portion = Math.random()

			boyy.geneObject.neuronType.push({
				//Per neuron attributes
				neuronThresholdAve: boyy.ge()*8,	//Base value
				neuronPortionVal: portion
			})

			totalPortion += portion
		}
		
		boyy.geneObject.totalNeuronPortionSize = totalPortion

	}


	static express_gene_object_v1(boyy){
		let geo = boyy.geneObject

		
		let orderedUnits = [...boyy.layers[1]];//.slice();
		

		//---
		//Order 0: Input layer hookup right away 
		//		so that if connectinos are ordered it knows where to start
		//----------------
		//input layer hookup
		//Special addition of first input to the top layer
		let sq_mid = Math.floor(Math.sqrt(boyy.layers[1].length))
		let icingOnTopLayer = Math.ceil(sq_mid/2)+1
		let increaser = 0
		let front = true// or back
		//Neuron.Neuron_connect(boyy.layers[0][0], boyy.layers[1][Math.floor(sq_mid/2)]);//first connect middle to middle

		while(icingOnTopLayer > 0){
			if(boyy.layers[1][Math.floor(sq_mid/2 - increaser)])
				Neuron.Neuron_connect(boyy.layers[0][0], boyy.layers[1][Math.floor(sq_mid/2 - increaser)])
			if(boyy.layers[1][Math.floor(sq_mid/2 + increaser)])
				Neuron.Neuron_connect(boyy.layers[0][0], boyy.layers[1][Math.floor(sq_mid/2 + increaser)])

			icingOnTopLayer--
			increaser++
		}
		// for(let j = 0;j < sq_mid;j++){
		// 	Neuron.Neuron_connect(boyy.layers[0][0], boyy.layers[1][j]);
		// }

		//---
		//Order 1: Organize the order of connection forming
		//----------------
		//Random shuffle
		if(geo.hookupRandomOrFromInput < 0.5){
			SmartBoy.shuffler(orderedUnits);
		}
		//Ordered from input
		else{
			//If from input, start 
			let orderedList = [];
			for(let i = 0;i < boyy.layers[0].length;i++){
				for(let j = 0;j < boyy.layers[0][i].outgoing.length;j++){
					if(orderedList.indexOf(boyy.layers[0][i].outgoing[j].n) === -1){
						orderedList.push(boyy.layers[0][i].outgoing[j].n);
					}

				}
			}

			//Hookup the units in the connection radius
			let deltaTrackedUnits = orderedList.length;
			do{
				deltaTrackedUnits = orderedList.length;
				//Loop through ordered list
				for(let i = 0;i < orderedList.length;i++){
					
					//Check all of in range lists
					for(let j = 0;j < boyy.layers[1].length;j++){
						if(Math.hypot(orderedList[i].p5_x - boyy.layers[1][j].p5_x,
							orderedList[i].p5_y - boyy.layers[1][j].p5_y) 
							<
							geo.hookupNeuronDistance)
							{
								if(orderedList.indexOf(boyy.layers[1][j]) === -1)
									orderedList.push(boyy.layers[1][j]);
						}
					}
				}
			}while(deltaTrackedUnits !== boyy.layers[1].length && orderedList.length > 0);
			orderedUnits = orderedList;
		}
		//output layer hookup
		//And the last layer to the back
		for(let j = boyy.layers[1].length-sq_mid;j < boyy.layers[1].length;j++){
			Neuron.Neuron_connect(boyy.layers[1][j], boyy.layers[2][0]);
		}




		//---
		//Order 2: Go through ordered units and hook up
		//----------------
		for(let i = 0;i < orderedUnits.length;i++){
			//Get list of neurons within max pixel distance
			let neighbours = [];
			let neuToComputeAround = orderedUnits[i];
			for(let j = orderedUnits.length-1;j > -1 ;j--){
				if(i !== j){
					if(Math.hypot(neuToComputeAround.p5_x - orderedUnits[j].p5_x,
						neuToComputeAround.p5_y - orderedUnits[j].p5_y) 
						<
						geo.hookupNeuronDistance)
						{
							neighbours.push(orderedUnits[j]);
						}
				}
			}





			//Check if neighbours are at least 'conf.minFeedback' connections backward
			let layersBack = 1//Math.floor(Math.max(1, conf.minFeedback + 0));//ALWAYS >= 1
			let offLimitUnits = [neuToComputeAround];//.incoming.slice();

			//While there are still layers to explore that you may be connecting to
			while(layersBack > 0){
				for(let j = offLimitUnits.length-1;j > -1;j--){
					for(let k = 0;k < offLimitUnits[j].incoming.length;k++){
						offLimitUnits.push(offLimitUnits[j].incoming[k].n);
					}
					//offLimitUnits.concat(offLimitUnits[j].incoming.slice());
				}
				layersBack--;
			}
			//Unique units only in the off-limit list to check all the neuighbours against
			offLimitUnits = [...new Set(offLimitUnits)];

			//Remove neighbours that count as too close a feedback loop
			for(let j = neighbours.length-1;j > -1;j--){
				for(let k = 0;k < offLimitUnits.length;k++){
					if(neighbours[j] === offLimitUnits[k]){
						neighbours.splice(j, 1);
						k = offLimitUnits.length;
					}
				}
			}
			

			



			//Select the neighbours to connect to now
			for(let j = 0;j < geo.hookupConnections && neighbours.length > 0;j++){
				let connectTo = neighbours.splice(
					Math.floor(Math.random()*neighbours.length), 1
				)[0];
				Neuron.Neuron_connect(neuToComputeAround, connectTo);
			}

			//Threshold recalibration
			for(let i = 0;i < boyy.layers[1].length;i++){

				//Get randomizer neuron type
				let randInt = Math.floor(geo.neuronType.length * Math.random())
				
				//Normalize neuron threshold
				let neuToComputeAround = boyy.layers[1][i];
				neuToComputeAround.threshold = neuToComputeAround.incoming.length *
					geo.neuronType[randInt].neuronThresholdAve
			}
		}

	}


	//Method to return the next number in the gene
	ge() {
		let theGE = this.gene[this.geneIndexTracker]
		this.geneIndexTracker = (this.geneIndexTracker+1) % this.gene.length
		return theGE
	}

	//Called right before refreshing the gene object
	geReset(){
		this.geneIndexTracker = 0
	}

	//Method get total number of times a gene was used
	//(call only after constructor)
	geTotal(){
		return -1;
	}
	

	//Helper function needs to be declared up here before connect
	getNeuronByID(idd){
		for(let b = 0;b < this.layers.length;b++){
			for(let c = 0;c < this.layers[b].length;c++){
				if(idd === this.layers[b][c].id) return this.layers[b][c];
			}
		}
		return null;
	}


	//this.neuronAt = (ind) => {
	//	return this.layers[0].concat(this.layers[1]).concat(this.layers[2])[ind];
	//};

	//inputs needed to be smaller than the number of input neurosn in the first layer
	activate(inputs){
		for(let j = 0;j < inputs.length;j++){
			//If the stimulatio nis 0, dont bother the outputs of this neuron, so don't stimulate...
			if(inputs[j] > 0){
				Neuron.Neuron_stimulate(
					this.oracle.nexts, 
					this.layers[0][j], 
					inputs[j]
				);
			}
			
		}
	}

	//SLeep mode?
	resetFiredCount() {
		for(let i = 0;i < this.layers.length;i++){
			for(let j = 0;j < this.layers[i].length;j++){
				this.layers[i][j].timesfired = 0;
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

	






	//literally shuffles an array
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
    constructor(temp_id, theNeuronDefaultDiam){
        this.id = temp_id;

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