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
    var selectedCompanies = ["Apple"];
    console.log("SELECTED COMPANIES", selectedCompanies);
    var data = parseStockData(selectedCompanies);
    console.log("DATA FROM COMPANIES", data);
    // load up the Stock Timeline D3
    $.getScript("js/stockTimeline.js", loadStockTimeline(data));
    // load up the Tweets View D3
    $.getScript("js/tweetsView.js", loadTweetsView());
});

var parseStockData = function(selectedCompaniesList)
{
    var stocks = []; 
    selectedCompaniesList.map(function(company) {
        d3.csv("data/AAPL.csv", function(pricesData)
        {
            //pricesData is an array of json objects containing the data in from the csv
            var stockDataByCompany = new Object();
            stockDataByCompany.company = company;
            stockDataByCompany.stockPrices = pricesData;
            stocks.push(stockDataByCompany);
            console.log("NEWDATA", stockDataByCompany);
        });
    });
    return stocks;
}

