class Environment{

    
    // Called ~60 times per second
    static stepConsciousness(boy, env){

        // Get what the agent is supposed to see based on on the environment
        let agentView = env.getConsciousView()
        // Propogate the agent view + existing signals 
        boy.step(agentView, "isThiSWholeGridUpdate");

        // Consciousness first
        for(let i = 0;i < env.fpd;i++) env.step();
    }


    constructor(seed){

        this.seed = seed
        this.rand = new PseudRand( this.seed);

        this.timeIndex = 0

        // Env frames between agent
        this.fpd = 1


        //current coursesteps:
        this.currentCourse = this.generateCourse(0)

        this.sunHeight = 0;

    }

    refreshSunHeight(){
        this.sunHeight = 0.5 * Math.sin(this.timeIndex/1400 - Math.PI/2) + 0.5
    }

    step(){
        this.timeIndex++;
        this.refreshSunHeight()

    }

    getConsciousView(){

        if(this.sunHeight > 0.5){
            return [
                0.2 + this.rand.random()*(this.sunHeight-0.3),
                0.2 + this.rand.random()*(this.sunHeight-0.3), 
                0.2 + this.rand.random()*(this.sunHeight-0.3), 
                0.2 + this.rand.random()*(this.sunHeight-0.3)
            ];
        }
        else{
            return [
                0, 
                0, 
                0, 
                0
            ];
        }
        
    }

    generateCourse(diff){
        // Generate the four puzzles
        let trainingDays = 4
        let puzzs = new Array(trainingDays)
        for(let t = 0;t < puzzs.length;t++){
            puzzs[t] = this.generatePuzzle(diff)
        }
        
        // Generate the training days
        return {
            agtFrame: 0,
            envFrame: 0,
            puzzles: puzzs
        }

    }

    generatePuzzle(difficulty){
        let ins = new Array(4)
        for(let i = 0;i < ins.length;i++) 
            ins[i] = 1 + Math.floor(99 * this.rand.random())

        return {
            question: ins, 
            answer: [
                1 + Math.floor(99 * this.rand.random())
            ]
        }
    }

    environmentSet(){

    }

}