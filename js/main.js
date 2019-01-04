var baseURL = "http://127.0.0.1:5001/";

var league = document.getElementById("league");
var team1 = document.getElementById("team1");
var team2 = document.getElementById("team2");
var submit = document.getElementById("submit");
var chart = document.getElementById("testchart");
var graphtype = document.getElementById("graphtype");
var loader = document.getElementById("loader");
loader.style.display = "none";

var team_to_subreddit = {
	// nfl 0-31
	'Arizona Cardinals' : 'AZCardinals',
	'Atlanta Falcons' : 'falcons',
	'Baltimore Ravens' : 'ravens',
	'Buffalo Bills' : 'buffalobills',
	'Carolina Panthers' : 'panthers',
	'Chicago Bears' : 'CHIBears',
	'Cincinnati Bengals' : 'bengals',
	'Cleveland Browns' : 'browns',
	'Dallas Cowboys' : 'cowboys',
	'Denver Broncos' : 'DenverBroncos',
	'Detroit Lions' : 'detroitlions',
	'Green Bay Packers' : 'GreenBayPackers',
	'Houston Texans' : 'Texans',
	'Indianapolis Colts' : 'colts',
	'Jacksonville Jaguars' : 'Jaguars',
	'Kansas City Chiefs' : 'KansasCityChiefs',
	'Los Angeles Chargers' : 'Chargers',
	'Los Angeles Rams' : 'LosAngelesRams',
	'Miami Dolphins' : 'miamidolphins',
	'Minnesota Vikings' : 'minnesotavikings',
	'New England Patriots' : 'Patriots',
	'New Orleans Saints' : 'Saints',
	'New York Giants' : 'NYGiants',
	'New York Jets' : 'nyjets',
	'Oakland Raiders' : 'oaklandraiders',
	'Philadelphia Eagles' : 'eagles',
	'Pittsburgh Steelers' : 'steelers',
	'San Francisco 49ers' : '49ers',
	'Seattle Seahawks' : 'Seahawks',
	'Tampa Bay Buccaneers' : 'buccaneers',
	'Tennessee Titans' : 'Tennesseetitans',
	'Washington Redskins' : 'Redskins',
	// nba 32-61
	'Atlanta Hawks' : 'AtlantaHawks',
	'Boston Celtics' : 'bostonceltics',
	'Brooklyn Nets' : 'GoNets',
	'Charlotte Hornets' : 'CharlotteHornets',
	'Chicago Bulls' : 'chicagobulls',
	'Cleveland Cavaliers' : 'clevelandcavs',
	'Dallas Mavericks' : 'Mavericks',
	'Denver Nuggets' : 'denvernuggets',
	'Detroit Pistons' : 'DetroitPistons',
	'Golden State Warriors' : 'warriors',
	'Houston Rockets' : 'rockets',
	'Indiana Pacers' : 'pacers',
	'Los Angeles Clippers' : 'LAClippers',
	'Los Angeles Lakers' : 'lakers',
	'Memphis Grizzlies' : 'memphisgrizzlies',
	'Miami Heat' : 'heat',
	'Milwaukee Bucks' : 'MkeBucks',
	'Minnesota Timberwolves' : 'timberwolves',
	'New Orleans Pelicans' : 'NOLAPelicans',
	'New York Knicks' : 'NYKnicks',
	'Oklahoma City Thunder' : 'Thunder',
	'Orlando Magic' : 'orlandomagic',
	'Philadelphia 76ers' : 'sixers',
	'Phoenix Suns' : 'suns',
	'Porland Trail Blazers' : 'ripcity',
	'Sacramento Kings' : 'kings',
	'San Antonio Spurs' : 'NBASpurs',
	'Toronto Raptors' : 'torontoraptors',
	'Utah Jazz' : 'UtahJazz',
	'Washington Wizards' : 'washingtonwizards'
}

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

function myFunction() {

	loader.style.display = "block";
	chart.style.display = "none";

	var datalist = [];

	subreddit = "";
	if (graphtype.value=="league")
		subreddit = league.value;
	else if (graphtype.value=="team1")
		subreddit = team_to_subreddit[team1.value];
	else
		subreddit = team_to_subreddit[team2.value];

	query = team1.value + "%20" + team2.value + "%20game%20thread";
	url = baseURL + subreddit + "/" + query;

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onload = function(e) {

		loader.style.display = "none";
		chart.style.display = "block";

		resp = JSON.parse(xhr.responseText);
		comments = resp["comments"];
		comments.sort(function compare(kv1, kv2) {
			return kv1['time'] - kv2['time'];
		});
		score = 0
		for (var i=0; i<comments.length; i++) {

			var date = new Date(comments[i]['time']*1000);
			var hours = date.getHours();
			var minutes = "0"+date.getMinutes();
			var seconds = "0"+date.getSeconds();
			var formattedTime = hours+":"+minutes.substr(-2)+":"+seconds.substr(-2);

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
