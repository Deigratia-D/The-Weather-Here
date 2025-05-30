// Weather Here app example from Daniel Shiffman's thecodingtrain.com and Daniel uses Joey Lee's example.

// This line of code is for using global variables between scripts with node.js. ./public/weather.js is where the variable exists.

require("dotenv").config();
const express = require("express");
const fs = require("fs");
const Datastore = require("@seald-io/nedb");
const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Starting server at ${port}.`));
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

const options = {
	filename: "datab.db",
};
const db = new Datastore(options);
db.loadDatabase();

app.get("/api", (request, response) => {
	db.find({}, (err, data) => {
		if (err) {
			response.end();
			return;
		}
		response.json(data);
	});
});

// Request data from a server.
app.get("/weat/:latlon", async (request, response) => {
	const latlon = request.params.latlon.split(",");
	const lat = latlon[0];
	const lon = latlon[1];

	// Use this url to find the location key from accuweather.com. Example for Lake, Nona is "Key": "3593298"
	const geo_url = `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=tbwoyZ9iZLr7NPXwYwJyLAgECv1UDG0u&q=${lat}%2C${lon}`;
	const geo_response = await fetch(geo_url);
	const geo_data = await geo_response.json();

	// Use this url for current weather from accuweather.com.
	const weather_url = `http://dataservice.accuweather.com/currentconditions/v1/${geo_data.Key}?apikey=tbwoyZ9iZLr7NPXwYwJyLAgECv1UDG0u`;
	const weather_response = await fetch(weather_url);
	const weather_data = await weather_response.json();

	// Use this url for Air Quality from openaq.org

	const api_key = process.env.API_KEY;

	const options = {
		headers: {
			"X-API-Key": api_key,
		},
	};
	// Use this URL to get the closest location_id to the users current location and use that id to get the lastest data from that location_id.
	const aqLoc_url = `https://api.openaq.org/v3/locations?coordinates=${lat},${lon}&radius=25000&limit=1`;
	const aqLoc_response = await fetch(aqLoc_url, options);
	const aqLoc_data = await aqLoc_response.json();

	// Use this URL to get the air quality data about the location that was found.
	const aq_url = `https://api.openaq.org/v3/locations/${aqLoc_data.results[0].id}/latest`;
	const aq_response = await fetch(aq_url, options);
	const aq_data = await aq_response.json();

	const data = {
		geo: geo_data,
		weather: weather_data,
		aqLoc: aqLoc_data,
		aq: aq_data,
	};

	response.json(data);
});

// This code is to post a request to a server then the server responds with what the request asks for.
app.post("/weatdata", (request, response) => {
	console.log("Posting incoming.");
	const data = request.body;
	console.log(data);
	const timestamp = Date.now();
	data.timestamp = timestamp;
	db.insert(data);
	response.json(data);
});
