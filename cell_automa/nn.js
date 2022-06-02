
function DaModel(model_properties){
	//Custom random
	this.cr = new CustomRandom("legatus salt" + "a", 3666);
	let st = "";
	for(let g = 0;g < 10;g++){
		st += "," + this.cr.random();
	}
	//console.log(st);
	//Needed?
	//this.input_bias = new Array(model_properties.neural_structure[0]);
	//for(let ff = 0;ff < this.input_bias.length;ff++) this.input_bias[ff] = 0.1 + 0.9*this.cr.random_pre();
	this.sig = function(x){return (1 / (1 + Math.exp(-x)));};
	this.sig_d = function(x){let v = this.sig(x); return v*(1-v);}
	this.rel = function(x){if(x < 0) return 0; return x;};
	this.lr = 0.547173;
	this.lr_amp =  0.09;
	this.lr_base = 0.2;
	this.lr_slowener = 0.0001;
	this.iter = 0;
	
	//Perceptron scaffolding
	this.layers = new Array(model_properties.layers.length-1);	//all the weights
	this.layers_c = new Array(model_properties.layers.length-1);	//all the weights - delta
	this.bias = new Array(model_properties.layers.length-1);		//just the one bias per neuron
	this.bias_c = new Array(model_properties.layers.length-1);	//just the one bias per neuron - delta
	this.outs = new Array(model_properties.layers.length-1);		//just the one output per neuron
	this.errs = new Array(model_properties.layers.length-1);		//just the one error per neuron
	this.nets = new Array(model_properties.layers.length-1);		//just the one net intake per neuron
	this.param_count = 0;
	this.lastInput = [];
	
	let bb = 0;
	for(let i = model_properties.layers.length-1;i > 0;i--){
		//Neurons in the layer
		let neuronss = new Array(model_properties.layers[i]);
		let neuronss_c = new Array(model_properties.layers[i]);
		let biass = new Array(model_properties.layers[i]);
		let biass_c = new Array(model_properties.layers[i]);
		let outss = new Array(model_properties.layers[i]);
		let errss = new Array(model_properties.layers[i]);
		let netss = new Array(model_properties.layers[i]);
		//Make weights of size of previous layer
		for(let j = 0;j < neuronss.length;j++){

			let wts = new Array(model_properties.layers[i-1]);
			let wts_c = new Array(model_properties.layers[i-1]);

			for(let k = 0;k < wts.length;k++){
				wts[k] = this.cr.random_pre()*2-1;
				wts_c[k] = 0.0;
				bb++;
			}
			neuronss[j] = wts;
			neuronss_c[j] = wts_c;
			
			biass[j] = this.cr.random_pre();
			bb++;
			biass_c[j] = 0;
			outss[j] = 0;
			errss[j] = 0;
			netss[j] = 0;
		}

		this.layers[i-1] = neuronss;
		this.layers_c[i-1] = neuronss_c;
		this.bias[i-1] = biass;
		this.bias_c[i-1] = biass_c;
		this.outs[i-1] = outss;
		this.errs[i-1] = errss;
		this.nets[i-1] = netss;
	}
	
	this.param_count = bb;

	this.activate = (ins) => {
		//Record most recent input
		let newActivation = new Array(ins.length);
		for(let hh = 0;hh < newActivation.length;hh++) newActivation[hh] = ins[hh];
		this.lastInput = newActivation;

		//Get to work on computing
		let vals = ins;
		for(let i = 0;i < this.layers.length;i++){
			let outs = new Array(this.layers[i].length);
			let nets = new Array(this.layers[i].length);
			for(let j = 0;j < outs.length;j++){
				let sum = 0;// + i===0 ? this.input_bias[j] : 0;
				for(let k = 0;k < this.layers[i][j].length;k++){
					sum += this.layers[i][j][k] * vals[k];
				}
				outs[j] = this.sig(sum + this.bias[i][j]);//Math.max(0, sum);
				nets[j] = sum;
				this.outs[i][j] = outs[j];
				this.nets[i][j] = nets[j];
			}
			vals = outs;
		}
		return vals;
	};

	this.bakp = (target) => {

		this.lr = 0.13;//this.lr_base + this.lr_amp*Math.sin(this.lr_slowener*this.iter);
		this.iter++;

		let E_TOTAL = 0;
		let lastLayer = this.layers.length-1;
		if(target.length !== this.outs[lastLayer].length){console.log("ERRR, wrong target size");return;}
		
		//TOTAL ERROR
		for(let i = 0;i < this.outs[lastLayer].length;i++){
			E_TOTAL += 0.5*Math.pow(target[i] - this.outs[lastLayer][i], 2);
		}

		//OUTPUT LAYER - Error for the first set of weights (the last weights in the network)
		//Each Neuron
		for(let i = 0;i < this.layers[lastLayer].length;i++){
			//Each Weight 
			for(let j = 0;j < this.layers[lastLayer][i].length;j++){
				let deltaRuleForThisWeight = 
					-(target[i] - this.outs[lastLayer][i]) *
					(this.outs[lastLayer][i] * (1 - this.outs[lastLayer][i])) *
					(this.outs[lastLayer-1][j])//eWRTout * outWRTnet * netWRTw;

				this.layers_c[lastLayer][i][j] = deltaRuleForThisWeight
			}
			//Save dE/dW
			this.errs[lastLayer][i] = (this.outs[lastLayer][i] - target[i]);

			//Error recording for the bias
			//let biasDelta = 0.0;
			for(let j = 0;j < this.bias[lastLayer].length;j++){
				this.bias_c[lastLayer][j] = 
					-(target[i] - this.outs[lastLayer][i]) *
					(this.outs[lastLayer][i] * (1 - this.outs[lastLayer][i])) * (1);
			}
		}

		//Each layer before output
		for(let i = this.layers.length-2;i > -1;i--){
			//Each Neuron
			for(let j = 0;j < this.layers[i].length;j++){

				//Add up error from layer infront
				let dEdH = 0.0;
				//Each Neuron (in next layer forwward)
				for(let g = 0;g < this.layers[i+1].length;g++){
					dEdH +=	this.errs[i+1][g] * 
							(this.outs[i+1][g] * (1.0 - this.outs[i+1][g])) *
							this.layers[i+1][g][j];//(%%TRICKY_PART%%)
							//get weight of incoming signal of neuron in the 'j' loop
				}

				//Set the error for this neuron for the next pass
				this.errs[i][j] = dEdH;

				//If first layer
				if(i === 0){
					//Each weight on Neuron
					for(let k = 0;k < this.layers[0][j].length;k++){
						//Full error adjustment for this one
						this.layers_c[0][j][k] = dEdH *
							(this.outs[0][j] * (1 - this.outs[0][j])) *
							(this.lastInput[k]);
					}
				}
				//Each weight on Neuron
				else{
					for(let k = 0;k < this.layers[i][j].length;k++){
						//Full error adjustment for this one
						this.layers_c[i][j][k] = dEdH *
							(this.outs[i][j] * (1 - this.outs[i][j])) *
							(this.outs[i-1][k]);
					}
				}

				//Update the biases
				this.bias_c[i][j] = this.errs[i][j] * this.bias[i][j];
			}
		}

		//Finally update all the weights
		for(let i = 0;i < this.layers.length;i++){
			for(let j = 0;j < this.layers[i].length;j++){
				for(let k = 0;k < this.layers[i][j].length;k++){
					this.layers[i][j][k] -= this.lr * this.layers_c[i][j][k];
				}
				this.bias[i][j] -= this.lr * this.bias_c[i][j];
			}
		}

		return E_TOTAL;
	};

	this.getSolnString = function(){
		let comp = "";
		for(let i = 0;i < this.layers.length;i++){
			for(let j = 0;j < this.layers[i].length;j++){
				comp += ":" + this.layers[i][j] + "|" + this.bias[i][j];
			}
		}
		return comp;
	};

	this.print = () => {
		console.log("======", this.layers.length)
		for(let i = 0;i < this.layers.length;i++){
			console.log("layer', ", i);
			for(let j = 0;j < this.layers[i].length;j++){
				console.log(j, " -length", this.layers[i][j].length, " ::: " , JSON.stringify(this.layers[i][j]));
			}
		}
	};
}

function PatternInterpreter(master_grid, blockRadius){

    
    //Observation radius
    this.observationRadius = blockRadius

    //Object per master grid
    this.getNewMetaDataObject = () => {
        let mdd = {}
        mdd.mask = new Array(this.observationRadius)
        for(let v = 0;v < mdd.mask.length;v++){
            mdd.mask[v] = new Array(this.observationRadius)
            for(let vv = 0;vv < mdd.mask[v].length;vv++){
                mdd.mask[v][vv] = 0
            }
        }
        return mdd
    }

    this.mg = new Array(master_grid.length);
    for(let i = 0;i < this.mg.length;i++){
      this.mg[i] = new Array(this.mg.length);
      for(let j = 0;j < this.mg[i].length;j++){
        this.mg[i][j] = this.getNewMetaDataObject();//master_grid[i][j]
      }
    }

    //ANalyze or train for each cell i guess fuck
    this.analyzeOrTrain = () => {
        for(let i = this.observationRadius;i < this.mg.length-this.observationRadius;i++){
            for(let j = this.observationRadius;j < this.mg[i].length-this.observationRadius;j++){

                this.mg[i][j] = this.getNewMetaDataObject()//ds
            }
        }
    };

    this.getCell = (xx, yy) => {

    }
}