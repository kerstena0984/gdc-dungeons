import webapp2
import jinja2
import os

jinja = jinja2.Environment(loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

class MainPage(webapp2.RequestHandler):
  def get(self):
    template = jinja.get_template('index.html')
    self.response.out.write(template.render())

class Play(webapp2.RequestHandler):
  def get(self):
    template = jinja.get_template('play.html')
    self.response.out.write(template.render())

class RPCHandler(webapp2.RequestHandler):
  def post(self):
    action = self.request.get('action')
    args = []
    count = 0
    while True:
      arg = self.request.get('arg' + str(count))
      if (arg):
        args.append(arg)
        count = count + 1
      else:
        break

    try:
      self.response.write(getattr(self, action)(*args))
    except AttributeError:
      self.response.write("undefined method")

  def requestShader(self, shaderName):
    if shaderName:
      try:
        f = open(shaderName + '.glsl')
        self.response.out.write(f.read())
      except IOError:
        pass

  def requestModel(self, modelName):
    if modelName:
      try:
        f = open(modelName + ".json")
        self.response.out.write(f.read())
      except IOError:
        pass

  def fragment(self):
    f = open('f1.glsl')
    self.response.out.write(f.read())

  def vertex(self):
    f = open('v1.glsl')
    self.response.out.write(f.read())

app = webapp2.WSGIApplication([('/rpc', RPCHandler),
                               ('/play', Play),
                               ('/', MainPage)],
                               debug=True)
