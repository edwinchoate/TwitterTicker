// Parses csv to get tweet data
function loadTweetData(companyName, tweetsData) {

    var dateToDataMap = new LinkedHashMap();
    //Get the values for tweetDataByCompany
    var keywordData = tweetsData.map(function (d) {

        var unixTime = parseDateAsInt(d.date);
        var keyword = d.keyword;
        var keywordType = d.keywordType;
        var sentiment = d.avgSentiment;
        var totalRetweets = d.totalRT;
        var totalFavorites = d.totalFav;
        var totalPopularity = d.totalPop;
        var topTweets = d.topTweet;
        var topRetweets = d.topRT;
        var topFavorites = d.topFav;
        var topPopularity = d.topPop;

        var dataArray = [keyword, keywordType, sentiment, totalRetweets, totalFavorites, totalPopularity, topTweets, topRetweets, topFavorites, topPopularity];

        if (dateToDataMap.hasValue(unixTime)) {
            var currentData = dateToDataMap.get(unixTime);
            currentData.concat(dataArray);
        } else {
            currentData = dataArray;
        }
        dateToDataMap.put(unixTime, currentData);
    });
    companyToFinalDataMap.put(companyName, dateToDataMap);
    initializeTweetsViewWithData();
    console.log("DATE TO DATA MAP", dateToDataMap);
}

//Changes the tweet view when a company is added or removed.
function loadTwitterData() {
    var myLength = selectedCompanies.length;
    for (var i = 0; i < myLength; i++) {
        companyName = selectedCompanies[i];
        d3.csv("data/twitter/" + companyName + "_final.csv", function (tweetsData) {
            loadTweetData(companyName, tweetsData);
        });
    }
}

function parseDateAsInt(date) {
    var toReturn = new Date(null);
    if (typeof date === 'string' || date !== null) {
        var parts = date.split('/');
        var myDate = new Date(parts[2], parts[0] - 1, parts[1]);
        toReturn = Date.parse(myDate);
    }
    return toReturn;
}

// Scans through the data, makes 'buckets' for each bubble (keyword),
// and aggregates the data for each bubble (keyword).
function initializeTweetsViewWithData() {

    var myLength = selectedCompanies.length;

    console.log("MY START DATE", myStartDate);
    console.log("MY END DATE ", myEndDate);

    for (var i = 0; i < myLength; i++) {
        company = selectedCompanies[i];
        var dateToDataMap = companyToFinalDataMap.get(company);
        var keyset = dateToDataMap.getAllKeys();

        // for every date between these two
        var keysetLength = keyset.length;
        for (var i = 0; i < keysetLength; i++) {

            var date = keyset[i];
            //console.log("SKIP DATE", myStartDate, myEndDate, date);
            if (date > myStartDate && date < myEndDate) {
                //doodle through until you get to the end date
                //console.log("DO THE DO");
                var data = dateToDataMap.get(date);
                var currentKeyword = data[0];

                if (keywordToDataMap.hasValue(currentKeyword)) {
                    // add new entry
                    keywordToDataMap.put(currentKeyword, [data[1], data[2], data[6], data[7], data[8], 1.0]);
                    //console.log("New Jack", keywordToDataMap);
                } else {
                    aggregatedData = keywordToDataMap.get(currentKeyword);

                    //modify the current entry

                    newCount = aggregatedData[5] + 1.0;
                    newSentiment = (data[2] + aggregatedData[1]) / newCount;
                    newRT = data[6] + aggregatedData[2];
                    newFav = data[7] + aggregatedData[3];
                    newPop = data[8] + aggregatedData[4];

                    keywordToDataMap.put(currentKeyword, [data[1], newSentiment, newRT, newFav, newPop, newCount]);
                    //console.log("Alligatorate Jack", keywordToDataMap);
                }
            } else if (date > endDate) {
                break;
            }
        }
    }
}

function loadSentiView() {
    // $.getScript("js/vis.js", this);
}




// Creates the Twitter Cluster View. Code from http://bl.ocks.org/mbostock/7882658
function loadClusterView() {

    var width = 500,
        height = 330,
        padding = 1.5, // separation between same-color nodes
        clusterPadding = 6, // separation between different-color nodes
        maxRadius = 18;

    var n = 200, // total number of nodes
        m = 6; // number of distinct clusters (number of companies)

    var color = d3.scale.category10()
        .domain(d3.range(m));

    // The largest node for each cluster.
    var clusters = new Array(m);

    var nodes = d3.range(n).map(function () {
        var i = Math.floor(Math.random() * m),
            r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
            d = {
                cluster: i,
                radius: r
            };
        if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
        return d;
    });

    // Use the pack layout to initialize node positions.

    d3.layout.pack()
        .sort(clusterPadding)
        .size([width, height])
        .children(function (d) {
            return d.values;
        })
        .value(function (d) {
            return d.radius * d.radius;
        })
        .nodes({
            values: d3.nest()
                .key(function (d) {
                    return d.cluster;
                })
                .entries(nodes)
        });

    var force = d3.layout.force()
        .nodes(nodes)
        .size([width * 1.5, height * 1.5])
        .gravity(.02)
        .charge(0)
        .on("tick", tick)
        .start();

    var svg = d3.select("#cluster-view").append("svg")
        .attr("width", width)
        .attr("height", height);

    var node = svg.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .style("fill", function (d) {
            return color(d.cluster);
        })
        .call(force.drag);

    node.transition()
        .duration(750)
        .delay(function (d, i) {
            return i * 5;
        })
        .attrTween("r", function (d) {
            var i = d3.interpolate(0, d.radius);
            return function (t) {
                return d.radius = i(t);
            };
        });

    function tick(e) {
        node
            .each(cluster(10 * e.alpha * e.alpha))
            .each(collide(.5))
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });
    }


    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {
        return function (d) {
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
        return function (d) {
            var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
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
