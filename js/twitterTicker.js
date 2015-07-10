var stockFinalData = [];
var currentNumberOfCompanies = 0;
var maxNumCompanies = 5;
var selectedCompanies = [];
var chart;
var chartData;
var minDate;
var maxDate; 


$(document).ready(function () {
    
    var selected = false;
    var companies = ["Amazon", "Apple", "Facebook", "Intel", "IBM", "Microsoft", "Google"];

    loadCompanies(companies);
    $("#company-selector").on("click", "g input", handleSelection);
    
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
    function handleSelection () {
        var currentCompany = $(this).closest("g").find("label");
        var currentCompanyName = currentCompany.attr("for").toString();
        console.log("currentCompany:", currentCompany);
        
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
    $.getScript("js/tweetsView.js", loadTweetsView());
 });

function addCompany(companyName, index) {
    console.log("Adding " + companyName + " to Stock Timeline...");
    if(currentNumberOfCompanies == 0) {
        parseStockData(companyName, index);
    }
    else {
        updateStockData(companyName, index);
    }
    
}

function removeCompany(companyName, index) {
    console.log("Removing " + companyName + " from Stock Timeline...");
    stockFinalData.splice(index, 1);
    loadStockTimeline(stockFinalData);
    currentNumberOfCompanies = stockFinalData.length;
}

function parseStockData(companyName, index)
{
    d3.csv("data/" +companyName+".csv", function(pricesData)
    {
        //pricesData is an array of json objects containing the data in from the csv
        var stockDataByCompany = new Object();
        stockDataByCompany.key = companyName;

        var stockDataToNum = pricesData.map(function(d) {
            var stockTime = +d.date;
            var stockClosing = +d.close;
            return [stockTime, stockClosing];
        });

        stockDataByCompany.values = stockDataToNum;
        stockFinalData[index] = stockDataByCompany;

        minDate = stockFinalData[0].values[0][0];
        maxDate = stockFinalData[0].values[stockFinalData[0].values.length - 1][0];
        loadStockTimeline(stockFinalData);
        currentNumberOfCompanies = stockFinalData.length;

    });
}

function updateStockData(companyName, index)
{
    d3.csv("data/" +companyName+".csv", function(pricesData)
    {
        //pricesData is an array of json objects containing the data in from the csv
        var stockDataByCompany = new Object();
        stockDataByCompany.key = companyName;

        var stockDataToNum = pricesData.map(function(d) {
            var stockTime = +d.date;
            var stockClosing = +d.close;
            return [stockTime, stockClosing];

        });
        
        stockDataByCompany.values = stockDataToNum;
        stockFinalData[index] = stockDataByCompany;
        
        var companyMinDate = stockFinalData[index].values[0][0];
        var companyMaxDate = stockFinalData[0].values[stockFinalData[0].values.length - 1][0];

        if(minDate > companyMinDate) {
            minDate = companyMinDate;
        }
        if(maxDate < companyMaxDate) {
            maxDate = companyMaxDate;
        }
        
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
                    .clipVoronoi(false);

        chart.brushExtent([(maxDate-minDate)/4 + minDate,3*(maxDate-minDate)/4 + minDate]);
        chart.margin({left: 75, bottom: 50});
        chart.focusMargin({ "bottom": 40 });
        chart.focusHeight(70);
        //chart.showControls(false);
        chart.xAxis.tickFormat(function(d) {return d3.time.format('%m/%d/%y')(new Date(d))});
        chart.x2Axis.axisLabel("Dates")
                    .tickFormat(function(d) {return d3.time.format('%m/%d/%y')(new Date(d))});

        chart.yAxis.axisLabel("Stock Price ($USD)")
                   .tickFormat(function(d,i){ return '$' + d3.format(',.1f')(d); });
        chart.y2Axis.tickFormat(d3.format(',.1f'));

        //chart.legend.vers('furious');


        chartData = d3.select('#chart svg').datum(data);
        chartData.call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });

}