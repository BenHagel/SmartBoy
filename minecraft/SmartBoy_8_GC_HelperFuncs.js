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


















// A slider between 0, and 1
// new Slider(0.5, 1/2)
class Slider {
    static up(sld, fctor){
        sld.potential += (1 - sld.potential) * sld.portion * fctor
    }
    static down(sld, fctor){
        sld.potential -= sld.potential * sld.portion * fctor
    }
    constructor(potential, portion){
        this.potential = potential;
        this.portion = portion
    }
}

















// A new juice object responsible for producing 
// and decaying a juice value + keeping its ghost potentials
class Juice {
    static squirt(joos){
        joos.potential += joos.squirt;
    }
    static update(joos){
        joos.potential *= joos.decay
        joos.juice_concentration = Juice.juiceFuncX(joos.potential, joos.stretch);

        //Get the ghost concentration to chase the actual joos concentration
        joos.ghost_concentration += 
            (joos.juice_concentration - joos.ghost_concentration) * joos.ghost_chase;
    }
    static juiceFuncX(xVal, stretchFactor){// will only be larger than 'x'
        return 2 * (1 / (1 + Math.exp(-(xVal*stretchFactor)))) - 1;
    }
    static getGhostDelta(joos){
        return joos.juice_concentration - joos.ghost_concentration;
    }

    static copyJoos(joosToCopy){
        let nuJoos = new Juice(0, 0, 0, 0);
        nuJoos.label = "" + joosToCopy.label + " Copy";
        nuJoos.r = joosToCopy.r;
        nuJoos.g = joosToCopy.g;
        nuJoos.b = joosToCopy.b;

        nuJoos.potential = joosToCopy.potential;
        nuJoos.juice_concentration = joosToCopy.juice_concentration;
        nuJoos.ghost_concentration = joosToCopy.ghost_concentration;

        nuJoos.squirt = joosToCopy.squirt;
        nuJoos.decay = joosToCopy.decay;
        nuJoos.stretch = joosToCopy.stretch;
        nuJoos.ghost_chase = joosToCopy.ghost_chase;

        return nuJoos;
    }

    constructor(squirt, decay, stretch, ghost_chase){
        this.label="default_label";
        this.r = 255;
        this.g = 255;
        this.b = 255;

        this.potential = 0;
        this.juice_concentration = 0;//f(x)
        this.ghost_concentration = 0;

        this.squirt = squirt;
        this.decay = decay;
        this.stretch = stretch;
        this.ghost_chase = ghost_chase;

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

    static GET_INPUT_META_JUICES_FROM_PU_TYPE(pu){
        let pu_bp = pu.pu_bp;
        let juiceInstances = [];
        for(let h = 0;h < pu_bp.inputMetaJuices.length;h++){
            juiceInstances.push(
                Juice.copyJoos(pu_bp.inputMetaJuices[h])
            );
        }

        return juiceInstances;
    }

    // Constructor
    constructor(from, to, weight){
        this.from = from;
        this.to = to;
        this.weight = weight;

        this.input_meta_juices = Bond.GET_INPUT_META_JUICES_FROM_PU_TYPE(this.to);

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
        SB8_LU.DECAY_PU_ATTRIBUTES(pu, indexDifference)


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
    static STEP_PU_as_whole_grid_update(pu){
        // Receive all the inputs (added into potential)

        let boy = pu.bf;

        // Decay differences (needs to be done before processing the inputs, 
        // otherwise it is skipping time (would cause jumps/jiter between signals cause lots of time could have passed))
        let indexDifference = boy.oracle.timeindex - pu.lastObserved
        //
        SB8_LU.DECAY_PU_ATTRIBUTES(pu, indexDifference)


        // TODO sum up all the inbox bonds, and their associated input meta

        // At wf%T===0 --->

        // list of inboxes to process
        for(let i = 0;i < pu.inbox_g.length;i++){
            pu.potential += pu.inbox_g[i].value * pu.inbox_g[i].bond.weight;

            //TODO update bonds' juice metas....  input_meta_juices all that shit
        }

        // If this PU will fire
        if(pu.potential >= pu.threshold){

            //Send nexts out (if threshold)
            for(let i = 0;i < pu.out_bonds.length;i++){
                pu.outbox_g.push(
                    new Nexter(pu.out_bonds[i], 1)
                );
            }

            pu.potential = 0;
            pu.fireJuice = 1;
        }



        // Clear inbox cause just dealt w all of it
        pu.inbox_g = [];
        

        pu.lastObserved = boy.oracle.timeindex;



    }

    static STEP_PU_transfer_outboxes_to_in(pu){
        // Receive all the inputs (added into potential)

        for(let i = 0;i <pu.outbox_g.length;i++){
            pu.outbox_g[i].bond.to.inbox_g.push(
                pu.outbox_g[i]
            );

        }

        pu.outbox_g = [];



    }
    

    constructor(boyRef, boyInd){
        this.bf = boyRef;// Refernce to the boy
        this.bi = boyInd;
        this.lastObserved = 0;//this.bf.oracle.timeindex;
        //this.physX = 
        this.id = PU.CURR_ID;
        PU.CURR_ID++;

        this.pu_bp = this.bf.pu_types[boyInd];//Processiong Unit blueprint

        this.inbox_g = [];
        this.outbox_g = []; //_g for entire grid update architecture

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

