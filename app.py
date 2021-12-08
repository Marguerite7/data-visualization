from flask import Flask, render_template, request
import csv, json

app = Flask(__name__)

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/api')
def api():
  # nodes = [dict(id=r[0], group=r[1], year=r[2], duration=r[3], plateform=r[4], continent=r[5], rating=r[6], link=r[7]) for r in csv.reader(open('data/nodes2.csv'))][1:]
  nodes = [dict(id=r[0], group=r[1], year=r[3], label=r[4], duration=r[5], plateform=r[6], continent=r[7], rating=r[2], link=r[9], size=r[10]) for r in csv.reader(open('data/nodes3.csv', encoding='utf8'))][1:]
  links = [dict(source=r[0], target=r[1], value=r[2]) for r in csv.reader(open('data/links3.csv'))][1:]
  return dict(nodes=nodes, links=links)