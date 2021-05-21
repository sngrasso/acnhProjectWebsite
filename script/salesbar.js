function createBarGraph() {
    /* DECLARE TOOLTIP */
    var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

    /* READING DATA FROM CSV */
    var totalSales = d3.csv("script/data/ac_sales.csv", function (d) {

            if(d["Title"] !== "Animal Crossing: New Leaf"
                && d["Title"] !== "Animal Crossing: New Leaf [Happy Price Selection]"
                && d["Title"] !== "Animal Crossing: New Leaf - Welcome amiibo"){
                return {
                    publishers: d["Title"],
                    sales: +d["FW"],
                    release: d["Release"]
                };
            }
    }).then(function(data){
        console.log(data);

        /* CLEANING UP SOME OF THE DATA */
        data.sort(function compareNumbers(a, b) { return b.sales - a.sales;});
        var companies = Array.from(data, d => d.publishers);
        console.log(companies)

        /* AXES SCALES */

        var xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sales)])
            .range([0,650]);

        var yScale = d3.scaleBand()
            .domain(companies)
            .range([0, 600]);

        var scale = d3.scaleLinear()
            .domain([0, companies.length])
            .range([0, 600]);

        /* AXES SCALES */

        var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(d3.format(".2s"));

        var yAxis = d3.axisLeft()
            .scale(yScale);

        // axis and scales are now ready

        var w = 1000;
        var h = 800;
        var xPadding = 325;
        var yPadding = 50;
        var padding = 600 + yPadding;
        var bottomTitle = padding + 55;

        /* START SVG */

        var svg = d3.select("#vis2")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(" + (xPadding) + "," + padding +")")
            .call(make_x_gridlines()
                .tickSize(-600)
                .tickFormat("")
            )

        /* DRAW BARS */
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("width", d => xScale(d.sales))
            .attr("height", 35)
            .attr("x", xPadding)
            .attr("y", (d, i) => scale(i) + yPadding + 15)
            .attr("fill", "#94CDA7")
            .on('mouseover', function(event, d) {
                tooltip.transition().duration(200).style('opacity', 1)

                tooltip.html("<b>Game:</b> " + d.publishers + "<br><b>Release: </b> " + d.release + "<br><b>Sales: </b> $" + d3.format(".2s")(d.sales))
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px')
            })
            .on('mouseout', function() {
                tooltip.transition().duration(600).style('opacity', 0)
            });

        /* DRAW AXES */

        // implementing axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + xPadding + "," + padding +")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + xPadding + "," + yPadding +")")
            .call(yAxis);

        /* TEXT TITLES */

        svg.append("text")
            .attr("class", "title")
            .attr("transform", "translate(" + (xPadding * 2) + "," + 30 +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("First Week Sales of Animal Crossing Games");

        svg.append("text")
            .attr("transform", "translate(" + ((w / 2) + 155) + "," + bottomTitle +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Sales (USD)");

        svg.append("text")
            .attr("class", "source")
            .attr("transform", "translate(" +((w / 2) - 200) + "," + (bottomTitle + 25)+")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Source: https://sites.google.com/site/gamedatalibrary/game-search");

        function make_x_gridlines() {
            return d3.axisBottom(xScale)
                .ticks(10)
        }
    });
}

function main() {
    createBarGraph();
}

main()