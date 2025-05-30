// This is for using global variables between scripts with node.js. ../sketch.js is where the second part of this global variable sharing exists.

function setup() {
	noCanvas();

	// Header.
	const h1 = document.createElement("h1");
	h1.innerText = "Weather Here Application";
	document.body.append(h1);

	// Paragraph 1.
	const p1 = document.createElement("p");
	p1.id = "allData";
	p1.innerText = "Data will appear here.";
	document.body.append(p1);

	const anchor1 = document.createElement("a");
	anchor1.setAttribute("href", "/index.html");
	anchor1.textContent = "Home";
	document.body.append(anchor1);

	const div2 = document.createElement("div");
	div2.id = "submit";
	document.body.append(div2);

	const button1 = document.createElement("button");
	button1.id = "geolocate";
	button1.textContent = "Submit";
	document.body.append(button1);

	const div3 = document.createElement("div");
	div3.id = "logs";
	document.body.append(div3);

	const anchor2 = document.createElement("a");
	anchor2.setAttribute("href", "/logs/index.html");
	anchor2.textContent = "Logs.";
	div2.append(anchor2);

	// Map creation and configuration.
	const h2 = document.createElement("h2");
	h2.innerText = "Weather data plotted on a Map.";
	document.body.append(h2);

	const div4 = document.createElement("div");
	div4.id = "mapWeather";
	document.body.append(div4);

	// Making a map and tiles.
	const map = L.map("mapWeather").setView([0, 0], 1);
	const attribution =
		"© <a href='https://www.openstreetmap.org/copyright'> OpenStreetMap</a> contributors";

	const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
	const tiles = L.tileLayer(tileUrl, { attribution });
	tiles.addTo(map);

	async function getData() {
		const response = await fetch("/api");
		const data = await response.json();

		for (let item of data) {
			const marker = L.marker([item.lat, item.lon]).addTo(map);

			const txt = `Your Latitude: ${item.lat}°\n
				Your Longitude: ${item.lon}°\n
				The weather summary is: ${item.weather[0].WeatherText}\n
				The temperature is: ${item.weather[0].Temperature.Metric.Value}° Celsius\n
				Sensor Latitude: ${item.airQuality.results[0].coordinates.latitude}°\n
				Sensor Longitude: ${item.airQuality.results[0].coordinates.longitude}°\n
				Distance from your location: ${item.airQualityLoc.results[0].distance} in KM.\n
				Air Quality Value: ${item.airQuality.results[0].value} (${item.airQualityLoc.results[0].sensors[0].parameter.name}) in ${item.airQualityLoc.results[0].sensors[0].parameter.units} units.`;

			marker.bindPopup(txt);
		}
	}

	getData();

	document.getElementById("geolocate").addEventListener("click", (event) => {
		if ("geolocation" in navigator) {
			console.log("Geolocation is Available.");
			navigator.geolocation.getCurrentPosition(async (position) => {
				const lat = position.coords.latitude;
				const lon = position.coords.longitude;
				const get_url = `/weat/${lat},${lon}`;
				const response = await fetch(get_url);
				const json = await response.json();
				console.log(json);
				const weather = json.weather;
				const airQualityLoc = json.aqLoc;
				const airQuality = json.aq;

				// WeatherText for Summary. Temperature/Metric/Value for degrees celcius.
				document.getElementById(
					"allData"
				).innerText = `Your Latitude: ${lat}°\n
				Your Longitude: ${lon}°\n
				The weather summary is: ${json.weather[0].WeatherText}\n
				The temperature is: ${json.weather[0].Temperature.Metric.Value}° Celsius\n
				Sensor Latitude: ${json.aq.results[0].coordinates.latitude}°\n
				Sensor Longitude: ${json.aq.results[0].coordinates.longitude}°\n
				Distance from your location: ${json.aqLoc.results[0].distance} in KM.\n
				Air Quality Value: ${json.aq.results[0].value} (${json.aqLoc.results[0].sensors[0].parameter.name}) in ${json.aqLoc.results[0].sensors[0].parameter.units} units.`;

				// Send the data to the database.
				// 	const data = { lat, lon, weather, airQuality, airQualityLoc };
				// 	const options = {
				// 		method: "POST",
				// 		headers: {
				// 			"Content-Type": "application/json",
				// 		},
				// 		body: JSON.stringify(data),
				// 	};
				// 	const post_url = "/weatData";
				// 	const post_response = await fetch(post_url, options);
				// 	const db_json = await post_response.json();
				// 	console.log(db_json);
			});
		} else {
			console.log("Geolocation is Not Available.");
		}
	});
}
