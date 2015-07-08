var stockFinalData = [];
var currentNumberOfCompanies = 0;
var maxNumCompanies = 5;

$(document).ready(function () {
    
    var selected = false;
    var companies = ["Amazon", "Apple", "Ford", "Intel", "McDonald's", "Microsoft",
                    "Amazon", "Apple", "Ford", "Intel", "McDonald's", "Microsoft",
                    "Amazon", "Apple", "Ford", "Intel", "McDonald's", "Microsoft",
                    "Amazon", "Apple", "Ford", "Intel", "McDonald's", "Microsoft"];
    loadCompanies(companies);

    // load companies into selector pane
    function loadCompanies (companiesArray) {
        var companyForm = $("#company-selector");
        for (company in companiesArray) {
            companyForm.append("<input type=\"radio\"><label>" + companiesArray[company] + "</label><br>");
        }
    }

    //Select specific companies based on which radio button is selected
    //Store them into the selectedCompanies list below
    var selectedCompanies = ["Apple", "Amazon"];
    currentNumberOfCompanies = stockFinalData.length;
    
    /*//need to maintain a list of this data
    //data should just be accessible if it's already been added. Don't want to add it if stockFinalData already contains it
    for(var i = 0; i < stockFinalData.length; i++) {
        for(var j = 0; j < selectedCompanies.length; j++) {
            key = selectedCompanies[j];
            if(selectedCompanies.contains(key) && !stockFinalData[i].contains(key) && currentNumberOfCompanies < 5) {
                parseStockData(selectedCompanies[i], index);
            }
            else if(selectedCompanies.contains(key) && !stockFinalData[i].contains(key) && currentNumberOfCompanies == 5){
                alert("You cannot add more than 5 companies! Please unselect one first");
            }
        }
    } */
    for(var i = 0; i < selectedCompanies.length; i++) {
        parseStockData(selectedCompanies[i], i);
    }
});

function parseStockData(companyName, index)
{
    d3.csv("data/" +companyName+".csv", function(pricesData)
    {
        //pricesData is an array of json objects containing the data in from the csv
        var stockDataByCompany = new Object();
        stockDataByCompany.key = companyName;
        //console.log("PRICES DATA: ", pricesData.close);

        var stockDataToNum = pricesData.map(function(d) {
            var stockTime = +d.date;
            var stockClosing = +d.close;
            return [stockTime, stockClosing];
        });

        stockDataByCompany.values = stockDataToNum;
        stockFinalData[index] = stockDataByCompany;
        console.log(stockFinalData);
        $.getScript("js/stockTimeline.js", loadStockTimeline(stockFinalData));
    });
}