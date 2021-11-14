from flask import Flask, render_template, request
import csv, json

app = Flask(__name__)

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/api')
def api():
  nodes = [dict(id=r[0], group=r[1]) for r in csv.reader(open('data/nodes.csv'))][1:]
  links = [dict(source=r[0], target=r[1], value=r[2]) for r in csv.reader(open('data/links.csv'))][1:]
  return dict(nodes=nodes, links=links)

