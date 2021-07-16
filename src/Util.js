class Util {

	static hashingAbility

	static infuseWithHashingPower(hasher){
		Util.hashingAbility = hasher
	}

	static toHexString(byteArray) {
		return Array.prototype.map.call(byteArray, function(byte) {
			return ('0' + (byte & 0xFF).toString(16)).slice(-2);
		}).join('');
	}
	
	static toByteArray(hexString) {
		var result = [];
		while (hexString.length >= 2) {
			result.push(parseInt(hexString.substring(0, 2), 16));
			hexString = hexString.substring(2, hexString.length);
		}
		return result;
	}

	static sigmoid(x) {
		return 1/(1+Math.pow(Math.E, -x));
	}

	static sigmoid_der(x) {
		let y = sigmoid(x);
		return y * (1 - y);
	}
	
	static relu(x){
		return Math.abs(x);
	}
}