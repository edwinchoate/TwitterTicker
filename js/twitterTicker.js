var stockFinalData = [];
var currentNumberOfCompanies = 0;
var maxNumCompanies = 5;
    var selectedCompanies = [];

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
        
        console.log("CURRENTCOMPANY", currentCompany);
        if(currentCompany.hasClass("selected")) {
            var index = selectedCompanies.indexOf(currentCompanyName);
            currentCompany.removeClass("selected");
            selectedCompanies.splice(index, 1);   
            removeCompany(currentCompanyName);

        } else if(currentNumberOfCompanies < 5) {
            selectedCompanies.push(currentCompany.attr("for").toString());
            var index = selectedCompanies.indexOf(currentCompanyName);
            console.log(index);
            addCompany(currentCompanyName, index);
            currentCompany.addClass("selected");
        }
        else {
            alert("You can't add another company. Please remove one company from the listing.");
        }
    }

 });

function addCompany(companyName, index) {
    parseStockData(companyName, index);
    currentNumberOfCompanies = stockFinalData.length;
}

function removeCompany(companyName) {
    for(var i = 0; i < stockFinalData.length; i++) {
        console.log("STOCK FINAL DATA", stockFinalData[i]);
        if(jQuery.inArray(companyName, selectedCompanies) == -1 && jQuery.inArray(companyName, stockFinalData[i]) >= 0  && currentNumberOfCompanies < 5) {
            console.log("IM IN HERE", stockFinalData[i]);
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
