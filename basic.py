import praw
import json
import requests
from praw.models import MoreComments

team_to_subreddit  = {
	'steelers' : 'steelers',
	'bengals' : 'bengals',
	'browns' : 'Browns',
	'ravens' : 'ravens',
	'colts' : 'Colts',
	'texans' : 'Texans',
	'titans' : 'Tennesseetitans',
	'jaguars' : 'Jaguars',
	'patriots' : 'Patriots',
	'jets' : 'nyjets',
	'dolphins' : 'miamidolphins',
	'bills' : 'buffalobills',
	'chiefs' : 'KansasCityChiefs',
	'chargers' : 'Chargers',
	'raiders' : 'oaklandraiders',
	'broncos' : 'DenverBroncos',
	'vikings' : 'minnesotavikings',
	'packers' : 'GreenBayPackers',
	'bears' : 'CHIBears',
	'lions' : 'detroitlions',
	'saints' : 'Saints',
	'panthers' : 'panthers',
	'falcons' : 'falcons',
	'buccaneers' : 'buccaneers',
	'eagles' : 'eagles',
	'cowboys' : 'cowboys',
	'giants' : 'NYGiants',
	'redskins' : 'Redskins',
	'rams' : 'LosAngelesRams',
	'seahawks' : 'Seahawks',
	'49ers' : '49ers',
	'cardinals' : 'AZCardinals',
}

id = 'w6vEbDuX26v3Cg'
secret = 'GkBu6pNbKoecHdzxnQZvCKyfsvA'
#myurl = 'https://www.reddit.com/r/nba/comments/9xr4t3/game_thread_toronto_raptors_123_boston_celtics_86/'
myurl = 'https://www.reddit.com/r/nfl/comments/a6wk6i/post_game_thread_philadelphia_eagles_77_at_los/'

reddit = praw.Reddit(user_agent="testing", client_id=id, client_secret=secret)

def get_comments(post):

	post.comments.replace_more(limit=100)

	comments = {}
	count = 0

	for comment in post.comments.list():
		curr = {}
		curr["body"] = comment.body
		curr["time"] = comment.created_utc
		comments[count] = curr
		count += 1

	print(comments)

# query will always be "team1 team2 game thread"
# can use team_to_subreddit to get team subreddits
def search_posts(subreddit, query):

	subreddit = reddit.subreddit(subreddit)
	for i in subreddit.search(query, limit=1):
		print(i)
		theid = i

	post = reddit.submission(id=theid)
	get_comments(post)

if __name__ == '__main__':
	search_posts("NFL", "titans giants game thread")
