//Custom Random obj

//Requires Util.js, bundle.js hasher_256

class CustomRandom {

	constructor(newHash, sha3_256Link){
		this.hash = "@bonisdev"+newHash;
		this.runs = 0;
		this.precalced = [];
		this.precalcedCounter = -1;
		this.sha3_256Link = sha3_256Link;

		for(let p = 0;p < 100;p++){
			this.precalced.push(this.random());
		}
	}
	

	nextHash(){
		this.sha3_256Link.reset();
		this.hash = Util.toHexString(
			this.sha3_256Link.update(this.hash).digest()
		);
		return this.hash;
	}
	
	numFromHash(seed){
		const nBits = 52;
		seed = seed.slice(0, nBits / 4);
		const r = parseInt(seed, 16);
		let X = r / Math.pow(2, nBits); // uniformly distributed in [0; 1)
		return X;
	}

	random(){
		this.runs++;
		return this.numFromHash(this.nextHash());
	}

	random_pre(){
		this.precalcedCounter = 
			(this.precalcedCounter + 1) % 
			this.precalced.length;
		return this.precalced[this.precalcedCounter];
	}

	
}
