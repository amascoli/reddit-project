var baseURL = "http://127.0.0.1:5001/";

var league = document.getElementById("league");
var team1 = document.getElementById("team1");
var team2 = document.getElementById("team2");
var submit = document.getElementById("submit");
var chart = document.getElementById("testchart");
var graphtype = document.getElementById("graphtype");
var loader = document.getElementById("loader");
var titleText = document.getElementById("titleText");
var subredditText = document.getElementById("subredditText");
var gameDate = document.getElementById("gameDate");
var testGraph = document.getElementById("testGraph");

subredditText.style.display = "none";
loader.style.display = "none";

var nfldatalist = document.createElement("DATALIST");
nfldatalist.setAttribute("id", "nflteams");
document.body.appendChild(nfldatalist);
var nbadatalist = document.createElement("DATALIST");
nbadatalist.setAttribute("id", "nbateams");
document.body.appendChild(nbadatalist);
count = 0;
for (var key in team_to_subreddit) {
	var team = document.createElement("OPTION");
	team.setAttribute("value", key);
	// nfl
	if (count < 32)
		nfldatalist.append(team);
	// nba
	else if (count < 62)
		nbadatalist.append(team);
	count += 1;
}

league.addEventListener("change", function() {
	curr = league.value;
	if (curr == 'nfl') {
		team1.setAttribute("list", "nflteams");
		team2.setAttribute("list", "nflteams");
	}
	else if (curr == 'nba') {
		team1.setAttribute("list", "nbateams");
		team2.setAttribute("list", "nbateams");
	}
});

function createGraph() {

	loader.style.display = "block";
	chart.style.display = "none";
	subredditText.display = "none";
	titleText.innerHTML = "Fetching Game Thread Data...";

	var datalist = [];

	subreddit = "";
	query = "";
	lineColor = "#000000";
	fillColor = "#C0C0C0";

	if (graphtype.value=="league") {
		subreddit = league.value;
		query = team1.value + " " + team2.value + " game thread";
	}
	else {
		var teamname1, teamname2;
		if (graphtype.value=="team1") {
			subreddit = team_to_subreddit[team1.value];
			teamname1 = team1.value;
			teamname2 = team2.value;
		}
		else {
			subreddit = team_to_subreddit[team2.value];
			teamname1 = team2.value;
			teamname2 = team1.value;
		}

		if (league.value == "nfl") {
			var team_data = nfl_team_data[teamname1]

			fillColor = team_data['color1'];
			lineColor = team_data['color2'];

			if (team_data['abbreviations']) {
				teamname1 = nfl_team_data[team1.value]['abbreviation'];
				teamname2 = nfl_team_data[team2.value]['abbreviation'];
			}
			else if (team_data['locations']) {
				teamname1 = nfl_team_data[team1.value]['location'] + " " + nfl_team_data[team1.value]['name'];
				teamname2 = nfl_team_data[team2.value]['location'] + " " + nfl_team_data[team2.value]['name'];
			}
			else {
				teamname1 = nfl_team_data[team1.value]['name'];
				teamname2 = nfl_team_data[team2.value]['name'];
			}

			if (!team_data['themself']) teamname1 = "";

			query = team_data['prefix'] + " " + teamname1 + " " + teamname2;
		}
		else query = team1.value + " " + team2.value + " game thread";
	}

	console.log(query);

	url = baseURL + "graph";

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	data = {
		'gameDate': gameDate.value,
		'team1': team1.value,
		'team2': team2.value,
		'query': query,
		'subreddit': subreddit,
	};
	json = JSON.stringify(data);

	xhr.onload = function(e) {

		loader.style.display = "none";
		chart.style.display = "block";

		resp = JSON.parse(xhr.responseText);

		console.log(resp);

		if (resp["comments"]["errorStatus"] == true) {
			titleText.innerHTML = resp["comments"]["errorMessage"];
			return null;
		}

		subredditText.style.display = "block";
		subredditText.innerHTML = "r/" + subreddit;
		titleText.innerHTML = resp["comments"]["name"];

		var comments = resp["comments"]["comments"];

		comments.sort(function compare(kv1, kv2) {
			return kv1['time'] - kv2['time'];
		});

		var score = 0;

		for (var i=0; i<comments.length; i++) {

			console.log(comments[i]);

			score = score - 0.4 + comments[i]['score'];

			var curr = {
				'x': comments[i]['time'],
				'y': score,
			};
			datalist.push(curr);
		}

		var ctx = document.getElementById("testchart").getContext("2d");

		var scatter = new Chart(ctx, {
			type: 'scatter',
			data: {
				datasets: [{
					label: 'Scatter Dataset',
					data: datalist,
					borderColor: lineColor,
					pointBorderColor: lineColor,
					pointBackgroundColor: lineColor,
					pointHoverBackgroundColor: lineColor,
					pointHoverBorderColor: lineColor,
					fill: true,
					backgroundColor: fillColor,
					lineTension: 0.1,
				}]
			},
			options: {
				scales: {
					xAxes: [{
						type: 'linear',
						position: 'bottom',
						ticks: {
							callback: function(value, index, values) {
								var date = new Date(value*1000);
								var hours = date.getHours();
								var minutes = "0"+date.getMinutes();
								var seconds = "0"+date.getSeconds();
								return hours+":"+minutes.substr(-2)+":"+seconds.substr(-2);
							}
						}
					}]
				}
			}
		});
	}
	xhr.send(json);
};

function makeTestGraph() {
	
	var img = new Image();
	img.src = 'images/eagles.jpg';
	//img.style.height = '50px';
	//img.style.width = '80px';
	img.onload = function() {

		var ctx = document.getElementById("testchart").getContext("2d");

		var fillPattern = ctx.createPattern(img, 'repeat');

		var scatter = new Chart(ctx, {
			type: 'scatter',
			height: '500px',
			width: '800px',
			data: {
				datasets: [{
					data: [{
						x: -10,
						y: 0
					}, {
						x: -9,
						y: -3
					}, {
						x: -4,
						y: 5
					}, {
						x: -3,
						y: 8
					}, {
						x: 0,
						y: -5
					}, {
						x: 5,
						y: 6
					}, {
						x: 7,
						y: 0
					}, {
						x: 9,
						y: 2
					}],
					borderColor: '#C8AA76',
					pointBorderColor: '#C8AA76',
					pointBackgroundColor: '#C8AA76',
					pointHoverBackgroundColor: '#C8AA76',
					pointHoverBorderColor: '#C8AA76',
					fill: true,
					//backgroundColor: '#C9243F',
					backgroundColor: fillPattern,
					lineTension: 0.1,
				}]
			},
			options: {
				legend: {
					display: false,
				},
				scales: {
					xAxes: [{
						type: 'linear',
						position: 'bottom',
					}]
				}
			}
		});
	}
};
