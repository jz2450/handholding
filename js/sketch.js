// var socket = io.connect('http://167.71.16.202/');
var socket = io.connect('https://jz2450.itp.io/');
					
socket.on('connect', function() {
	console.log("Connected, your socket id is: "+socket.id);
});   

socket.on('disconnected', function(socketId) {
	console.log(socketId+" was disconnected");
	deleteHand(socketId);
});

socket.on('w3mouse', function(data) {  
	console.log(data);
	if (data.handId in otherHands) {
		updateHand(data.handId, data.x, data.y);
		console.log('hand '+data.handId+' updated')
	} else {
		createHand(data.handId, data.x, data.y);
		console.log('hand '+data.handId+' created');
	}
});

function updateHand(handId, newX, newY) {
	otherHands[handId].x = newX;
	otherHands[handId].y = newY;
}

function createHand(handId, newX, newY) {
	let handCoords = {
		x: newX,
		y: newY
	}
	otherHands[handId] = handCoords;
}

function deleteHand(handId) {
	if (handId in otherHands) {
		delete otherHands[handId];
		console.log('hand '+handId+' deleted')
	} else {
		console.log('could not find hand '+handId+' to delete, maybe disconnected before first touch');
	}
}

var openhandimg, holdinghandimg;
var handSize = 30;
var otherHands = {};

function preload() {
	openhandimg = loadImage("/w3-handholding/assets/openhand.png");
	holdinghandimg = loadImage("/w3-handholding/assets/holdinghands.png");
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	openhandimg.loadPixels();
	holdinghandimg.loadPixels();
}

function draw() {
	background('#00807F');
	drawDialog();
	if (otherHands) {
		let rankedHandCloseness = getSortedArrayOfHandsByDistance();
		// let singleHands = [];
		let coupledHands = [];
		rankedHandCloseness.forEach((handCombo) => {
			if (handCombo.dist < 30) {
				coupledHands.push(handCombo.firsthand);
				coupledHands.push(handCombo.secondhand);
				image(holdinghandimg, handCombo.midX, handCombo.midY, handSize, handSize);
			}
		});

		let uniqueSingleHands = Object.keys(otherHands).filter(function(el) {
			return !coupledHands.includes(el);
		});
		if (!coupledHands.includes("thisHand")) {
			uniqueSingleHands.push("thisHand");
		}

		uniqueSingleHands.forEach(singleHand => {
			if (singleHand == "thisHand") {
				image(openhandimg, mouseX, mouseY, handSize, handSize);
			} else {
				image(openhandimg, otherHands[singleHand].x, otherHands[singleHand].y, handSize, handSize);
			}
		});
	} else {
		image(openhandimg, mouseX, mouseY, handSize, handSize);
	}
}

function getSortedArrayOfHandsByDistance() {
	let handDistances = [];
	let numberOfHands = Object.keys(otherHands).length;
	// compare other hands with other hands
	for (var i = 0; i < numberOfHands-1; i++) {
		for (var j = i+1; j < numberOfHands; j++) {
			let firsthand = otherHands[Object.keys(otherHands)[i]];
			let secondhand = otherHands[Object.keys(otherHands)[j]];
			let dist = getDistance(firsthand.x, firsthand.y, secondhand.x, secondhand.y);
			let distLog = {
				firsthand: Object.keys(otherHands)[i],
				secondhand: Object.keys(otherHands)[j],
				dist: dist,
				midX: (firsthand.x + secondhand.x)/2,
				midY: (firsthand.y + secondhand.y)/2
			}
			handDistances.push(distLog);
		}
	}
	// compare all with self
	for (var i = 0; i < numberOfHands; i++) {
		let secondhand = otherHands[Object.keys(otherHands)[i]];
		let dist = getDistance(secondhand.x, secondhand.y, mouseX, mouseY);
		let distLog = {
			firsthand: "thisHand",
			secondhand: Object.keys(otherHands)[i],
			dist: dist,
			midX: (mouseX + secondhand.x)/2,
			midY: (mouseY + secondhand.y)/2
		}
		handDistances.push(distLog);
	}

	// handDistances = sortByKey(handDistances, dist);
	// https://www.scaler.com/topics/javascript-sort-an-array-of-objects/
	let sortedHandDistances = handDistances.sort(
		(h1, h2) => (h1.dist > h2.dist) ? 1 : (h1.dist < h2.dist) ? -1 : 0);
	
	return sortedHandDistances;
}

function drawDialog() {
	fill('#c2c6ca');
	rect(20,20,265,118);
	fill('#00a');
	rect(22,22,261,20);
	textFont('Microsoft Sans Serif');
	fill('white');
	text('w3-handholding',30,37);
	fill('black');
	text("Welcome to the hand-holding space.",50,80);
	fill('black');
	text("(best enjoyed with friends",50,100);
	text("and a mouse/trackpad)",50,120);
	
}

function mouseMoved() {
	var datatosend = {
		x: mouseX,
		y: mouseY
	}
	// otherHands.thisUser = datatosend
	socket.emit('w3mouse', datatosend);
}

function touchStarted() {
	var datatosend = {
		x: mouseX,
		y: mouseY
	}
	// otherHands.thisUser = datatosend
	socket.emit('w3mouse', datatosend);
}

// helper functions

function getDistance(x1, y1, x2, y2) {
  let y = x2 - x1;
  let x = y2 - y1;

  return Math.sqrt(x * x + y * y);
}
