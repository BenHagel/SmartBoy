class SB8_LU{// Smartboy8_LogicUnit



////////////////////////////////////////////////////////////////////  
//////////////////////////////////////////////////////////////////// SB8 Agent.............. Generation + Operation
////////////////////////////////////////////////////////////////////

    // This sets "body_juice_types"
    static GET_AGENT_JUICE_TYPES(boy){
        return [
            {
                label: "reward_joos",
                val: 0, 
                decay: (1-boy.decVar) + (boy.decVar - 0.001*boy.decVar) * boy.rand.GET_GENE()
            },

            //     Pain juice
            {
                label: "pain_joos",
                val: 0, 
                decay: (1-boy.decVar) + (boy.decVar - 0.001*boy.decVar) * boy.rand.GET_GENE()
            },

            //     Sleepy juice
            {
                label: "sleepy_joos",
                val: 0, 
                decay: (1-boy.decVar) + (boy.decVar - 0.001*boy.decVar) * boy.rand.GET_GENE()
            }
        ];
    }

    static GET_NUM_DIFFERENT_TYPES_LOBES(boy){
        return 1 + Math.floor(boy.rand.GET_GENE() * 3);
    }

    static GET_INPUT_META_DEPTH_LENGTH(boy){
        return 9;
    }

    static GET_NEW_PU_TYPE(boy, lobeId){
        let minSize = Math.floor(boy.num_of_PUs / boy.pu_type_amt)
        let remainder = boy.num_of_PUs - (minSize * boy.pu_type_amt)

        let puType = {
            population: lobeId===0 ? minSize+remainder : minSize,

            // Connectivity
            cohesionOutputs_min: 2,
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
                    boy.body_juice_types.length    + 1     + boy.input_meta.length, 
                    1
                ],
                boy.seed + 543),
            weightadj_FRQ: 2 + Math.floor(boy.rand.GET_GENE() * (boy.vanityFPS-2)),// 1 - 60

            // Threshold updates
            thresholdPerWeight: 0.15 + boy.rand.GET_GENE() * 1,
            thresholdadj_NN: new StdNn(
                [   // state of whole organism      //input //input meta
                    boy.body_juice_types.length    + 1     + boy.input_meta.length, 
                    1
                ],
                boy.seed + 5143),
            thresholdadj_FRQ: 2,

            health: 1,

            PUs: []
        };

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