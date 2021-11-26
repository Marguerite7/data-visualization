// Generated by CoffeeScript 2.4.1
// future features

// force label placement & highlights
// https://bl.ocks.org/mapio/53fed7d84cd1812d6a6639ed7aa83868
// http://bl.ocks.org/MoritzStefaner/1377729

// curved edges
// https://bl.ocks.org/almsuarez/baa897c189ed64ba2bb32cde2876533b

// force tooltip & highlights
// https://bl.ocks.org/almsuarez/4333a12d2531d6c1f6f22b74f2c57102

// align tooltip position when zoomed (mismatch because of transform, translate, scale)
// https://bl.ocks.org/anonymous/3e3e5333ff24a2c9972bc9320dc6f712/f4dcd09a07b5eafdc78efa0cf45948021e003739

// global variables
// [svg, svgNodes, svgLinks, svgTexts, width, height, color, nodes, links, force, node, link, text, zoom, drag, graph] = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
var centerToXY, color, drag, dragended, dragged, dragging, dragstarted, exitHighlight, g, gc20, getTransform, graph, height, hideDetails, init, initUI, reload_data, isEdgeOf, isEdgeSelected, isLinkOn, isNeighbor, isNodeSelected, isPartOf, isSameEdge, isSameNode, isTextOn, isTooltipOn, slider_year_link, slider_year_node, slider_duration_link, slider_duration_node, link, links, nborsdic, node, nodeColor, nodes, resetCanvas, resetSelected, resetSize, resetAll, selected, setHighlightByNode, setHighlightByStr, setHighlightbySlider, showDetails, simulation, svg, svgLinks, svgNodes, svgTexts, text, tick, url, width, zoom, yearSlider, durationSlider, filters_continent, filters_plateform, min_year, max_year, max_duration;

svg = null;

g = null;

svgNodes = null;

svgLinks = null;

svgTexts = null;

width = null;

height = null;

color = null;

nodes = null;

links = null;

simulation = null;

node = null;

link = null;

text = null;

zoom = null;

drag = null;

graph = null;

selected = null;

dragging = null;

nborsdic = null;

filters_continent = [];

filters_plateform = [];

min_year = 1980;

max_year = 2021;

duration = 180;

gc20 = '#3366cc #dc3912 #ff9900 #109618 #990099 #0099c6 #dd4477 #66aa00 #b82e2e #316395 #994499 #22aa99 #aaaa11 #6633cc #e67300 #8b0707 #651067 #329262 #5574a6 #3b3eac'.split(' ');

url = '/api';

// initialize ui
init = function() {
  $('#last-updated').text(document.lastModified);
  // initTooltips()
  initUI();
  color = d3.scaleOrdinal().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]).range(gc20);
  drag = d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  zoom = d3.zoom().scaleExtent([.1, 10]).on('zoom', function() {
    g.attr('transform', d3.event.transform);
  });
  // render graph
  resetCanvas();
  $('#spinner').show();
  d3.json(url).then(function(data) {
    if (filters_continent.length > 0 ) {
      data.nodes = data.nodes.filter(function(v) { return filters_continent.indexOf(v.continent) != -1});
      var id_node = $.map(data.nodes, function(v) {
        return v.id
      });
      data.links = data.links.filter(function(v) { return id_node.indexOf(v.target) != -1 && id_node.indexOf(v.source) != -1});
    }
    if (filters_plateform.length > 0 ) {
      data.nodes = data.nodes.filter(function(v) { 
        var intersect = filters_plateform.filter(value => v.plateform.includes(value));
        return intersect.length > 0});
      var id_node = $.map(data.nodes, function(v) {
        return v.id
      });
      data.links = data.links.filter(function(v) { return id_node.indexOf(v.target) != -1 && id_node.indexOf(v.source) != -1});
    }
    graph = data;
    // console.log(graph.nodes[0]['plateform']);
    nborsdic = {};
    $.map(graph.nodes, function(v) {
      nborsdic[v.id] = [];
    });
    $.map(graph.links, function(e) {
      if (!nborsdic.hasOwnProperty(e.source)) {
        nborsdic[e.source] = [];
      }
      if (!nborsdic.hasOwnProperty(e.target)) {
        nborsdic[e.target] = [];
      }
      nborsdic[e.source].push(e.target);
      nborsdic[e.target].push(e.source);
    });
    simulation = d3.forceSimulation(graph.nodes).force('charge', d3.forceManyBody().strength(-100)).force('collide', d3.forceCollide()).force('link', d3.forceLink(graph.links).id(function(d) {
      return d.id;
    })).force('center', d3.forceCenter(width / 2, height / 2)).on('tick', tick);
    link = svgLinks.selectAll('.link');
    link = link.data(graph.links, function(d) {
      return d.source.id + '-' + d.target.id;
    }).enter().append('line').attr('class', 'link').style('stroke-width', function(d) {
      if (d.hasOwnProperty('value')) {
        return d.value;
      } else {
        return 1;
      }
    }).on('mouseover', function(d) {
      // setHighlightByEdge d, true
      showDetails(d);
    }).on('mouseout', function(d) {
      // exitHighlight()
      hideDetails();
    });
    link.exit().remove();
    // node circle
    node = svgNodes.selectAll('.node');
    node = node.data(graph.nodes, function(d) {
      return d.id;
    }).enter().append('circle').attr('class', 'node').attr('r', function(d) {
      if (d.hasOwnProperty('size')) {
        return d.size;
      } else {
        return 6;
      }
    }).style('fill', function(d) {
      return nodeColor(d);
    }).style('stroke', function(d) {
      return nodeColor(d);
    }).call(drag).on('mouseover', function(d) {
      setHighlightByNode(d, true);
      showDetails(d);
    }).on('mouseout', function(d) {
      exitHighlight();
      hideDetails();
    }).on('click', function(d) {
      d3.event.stopPropagation();
      if (!d3.event.defaultPrevented) { // distinguishing from click from dragging
        // node gets selected
        return centerToXY(d.x, d.y, getTransform()[2], 750);
      }
    });
    node.exit().remove();
    // node label
    text = svgTexts.selectAll('.text');
    text = text.data(graph.nodes, function(d) {
      return d.id;
    // .attr 'dx', (d) -> labelOffset + nodeSize d
    }).enter().append('text').attr('class', 'text').attr('dx', function(d) {
      if (d.hasOwnProperty('size')) {
        return d.size + 4;
      } else {
        return 10;
      }
    }).attr('dy', '.35em').attr('font-size', '9pt').text(function(d) {
      if (d.hasOwnProperty('label')) {
        return d.label;
      } else {
        return d.id;
      }
    }).call(drag).on('mouseover', function(d) {
      setHighlightByNode(d, true);
      showDetails(d);
    }).on('mouseout', function(d) {
      exitHighlight();
      hideDetails();
    }).on('click', function(d) {
      d3.event.stopPropagation();
      if (!d3.event.defaultPrevented) { // distinguishing from click from dragging
        // node gets selected
        return centerToXY(d.x, d.y, getTransform()[2], 750);
      }
    });
    text.exit().remove();
    svg.call(zoom.transform, d3.zoomIdentity);
    // drawGraph()
    return $('#spinner').hide();
  });
};

reload_data = function() {
  color = d3.scaleOrdinal().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]).range(gc20);
  drag = d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  zoom = d3.zoom().scaleExtent([.1, 10]).on('zoom', function() {
    g.attr('transform', d3.event.transform);
  });
  // render graph
  resetCanvas();
  $('#spinner').show();
  d3.json(url).then(function(data) {
    if (filters_continent.length > 0 ) {
      data.nodes = data.nodes.filter(function(v) { return filters_continent.indexOf(v.continent) != -1});
      var id_node = $.map(data.nodes, function(v) {
        return v.id
      });
      data.links = data.links.filter(function(v) { return id_node.indexOf(v.target) != -1 && id_node.indexOf(v.source) != -1});
    }
    if (filters_plateform.length > 0 ) {
      data.nodes = data.nodes.filter(function(v) { 
        var intersect = filters_plateform.filter(value => v.plateform.includes(value));
        return intersect.length > 0});
      var id_node = $.map(data.nodes, function(v) {
        return v.id
      });
      data.links = data.links.filter(function(v) { return id_node.indexOf(v.target) != -1 && id_node.indexOf(v.source) != -1});
    }
    graph = data;
    // console.log(graph.nodes[0]['plateform']);
    nborsdic = {};
    $.map(graph.nodes, function(v) {
      nborsdic[v.id] = [];
    });
    $.map(graph.links, function(e) {
      if (!nborsdic.hasOwnProperty(e.source)) {
        nborsdic[e.source] = [];
      }
      if (!nborsdic.hasOwnProperty(e.target)) {
        nborsdic[e.target] = [];
      }
      nborsdic[e.source].push(e.target);
      nborsdic[e.target].push(e.source);
    });
    simulation = d3.forceSimulation(graph.nodes).force('charge', d3.forceManyBody().strength(-100)).force('collide', d3.forceCollide()).force('link', d3.forceLink(graph.links).id(function(d) {
      return d.id;
    })).force('center', d3.forceCenter(width / 2, height / 2)).on('tick', tick);
    link = svgLinks.selectAll('.link');
    link = link.data(graph.links, function(d) {
      return d.source.id + '-' + d.target.id;
    }).enter().append('line').attr('class', 'link').style('stroke-width', function(d) {
      if (d.hasOwnProperty('value')) {
        return d.value;
      } else {
        return 1;
      }
    }).on('mouseover', function(d) {
      // setHighlightByEdge d, true
      showDetails(d);
    }).on('mouseout', function(d) {
      // exitHighlight()
      hideDetails();
    });
    link.exit().remove();
    // node circle
    node = svgNodes.selectAll('.node');
    node = node.data(graph.nodes, function(d) {
      return d.id;
    }).enter().append('circle').attr('class', 'node').attr('r', function(d) {
      if (d.hasOwnProperty('size')) {
        return d.size;
      } else {
        return 6;
      }
    }).style('fill', function(d) {
      return nodeColor(d);
    }).style('stroke', function(d) {
      return nodeColor(d);
    }).call(drag).on('mouseover', function(d) {
      setHighlightByNode(d, true);
      showDetails(d);
    }).on('mouseout', function(d) {
      exitHighlight();
      hideDetails();
    }).on('click', function(d) {
      d3.event.stopPropagation();
      if (!d3.event.defaultPrevented) { // distinguishing from click from dragging
        // node gets selected
        return centerToXY(d.x, d.y, getTransform()[2], 750);
      }
    });
    node.exit().remove();
    // node label
    text = svgTexts.selectAll('.text');
    text = text.data(graph.nodes, function(d) {
      return d.id;
    // .attr 'dx', (d) -> labelOffset + nodeSize d
    }).enter().append('text').attr('class', 'text').attr('dx', function(d) {
      if (d.hasOwnProperty('size')) {
        return d.size + 4;
      } else {
        return 10;
      }
    }).attr('dy', '.35em').attr('font-size', '9pt').text(function(d) {
      if (d.hasOwnProperty('label')) {
        return d.label;
      } else {
        return d.id;
      }
    }).call(drag).on('mouseover', function(d) {
      setHighlightByNode(d, true);
      showDetails(d);
    }).on('mouseout', function(d) {
      exitHighlight();
      hideDetails();
    }).on('click', function(d) {
      d3.event.stopPropagation();
      if (!d3.event.defaultPrevented) { // distinguishing from click from dragging
        // node gets selected
        return centerToXY(d.x, d.y, getTransform()[2], 750);
      }
    });
    text.exit().remove();
    svg.call(zoom.transform, d3.zoomIdentity);
    // drawGraph()
    return $('#spinner').hide();
  });
};

// force computation for every tick
tick = function() {
  text.attr('transform', function(d) {
    return 'translate(' + [d.x, d.y] + ')';
  });
  node.attr('cx', function(d) {
    return d.x;
  }).attr('cy', function(d) {
    return d.y;
  });
  link.attr('x1', function(d) {
    return d.source.x;
  }).attr('y1', function(d) {
    return d.source.y;
  }).attr('x2', function(d) {
    return d.target.x;
  }).attr('y2', function(d) {
    return d.target.y;
  });
};

// node-dragging-related functions
dragstarted = function(d) {
  if (!d3.event.active) {
    simulation.alphaTarget(0.3).restart();
  }
  d.fx = d.x;
  d.fy = d.y;
  dragging = true;
};

dragged = function(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
};

dragended = function(d) {
  if (!d3.event.active) {
    simulation.alphaTarget(0.0001);
  }
  d.fx = null;
  d.fy = null;
  dragging = false;
  exitHighlight();
};

// if not $('#control-force').hasClass 'active' then force.stop()
centerToXY = function(x, y, k, delay) {
  var transform, translate;
  translate = [width / 2 - (k * x), height / 2 - (k * y)];
  transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(k);
  svg.transition().duration(delay).call(zoom.transform, transform);
};

getTransform = function() {
  return $('svg > g').attr('transform').match(/([\d\.]+)/g).map(parseFloat);
};

nodeColor = function(d) {
  if (d.hasOwnProperty('color')) {
    return d.color;
  }
  if (d.hasOwnProperty('group')) {
    return color(d.group);
  } else {
    return color(1);
  };
};

showDetails = function(d) {
  var tt;
  tt = $('#tooltip');
  tt.html(JSON.stringify(d, ['id', 'label', 'group', 'color', 'size', 'source', 'target', 'value', 'year', 'duration', 'plateform', 'continent'], 2));
  // tt.html JSON.stringify(d, null, 2)
  if (d.hasOwnProperty('x')) {
    tt.css('left', 10 + d.x);
    tt.css('top', 10 + d.y);
  } else {
    tt.css('left', 10 + (d.source.x + d.target.x) / 2);
    tt.css('top', 10 + (d.source.y + d.target.y) / 2);
  };
  if (isTooltipOn()) {
    tt.removeClass('d-none');
  };
};

hideDetails = function(d) {
  $('#tooltip').addClass('d-none');
};

// init all tooltips
// initTooltips = ->
//   $( -> $('[data-toggle="tooltip"]').tooltip(); return); return
initUI = function() {
  $('.nav-toggle').click(function(event) {
    event.preventDefault();
    if (this.text.split(': ')[1] === 'On') {
      g.selectAll('.' + this.id.split('-')[1]).classed('d-none', true);
      // $('.main-canvas .'+this.id.split('-')[1]).hide()
      this.text = this.text.split(': ')[0] + ': Off';
    } else {
      g.selectAll('.' + this.id.split('-')[1]).classed('dim', false).classed('d-none', false);
      // $('.main-canvas .'+this.id.split('-')[1]).show()
      this.text = this.text.split(': ')[0] + ': On';
    };
    $(this).blur();
  });
  $('#quick-search').on('keyup search click', function(event) {
    var qsVal;
    if (selected) {
      resetSelected();
    }
    qsVal = $('#quick-search').val();
    if (qsVal.length > 0) {
      setHighlightByStr(qsVal);
    } else {
      exitHighlight();
    }
  });
  $('.modal').on('shown.bs.modal', function(e) {
    $('.nav-link').one('focus', function(e) {
      return $(this).blur();
    });
  });
};

$('input[type=checkbox]').change(function() {
  if (this.checked) {
    if (['Africa', 'Asia', 'Europe', 'North America', 'South America'].indexOf(this.id) != -1) {
      if (filters_continent.indexOf(this.id == -1)) {
        filters_continent.push(this.id);
      };
      reload_data();
    }
    else {
      if (filters_plateform.indexOf(this.id == -1)) {
        filters_plateform.push(this.id);
      }
      reload_data();
    };
  } else {
    if (['Africa', 'Asia', 'Europe', 'North America', 'South America'].indexOf(this.id) != -1) {
      filters_continent.splice(filters_continent.indexOf(this.id),1);
      reload_data();
    } else {
      filters_plateform.splice(filters_plateform.indexOf(this.id),1);
      reload_data();
    };
  };
});

isTextOn = function() {
  return $('#toggle-text').text().split(': ')[1] === 'On';
};

isLinkOn = function() {
  return $('#toggle-link').text().split(': ')[1] === 'On';
};

isTooltipOn = function() {
  return $('#toggle-tooltip').text().split(': ')[1] === 'On';
};

// hover & quick search highlight functions
isNeighbor = function(p, d) {
  return p.id === d.id || nborsdic[d.id].indexOf(p.id) >= 0; // check if p is one of d's neighbors
};

isPartOf = function(p, s) {
  var flagId, flagLabel;
  flagId = p.id.toString().toLowerCase().indexOf(s.toLowerCase()) >= 0;
  flagLabel = p.hasOwnProperty('label') ? p.label.toString().toLowerCase().indexOf(s.toLowerCase()) >= 0 : false;
  return flagId || flagLabel;
};

// check if s [string] is part of p [node] id or label
isSameNode = function(p, d) {
  return p.id === d.id; // check if p [node] is same to d [node]
};

isSameEdge = function(p, d) {
  return (p.source.id === d.source.id && p.target.id === d.target) || (p.source.id === d.target.id && p.target.id === d.source.id); // check if p [edge] is same to d [edge]
};

isEdgeOf = function(p, d) {
  return p.source.id === d.id || p.target.id === d.id; // is p [edge] an edge of d [node]
};

slider_year_link = function(p) {
  return p.source.year >= min_year && p.source.year <= max_year && p.target.year >= min_year && p.target.year <= max_year;
};

slider_year_node = function(p) {
  return p.year >= min_year && p.year <= max_year;
};

slider_duration_link = function(p) {
  return p.source.duration <= max_duration && p.target.duration <= max_duration;
};

slider_duration_node = function(p) {
  return p.duration <= max_duration;
};

isNodeSelected = function() {
  return selected && !selected.hasOwnProperty('source');
};

isEdgeSelected = function() {
  return selected && selected.hasOwnProperty('source');
};

$('input[id=reset]').change(function() {
  if (this.checked) {
    if (this.checked == true) {
      resetAll();
      $(':checkbox').each(function() {
        this.checked = false;
    });
    };
  };
});

yearSlider = function (slider) {
  min_year = slider.values[0];
  max_year = slider.values[1];
  setHighlightbySlider();
};

durationSlider = function (slider) {
  max_duration = slider.value
  setHighlightbySlider();
};

// $('input[type=checkbox]').change(function() { // while you're at it listen for change rather than click, this is in case something else modifies the checkbox
//   console.log("something is checked on the page");
// });

setHighlightByNode = function(d, hover) {
  if (link !== null) {
    if (!dragging) {
      link.classed('dim', function(p) {
        return !isEdgeOf(p, d) || (!slider_year_link(p) && !slider_duration_link(p));
      });
      // .classed 'selected', (p) -> (not hover) and isEdgeSelected() and isSameEdge p,selected
      node.classed('dim', function(p) {
        return !isNeighbor(p, d) || (!slider_year_node(p) && !slider_year_node(d) && !slider_duration_node(p) && !slider_duration_node(d));
      });
      // .classed 'selected', (p) -> (not hover) and isNodeSelected() and isSameNode p,selected
      text.classed('dim', function(p) {
        return !isNeighbor(p, d) || (!slider_year_node(p) && !slider_year_node(d) && !slider_duration_node(p) && !slider_duration_node(d));
      });
    };
  };
};

setHighlightbySlider = function() {
  if (link !== null) {
    link.classed('d-none', function(p) {
      return p.source.duration > max_duration || p.target.duration > max_duration || p.source.year < min_year || p.source.year > max_year || p.target.year < min_year || p.target.year > max_year || !isLinkOn();
    });
    node.classed('d-none', function(p) {
      return p.duration > max_duration || p.year < min_year || p.year > max_year;
    });
    text.classed('d-none', function(p) {
      return p.duration > max_duration || p.year < min_year || p.year > max_year || !isTextOn();
    });
  };
};

resetAll = function() {
  if (link !== null) {
    selected = null;
    max_duration = 180;
    min_year = 1980;
    max_year = 2021;
    filters_continent = [];
    filters_plateform = [];
    $('.nav-toggle').each(function() {
      if (this.text.split(': ')[1] === 'Off') {
        this.text = this.text.split(': ')[0] + ': On';
      }
    });;
    $('#quick-search').val('');
    reload_data();
  };
};

// setHighlightByEdge = (d, hover) ->
//   if link!=null
//     if not dragging
//       link
//         .classed 'dim', (p) -> not isSameEdge p,d
//         .classed 'd-none', (p) -> not isLinkOn() and not isSameEdge p,d
//         .classed 'selected', (p) -> (not hover) and isEdgeSelected() and isSameEdge p,selected
//       node
//         .classed 'dim', (p) -> not isEdgeOf d,p
//         .classed 'selected', (p) -> (not hover) and isNodeSelected() and isSameNode p,selected
//       text
//         .classed 'dim', (p) -> not isEdgeOf d,p
//         .classed 'd-none', (p) -> not isTextOn() and not isEdgeOf d,p
//   return

setHighlightByStr = function(s) {
  // console.log s.toLowerCase()
  if (link !== null) {
    link.classed('dim', true).classed('d-none', function(p) {
      return !isLinkOn() && (!slider_year_link(p) || !slider_duration_link(p));
    });
    // .classed 'selected', (p) -> isEdgeSelected() and isSameEdge p,selected
    node.classed('dim', function(p) {
      return !isPartOf(p, s) && (!slider_year_node(p)  || !slider_duration_node(p));
    });
    // .classed 'selected', (p) -> isNodeSelected() and isSameNode p,selected
    text.classed('dim', function(p) {
      return !isPartOf(p, s) && (!slider_year_node(p) || !slider_duration_node(p));
    })
  };
};

exitHighlight = function() {
  if (link !== null) {
    if (!dragging) {
      if (selected) {
        if (selected.hasOwnProperty('source')) {
          setHighlightByEdge(selected, false);
        } else {
          setHighlightByNode(selected, false);
        };
      } else {
        if ($('#quick-search').val().length > 0) {
          setHighlightByStr($('#quick-search').val());
        } else {
          link.classed('dim', function(p) {
            return !slider_year_link(p) && !slider_duration_link(p);
          }).classed('d-none', function(p) {
            return !isLinkOn() || (!slider_year_link(p) && !slider_duration_link(p));
          }).classed('selected', false);
          node.classed('dim', false).classed('selected', false);
          text.classed('dim', function(p) {
            return !slider_year_node(p) && !slider_duration_node(p);
          }).classed('d-none', function(p) {
            return !isTextOn() || (!slider_year_node(p) && !slider_duration_node(p));
          });
        };
      };
    };
  };
};

resetSelected = function() {
  if (link !== null) {
    selected = null;
    exitHighlight();
  };
};

resetSize = function() {
  width = $('#canvas').width();
  height = $('#canvas').height();
};

// if zoom!=null then zoom.center [width / 2, height / 2]
// if svg!=null then svg.attr "viewBox", "0 0 " + width + " " + height
resetCanvas = function() {
  resetSize();
  // zoom.center [width / 2, height / 2]
  // zoom.translate [0, 0]
  $('#canvas').empty();
  // .attr "viewBox", "0 0 " + width + " " + height
  // .attr 'cursor', 'move'
  svg = d3.select('#canvas').append('svg').attr('class', 'main-canvas').call(zoom);
  // .on 'click', (d) ->
  //   if not d3.event.defaultPrevented then resetSelected()
  //   return
  g = svg.append('g');
  // svg.attr 'transform', d3.zoomIdentity
  svgLinks = g.append('g');
  svgNodes = g.append('g');
  svgTexts = g.append('g');
};

// initialization when document gets ready
$(function() {
  init();
});