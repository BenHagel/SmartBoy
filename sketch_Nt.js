/*
This smart boy is trained in an environment with rules that it must learn etc.
BUT^ this is necessary becuase the types of associations the smart boy MUST do
in order to even be called a smart boy system is interact with an environment 
in time

Minimum version of this environmet:
*Agent can OBSERVE _and_ INFLUENCE its environment
*Causal events and learnable patterns in second-second time frame

Things left to build:
1) Tool to build the environment's stream of inputs to show when reward / punishment should be given
	-This requires some kind of envionrment w the ability to convert itself into a bit stream
		to be given to the nn
	-Be able to input like an image and 

2) Neuro logical frameowrk for how new Neurons fire with the new neurotransmitter
	-List of all things that are governed by the StdNn and what neurotransmitters are deployed and when

3) Neuro placements of neurons
	-Square linear logical placement
	-Random scatterings of all
	-Square linear 
4) Creation of all this in al lpossible space by the genetic evo - determine the possible spaces

5) Tool to evaluate and rank, and geneetically evolve

6) Tool to evaluate current environemnt + test other environments?

*/
var canvasInstance;
//Neuron specifications
var p5_neuronApartDefaultOffset = 90;
var p5_networkOffsetX = 0;
var p5_networkOffsetY = 0;

//User controls
var heldNeuron = null;
var fireButtonHeldDown = false;
var heldNewPositionX = 0;
var heldNewPositionY = 0;
var leftShiftDown = false;
var startNeuronForNewConnection = null;

var animateTheVisualNetworkModel = true;

//Global randomizer
//Import "bundle.js" and the crypto helper
var OVERLORD_RAND;

//The specifications of the current agent being run
var Boy;
var Gen;

//Determines which mode the interface is in
//either: exact mode, or gene worker mode

var uiGeneMode = 0

//Reset whole smart boy
function resetWholeSmartBoy(){
	boy = new SmartBoy({
		"type": "smartboy",		//Smartboy
		"layers": [1, 25, 1],	//PU configuration (ins, hiddens, outs)
		"gene": null,	//values for all the god parameters required
	}, "test s e e d  _ 8123.../");
}


function setup(){
	createCanvas(600, 600);
	//createCanvas(600, 600, WEBGL);
	ellipseMode(CENTER);
	rectMode(CORNER);
	textAlign(CENTER, CENTER);
	noSmooth()
	frameRate(60);
	textSize(12);

	Util.infuseWithHashingPower(CHelper__B.hasher_256);

	OVERLORD_RAND = new CustomRandom("snxeakfddsdsdfy seed", CHelper__B.hasher_256);


	
	//Test the std nn
	let net = new StdNn({
		"layers": [3, 4, 1]//[2, 2, 1],//The layers of the  net work
	}, "randoseed1239&");
	console.log(net.activate([1,2,4]))

	resetWholeSmartBoy()
}

function loadUpDemoForCaseStudy(){

}

function draw(){

	if(uiGeneMode === 0){//Gene Mode
		background(7, 61, 132)

	}
	else if(uiGeneMode === 1){//Inspector Mode
		//background(30, 20, 20);
		background(119, 119, 24);
	}

	//Move selected neuron towards
	if(heldNeuron){
		heldNeuron.p5_x += (mouseX - heldNeuron.p5_x) / 14.00;
		heldNeuron.p5_y += (mouseY - heldNeuron.p5_y) / 14.00;
	}

	drawWeights();
	drawNexts();
	drawNeurons();

	//Is Shift down? Display where user is goin
	if(startNeuronForNewConnection){
		stroke(255);
		strokeWeight(1);
		line(startNeuronForNewConnection.p5_x, 
			startNeuronForNewConnection.p5_y, 
			mouseX, mouseY);
	}
	
}









///Functions to display the SMARTBOY_ringCore Architecure
//===================================================================================
//===================================================================================
//===================================================================================
function drawNeurons(){
	
	noStroke();
		
	
	//Draw the weights first
	for(let k = 0;k < boy.totalNeurons();k++){
		let n = boy.all_neurons[k];
		//Type of neuron
		if(n.p5_type === 0){
			fill(200);
			if(fireButtonHeldDown){
				fill(230, 23, 23);
			}
		}
		if(n.p5_type === 1){
			fill(200);
		}
		if(n.p5_type === 2){
			fill(200);
		}
		//if(startNeuronForNewConnection === n) stroke(255);
		//else noStroke();
		push();
			translate(n.p5_x, n.p5_y)
			circle(0, 0, n.p5_diam);
		pop();
		//Draw the times fired
		fill(10);
		//textSize(20)
		//text(n.potential.toFixed(1) + "/" + n.threshold.toFixed(1), n.p5_x, n.p5_y);
		//text(n.timesfired, n.p5_x, n.p5_y);
		//text(n.id, n.p5_x, n.p5_y);
	}
}

function drawWeights(){

	//push();
	strokeWeight(3);
	//Draw the weights first
	for(let k = 0;k < boy.totalNeurons();k++){
	    let n = boy.all_neurons[k];
	    //loop through the inpugs
	    let ins = n.incoming;
	    for(let h = 0;h < ins.length;h++){
		stroke(ins[h].r, ins[h].g, ins[h].b);
		fill(ins[h].r, ins[h].g, ins[h].b);
		line(
		    n.p5_x + ins[h].p5_offsetx, 
		    n.p5_y + ins[h].p5_offsety, 
		    ins[h].n.p5_x, 
		    ins[h].n.p5_y
		);
		drawArrow(
		    ins[h].n.p5_x, ins[h].n.p5_y,
		    createVector(
			n.p5_x + ins[h].p5_offsetx - ins[h].n.p5_x,
			n.p5_y + ins[h].p5_offsety - ins[h].n.p5_y,
		    ) 
		);
	    }
	}
	//pop();
}

function drawNexts(){
	fill(240);
	strokeWeight(2);
	for(let i = 0;i < boy.oracle.nexts.length;i++){

	    let vec = createVector(boy.oracle.nexts[i].o.p5_x - boy.oracle.nexts[i].f.p5_x,
		boy.oracle.nexts[i].o.p5_y - boy.oracle.nexts[i].f.p5_y);
	    
	    if(frameCount%10 > 5) stroke(255);
	    else noStroke();

	    line(
			boy.oracle.nexts[i].f.p5_x, boy.oracle.nexts[i].f.p5_y,
			boy.oracle.nexts[i].o.p5_x, boy.oracle.nexts[i].o.p5_y
	    );
	    
	    noStroke();
	    ellipse(
			boy.oracle.nexts[i].f.p5_x + (vec.x * (frameCount%45) / 45),
			boy.oracle.nexts[i].f.p5_y + (vec.y * (frameCount%45) / 45),
			4,
			4,
	    );
	    
	}
}




//Functions to display the SmartBoy_Nt architecture

//===================================================================================
function drawNtNeuron(){
	//not much differnt than the old draw neuron
}
function drawNtWeights(){
	//Draw the different values of nt
}
function drawCurrentTrainingSet(){

}






















//Logistics
//====================================================================
function stepNetworkAndFire(){
	let fireThePattern = [];
	try{
	    //fireThePattern = JSON.parse(document.getElementById("firePatternToFire").value);
		fireThePattern = [1];
	    boy.activate(fireThePattern);
	    boy.step();

	}
	catch(err){
	    console.log("Error firing:");
	    console.log(err);
	}
}























function drawArrow(xStart, yStart, vec) {
	push();
	    translate(xStart, yStart);
	    line(0, 0, vec.x, vec.y);
	    rotate(vec.heading());
	    let arrowSize = 7;
	    translate(vec.mag() - arrowSize, 0);
	    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
	pop();
}

function drawGraphOfActivity(arr, x, y, w, h){
	//[324, 234, 3]
	let min = Math.min(...arr);
	let max = Math.max(...arr);


	if(isNaN(min) || isNaN(max)) return;
	stroke(255);
	strokeWeight(1);
	textSize(32);
	fill(255);
	line(x, y, x, y + h);

	text(max.toFixed(1), x - 30, y);
	text(min.toFixed(1), x - 30, y + h);
	//console.log("in drawGraphOfActivity", arr);
	//No divide by zero errors
	if(max > 0){
	    let tempx = 0;
	    for(let k = Math.max(arr.length - 100, 0);k <arr.length;k++){
		//console.log( arr[k], max)
		var x1 = x + 1 + tempx*3;
		var y1 = y+h - (arr[k]/max)*h;
		ellipse(x1,  y1, 4, 4);
		tempx++;

	    }
	}


}

function keyReleased(){
	if(key === 'w'){
		moveUp = false;
	}
	if(key === 's'){
		moveDown = false;
	}
	if(keyCode === SHIFT){
	    leftShiftDown = false;
	}
	else if(key === "f"){
	    fireButtonHeldDown = false;
	}
}

//Drag and drop of neurons
function mousePressed(){
	for(let uu = 0;uu < boy.all_neurons.length;uu++){
	    if(Math.hypot(mouseX-boy.all_neurons[uu].p5_x, mouseY-boy.all_neurons[uu].p5_y) < boy.all_neurons[uu].p5_diam/2){
			//Mkaing a connection
			if(leftShiftDown){
				startNeuronForNewConnection = boy.all_neurons[uu];
			}
			else{
				heldNeuron = boy.all_neurons[uu];
			}
		
	    }
	}
}

function mouseReleased(){
	//Drop the neuron
	heldNeuron = null;

	//Check if successfully connecting to another neuron
	if(startNeuronForNewConnection){
	    //Loop through all neurons to find end neuron
	    for(let uu = 0;uu < boy.all_neurons.length;uu++){
			if(Math.hypot(mouseX-boy.all_neurons[uu].p5_x, mouseY-boy.all_neurons[uu].p5_y) < 
				boy.all_neurons[uu].p5_diam/2){
				Neuron.Neuron_connect(startNeuronForNewConnection, boy.all_neurons[uu]);
				break;
				
			}
	    }
	}

	//NO matter what if mouse released drop the new conneciotn
	startNeuronForNewConnection = null;
	//Make errors pretty again after move
	SmartBoy.new_recalWeightArrows(boy);
}
function windowResized() {
	//resizeCanvas(windowWidth, windowHeight);
}

function keyPressed(){
	if(key === 'w'){
		moveUp = true;
	}
	if(key === 's'){
		moveDown = true;
	}
	if(key === ' '){
		boy.step();
	}
	if(keyCode === SHIFT){
	    leftShiftDown = true;
	}
	else if(key === "f"){
	    fireButtonHeldDown = true;
		//console.log("leftShiftDown", leftShiftDown);
		//Shift add more cyccles
		if(true){
			for(let gg = 0;gg < 1;gg++) stepNetworkAndFire();
		}
		//Just fire once
		else{
			stepNetworkAndFire();
		}
	}
	
}


function drawPastScores(){
	for(let i = 0;i < Gen.trendField.length;i+=3){
		if(Gen.trendField[i].f > 0.9) fill(20, 200, 20);
		else if(Gen.trendField[i].f > 0.7) fill(130, 180, 20);
		else if(Gen.trendField[i].f > 0.5) fill(200, 200, 0);
		else fill(200, 100, 100);
		text("Generation: " + i + " : " + Gen.trendField[i].f, 
			30, 
			i * 30 + 50);
	}
}