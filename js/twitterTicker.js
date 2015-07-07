$(document).ready(function () {
    
    // load companies into selector pane
    function loadCompanies (companiesArray) {
        var companyForm = $("#company-selector");
        for (company in companiesArray) {
            companyForm.append("<input type=\"radio\"><label>" + companiesArray[company] + "</label><br>");
        }
    }
    
    // load up the Stock Timeline D3
    $.getScript("js/stockTimeline.js", loadStockTimeline);
    
    
    var companies = ["Amazon", "Apple", "Ford", "Intel", "McDonald's", "Microsoft",
                    "Amazon", "Apple", "Ford", "Intel", "McDonald's", "Microsoft",
                    "Amazon", "Apple", "Ford", "Intel", "McDonald's", "Microsoft",
                    "Amazon", "Apple", "Ford", "Intel", "McDonald's", "Microsoft"];
    loadCompanies(companies);
    
});