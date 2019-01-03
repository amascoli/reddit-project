var baseURL = "http://127.0.0.1:5001/";

var league = document.getElementById("league");
var team1 = document.getElementById("team1");
var team2 = document.getElementById("team2");
var submit = document.getElementById("submit");

function myFunction() {

	var datalist = [];

	query = team1.value + "%20" + team2.value + "%20game%20thread";
	url = baseURL + query;

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onload = function(e) {
		resp = JSON.parse(xhr.responseText);
		comments = resp["comments"];
		comments.sort(function compare(kv1, kv2) {
			return kv1['time'] - kv2['time'];
		});
		score = 0
		for (var i=0; i<comments.length; i++) {
			score += comments[i]['joy'];
			score -= comments[i]['anger'];
			var curr = {
				'x': comments[i]['time'],
				'y': score
			};
			datalist.push(curr);
		}

		var ctx = document.getElementById("testchart").getContext("2d");
		var scatter = new Chart(ctx, {
			type: 'scatter',
			data: {
				datasets: [{
					label: 'Scatter Dataset',
					data: datalist
				}]
			},
			options: {
				scales: {
					xAxes: [{
						type: 'linear',
						position: 'bottom'
					}]
				}
			}
		});

	}
	xhr.send(null);
}
