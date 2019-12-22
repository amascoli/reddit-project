import json
import cherrypy
from basic import team_reddit_api

def CORS():
	cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
	cherrypy.response.headers["Access-Control-Allow-Methods"] = "GET, PUT, POST, DELETE, OPTIONS"
	cherrypy.response.headers["Access-Control-Allow-Credentials"] = "*"

class OptionsController(object):

	def OPTIONS(self, *args, **kargs):
		return ""

class MyController(object):

	def __init__(self, db=None):
		if db is None:
			self.db = team_reddit_api()
		else:
			self.db = db

	def POST_QUERY(self, league, query):
		output = {'result' : 'success'}
		query = str(query)
		output['query'] = query
		try:
			payload = json.loads(cherrypy.request.body.read().decode("utf-8"))
			comments = self.db.search_posts(league, query, payload)
			output['comments'] = comments
		except Exception as ex:
			output['result'] = 'failure'
			output['message'] = str(ex)
		return json.dumps(output)

	def POST_TEST(self):
		output = {'result' : 'success'}
		output['message'] = 'test'
		return json.dumps(output)

def start_service():

	mycon = MyController()
	optcon = OptionsController()

	dispatcher = cherrypy.dispatch.RoutesDispatcher()

	dispatcher.connect('opt_query', '/:league/:query', controller=optcon, action='OPTIONS', conditions=dict(method=['OPTIONS']))
	dispatcher.connect('opt_test', '/', controller=optcon, action='OPTIONS', conditions=dict(method=['OPTIONS']))

	dispatcher.connect('post_query', '/:league/:query', controller=mycon, action='POST_QUERY', conditions=dict(method=['POST']))
	dispatcher.connect('post_test', '/', controller=mycon, action='POST_TEST', conditions=dict(method=['POST']))

	conf = {
		'global' : {
			'server.socket_host' : '127.0.0.1',
			'server.socket_port' : 5001,
		},
		'/' : { 'request.dispatch' : dispatcher,
				'tools.CORS.on' : True
		},
	}

	cherrypy.config.update(conf)
	app = cherrypy.tree.mount(None, config=conf)
	cherrypy.quickstart(app)

if __name__ == '__main__':
	cherrypy.tools.CORS = cherrypy.Tool('before_finalize', CORS)
	start_service()
