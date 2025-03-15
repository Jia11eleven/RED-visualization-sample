(function(RED_viz){
    'use strict';
    
    var chartHolder = d3.select("#post-timeline");
     
    var margin = {top:10, right:10, bottom:60, left:10};
    var boundingRect = chartHolder.node().getBoundingClientRect();
    var width = boundingRect.width - margin.left - margin.right;
    var height = boundingRect.height - margin.top - margin.bottom;

    var svg = chartHolder.append('svg')
                            .attr('width', width + margin.left + margin.right)
                            .attr('height', height + margin.top + margin.bottom)
                            .append('g')
                            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    RED_viz.uniqueDates = [
        "2025-02-01", "2025-02-02", "2025-02-03", "2025-02-04", "2025-02-05",
        "2025-02-06", "2025-02-07", "2025-02-08", "2025-02-09", "2025-02-10",
        "2025-02-11", "2025-02-12", "2025-02-13", "2025-02-14", "2025-02-15",
        "2025-02-16", "2025-02-17", "2025-02-18", "2025-02-19", "2025-02-20",
        "2025-02-21", "2025-02-22", "2025-02-23", "2025-02-24", "2025-02-25",
        "2025-02-26", "2025-02-27", "2025-02-28", "2025-03-01"
    ];
                            
                            
    var xScale = d3.scaleBand()
                   .domain(RED_viz.uniqueDates)  // Dates as strings
                   .range([0, width])
                   .padding(0.2);  // Add spacing between bars
                            
    var xAxis = d3.axisBottom(xScale);

    var yScale = d3.scaleLinear()
        .domain([0, 125]) 
        .range([height ,0]); 


    svg.append('g')
       .attr('class', 'x axis')
       .attr('transform', 'translate(0,' + height + ')')
       .call(xAxis);

    svg.selectAll('text')
       .style('text-anchor', 'end')
       .attr('dx', '-0.8em')
       .attr('dy', '.15em')
       .attr('transform', 'rotate(-65)')
       .style('font-size', '10px');

    // Function to group data by date
    RED_viz.groupDataByDate = function(data) {
        let groupedData = d3.group(data, d => d.creation_date.trim());
    
        return Array.from(groupedData, ([key, value]) => ({
            key: key,  // Keep as string
            value: value.length
        }));
    };    
    

    // Function to update the line chart
    RED_viz.updateBarChart = function(data) {
        var groupedData = RED_viz.groupDataByDate(data);

        var svg = d3.select("#post-timeline svg g");

        // Remove old bars before drawing new ones
        svg.selectAll(".bar").remove();

        // Draw bars
        svg.selectAll(".bar")
           .data(groupedData)
           .enter()
           .append("rect")
           .attr("class", "bar")
           .attr("x", d => xScale(d.key))  // Match string-based dates
           .attr("y", d => yScale(d.value))
           .attr("width", xScale.bandwidth())  // Use `scaleBand()` width
           .attr("height", d => height - yScale(d.value))
           .attr("fill", "steelblue")
           .attr("opacity", 0.8);
};

}(window.RED_viz = window.RED_viz || {}));