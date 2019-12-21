import praw
import json
import math
import requests
import indicoio
from praw.models import MoreComments

datapoints = 10

class team_reddit_api(object):

	def __init__(self):

		id = 'w6vEbDuX26v3Cg'
		secret = 'GkBu6pNbKoecHdzxnQZvCKyfsvA'

		indicoio.config.api_key = '664989ce0551a7fb18da6606494e73f9'

		self.reddit = praw.Reddit(user_agent="testing", client_id=id, client_secret=secret)

	def get_comments(self, post):

		try:
			post.comments.replace_more(limit=100)
		except Exception:
			return 'Error: no post found'

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
			count += 1

		return comments

	# query will always be "team1 team2 game thread"
	# can use team_to_subreddit to get team subreddits
	def search_posts(self, subreddit, query):
		leagues = ['nfl', 'nba']
		subreddit = self.reddit.subreddit(subreddit)
		for i in subreddit.search(query, limit=10):
			theid = i
			post = self.reddit.submission(id=theid)
			# if league not team
			if subreddit in leagues:
				# make sure we get Game Thred (not Postgame or something else)
				if post.link_flair_text == 'Game Thread':
					print(post.title)
					return self.get_comments(post)
				else:
					continue
			# if team not league
			else:
				return self.get_comments(post)

#if __name__ == '__main__':
#	search_posts("NFL", "titans giants game thread")
#	indicoio.config.api_key = '664989ce0551a7fb18da6606494e73f9'
#	print(indicoio.sentiment("this is a great sentence"))