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




class SmartBoy{

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
		this.std_neuron_diam = 20;	//how much diameter should neurons have in this smart boy (not used in calculations)
		this.unit_distance = 50;	//ave arc length between neurons in the core
		this.unit_offset_x = 50;
		this.unit_offset_y = 50;

		//Unpack the gene and instantiate it into the smart boy's neural architecture
		this.gene = conf.gene ? conf.gene : this.rand.precalced;

		//The object this agent's parameters are stored with a label 
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
			let totNeu = 0;for(let i = 0;i < this.layers.length;i++) totNeu += this.layers[i].length;
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


	sb_train_supervised2(aveoutputs, targetoutputs, learningrate) {
		let totalError = 0.0;
		let activeNeurons = [];
		let neuronsAlreadyLookedAt = [];//neuronsAlreadyLookedAt.push(neu); not necessary will nvr connect ot an output

		for(let v = 0;v < this.layers[2].length;v++){
			let e = aveoutputs[v] - targetoutputs[v]; //1 got 0.3, move .7 UP
			this.layers[2][v].error = e;
			totalError += Math.abs(e);
			activeNeurons.push(this.layers[2][v]);
		}
		
		do{
			for(let j = activeNeurons.length-1;j > -1;j--){
				//Loop through inputs and update the incoming weights
				let sum = 0.0;
				//If there are any outputs to this neuron then have to calculate the error ourselves
				if(activeNeurons[j].outgoing.length > 0){
					//Loop through outputs gather up error
					for(let k = 0;k < activeNeurons[j].outgoing.length;k++){
						//Loop through the inputs of that outpot neuron to update that weight
						for(let h = 0;h < activeNeurons[j].outgoing[k].n.incoming.length;h++){
							//Found the memory address that controls the weight
							if(activeNeurons[j].outgoing[k].n.incoming[h].n === activeNeurons[j]){
								activeNeurons[j].outgoing[k].n.incoming[h].w -=
									learningrate * activeNeurons[j].outgoing[k].n.error * activeNeurons[j].output;
								sum += 
									activeNeurons[j].outgoing[k].n.error * 
									activeNeurons[j].outgoing[k].n.incoming[h].w;
							}
						}
					}
				}
				//No outputs, so the error was already assigned to us in the output layer
				else{
					sum = activeNeurons[j].error;
				}
				
				
				activeNeurons[j].error = sum * activeNeurons[j]._output;

				//Updat ethe bais
				activeNeurons[j].bias -= learningrate * activeNeurons[j].error;

				//Find next neurons to propgate through
				for(let k = 0;k < activeNeurons[j].incoming.length;k++){
					if(neuronsAlreadyLookedAt.indexOf(activeNeurons[j].incoming[k].n) === -1){
						neuronsAlreadyLookedAt.push(activeNeurons[j].incoming[k].n);
						activeNeurons.push(activeNeurons[j].incoming[k].n);
					}
					//else{dont bother updating, already looked at once... 0_o} TODO maybe more?
				}

				activeNeurons.splice(j, 1);
			}
		} while(activeNeurons.length > 0);

		return totalError;
	};

	calculateDiagnostics() {
		//Calculate longest path per each output to get to each input
		//Active routes
		let activeRoutes = [];//{a: [2, 21, 78, 32]}
		let winningRoutes = [];
		//Neurons already visited
		let idsHitAlready = [];//[34, 12, 8, 3]

		//Start at the outputs, add all the starting routes
		for(let i = 0;i < this.layers[this.layers.length-1].length;i++){
			let newPath = {};
			newPath.a = [];
			newPath.a.push(this.layers[this.layers.length-1][i].id);
			idsHitAlready.push(this.layers[this.layers.length-1][i].id);
			activeRoutes.push(newPath);
		}

		//Set the list of ids that are inputs
		let inputIds = [];
		for(let i = 0;i < this.layers[0].length;i++){
			inputIds.push(this.layers[0][i].id);
		}

		//WHile less than 90% of the neurons have not been looked ay YET
		while(idsHitAlready.length < (0.0+(this.ID_TEMPLATE_ - this.layers[0].length)) * 0.96){
			for(let i = activeRoutes.length-1;i > -1;i--){
				let thisNeur = this.getNeuronByID(activeRoutes[i].a[activeRoutes[i].a.length-1]);
	
				//Check if neuron IS an input
				if(inputIds.indexOf(thisNeur.id) > -1){
					//WINNER CAWSE
					//console.log("ROUTE FOUND", activeRoutes[i].a.length);
					//console.log(activeRoutes[i].a);
					winningRoutes.push({"a": [...activeRoutes[i].a]});//add to winner!
					//activeRoutes.splice(i, 1);//remove that boy from active
				}
				//NOT YET an input
				else{
					//Get keys
					let tgs = Object.keys(thisNeur.incoming.targets);
					//variable for keeping track of if a path has yielded any new viable paths
					let newPathsMade = 0;
					for(let j = 0;j < tgs.length;j++){
						let num_id = Number(tgs[j]);
						//Doesnt exist in alraeedy checked 
						if(idsHitAlready.indexOf(num_id) === -1){
							//ADD NEW ROUTE (TODO= remove old one)
							activeRoutes.push({
								"a": [...activeRoutes[i].a]
							});
							activeRoutes[activeRoutes.length-1].a.push(num_id);
	
							//If not an input id, add it to already seen 
							if(inputIds.indexOf(num_id) === -1){
								idsHitAlready.push(num_id);
							}
							newPathsMade++;
						}
						//Does exist in already checked, leave
						else{
	
						}
					}
				}
				activeRoutes.splice(i, 1);
			}
			let smlrThan = (this.ID_TEMPLATE_ - this.layers[0].length)*0.96;
			//console.log("idsHitAlready", idsHitAlready.length, "<", smlrThan);
		}///ALL VICTORY ROUTES FROM OUTPUT TO INPUT
		console.log("Winning Routes:", winningRoutes.length);

		//Time Index gaps from inputs
		let timeIndexGaps = [];
		//Now calculate the average + Min/Max wait time between neuron firings
		let minGap = 999;
		let maxGap = 0;
		let negativeOneConnections = 0;//# of connections that have never had information flow through them

		for(let i = 0;i < this.layers.length;i++){
			for(let j = 0;j < this.layers[i].length;j++){
				let ins = Object.keys(this.layers[i][j].incoming.lastactive);
				for(let k = 0;k < ins.length;k++){
					if(this.layers[i][j].incoming.lastactive[ins[k]] !== -1){
						//console.log(i, j, ins[k], this.layers[i][j].incoming.lastactive[ins[k]]);
						let g = this.oracle.timeindex - this.layers[i][j].incoming.lastactive[ins[k]];
						timeIndexGaps.push(g);
						if(g > maxGap) maxGap = g;
						else if(g < minGap) minGap = g;
					}
					else{
						negativeOneConnections++;
						//console.log("SUM NEGTIVES id", this.layers[i][j].id, );
					}
				}
			}
		}

		let ave = 0.0;
		for(let jj = 0;jj < timeIndexGaps.length;jj++){
			ave += timeIndexGaps[jj];
		}
		ave /= (timeIndexGaps.length+0.0);

		console.log("min", minGap);
		console.log("ave", ave);
		console.log("max", maxGap);
		console.log(timeIndexGaps.length, " gaps");
		console.log("negativeOneConnections", negativeOneConnections);
		console.log('recorded at oracle.timeindex', this.oracle.timeindex);
		//inputs listings
		console.log('input list for output cells');
		for(let y = 0;y < this.layers[this.layers.length-1].length;y++){
			console.log(Object.keys(
				this.layers[this.layers.length-1][y].incoming.lastactive
			));
		}
	}
	
	getNeuronInfo(indexOfNeu = 0) {
		for(let b = 0;b < this.layers.length;b++){
			for(let c = 0;c < this.layers[b].length;c++){
				if(this.layers[b][c].id === indexOfNeu){
					let neu = this.layers[b][c];

					let contents = {};
					contents.connectomeTimeIndex = this.oracle.timeindex;
					contents.id = this.layers[b][c].id;
					contents.ins = [];
					contents.ins_w = [];
					contents.outs = [];
					contents.outs_w = [];
					contents.layer_x = b;
					contents.layer_y = c;
					contents.bias = this.layers[b][c].bias;
					contents.threshold = this.layers[b][c].threshold;
					contents.potential = this.layers[b][c].potential;
					contents.output = this.layers[b][c].output;
					contents._output = this.layers[b][c]._output;
					contents.error = this.layers[b][c].error;
					contents._error = this.layers[b][c]._error;
					
					for(let i = 0;i < neu.incoming.length;i++){
						contents.ins.push(neu.incoming[i].n.id);
						contents.ins_w.push(neu.incoming[i].w);
					}
					for(let i = 0;i < neu.outgoing.length;i++){
						contents.outs.push(neu.outgoing[i].n.id);
						contents.outs_w.push(neu.outgoing[i].w);
					}

					//Get the nexts 
					contents.incomingSignals = [];
					for(let kk = 0;kk < this.oracle.nexts.length;kk++){
						if(this.oracle.nexts[kk].o == contents.id){
							contents.incomingSignals.push({"f": this.oracle.nexts[kk].f, "v": this.oracle.nexts[kk].v});
						}
					}
					return contents;
				}
			}
		}
		return -1;
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
			hookupMode: boyy.ge(),
			hookupNeuronDistance: boyy.unit_distance*1.1 + boyy.ge() * 2 * boyy.unit_distance,
			hookupConnections: 3 + Math.floor(boyy.ge()*6),
			
			neuronThresholdAve: boyy.ge()*8,	//Base value
			neuronThresholdVar: boyy.ge(),		//Range of up and down between neurons

			connectRadiusWidth: boyy.ge(),
			connectRadiusHeight: boyy.ge(),
			connectRadiusOffset: boyy.ge()
		}
		

	}











	static express_gene_object_v1(boyy){
		let geo = boyy.geneObject

		
		let orderedUnits = [...boyy.layers[1]];//.slice();
		SmartBoy.shuffler(orderedUnits);

		//---
		//Order 1: Organize the order of connection forming
		//----------------

		//Random shuffle
		if(geo.hookupMode < 0.5){

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

		//Special addition of first input to the top layer
		let sq_mid = Math.floor(Math.sqrt(boyy.layers[1].length))
		for(let j = 0;j < sq_mid;j++){
			Neuron.Neuron_connect(boyy.layers[0][0], boyy.layers[1][j]);
		}
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
				//Normalize neuron threshold
				let neuToComputeAround = boyy.layers[1][i];
				neuToComputeAround.threshold = neuToComputeAround.incoming.length *
					geo.neuronThresholdAve;
			}
		}

	}







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

	///UTIL FUNCTIONS FOR SMART BOY V 5 (Ringcore)
	static connectCore(boyy, theGene){
		//Set the new 
		boyy.gene = theGene

		boyy.geReset()
		//Conf containts:
		/*
			{
				"coreGrowth": "from_inputs", (or "total_random")
				/////////////"coreWrap": false, (units in the core loop around)
				"coreRadius": 1.5, (multiply by one unit distance to get connection radius for a unit)
				"minFeedback": 1, (can not connect back on a unit)
				"coreConnections": 2, (each unit connects to two other units)
				"coreThreshold": 0.5 (connect maximum)
			}
		*/

		conf.coreWrap = false;

		let orderedUnits = [...boyy.layers[1]];//.slice();
		shuffler(orderedUnits);

		//Depending on the development pattern of this core
		//(Either originating from the inputs, or connections start growing from uniformly randomly picked locations)
		if(conf.coreGrowth === "from_random"){

		}
		else if(conf.coreGrowth === "from_input"){
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
							conf.coreRadius * boyy.unit_distance)
							{
								if(orderedList.indexOf(boyy.layers[1][j]) === -1)
									orderedList.push(boyy.layers[1][j]);
						}
					}
				}

			}while(deltaTrackedUnits !== boyy.layers[1].length && orderedList.length > 0);

			orderedUnits = orderedList;
		}
		
		

		//Units are connected randomly regardless of location
		//of signals on their way into the core
		//Edge units are not considered close to units on opposite edge
		if(conf.coreWrap === true){
			//Loop through every hidden neuron and hook em up
			for(let i = orderedUnits.length-1;i > -1 ;i--){

			}
		}
		//Cannot loop around to connect to other units on the opposite edge
		else if(conf.coreWrap === false){
			//for(let i = orderedUnits.length-1;i > -1 ;i--){   This order inverts the path building you developed
			for(let i = 0;i < orderedUnits.length;i++){
				//Get list of neurons within max pixel distance
				let neighbours = [];
				let neuToComputeAround = orderedUnits[i];
				for(let j = orderedUnits.length-1;j > -1 ;j--){
					if(i !== j){
						if(Math.hypot(neuToComputeAround.p5_x - orderedUnits[j].p5_x,
							neuToComputeAround.p5_y - orderedUnits[j].p5_y) 
							<
							conf.coreRadius * boyy.unit_distance){
								neighbours.push(orderedUnits[j]);
							}
					}
				}

				//Check if neighbours are at least 'conf.minFeedback' connections backward
				let layersBack = Math.floor(Math.max(1, conf.minFeedback + 0));//ALWAYS >= 1
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
				for(let j = 0;j < conf.coreConnections && neighbours.length > 0;j++){
					let conTo = neighbours.splice(
						Math.floor(OVERLORD_RAND.random()*neighbours.length), 1
					)[0];
					//if(!conTo) console.log("ERRRRRRRRRRRRRR");
					//if(neighbours.length < 1) console.log("YEP");
					Neuron.Neuron_connect(neuToComputeAround, conTo);
				}

				//Threshold recalibration
				//new_new_normalizeThresholds(boyy, conf.coreThreshold);
				for(let i = 0;i < boyy.layers[1].length;i++){
					//Normalize neuron threshold
					let neuToComputeAround = boyy.layers[1][i];
					neuToComputeAround.threshold = neuToComputeAround.incoming.length *
						conf.coreThreshold;
				}
			}
		}
	}


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
