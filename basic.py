import praw
import json
import math
import requests
import indicoio
from praw.models import MoreComments
from datetime import datetime, timezone

datapoints = 10

class team_reddit_api(object):

	def __init__(self):

		id = 'w6vEbDuX26v3Cg'
		secret = 'GkBu6pNbKoecHdzxnQZvCKyfsvA'

		indicoio.config.api_key = '664989ce0551a7fb18da6606494e73f9'

		self.reddit = praw.Reddit(user_agent="testing", client_id=id, client_secret=secret)

	def get_comments(self, post):

		response = {'name': post.title}

		try:
			post.comments.replace_more(limit=100)
		except Exception:
			response['errorStatus'] = True
			response['errorMessage'] = 'No post found'
			return response

		comments = []
		count = 0

		# limit to 'datapoints #' comments to save time
		interval = math.floor(len(post.comments.list())/datapoints)

		for comment in post.comments.list():
			if (count/interval).is_integer():
				curr = {}
				curr['body'] = comment.body
				curr['time'] = comment.created_utc
				curr['score'] = indicoio.sentiment(comment.body)

				comments.append(curr)

			count += 1

		response['comments'] = comments

		response['errorStatus'] = False
		
		return response

	# query will always be "team1 team2 game thread"
	# can use team_to_subreddit to get team subreddits
	def search_posts(self, payload):
		leagues = ['nfl', 'nba']
		subreddit = self.reddit.subreddit(payload['subreddit'])

		if (payload['gameDate'] != ""):
			startDate = datetime.strptime(payload['gameDate'], '%Y-%m-%d')
			startUtc = startDate.replace(tzinfo=timezone.utc).timestamp() - 86400
			endDate = datetime.strptime(payload['gameDate'], '%Y-%m-%d')
			endUtc = endDate.replace(tzinfo=timezone.utc).timestamp() + 86400 + 28800
		else:
			startDate = datetime.strptime('2000-01-01', '%Y-%m-%d')
			startUtc = startDate.replace(tzinfo=timezone.utc).timestamp()
			endDate = datetime.strptime('2030-12-31', '%Y-%m-%d')
			endUtc = endDate.replace(tzinfo=timezone.utc).timestamp()

		team1 = payload['team1']
		team2 = payload['team2']

		response = {'errorStatus': True}

		if team1 == team2:
			response['errorMessage'] = 'Teams selected cannot be the same.'
			return response
		elif endUtc <= startUtc:
			response['errorMessage'] = 'Please enter a valid date range.'
			return response

		print(startUtc)
		print(endUtc)

		for i in subreddit.search(payload['query'], limit=10):
			post = self.reddit.submission(id=i)

			postTime = post.created_utc
			print (postTime)

			if not self.post_in_date_range(startUtc, endUtc, postTime):
				continue

			if subreddit in leagues:
				# make sure we get Game Thred (not Postgame or something else)
				if post.link_flair_text == 'Game Thread' and post.title.startswith("Game Thread"):
					print(post.title)
					return self.get_comments(post)
				else:
					continue
			# if team not league
			else:
				return self.get_comments(post)
		
		response['errorMessage'] = 'No game thread found for teams in selected date range.'
		return response

	def post_in_date_range(self, start, end, post):
		return post >= start and post <= end

if __name__ == '__main__':
	team_reddit_api().search_posts("NFL", "titans giants game thread")
#	indicoio.config.api_key = '664989ce0551a7fb18da6606494e73f9'
#	print(indicoio.sentiment("this is a great sentence"))
