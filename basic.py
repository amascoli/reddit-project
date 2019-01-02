import praw
import json
import math
import requests
from praw.models import MoreComments
from watson_developer_cloud import ToneAnalyzerV3

datapoints = 200

class team_reddit_api(object):

	def __init__(self):

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

		self.reddit = praw.Reddit(user_agent="testing", client_id=id, client_secret=secret)

		self.tone_analyzer = ToneAnalyzerV3(
			iam_apikey='_4GZKtcskF4N4Ds6zfK32fJhOSGyPq99UlUFz0vz6YCi',
			version='2016-05-19',
			url='https://gateway.watsonplatform.net/tone-analyzer/api'
		)

	def get_comments(self, post):

		post.comments.replace_more(limit=100)

		comments = []
		count = 0

		# limit to 'datapoints #' comments to save time
		interval = math.floor(len(post.comments.list())/datapoints)

		for comment in post.comments.list():
			if (count/interval).is_integer():
				curr = {}
				curr["body"] = comment.body
				curr["time"] = comment.created_utc
				# tone analysis
				json_out = self.tone_analyzer.tone({'text': comment.body}, 'application/json').get_result()
				tones = json_out['document_tone']['tone_categories'][0]['tones']
				curr['anger'] = tones[0]['score']
				curr['joy'] = tones[3]['score']
				curr['sadness'] = tones[4]['score']
				comments.append(curr)
				#print(count)
			count += 1

		return comments

	# query will always be "team1 team2 game thread"
	# can use team_to_subreddit to get team subreddits
	def search_posts(self, subreddit, query):

		subreddit = self.reddit.subreddit(subreddit)
		for i in subreddit.search(query, limit=1):
			theid = i

		post = self.reddit.submission(id=theid)
		return self.get_comments(post)

#if __name__ == '__main__':
#	search_posts("NFL", "titans giants game thread")
