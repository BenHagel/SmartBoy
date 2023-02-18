class PseudRand{
    constructor(seed){
        this.seed = seed
        this.modulus = 2 ** 32
        this.a = 1664525
        this.c = 1013904223
    }

    GET_GENE(){
        return this.random();
    }

    random(){
        let returnVal = this.seed / this.modulus
        this.seed = (this.a * this.seed + this.c) % this.modulus
        return returnVal
    }
}