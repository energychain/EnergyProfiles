var http = require('http');
var express = require("express");
var RED = require("node-red");
const fs = require("fs");
if(!fs.existsSync("./runtime/")) {
    fs.mkdirSync("./runtime/");
    fs.writeFileSync("./runtime/package.json",fs.readFileSync("./standalone_package.json"));
    fs.writeFileSync("./runtime/flows.json",fs.readFileSync("./standalone_flow.json"));
    var child_process = require('child_process');
    process.chdir('./runtime/');
    child_process.execSync('npm install',{stdio:[0,1,2]});
    process.chdir('..');
}
// Create an Express app
var app = express();

// Add a simple route for static content served from 'public'
app.use("/",express.static("./public"));
app.use("/flows.json",express.static("./runtime/flows.json"));
// Create a server
var server = http.createServer(app);

// Create the settings object - see default settings.js file for other options
var settings = {
    httpAdminRoot:"/red",
    httpNodeRoot: "/api",
    userDir:__dirname+"/runtime/",
    flowFile: './runtime/flows.json',
    functionGlobalContext: { }    // enables global context
};

// Initialise the runtime with a server and settings
RED.init(server,settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot,RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot,RED.httpNode);

server.listen(8000);

// Start the runtime
RED.start();