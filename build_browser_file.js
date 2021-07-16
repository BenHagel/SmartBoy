var fs = require("fs");

var outputFile = "./browser_smart_boy.js";

var outputContents = "//Smart Boy - ready for browser\n\n//Built at:" + Date.now();

outputContents += "\n\n"+fs.readFileSync("./bundle.js");
outputContents += "\n\n"+fs.readFileSync("src/CustomRandom.js");
outputContents += "\n\n"+fs.readFileSync("src/GeneticEvo.js");
outputContents += "\n\n"+fs.readFileSync("src/Neuron.js");
outputContents += "\n\n"+fs.readFileSync("src/SmartBoy_5_Ringcore.js");
outputContents += "\n\n"+fs.readFileSync("src/Util.js");
outputContents += "\n\n"+fs.readFileSync("src/World.js");

console.log("writing file with", outputContents.length, "chars")
fs.writeFileSync(outputFile, outputContents);