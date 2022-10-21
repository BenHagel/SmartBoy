class WhiteBoard {
    
    static ENT_LOGIC = {

    };
    
    constructor(seeed){
        this.seed = seeed;
    }

    reset(){
        this.rand = new PseudRand(seeed);
        this.framerate = 30;
        this.entities = [];
    }
}