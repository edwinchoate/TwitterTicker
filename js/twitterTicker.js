var stockFinalData = [];
var currentNumberOfCompanies = 0;
var maxNumCompanies = 5;
var selectedCompanies = [];
var chart;
var chartData;
var minDate;
var maxDate; 

/* Creates legend and companies list for function */
function companiesFunction() {
        return [
            {key: "Amazon"},
            {key: "Apple"},
            {key: "Facebook"},
            {key: "Intel"},
            {key: "IBM"},
            {key: "Microsoft"},
            {key: "Google"},
        ];
    }

var legend = nv.models.legend().vers('furious').height(100).padding(180);

d3.select('#companySelectionLegend')
    .attr('height', 50)
    .datum(companiesFunction()).call(legend);

legend.dispatch.on('stateChange', function(d) {
    console.log(d);
    d3.select('#companySelectionLegend').call(legend);
});


$(document).ready(function () {
    
    var selected = false;
    var companies = ["Amazon", "Apple", "Facebook", "Intel", "IBM", "Microsoft", "Google"];

    loadCompanies(companies);
    $("#company-selector").on("click", "g", handleSelection);

    // load companies into selector pane
    function loadCompanies (companiesArray) {
        var companyForm = $("#company-selector");
        for (company in companiesArray) {
            var currentCompany = companiesArray[company];
            companyForm.append("<g id=\"" + currentCompany + "-input\"><input type=\"checkbox\" id=\"" +
                               currentCompany + 
                               "\"><label for=\"" + currentCompany + "\">" + 
                               currentCompany + "</label></g><br>");
        }
    }

    // handle selection of companies
    function handleSelection () {
        var currentCompany = $(this).find("label");
        var currentCompanyName = currentCompany.attr("for").toString();
        
        //console.log("CURRENTCOMPANY", currentCompany);
        if(currentCompany.hasClass("selected")) {
            var index = selectedCompanies.indexOf(currentCompanyName);
            currentCompany.removeClass("selected");
            selectedCompanies.splice(index, 1);   
            removeCompany(currentCompanyName);

        } else if(currentNumberOfCompanies < 5) {
            //console.log("IM FRIGGIN HERE");
            selectedCompanies.push(currentCompany.attr("for").toString());
            //console.log("OMG IJUST ADDED COMPANY", currentCompany.attr("for").toString());
            var index = selectedCompanies.indexOf(currentCompanyName);
            //console.log("INDEX: ", index);
            addCompany(currentCompanyName, index);
            //console.log("ADDED A COMPANY: ", currentCompany);
            currentCompany.addClass("selected");
        }
        else {
            alert("You can't add another company. Please remove one company from the listing.");
        }
    }
    $.getScript("js/tweetsView.js", loadTweetsView());
 });

function addCompany(companyName, index) {
        //console.log("ADDING A COMPANY");
    if(currentNumberOfCompanies == 0) {
        //console.log("NUMBER OF COMPANIES IS 0");
        parseStockData(companyName, index);
    }
    else {
        //console.log("NUMBER OF COMPANIES IS NOT 0");
        updateStockData(companyName, index);
    }
    
}

function removeCompany(companyName) {
    for(var i = 0; i < stockFinalData.length; i++) {
        //console.log("STOCK FINAL DATA", stockFinalData[i]);
        if(jQuery.inArray(companyName, selectedCompanies) == -1 && jQuery.inArray(companyName, stockFinalData[i]) >= 0  && currentNumberOfCompanies < 5) {
            //console.log("IM IN HERE", stockFinalData[i]);
            stockFinalData.splice(i, 1);
        }
    }
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
        ////console.log("PRICES DATA: ", pricesData.close);

        var stockDataToNum = pricesData.map(function(d) {
            var stockTime = +d.date;
            var stockClosing = +d.close;
            return [stockTime, stockClosing];
        });

        stockDataByCompany.values = stockDataToNum;
        stockFinalData[index] = stockDataByCompany;
        //console.log("PARSE STOCK DATA", stockFinalData);

        minDate = stockFinalData[0].values[0][0];
        maxDate = stockFinalData[0].values[stockFinalData[0].values.length - 1][0];
        //console.log("MINDATE FIRST", minDate);
        //console.log("MAXDATE FIRST", maxDate);
        loadStockTimeline(stockFinalData);
        //console.log("PREVIOUS NUMBER OF COMPANIES: ", currentNumberOfCompanies);
        currentNumberOfCompanies = stockFinalData.length;
        //console.log("CURRENT NUMBER OF COMPANIES: ", currentNumberOfCompanies);

    });
}

function updateStockData(companyName, index)
{
    d3.csv("data/" +companyName+".csv", function(pricesData)
    {
        //pricesData is an array of json objects containing the data in from the csv
        var stockDataByCompany = new Object();
        stockDataByCompany.key = companyName;
        ////console.log("PRICES DATA: ", pricesData.close);

        var stockDataToNum = pricesData.map(function(d) {
            var stockTime = +d.date;
            var stockClosing = +d.close;
            return [stockTime, stockClosing];

        });
        
        //console.log("MINDATE", minDate);
        //console.log("MAXDATE", maxDate);
        stockDataByCompany.values = stockDataToNum;
        stockFinalData[index] = stockDataByCompany;
        //console.log("PARSE STOCK DATA", stockFinalData);
        
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
        //console.log("PREVIOUS NUMBER OF COMPANIES: ", currentNumberOfCompanies);
        currentNumberOfCompanies = stockFinalData.length;
        //console.log("CURRENT NUMBER OF COMPANIES: ", currentNumberOfCompanies);
    });
}

function loadStockTimeline (data) {
    //console.log("DATA", data);
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

        chart.legend = legend; 


        chartData = d3.select('#chart svg').datum(data);
        chartData.call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });

}