from flask import Flask, render_template, request
import csv, json

app = Flask(__name__)

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/api')
def api():
  # nodes = [dict(id=r[0], group=r[1], year=r[2], duration=r[3], plateform=r[4], continent=r[5], rating=r[6], link=r[7]) for r in csv.reader(open('data/nodes2.csv'))][1:]
  nodes = [dict(id=r[0], group=r[1], year=r[2], label=r[3], duration=r[4], plateform=r[5], continent=r[6], rating=r[7], link=r[8]) for r in csv.reader(open('data/nodes.csv', encoding='utf8'))][1:]
  links = [dict(source=r[0], target=r[1], value=r[2]) for r in csv.reader(open('data/links.csv'))][1:]
  return dict(nodes=nodes, links=links)