var parseStockData = function(selectedCompaniesArray)
{
    var parse = d3.time.format("%m/%d/%Y").parse;
    for(company in selectedCompaniesArray) {
        d3.json("data/"+companyName+".json", function(pricesData)
        {
            //pricesData is an array of json objects containing the data in from the csv
            //console.log("pricesData:", pricesData);
            data = pricesData.map(function(d)
            {
                //each d is one line of the csv file represented as a json object
                stockDay = parse(d.date).getDate();
                stockMonth = parse(d.date).getMonth() +1;
                stockYear = parse(d.date).getFullYear();
                //console.log("DATE: " +parse(d.date).getMonth());
                //console.log("MONTH" + stockDate);
                stockPrice = d.close;
                //console.log("price:", stockPrice);
                return {"stockDay": stockDay, "stockMonth": stockMonth, "stockYear": stockYear, "stockPrice": stockPrice};
            });
            console.log("PARSEDATA", data);
        });
    }  
      
}