//Changes the tweet view when a company is added or removed.
function loadTwitterData() {
    var companyToFinalDataMap = new Map();
    var myLength = selectedCompanies.length;
    for (var i = 0; i < myLength; i++) {
        companyName = selectedCompanies[i];
        if (!companyToFinalDataMap.has(companyName)) {
            d3.csv("data/twitter/" + companyName + "_final.csv", function (tweetsData) {
                console.log("BEGIN");
                //addDataToHashMapFromCSV(companyName, tweetsData);
                //Get the values for tweetDataByCompany
                var keywordToDataMap = new Map();
                var maxCount = NUM_BUBBLES / currentNumberOfCompanies;
                var rowcount = 0;
                console.log("TWEETS DATA", tweetsData);

                for (var i = 0; i < tweetsData.length && i < maxCount; i++) {
                    currentRow = tweetsData[i];
                    [currentRow].map(function (d) {
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
                        var dates = [];

                        var hasMoreDates = true;
                        var count = 0;
                        while (hasMoreDates) {
                            var colName = "date" + count;
                            var currentDate = d[colName];

                            if (currentDate === null || currentDate == "") {
                                hasMoreDates = false;
                            } else {
                                dates.push(currentDate);
                                count += 1;
                            }
                        }

                        var dataArray = [keywordType, sentiment, totalRetweets, totalFavorites, totalPopularity, topTweets, topRetweets, topFavorites, topPopularity, dates, companyName];

                        keywordToDataMap.set(keyword, dataArray);
                    });
                }

                companyToFinalDataMap.set(companyName, keywordToDataMap);

                console.log("GOOD COMPANY ", companyToFinalDataMap);
                console.log("END");
            });

        }
    }
    return companyToFinalDataMap;
}


// Parses csv to get tweet data
function addDataToHashMapFromCSV(companyName, tweetsData) {
    //Get the values for tweetDataByCompany
    var keywordToDataMap = new Map();
    var maxCount = NUM_BUBBLES / currentNumberOfCompanies;
    var rowcount = 0;
    console.log("TWEETS DATA", tweetsData);

    for (var i = 0; i < tweetsData.length && i < maxCount; i++) {
        currentRow = tweetsData[i];
        [currentRow].map(function (d) {
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
            var dates = [];

            var hasMoreDates = true;
            var count = 0;
            while (hasMoreDates) {
                var colName = "date" + count;
                var currentDate = d[colName];

                if (currentDate === null || currentDate == "") {
                    hasMoreDates = false;
                } else {
                    dates.push(currentDate);
                    count += 1;
                }
            }

            var dataArray = [keywordType, sentiment, totalRetweets, totalFavorites, totalPopularity, topTweets, topRetweets, topFavorites, topPopularity, dates, companyName];

            keywordToDataMap.set(keyword, dataArray);
        });
    }

    companyToFinalDataMap.set(companyName, keywordToDataMap);
    console.log("GOOD COMPANY ", companyToFinalDataMap);
}

//Given a keyword, return an array containing the dates for that company
function getDatesFromHashMap(companyToFinalDataMap, keyword, company) {
    var keywordToDataMap = companyToFinalDataMap.get(company);
    return keywordToDataMap.get(keyword)[9];
}

function getDataFromHashMap(companyToFinalDataMap, keyword, company) {
    var keywordToDataMap = companyToFinalDataMap.get(company);
    console.log("YEIHIHUHUHH", keywordToDataMap);
    console.log("HSFIJAIJBFBFB", keywordToDataMap.get(keyword));
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


// Creates the Twitter Cluster View. Code from http://bl.ocks.org/mbostock/7882658
function loadClusterView(clusterData) {

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
    // var clusters = new Array(m);

    // var nodes = d3.range(n).map(function () {
    //     var i = Math.floor(Math.random() * m),
    //         r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
    //         d = {
    //             cluster: i,
    //             radius: r
    //         };
    //     if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
    //     return d;
    // });

    //console.log("NOdes", nodes);
    //console.log("real clusters", clusters);
    var nodes = [];
    var clusters = new Array(m);
    var maxPop = clusterData[0].totalPop;
    //console.log("mex pap", clusterData[0]);
    if(typeof maxPop === "undefined") {
        maxPop = 1;
    }
    var data = 0;
    var myCompany = "Amazon";
    var myPop = 1;
    var clusterVal = 0;

    for (var i = 0; i < n; i++) {

        if (selectedCompanies.length > 0) {
            data = clusterData[i];
            //console.log("DATA", data);
            myCompany = data.company;
            myPop = data.totalPop;
            //console.log(myCompany);
            clusterVal = selectedCompanies.indexOf(myCompany);
        }
        var swert = -Math.log(myPop / maxPop + 0.00000001);

        var r = Math.sqrt(Math.abs(swert)) * maxRadius;
        // console.log("SWERT", swert);
        // console.log("MAXPOP", maxPop);
        var d = {
            cluster: clusterVal,
            radius: r/2,
            company: myCompany,
            keyword: data.keyword
        }
        if (!clusters[clusterVal] || (r > clusters[clusterVal].radius)) clusters[clusterVal] = d;
        nodes.push(d);
    }
    //console.log("nodes", nodes);
    console.log("clusters", clusters);

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
        .attr('fill', function (d) {
            switch (d.company) {
                case "Amazon":
                    return companyColors.Amazon;
                    break;
                case "Apple":
                    return companyColors.Apple;
                    break;
                case "Intel":
                    return companyColors.Intel;
                    break;
                case "IBM":
                    return companyColors.IBM;
                    break;
                case "Microsoft":
                    return companyColors.Microsoft;
                    break;
                case "Google":
                    return companyColors.Google;
                    break;
                default:
                    return "#55acee";
            }
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

    function getKeywordTitle(d) {
        switch (d.keyword) {
            case "avgSentiment":
                return "Average Sentiment Score";
                break;
            case "totalRT":
                return "Total Retweets";
                break;
            case "totalFav":
                return "Total Favorites";
                break;
            default:
                $("#tweet-display").text(d.company + ": " + d.topTweet);
                $("#num-retweets-display").text(d.topRT);
                $("#num-favorites-display").text(d.topFav);
                return d.keyword + "<hr>" +
                    "Company: " + d.company + "<br><br>" +
                    "Top <i class=\"fa fa-retweet\"></i>'s: " + d.topRT + "<br>" +
                    "Top <i class=\"fa fa-star\"></i>'s: " + d.topFav + "<br><br>" +
                    "Total <i class=\"fa fa-retweet\"></i>'s: " + d.totalRT + "<br>" +
                    "Total <i class=\"fa fa-star\"></i>'s: " + d.totalFav + "<br>";
        }
    }

    /**
     * Funtion to handle tooltips over the dust
     */
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            ////console.log(d);
            return "<strong>" + getKeywordTitle(d) + "</strong>";
        })

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
