/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */

var http = require('https');
var AlexaSkill = require('./AlexaSkill');

/*
 *
 * Particle is a child of AlexaSkill.
 *
 */
var Particle = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Particle.prototype = Object.create(AlexaSkill.prototype);
Particle.prototype.constructor = Particle;

Particle.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Particle onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
};

Particle.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("Particle onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the Particle Demo, you can ask me what is the temperature or humidity. You can also tell me to turn on Red or Green light.";
	
    response.ask(speechOutput);
};

Particle.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Particle onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
};

Particle.prototype.intentHandlers = {
    // register custom intent handlers
    ParticleIntent: function (intent, session, response) {
        var lightSlot = intent.slots.light;
        var onoffSlot = intent.slots.onoff;

        var light = "";
        var onoff = "";

        light = lightSlot ? intent.slots.light.value : "";
        onoff = onoffSlot ? intent.slots.onoff.value : "off";

        var speakText = "";

        console.log("Light = " + light);
        console.log("OnOff = " + onoff);

        var pin = "";
        var pinvalue = "";

        // Replace these with action device id and access token
        var deviceid = "410022000247363339343638";
        var accessToken = "bd3b676c56061a314c1f7d1d455258aab7f1c0c2";

        var sparkHst = "api.particle.io";

        console.log("Host = " + sparkHst);

        // Check slots and call appropriate Particle Functions

        if(light == "red"){
            pin = "D0";
        }
        else if(light == "green"){
            pin = "D1";
        }

        // User is asking to turn on/off lights
        if(pin.length > 0){
            //response.tell("Im here");
            if(onoff == "on"){
                pinvalue = "HIGH";

            }
            else{
                pinvalue = "LOW";
            }

            var sparkPath = "/v1/devices/" + deviceid + "/ctrlled";
            console.log("Path = " + sparkPath);

            var args = pin + "," + pinvalue;

            makeParticleRequest(sparkHst, sparkPath, args, accessToken, function(resp){
            var json = JSON.parse(resp);

            console.log("Temperature: " + json.return_value);

            response.ask("Continue?");
            });
            //response.tell(args);
        }
        else{
            response.tell("Sorry, I could not understand what you said");
        }

    },
    HelpIntent: function (intent, session, response) {
        response.ask("You can ask me what is the temperature or humidity. You can also tell me to turn on Red or Green light!");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Particle skill.
    var particleSkill = new Particle();
    particleSkill.execute(event, context);
};

function makeParticleRequest(hname, urlPath, args, accessToken, callback){
	// Particle API parameters
	var options = {
		hostname: hname,
		port: 443,
		path: urlPath,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': '*.*'
		}
	}
	
	var postData = "access_token=" + accessToken + "&" + "args=" + args;
	
	console.log("Post Data: " + postData);
	
	// Call Particle API
	var req = http.request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		
		var body = "";
		
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			
			body += chunk;
		});
		
		res.on('end', function () {
            callback(body);
        });
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	// write data to request body
	req.write(postData);
	req.end();
}