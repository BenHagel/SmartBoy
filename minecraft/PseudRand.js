class PseudRand{
    constructor(seed){
        this.seed = seed
        this.modulus = 2 ** 32
        this.a = 1664525
        this.c = 1013904223
        this.totalVals = []
    }

    GET_GENE(){
        let kk = this.random();
        this.totalVals.push(kk);
        return kk;
    }

    END_GENE(){
        return this.totalVals;
    }

    random(){
        let returnVal = this.seed / this.modulus
        this.seed = (this.a * this.seed + this.c) % this.modulus
        return returnVal
    }
}