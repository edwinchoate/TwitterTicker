
// Parses csv to get tweet data
function loadTweetData(companyName, tweetsData) {
	
	var dateToDataMap = new LinkedHashMap();
	//Get the values for tweetDataByCompany
    var keywordData = tweetsData.map(function(d) {

        var unixTime = parseDateAsInt(d.date);
        var keyword = d.keyword;
        var keywordType = d.keywordType;
        var sentiment = d.sentiment;
        var sentimentType = d.sentimentType;
        var id = d.id;
        var tweet = d.tweet;
        var retweets = d.retweets;
        var favorites = d.favorites;
        var popularity = d.popularity;

        var dataArray = [keyword, keywordType, sentiment, sentimentType, id, tweet, retweets, favorites, popularity];

        if(dateToDataMap.hasValue(unixTime)) {
        	currentData = dateToDataMap.get(unixTime);
        	currentData.concat(dataArray);
        }
        else {
        	currentData = dataArray;
        }
    	dateToDataMap.put(unixTime, currentData);
    });
	companyToFinalDataMap.put(companyName, dateToDataMap);
	initializeTweetsView();
}

//Changes the tweet view when a company is added or removed.
function updateTweetsView() {
	if(selectedCompanies.length == 0){
		return;
	}
	var myLength = selectedCompanies.length;
	for(var i = 0; i < myLength; i++) {
		companyName = selectedCompanies[i];
		d3.csv("data/twitter/" +companyName+"_twitter.csv", function(tweetsData)
	    {
	        loadTweetData(companyName, tweetsData);
	    });	
    }	
}



// Changes the tweets view when the viewfinder is moved.
function scrollTweetsView(){
	myStartDate = Date.parse(startDate);
	myEndDate = Date.parse(endDate);
	myOldStartDate = Date.parse(oldStartDate);
	myOldEndDate = Date.parse(oldEndDate);

	if(myStartDate < myOldStartDate && myOldEndDate === myOldEndDate) {
			//add on extra 

		}
		else if(myStartDate === myOldStartDate && myEndDate === myOldEndDate) {

		}
		else if(myStartDate > myOldStartDate && myOldEndDate === myOldEndDate) {
			//add on extra 
			
		}
		else if(myStartDate < myOldStartDate && myEndDate < myOldEndDate) {

		}
		else if(myStartDate === myOldStartDate && myOldEndDate < myOldEndDate) {
			//add on extra 
			
		}
		else if(myStartDate > myOldStartDate && myEndDate < myOldEndDate) {

		}
		else if(myStartDate < myOldStartDate && myOldEndDate > myOldEndDate) {
			//add on extra 
			
		}
		else if(myStartDate === myOldStartDate && myEndDate > myOldEndDate) {

		}
		else if(myStartDate > myOldStartDate && myEndDate > myOldEndDate) {

		}
		else if(myEndDate < myOldStartDate) {

		}
		else if(myStartDate > myOldEndDate) {

		}
}

function parseDateAsInt(date){
	if(typeof date === 'undefined' || date === null){
		return;
	}
    var parts = date.split('/');
	var myDate = new Date(parts[2],parts[0]-1,parts[1]); 
	return Date.parse(myDate);
}

// Scans through the data, makes 'buckets' for each bubble (keyword),
// and aggregates the data for each bubble (keyword).
function initializeTweetsView (){

	var myLength = selectedCompanies.length;
	myStartDate = Date.parse(startDate);
	myEndDate = Date.parse(endDate);

	for(var i = 0; i < myLength; i++) {
		company = selectedCompanies[i];
		var dateToDataMap = companyToFinalDataMap.get(company);
		var keyset = dateToDataMap.getAllKeys();

		// for every date between these two
		var keysetLength = keyset.length;
		for(var i = 0; i < keysetLength; i++){
			
			var date = keyset[i];
			console.log("SKIP DATE", myStartDate, myEndDate, date);
			if(date > myStartDate && date < myEndDate){
				//doodle through until you get to the end date
				console.log("DO THE DO");
				var data = dateToDataMap.get(date);
				var currentKeyword = data[0];

				if(keywordToDataMap.hasValue(currentKeyword)){
					// add new entry
					keywordToDataMap.put(currentKeyword, [data[1],data[2],data[6],data[7],data[8], 1.0]);
					console.log("New Jack", keywordToDataMap);
				}
				else{
					aggregatedData = keywordToDataMap.get(currentKeyword);

					//modify the current entry
					
					newCount = aggregatedData[5] + 1.0;
					newSentiment = (data[2] + aggregatedData[1]) / newCount;
					newRT = data[6] + aggregatedData[2];
					newFav = data[7] + aggregatedData[3];
					newPop = data[8] + aggregatedData[4];

					keywordToDataMap.put(currentKeyword, [data[1], newSentiment, newRT, newFav, newPop, newCount]);
					console.log("Alligatorate Jack", keywordToDataMap);
				}
			}
			else if(date > endDate){
				break;
			}
		}	
	}
}

function loadWordCloudView() {
		// Generated by CoffeeScript 1.9.3
	(function() {
	  var Bubbles, root, texts;

	  root = typeof exports !== "undefined" && exports !== null ? exports : this;

	  Bubbles = function() {
	    var chart, clear, click, collide, collisionPadding, connectEvents, data, force, gravity, hashchange, height, idValue, jitter, label, margin, maxRadius, minCollisionRadius, mouseout, mouseover, node, rScale, rValue, textValue, tick, transformData, update, updateActive, updateLabels, updateNodes, width;
	    width = 980;
	    height = 510;
	    data = [];
	    node = null;
	    label = null;
	    margin = {
	      top: 5,
	      right: 0,
	      bottom: 0,
	      left: 0
	    };
	    maxRadius = 65;
	    rScale = d3.scale.sqrt().range([0, maxRadius]);
	    rValue = function(d) {
	      return parseInt(d.popularity);
	    };
	    idValue = function(d) {
	      return d.keyword;
	    };
	    textValue = function(d) {
	      return d.keyword;
	    };
	    collisionPadding = 4;
	    minCollisionRadius = 12;
	    jitter = 0.5;
	    transformData = function(rawData) {
	      rawData.forEach(function(d) {
	        d.popularity = parseInt(d.popularity);
	        return rawData.sort(function() {
	          return 0.5 - Math.random();
	        });
	      });
	      return rawData;
	    };
	    tick = function(e) {
	      var dampenedAlpha;
	      dampenedAlpha = e.alpha * 0.1;
	      node.each(gravity(dampenedAlpha)).each(collide(jitter)).attr("transform", function(d) {
	        return "translate(" + d.x + "," + d.y + ")";
	      });
	      return label.style("left", function(d) {
	        return ((margin.left + d.x) - d.dx / 2) + "px";
	      }).style("top", function(d) {
	        return ((margin.top + d.y) - d.dy / 2) + "px";
	      });
	    };
	    force = d3.layout.force().gravity(0).charge(0).size([width, height]).on("tick", tick);
	    chart = function(selection) {
	      return selection.each(function(rawData) {
	        var maxDomainValue, svg, svgEnter;
	        data = transformData(rawData);
	        maxDomainValue = d3.max(data, function(d) {
	          return rValue(d);
	        });
	        rScale.domain([0, maxDomainValue]);
	        svg = d3.select(this).selectAll("svg").data([data]);
	        svgEnter = svg.enter().append("svg");
	        svg.attr("width", width + margin.left + margin.right);
	        svg.attr("height", height + margin.top + margin.bottom);
	        node = svgEnter.append("g").attr("id", "bubble-nodes").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	        node.append("rect").attr("id", "bubble-background").attr("width", width).attr("height", height).on("click", clear);
	        label = d3.select(this).selectAll("#bubble-labels").data([data]).enter().append("div").attr("id", "bubble-labels");
	        update();
	        hashchange();
	        return d3.select(window).on("hashchange", hashchange);
	      });
	    };
	    update = function() {
	      data.forEach(function(d, i) {
	        return d.forceR = Math.max(minCollisionRadius, rScale(rValue(d)));
	      });
	      force.nodes(data).start();
	      updateNodes();
	      return updateLabels();
	    };
	    updateNodes = function() {
	      node = node.selectAll(".bubble-node").data(data, function(d) {
	        return idValue(d);
	      });
	      node.exit().remove();
	      return node.enter().append("a").attr("class", "bubble-node").attr("xlink:href", function(d) {
	        return "#" + (encodeURIComponent(idValue(d)));
	      }).call(force.drag).call(connectEvents).append("circle").attr("r", function(d) {
	        return rScale(rValue(d));
	      });
	    };
	    updateLabels = function() {
	      var labelEnter;
	      label = label.selectAll(".bubble-label").data(data, function(d) {
	        return idValue(d);
	      });
	      label.exit().remove();
	      labelEnter = label.enter().append("a").attr("class", "bubble-label").attr("href", function(d) {
	        return "#" + (encodeURIComponent(idValue(d)));
	      }).call(force.drag).call(connectEvents);
	      labelEnter.append("div").attr("class", "bubble-label-name").text(function(d) {
	        return textValue(d);
	      });
	      labelEnter.append("div").attr("class", "bubble-label-value").text(function(d) {
	        return rValue(d);
	      });
	      label.style("font-size", function(d) {
	        return Math.max(8, rScale(rValue(d) / 2)) + "px";
	      }).style("width", function(d) {
	        return 2.5 * rScale(rValue(d)) + "px";
	      });
	      label.append("span").text(function(d) {
	        return textValue(d);
	      }).each(function(d) {
	        return d.dx = Math.max(2.5 * rScale(rValue(d)), this.getBoundingClientRect().width);
	      }).remove();
	      label.style("width", function(d) {
	        return d.dx + "px";
	      });
	      return label.each(function(d) {
	        return d.dy = this.getBoundingClientRect().height;
	      });
	    };
	    gravity = function(alpha) {
	      var ax, ay, cx, cy;
	      cx = width / 2;
	      cy = height / 2;
	      ax = alpha / 8;
	      ay = alpha;
	      return function(d) {
	        d.x += (cx - d.x) * ax;
	        return d.y += (cy - d.y) * ay;
	      };
	    };
	    collide = function(jitter) {
	      return function(d) {
	        return data.forEach(function(d2) {
	          var distance, minDistance, moveX, moveY, x, y;
	          if (d !== d2) {
	            x = d.x - d2.x;
	            y = d.y - d2.y;
	            distance = Math.sqrt(x * x + y * y);
	            minDistance = d.forceR + d2.forceR + collisionPadding;
	            if (distance < minDistance) {
	              distance = (distance - minDistance) / distance * jitter;
	              moveX = x * distance;
	              moveY = y * distance;
	              d.x -= moveX;
	              d.y -= moveY;
	              d2.x += moveX;
	              return d2.y += moveY;
	            }
	          }
	        });
	      };
	    };
	    connectEvents = function(d) {
	      d.on("click", click);
	      d.on("mouseover", mouseover);
	      return d.on("mouseout", mouseout);
	    };
	    clear = function() {
	      return location.replace("#");
	    };
	    click = function(d) {
	      location.replace("#" + encodeURIComponent(idValue(d)));
	      return d3.event.preventDefault();
	    };
	    hashchange = function() {
	      var id;
	      id = decodeURIComponent(location.hash.substring(1)).trim();
	      return updateActive(id);
	    };
	    updateActive = function(id) {
	      node.classed("bubble-selected", function(d) {
	        return id === idValue(d);
	      });
	      if (id.length > 0) {
	        return d3.select("#status").html("<h3>The word <span class=\"active\">" + id + "</span> is now active</h3>");
	      } else {
	        return d3.select("#status").html("<h3>No word is active</h3>");
	      }
	    };
	    mouseover = function(d) {
	      return node.classed("bubble-hover", function(p) {
	        return p === d;
	      });
	    };
	    mouseout = function(d) {
	      return node.classed("bubble-hover", false);
	    };
	    chart.jitter = function(_) {
	      if (!arguments.length) {
	        return jitter;
	      }
	      jitter = _;
	      force.start();
	      return chart;
	    };
	    chart.height = function(_) {
	      if (!arguments.length) {
	        return height;
	      }
	      height = _;
	      return chart;
	    };
	    chart.width = function(_) {
	      if (!arguments.length) {
	        return width;
	      }
	      width = _;
	      return chart;
	    };
	    chart.r = function(_) {
	      if (!arguments.length) {
	        return rValue;
	      }
	      rValue = _;
	      return chart;
	    };
	    return chart;
	  };

	  root.plotData = function(selector, data, plot) {
	    return d3.select(selector).datum(data).call(plot);
	  };

	  texts = [
	    {
	      key: "sherlock",
	      file: "Apple_twitter.csv",
	      name: "The Adventures of Steve Jobs"
	    }, {
	      key: "aesop",
	      file: "top_aesop.csv",
	      name: "Aesop's Fables"
	    }, {
	      key: "alice",
	      file: "alice.csv",
	      name: "Alice's Adventures in Wonderland"
	    }, {
	      key: "gulliver",
	      file: "top_gulliver.csv",
	      name: "Gulliver's Travels"
	    }
	  ];

	  $(function() {
	    var display, key, plot, text;
	    plot = Bubbles();
	    display = function(data) {
	      return plotData("#vis", data, plot);
	    };
	    key = decodeURIComponent(location.search).replace("?", "");
	    text = texts.filter(function(t) {
	      return t.key === key;
	    })[0];
	    if (!text) {
	      text = texts[0];
	    }
	    d3.select("#jitter").on("input", function() {
	      return plot.jitter(parseFloat(this.output.value));
	    });
	    d3.select("#text-select").on("change", function(e) {
	      key = $(this).val();
	      location.replace("#");
	      return location.search = encodeURIComponent(key);
	    });
	    d3.select("#book-title").html(text.name);
	    return d3.csv("data/twitter/" + text.file, display);
	  });

	}).call(this);
}




// Creates the Twitter Cluster View. Code from http://bl.ocks.org/mbostock/7882658
function loadTweetsView () {

	var width = 500,
    height = 500,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 12;

	var n = 200, // total number of nodes
	    m = 10; // number of distinct clusters

	var color = d3.scale.category10()
	    .domain(d3.range(m));

	// The largest node for each cluster.
	var clusters = new Array(m);

	var nodes = d3.range(n).map(function() {
	  var i = Math.floor(Math.random() * m),
	      r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
	      d = {cluster: i, radius: r};
	  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
	  return d;
	});

	// Use the pack layout to initialize node positions.
	d3.layout.pack()
	    .sort(null)
	    .size([width, height])
	    .children(function(d) { return d.values; })
	    .value(function(d) { return d.radius * d.radius; })
	    .nodes({values: d3.nest()
	      .key(function(d) { return d.cluster; })
	      .entries(nodes)});

	var force = d3.layout.force()
	    .nodes(nodes)
	    .size([width, height])
	    .gravity(.02)
	    .charge(0)
	    .on("tick", tick)
	    .start();

	var svg = d3.select("#tweetsView").append("svg")
	    .attr("width", width)
	    .attr("height", height);

	var node = svg.selectAll("circle")
	    .data(nodes)
	  .enter().append("circle")
	    .style("fill", function(d) { return color(d.cluster); })
	    .call(force.drag);

	node.transition()
	    .duration(750)
	    .delay(function(d, i) { return i * 5; })
	    .attrTween("r", function(d) {
	      var i = d3.interpolate(0, d.radius);
	      return function(t) { return d.radius = i(t); };
	    });

	function tick(e) {
	  node
	      .each(cluster(10 * e.alpha * e.alpha))
	      .each(collide(.5))
	      .attr("cx", function(d) { return d.x; })
	      .attr("cy", function(d) { return d.y; });
	}

	// Move d to be adjacent to the cluster node.
	function cluster(alpha) {
	  return function(d) {
	    var cluster = clusters[d.cluster];
	    if (cluster === d) return;
	    var x = d.x - cluster.x,
	        y = d.y - cluster.y,
	        l = Math.sqrt(x * x + y * y),
	        r = d.radius + cluster.radius;
	    if (l != r) {
	      l = (l - r) / l * alpha;
	      d.x -= x *= l;
	      d.y -= y *= l;
	      cluster.x += x;
	      cluster.y += y;
	    }
	  };
	}
	
	// Resolves collisions between d and all other circles.
	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(nodes);
	  return function(d) {
	    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
	        nx1 = d.x - r,
	        nx2 = d.x + r,
	        ny1 = d.y - r,
	        ny2 = d.y + r;
	    quadtree.visit(function(quad, x1, y1, x2, y2) {
	      if (quad.point && (quad.point !== d)) {
	        var x = d.x - quad.point.x,
	            y = d.y - quad.point.y,
	            l = Math.sqrt(x * x + y * y),
	            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
	        if (l < r) {
	          l = (l - r) / l * alpha;
	          d.x -= x *= l;
	          d.y -= y *= l;
	          quad.point.x += x;
	          quad.point.y += y;
	        }
	      }
	      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	    });
	  };
	}

}




// TODO updateTweetsView() 