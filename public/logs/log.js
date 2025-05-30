function setup() {
	noCanvas();

	// Header.
	const h1 = document.createElement("h1");
	h1.innerText = "Log of data";
	document.body.append(h1);

	const anchor1 = document.createElement("a");
	anchor1.setAttribute("href", "../index.html");
	anchor1.textContent = "Home";
	document.body.append(anchor1);

	const div1 = document.createElement("div");
	div1.id = "sortTime";
	document.body.append(div1);

	const anchor2 = document.createElement("a");
	anchor2.id = "time";
	anchor2.setAttribute("href", "#");
	anchor2.textContent = "Sort by time.";
	document.body.append(anchor2);

	getServerData();

	const selfies = [];

	document.getElementById("time").addEventListener("click", (event) => {
		sortData((a, b) => b.time - a.time);
	});

	function sortData(compare) {
		for (let item of selfies) {
			item.elt.remove();
		}
		selfies.sort(compare);
		for (let item of selfies) {
			document.body.append(item.elt);
		}
	}

	async function getServerData() {
		const response = await fetch("/api");
		const data = await response.json();

		for (item of data) {
			const root = document.createElement("p");
			const geo = document.createElement("div");
			const date = document.createElement("div");

			geo.textContent =
				"lat: " + item.lat + "°" + " " + "lon: " + item.lon + "°";
			const dateString = new Date(item.timestamp).toLocaleString();
			date.textContent = dateString;

			root.append(geo, date);

			selfies.push({ elt: root, time: item.timestamp });
			document.body.append(root);
		}
		console.log(data);
	}
}
