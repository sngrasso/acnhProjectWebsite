function createBarGraph() {
    var totalSales = d3.csv("script/data/ac_sales.csv", function (d) {
        return {
            publishers: d["Title"],
            sales: +d["FW"]
        };
    }).then(function(data){
        console.log(data);

        // FINALLY we were able to process the pages
        // var totalSum = Array.from(d3.rollup(pages, v => d3.sum(v, d => d.sales), d => d.publishers));
        // console.log(totalSum);
        data.sort(function compareNumbers(a, b) { return b.sales - a.sales;});
        var companies = Array.from(data, d => d.publishers);
        console.log(companies)

        // figuring out how the axis is going to work
        var xScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.sales), d3.max(data, d => d.sales)])
            .range([0,650]);

        var yScale = d3.scaleBand()
            .domain(companies)
            .range([0, 600]);

        var scale = d3.scaleLinear()
            .domain([0, companies.length])
            .range([0, 600]);

        var xAxis = d3.axisBottom()
            .scale(xScale);

        var yAxis = d3.axisLeft()
            .scale(yScale);

        // axis and scales are now ready

        var w = 1000;
        var h = 800;
        var xPadding = 325;
        var yPadding = 50;
        var padding = 600 + yPadding;
        var bottomTitle = padding + 55;

        // this is where the magic happens
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

        // okay now here are the actual bars
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("width", d => xScale(d.sales))
            .attr("height", 35)
            .attr("x", xPadding)
            .attr("y", (d, i) => scale(i) + yPadding + 8)
            .attr("fill", "#94CDA7");

        svg.append("text")
            .attr("class", "title")
            .attr("transform", "translate(" + xPadding * 2 + "," + 30 +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("First Week Sales of Animal Crossing Games");

        // implementing axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + xPadding + "," + padding +")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + xPadding + "," + yPadding +")")
            .call(yAxis);

        svg.append("text")
            .attr("transform", "translate(" + ((w / 2) + 155) + "," + bottomTitle +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Sales (USD)");

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