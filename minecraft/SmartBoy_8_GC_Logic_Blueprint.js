class SB8_LU{// Smartboy8_LogicUnit



////////////////////////////////////////////////////////////////////  
//////////////////////////////////////////////////////////////////// SB8 Agent.............. Generation + Operation
////////////////////////////////////////////////////////////////////

    // This sets "body_juice_types"
    static GET_AGENT_JUICE_TYPES(boy){
        let ALL_AGENT_JUICES = [];
        //                          squirt              decay                           stretchfactor of eqn    ghost valuechase
        let rewardJoos = new Juice(boy.rand.GET_GENE(), 0.9 + 0.1*boy.rand.GET_GENE(), boy.rand.GET_GENE()*3, 0.08*boy.rand.GET_GENE());
        rewardJoos.label = "reward_joos"
        rewardJoos.r = 120
        rewardJoos.g = 220
        rewardJoos.b = 100
        ALL_AGENT_JUICES.push(rewardJoos);

        let painJoos = new Juice(boy.rand.GET_GENE(), 0.9 + 0.1*boy.rand.GET_GENE(), boy.rand.GET_GENE()*3, 0.08*boy.rand.GET_GENE());
        painJoos.label = "pain_joos"
        painJoos.r = 166
        painJoos.g = 30
        painJoos.b = 40
        ALL_AGENT_JUICES.push(painJoos);

        let sleepJoos = new Juice(boy.rand.GET_GENE(), 0.9 + 0.1*boy.rand.GET_GENE(), boy.rand.GET_GENE()*3, 0.08*boy.rand.GET_GENE());
        sleepJoos.label = "eepy_joos"
        sleepJoos.r = 0
        sleepJoos.g = 0
        sleepJoos.b = 45
        ALL_AGENT_JUICES.push(sleepJoos);

        return ALL_AGENT_JUICES;
    }

    static GET_NUM_DIFFERENT_TYPES_LOBES(boy){
        return 1;// + Math.floor(boy.rand.GET_GENE() * 3);
    }

    static GET_INPUT_META_JUICE_TEMPLATES(boy){

    }

    static GET_INPUT_META_DEPTH_LENGTH(boy){
        return 4;
    }

    

    static GET_NEW_PU_TYPE(boy, lobeId){
        let minSize = Math.floor(boy.num_of_PUs / boy.pu_type_amt)
        let remainder = boy.num_of_PUs - (minSize * boy.pu_type_amt)

        let puType = {
            population: lobeId===0 ? minSize+remainder : minSize,

            // Connectivity
            cohesionOutputs_min: 3,
            //cohesionOutputs_weightRange: 1,       //TODO math.Round some here
            adhesionOutputs_min: 1,
            //adhesionOutputs_weightRange: 3,

            globalNudgePortion: 0.3,      // PU.NUDGE_UP_1(val, 0.3, fctor){

            // Decay rates for the big 4 juices
            postFireJuiceDecay: (1-boy.decVar) + (boy.decVar - 0.001*boy.decVar) * boy.rand.GET_GENE(), //0.9-0.999 decary rate)
            potentialDecay: (1-boy.decVar) + (boy.decVar - 0.001*boy.decVar) * boy.rand.GET_GENE(),

            // Called to massage every input
            input_NN: new StdNn(
                [   // state of whole organism      //input
                    boy.body_juice_types.length    + 1     , 
                    1
                ],
                boy.seed + 3131),

            // Called to massage weight Nudge
            weightadj_NN: new StdNn(
                [   // state of whole organism      //input //input meta
                    boy.body_juice_types.length    + 1     + boy.input_meta_depth, 
                    1
                ],
                boy.seed + 543),
            weightadj_FRQ: 2 + Math.floor(boy.rand.GET_GENE() * (boy.vanityFPS-2)),// 1 - 60

            // Threshold updates
            thresholdPerWeight: 0.15 + boy.rand.GET_GENE() * 1,
            thresholdadj_NN: new StdNn(
                [   // state of whole organism      //input //input meta
                    boy.body_juice_types.length    + 1     + boy.input_meta_depth, 
                    1
                ],
                boy.seed + 5143),
            thresholdadj_FRQ: 2,

            health: 1,

            PUs: []
        };

        // Add in the PU juice types
        puType.inputMetaJuices = [];
        for(let b = 0;b < boy.input_meta_depth;b++){
            let nuJuus = new Juice(boy.rand.GET_GENE(), 0.9 + 0.1*boy.rand.GET_GENE(), boy.rand.GET_GENE()*3, 0.08*boy.rand.GET_GENE());
            nuJuus.label = "im" + b;
            nuJuus.r = Math.floor(boy.rand.GET_GENE() * 255)
            nuJuus.g = Math.floor(boy.rand.GET_GENE() * 255)
            nuJuus.b = Math.floor(boy.rand.GET_GENE() * 255)
            puType.inputMetaJuices.push(nuJuus);
        }

        return puType;
    }





////////////////////////////////////////////////////////////////////  
//////////////////////////////////////////////////////////////////// Processing _ Unit.............. Generation + Operation
////////////////////////////////////////////////////////////////////


    static ADD_ATTRIBUTES_TO_PU(){

    }

    // This function must update the input to processing unit
    static ACCEPT_INPUT_TO_PU(pu, in_val){

    }

    static DECAY_PU_ATTRIBUTES(pu, iters){
        for(let i = 0;i < iters;i++){

            // The potential
            pu.potential *= pu.pu_bp.potentialDecay

            // The pulse juice
            pu.fireJuice *= pu.pu_bp.postFireJuiceDecay


        }

    }


}