function toHexString(byteArray) {
	return Array.prototype.map.call(byteArray, function(byte) {
		return ('0' + (byte & 0xFF).toString(16)).slice(-2);
	}).join('');
}

function toByteArray(hexString) {
	var result = [];
	while (hexString.length >= 2) {
		result.push(parseInt(hexString.substring(0, 2), 16));
		hexString = hexString.substring(2, hexString.length);
	}
	return result;
}

function sigmoid(x) {
	return 1/(1+Math.pow(Math.E, -x));
}
function sigmoid_der(x) {
	let y = sigmoid(x);
	return y * (1 - y);
}
//Custom Random obj
function CustomRandom(newHash, pregened){
	this.hash = "@bonisdev"+newHash;
	this.runs = 0;
	this.precalced = [];
	this.precalcedCounter = -1;

	this.nextHash = function(){
		CHelper__B.hasher.reset();
		this.hash = toHexString(
			CHelper__B.hasher.update(this.hash).digest()
		);
		return this.hash;
	};

	this.numFromHash = function(seed){
		const nBits = 52;
		seed = seed.slice(0, nBits / 4);
		const r = parseInt(seed, 16);
		let X = r / Math.pow(2, nBits); // uniformly distributed in [0; 1)
		return X;
	};

	this.random = function(){
		this.runs++;
		return this.numFromHash(this.nextHash());
	};

	this.random_pre = function(){
		this.precalcedCounter =
			(this.precalcedCounter + 1) %
			this.precalced.length;
		return this.precalced[this.precalcedCounter];
	};

	if(pregened){
		for(let p = 0;p < pregened;p++){
			this.precalced.push(this.random());
		}
	}else{
		for(let p = 0;p < 1;p++){
			this.precalced.push(this.random());
		}
	}

}
