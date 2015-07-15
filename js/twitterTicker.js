var stockFinalData    = [];
var tweetFinalData    = [];
var selectedCompanies = [];
var currentDisplayedKeywords = [];
var companyToFinalDataMap = new LinkedHashMap();
var keywordToDataMap      = new LinkedHashMap();

var selectedModeTag;
var selectedModeName;
var companyColors = {Amazon: "#E6E65C", Apple: "#cccccc", Intel: "#63D9DB", IBM: "#BB63DB", Microsoft: "#51C253", Google: "#EB832F"};

var isTweetSelected = false;

/*
    viewMode represents one of three modes:
    0 - RelaTweeter View
    1 - SentiMagnets View
    2 - Cluster View 
*/
var viewMode = 0;
var companies = [];

var chart;
var chartData;

var minDate,
    maxDate = 0;

var myStartDate, 
    myEndDate, 
    myOldStartDate,
    myOldEndDate;

var startDate, endDate;
var firstTimeLoad = true;

var oldStartDate, 
    oldEndDate = new Date();
var currentNumberOfCompanies = 0;

var SHOW_LEGEND = true;
var MAX_NUM_COMPANIES = 5;
var NO_TWITTER_VIEW_SELECTED = "No Twitter View Selected";

$(document).ready(function () {
    
    companies = ["Amazon", "Apple", "Intel", "IBM", "Microsoft", "Google"];
    $("#filter-tweet-selector").slider();

    loadCompanies(companies);
    initializeTweetsView();
    
    loadTweetLineDisplay();

    $("#company-selector").on("click", "g input", handleCompanySelection);
    $("#view-mode-selector").on("click", "g input", handleViewModeSelection);
    $("#filter-mode-selector").on("click", "g input", handleFilterModeSelection);
    //ON CLICK FOR THE NAV BAR   
    //$(window).on('click', updateSelectionDates);
    //$('.g.nv-x.nv.brush').on('click', updateSelectionDates);

       // var unparsedEndDate   = $(".nv-focus").find(".nv-axisMaxMin.nv-axisMaxMin-x.nv-axisMax-x").text();

   
    // horizontal line seperating selected/not-selected companies
    
    // load companies into selector pane
    function loadCompanies (companiesArray) {
        var companyForm = $("#company-selector");
        
        for (company in companiesArray) {
            var currentCompany = companiesArray[company];
            companyForm.append("<g id=\"" + currentCompany + "-input\"><input type=\"checkbox\" id=\"" +
                               currentCompany + 
                               "\"><label for=\"" + currentCompany + "\">" + 
                               currentCompany + "</label><br></g>");
        }
    }

    // handle selection of companies
    function handleCompanySelection () {
        var currentCompany = $(this).closest("g").find("label");
        var currentCompanyName = currentCompany.attr("for").toString();
        
        if(currentCompany.hasClass("selected")) {
            var index = selectedCompanies.indexOf(currentCompanyName);
            currentCompany.removeClass("selected");
            if (selectedCompanies.length <= 1) {
                $("#please").fadeIn(650);   
            }
            selectedCompanies.splice(index, 1);   
            removeCompany(currentCompanyName, index);
            $(this).closest("g").prependTo("#unselected-container");
        } else {
            selectedCompanies.push(currentCompany.attr("for").toString());
            var index = selectedCompanies.indexOf(currentCompanyName);
            addCompany(currentCompanyName, index);
        
            currentCompany.addClass("selected");
            $(this).closest("g").prependTo("#selected-container");
        }
             
        console.log(selectedCompanies);
    }

    //handle mode selection
    function handleViewModeSelection() {
        var currentViewMode = $(this).closest("g").find("label").attr("for");
        
        if (currentViewMode === "magnet") {
            viewMode = 0;
            console.log("Magnet View was selected... (viewMode=" + viewMode + ")");
        } else if (currentViewMode === "senti") {
            viewMode = 1;
            console.log("Sentiment View was selected... (viewMode=" + viewMode + ")");
        } else if (currentViewMode === "cluster") {
            viewMode = 2;
            console.log("Cluster View was selected... (viewMode=" + viewMode + ")");
        }
        displayTwitterVis();
    }
    
    function handleFilterModeSelection () {
        var currentFilterMode = $(this).closest("g").find("label");
        
        if (currentFilterMode.hasClass("selected")) {
            currentFilterMode.removeClass("selected");
            console.log(currentFilterMode.text() + " was deselected...");
        } else {
            currentFilterMode.addClass("selected");
            console.log(currentFilterMode.text() + " was selected...");
        }
    }
 });
 

function updateSelectionDates () {
    


    
    if(!firstTimeLoad) {
        console.log("THE SCROLL BAR HAS MOVED REGARDLESS OF NUMBER OF COMPANIES");
        oldStartDate = startDate;
        oldEndDate   = endDate;

        var unparsedStartDate = $(".nv-focus").find(".nv-axisMaxMin.nv-axisMaxMin-x.nv-axisMin-x").text();
        var unparsedEndDate   = $(".nv-focus").find(".nv-axisMaxMin.nv-axisMaxMin-x.nv-axisMax-x").text();

        startDate = Date.parse(unparsedStartDate);
        endDate   = Date.parse(unparsedEndDate);

        console.log("Selected Start Date:", startDate + "\nSelected End Date:", endDate);
        $.getScript("js/tweetsView.js", scrollTweetsView);
    }
    else {
        console.log("LOAD TWEETS VIEW INITIALLY");
        myStartDate = startDate;
        myEndDate   = endDate; 
        oldStartDate = myStartDate;
        oldEndDate = myEndDate;
        //need to update this so that we can get
        $.getScript("js/tweetsView.js", loadTweetsView());
    }
}

function addCompany(companyName, index) {
    console.log("Adding " + companyName + " to Stock Timeline...");
    $("#please").hide();
    if(currentNumberOfCompanies == 0) {
        initializeStockTimeline(companyName, index);
    }
    else {
        updateStockTimeline(companyName, index);
    }
    
    addCompanyToMagnetView(companyName, index);
    
    console.log(stockFinalData);
}

function removeCompany(companyName, index) {
    console.log("Removing " + companyName + " from Stock Timeline...");
    stockFinalData.splice(index, 1);
    loadStockTimeline(stockFinalData, startDate, endDate);
    currentNumberOfCompanies = stockFinalData.length;
    
    
    removeCompanyFromMagnetView(companyName, index);
}

function loadStockData(companyName, index, pricesData) {
    var stockDataByCompany = new Object();
    stockDataByCompany.key = companyName;

    var stockDataToNum = pricesData.map(function(d) {
        var stockTime = +d.date;
        var stockClosing = +d.close;
        return [stockTime, stockClosing];
    });

    stockDataByCompany.values = stockDataToNum;
    stockDataByCompany.color = companyColors[companyName];
    
    stockFinalData[index] = stockDataByCompany;
}

function initializeStockTimeline(companyName, index)
{
    d3.csv("data/stock/" +companyName+"_stock.csv", function(pricesData)
    {
        loadStockData(companyName, index, pricesData);

        minDate = stockFinalData[0].values[0][0];
        maxDate = stockFinalData[0].values[stockFinalData[0].values.length - 1][0];

        startDate = (maxDate-minDate)/4 + minDate;
        endDate   = 3*(maxDate-minDate)/4 + minDate;

        console.log("START DATE: ",startDate, "END DATE", endDate);
        loadStockTimeline(stockFinalData, startDate, endDate);
        currentNumberOfCompanies = stockFinalData.length;
        //updateSelectionDates();
    });
}

function updateStockTimeline(companyName, index)
{
    d3.csv("data/stock/" +companyName+"_stock.csv", function(pricesData)
    {
        firstTimeLoad = false;
        loadStockData(companyName, index, pricesData);
        
        var companyMinDate = stockFinalData[index].values[0][0];
        var companyMaxDate = stockFinalData[0].values[stockFinalData[0].values.length - 1][0];
        if(minDate > companyMinDate) { minDate = companyMinDate; }
        if(maxDate < companyMaxDate) { maxDate = companyMaxDate; }

        startDate = (maxDate-minDate)/4 + minDate;
        endDate   = 3*(maxDate-minDate)/4 + minDate;

        chart.brushExtent([startDate, endDate]);
        chartData.datum(stockFinalData).call(chart);
        nv.utils.windowResize(chart.update);
        currentNumberOfCompanies = stockFinalData.length;

        //updateSelectionDates();
    });
}

function loadStockTimeline (data, start, end) {
    nv.addGraph(function() {

        chart = nv.models.lineWithFocusChart()
                    .useInteractiveGuideline(true)
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; })
                    .duration(250)
                    //.color(d3.scale.category10().range())
                    .clipVoronoi(false)
                    .showLegend(SHOW_LEGEND);

        chart.brushExtent([start, end]);
        chart.margin({left: 75, bottom: 50});
        chart.focusMargin({ "bottom": 40 });
        chart.focusHeight(70);

        chart.xAxis.tickFormat(function(d) {return d3.time.format('%m/%d/%y')(new Date(d))});
        chart.x2Axis.axisLabel("Date")
                    .tickFormat(function(d) {return d3.time.format('%m/%d/%y')(new Date(d))});

        chart.yAxis.axisLabel("Stock Price ($USD)")
                   .tickFormat(function(d){ return '$' + d3.format(',.1f')(d); });
        chart.y2Axis.tickFormat(function(d){ return '$' + d3.format(',.1f')(d); });

        chartData = d3.select('#chart svg').datum(data);
        chartData.call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
}

function initializeTweetsView () {
    
    // Init Magnet View and hide it
    initializeMagnetView();
    initializeSentiView();
    initializeClusterView();
}

/*
d3.csv("data/twitter/Google_twitter_keyword_data_top_200.csv", function (d) {
        tweetFinalData.push(d);
        console.log("parsing");
        render('#magnet-view', tweetFinalData[0]);
    }); */

function initializeMagnetView (companyName, index) {
    // Initializes Dust and Magnets part of vis
    $("#senti-view, #cluster-view").hide();
    
}

function addCompanyToMagnetView (companyName, index) {
    d3.csv("data/twitter/"+companyName+"_twitter_keyword_data_top_200.csv", function (d) {
        tweetFinalData.splice(index, 0, d);
        var magnetData = [];
        for (var i = 0; i < tweetFinalData.length; i++) {
            magnetData = magnetData.concat(tweetFinalData[i].slice(0, 200/selectedCompanies.length));   
        }
        $("#magnet-view").empty();
        $.getScript("js/viz.js", render('#magnet-view', magnetData));
    });
    
    console.log("tweetFinalData:", tweetFinalData);
}

function removeCompanyFromMagnetView (companyName, index) {
    tweetFinalData.splice(index, 1);
    
    if (selectedCompanies.length > 0) {
        var magnetData = [];
        for (var i = 0; i < tweetFinalData.length; i++) {
            magnetData = magnetData.concat(tweetFinalData[i].slice(0, 200/selectedCompanies.length));   
        }
        $("#magnet-view").empty();
        $.getScript("js/viz.js", render('#magnet-view', magnetData));
    } else {
        $("#magnet-view").empty();
    }

}

function initializeSentiView () {
    $.getScript("js/tweetsView.js", loadSentiView);
}

function initializeClusterView () {
    $.getScript("js/tweetsView.js", loadClusterView);
}

function loadTweetLineDisplay () {
    if (!isTweetSelected) {
        $("#tweet-display").text("No tweet is selected.");
        $("#num-retweets-display").text("0");
        $("#num-favorites-display").text("0");
    } else {
        // update displayed twitter stats based on most popular tweet attr of selected keyword
        
    }
}

function displayTwitterVis() {
    
    $("#magnet-view, #senti-view, #cluster-view").hide();
    
    loadTweetLineDisplay();
    
    // Display Tweets based on currently selected mode
    switch (viewMode) {
        case 0: // RelaTweeter View
            $("#magnet-view").fadeIn(650);
            break;
        case 1: // Sentimagnets View
            $("#senti-view").fadeIn(650);
            break;
        case 2: // Cluster View
            $("#cluster-view").fadeIn(650);
            break;
    }

}