import webapp2
import jinja2
import os

import logging

import urllib
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers

jinja = jinja2.Environment(loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

class MainPage(webapp2.RequestHandler):
  def get(self):
    template = jinja.get_template('index.html')
    self.response.out.write(template.render())

class Model3D(db.Model):
  name = db.StringProperty(required = True)
  user = db.StringProperty(required = True)
  blobKey = db.StringProperty(required = True)
  created = db.DateTimeProperty(auto_now_add = True)

class ModelUploadPage(webapp2.RequestHandler):
  def get(self):
    user = users.get_current_user()
    if user:
      template = jinja.get_template('model-upload.html')
      upload_url = blobstore.create_upload_url('/model/upload-handler')
      template_values = {
        'user' : user.nickname(),
        'user_id' : user.user_id(),
        'logout' : users.create_logout_url("/"),
        'upload_url' : upload_url
      }
      self.response.out.write(template.render(template_values))
    else:
      self.redirect(users.create_login_url('/model/upload'))

class ModelUploadHandler(blobstore_handlers.BlobstoreUploadHandler):
  def post(self):
    upload_files = self.get_uploads('file')
    blob_info = upload_files[0]
    name = self.request.get('name')
    user = self.request.get('user_id')
    if name and user:
      Model3D(name = name, user = user, blobKey = str(blob_info.key())).put()
      self.redirect('/model/list')
    else:
      blob_info.delete()
      self.redirect('/model/upload')

class ModelRequestHandler(blobstore_handlers.BlobstoreDownloadHandler):
  def get(self):
    modelKey = self.request.get('key')
    if modelKey:
      blob_info = blobstore.BlobInfo.get(modelKey)
      result = db.GqlQuery("SELECT * FROM Model3D WHERE blobKey = :blobKey", blobKey = modelKey).run()
      self.send_blob(blob_info, save_as = str(result.next().name) + ".json")
  def post(self):
    modelKey = self.request.get('key')
    if modelKey:
      blob_info = blobstore.BlobInfo.get(modelKey)
      self.send_blob(blob_info)

class ModelListPage(webapp2.RequestHandler):
  def get(self):
    template = jinja.get_template('model-list.html')
    result = db.GqlQuery("SELECT * FROM Model3D ORDER BY name").run()
    models = []
    for model in result:
      blob_info = blobstore.BlobInfo.get(model.blobKey)
      models.append({
        "name" : model.name,
        "blobKey" : model.blobKey,
        "created" : model.created,
        "md5_hash" : blob_info.md5_hash,
        "size" : blob_info.size
      })
    template_values = {
      'models' : models
    }
    self.response.out.write(template.render(template_values))

class ModelPage(webapp2.RequestHandler):
  def get(self):
    self.response.out.write('Model Page')

class PlayPage(webapp2.RequestHandler):
  def get(self):
    template = jinja.get_template('play.html')
    self.response.out.write(template.render())

# only around so the old hello world works
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

app = webapp2.WSGIApplication([('/model/upload', ModelUploadPage),
                               ('/model/upload-handler', ModelUploadHandler),
                               ('/model/request', ModelRequestHandler),
                               ('/model/list', ModelListPage),
                               ('/model', ModelPage),
                               ('/play', PlayPage),
                               ('/rpc', RPCHandler),
                               ('/', MainPage)],
                               debug=True)
