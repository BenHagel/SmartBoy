class Neuron {
    constructor(temp_id, theNeuronDefaultDiam){
        this.id = temp_id;

        this.bias = 0.0;//OVERLORD_RAND.random()*2 - 1;
    
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
        this.p5_z = 0;
        this.p5_diam = p5_neuronDefaultDiam;// p5_neuronDefaultDiam;
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
                "r": Math.floor(OVERLORD_RAND.random()*145) + 100,
                "g": Math.floor(OVERLORD_RAND.random()*145) + 100,
                "b": Math.floor(OVERLORD_RAND.random()*145) + 100,
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