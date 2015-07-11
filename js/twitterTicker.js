var stockFinalData    = [];
var tweetFinalData    = [];
var selectedCompanies = [];

var selectedModeTag;
var selectedModeName;

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

var minDate = 0;
var maxDate = 0; 
var currentNumberOfCompanies = 0;

var SHOW_LEGEND = true;
var MAX_NUM_COMPANIES = 5;
var NO_TWITTER_VIEW_SELECTED = "No Twitter View Selected";

$(document).ready(function () {
    
    companies = ["Amazon", "Apple", "Facebook", "Intel", "IBM", "Microsoft", "Google"];

    loadCompanies(companies);
    $.getScript("js/tweetsView.js", initializeTweetView);

    $("#company-selector").on("click", "g input", handleCompanySelection);
    $("#view-mode-selector").on("click", "g input", handleViewModeSelection);
    $("#filter-mode-selector").on("click", "g input", handleFilterModeSelection);
    
    

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

function addCompany(companyName, index) {
    console.log("Adding " + companyName + " to Stock Timeline...");
    if(currentNumberOfCompanies == 0) {
        initializeStockTimeline(companyName, index);
    }
    else {
        updateStockTimeline(companyName, index);
    }
}

function removeCompany(companyName, index) {
    console.log("Removing " + companyName + " from Stock Timeline...");
    stockFinalData.splice(index, 1);
    loadStockTimeline(stockFinalData);
    currentNumberOfCompanies = stockFinalData.length;
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
    stockFinalData[index] = stockDataByCompany;
}

function initializeStockTimeline(companyName, index)
{
    d3.csv("data/" +companyName+".csv", function(pricesData)
    {
        loadStockData(companyName, index, pricesData);

        minDate = stockFinalData[0].values[0][0];
        maxDate = stockFinalData[0].values[stockFinalData[0].values.length - 1][0];

        loadStockTimeline(stockFinalData);
        currentNumberOfCompanies = stockFinalData.length;

    });
}

function updateStockTimeline(companyName, index)
{
    d3.csv("data/" +companyName+".csv", function(pricesData)
    {
        loadStockData(companyName, index, pricesData);
        
        var companyMinDate = stockFinalData[index].values[0][0];
        var companyMaxDate = stockFinalData[0].values[stockFinalData[0].values.length - 1][0];
        if(minDate > companyMinDate) { minDate = companyMinDate; }
        if(maxDate < companyMaxDate) { maxDate = companyMaxDate; }
        
        chartData.datum(stockFinalData).call(chart);
        nv.utils.windowResize(chart.update);
        currentNumberOfCompanies = stockFinalData.length;
    });
}

function loadStockTimeline (data) {
    nv.addGraph(function() {

        chart = nv.models.lineWithFocusChart()
                    .useInteractiveGuideline(true)
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; })
                    .duration(250)
                    .color(d3.scale.category10().range())
                    .clipVoronoi(false)
                    .showLegend(SHOW_LEGEND);

        chart.brushExtent([(maxDate-minDate)/4 + minDate,3*(maxDate-minDate)/4 + minDate]);
        chart.margin({left: 75, bottom: 50});
        chart.focusMargin({ "bottom": 40 });
        chart.focusHeight(70);

        chart.xAxis.tickFormat(function(d) {return d3.time.format('%m/%d/%y')(new Date(d))});
        chart.x2Axis.axisLabel("Dates")
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

function displayTwitterVis() {
    
    // Display Tweets based on currently selected mode
    switch (viewMode) {
        case 0: // RelaTweeter View
            
            break;
        case 1: // Sentimagnets View
            
            break;
        case 2: // Cluster View
            
            break;
    }

}



/* INSPIRATION FOR THE MODE SELECTOR BELOW

----USES THE MODE SELECTOR INPUT CHECKED TO DO SELECTION OF CHECKBOX. REMOVING DOESN"T UPDATE VIS
var count = $("#mode-selector input:checked").length;
    console.log("COUNT", count);
    if(currentNumberOfCompanies > 0) {
        var currentModeTag = $(this).find("label");
        console.log("CURRENT MODE", currentModeTag);

        var currentModeName = currentModeTag.context.id;

        console.log("CURRENT MODE NAME", currentModeName);

        if(count == 0)
        {
            selectedModeTag = [];
            selectedModeName = NO_TWITTER_VIEW_SELECTED;
            console.log("NADA");
        }
        else if(count == 1) {
            var check = $(this).attr('checked');
            console.log("JUST CLICKED A NEW ONE");
            selectedModeTag = currentModeTag;
            selectedModeName = currentModeName;
        }
        else if(count == 2) {
            console.log("SELECTED", selectedModeTag);
            console.log("selectedMODE NAME", selectedModeName);
            $("#" +selectedModeName).prop('checked', false); // Unchecks it  
            console.log("#"+selectedModeName);
            //$(selectedModeTag).attr('checked', false);
            console.log("JUST SWITCHED TO A NEW VIEW");
            selectedModeTag = currentModeTag;
            selectedModeName = currentModeName;  
        }
    }
    else {
        alert("Please choose a company to view first!");
    }
*/

/* -----DOES IT THE WAY WE"VE GOT IT SET UP WITH THE OTHER ONE. REMOVING DOESN"T UPDATE VISs
//handle mode selection
    function handleModeSelection() {
        if(currentNumberOfCompanies > 0) {
            var currentModeTag = $(this).find("label");
            var currentModeName = currentModeTag.attr("for").toString();

            console.log("CURRNET MODE", currentModeTag);
            console.log("CURRENT MODE NAME", currentModeName);

            if((typeof selectedModeTag != 'undefined') && (currentModeTag.hasClass("selected") || selectedModeTag.hasClass("selected"))) {
                if(selectedModeName.toUpperCase() === currentModeName.toUpperCase()) {
                    currentModeTag.removeClass("selected"); //click the same one and I remove it
                    selectedModeTag.removeClass("selected");
                    selectedModeName = NO_TWITTER_VIEW_SELECTED;
                    console.log("THE SAME ONE SHOULD BE OFF", selectedModeName);
                }
                else {
                    selectedModeTag.removeClass("selected");
                    $(selectedModeTag).removeAttr('checked');
                    selectedModeTag = currentModeTag;
                    console.log("OLD SELECTED", selectedModeName);
                    selectedModeName = currentModeName;
                    selectedModeTag.addClass("selected");
                    console.log("THE NEW ONE SHOULD BE ON and OLD ONE SHOULD BE OFF NEW SELECTED", selectedModeName);
                }
            }
            else {
                console.log("You just added a new one");
                currentModeTag.addClass("selected");
                selectedModeTag = currentModeTag;
                selectedModeName = currentModeName;
            }
            displayTwitterVis();
        }
        else {
            alert("Please choose a company to view first!");
        }
    }
*/