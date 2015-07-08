function loadStockTimeline (data) {
    nv.addGraph(function() {
        var chart = nv.models.lineWithFocusChart()
                    .useInteractiveGuideline(true)
                    .x(function(d) { return d[0]})
                    .y(function(d) { return d[1]})
                    .duration(250)
                    .color(d3.scale.category10().range())
                    .clipVoronoi(false);

        chart.brushExtent([50,70]);
        chart.margin({left: 75, bottom: 50});
        chart.focusMargin({ "bottom": 40 });
        chart.focusHeight(70);
                    
        chart.xAxis.tickFormat(function(d) {return d3.time.format('%m/%d/%y')(new Date(d))});
        chart.x2Axis.axisLabel("Dates")
                    .tickFormat(function(d) {return d3.time.format('%m/%d/%y')(new Date(d))});

        chart.yAxis.axisLabel("Stock Price ($USD)")
                   .tickFormat(function(d,i){ return '$' + d3.format(',.1f')(d); });
        chart.y2Axis.tickFormat(d3.format(',.1f'));
        chart.legend.vers('furious');
        d3.select('#chart svg')
            .datum(data)
            .call(chart)
			.each('start', function() {
                setTimeout(function() { 
                    d3.selectAll('#chart *').each(function() {
                        if(this.__transition__)
                            this.__transition__.duration = 1;
                    })
                }, 0)
            });

        nv.utils.windowResize(chart.update);

        return chart;
    });

}