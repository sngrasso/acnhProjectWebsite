function createLineChart() {
    var margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom
    const w = 1200;
    const h = 725;
    const xPadding = 125;
    const yPadding = 50;
    const padding = 600 + yPadding;
    var bottomTitle = padding + 55;

    const timeConv = d3.timeParse("%Y-%m");
    const dataset = d3.csv("script/data/multiTimeline.csv");




    /* DATA CLEANING */
    dataset.then(function(data) {
        const slices = data.columns.slice(1).map(function(id) {
            return {
                id: id,
                values: data.map(function(d){
                    return {
                        date: timeConv(d.date),
                        measurement: +d[id]
                    };
                })
            };
        });
        console.log(slices);

        /* SCALES */
        const xScale = d3.scaleTime().range([0,width - margin.right]);
        const yScale = d3.scaleLinear().rangeRound([height, 0]);

        xScale.domain(d3.extent(data, function(d){
            console.log(timeConv(d.date));
            return timeConv(d.date);
        }));

        yScale.domain([(0), d3.max(slices, function(c) {
            return d3.max(c.values, function(d) {
                return d.measurement + 4; });
        })
        ]);

        /* AXES */
        const yAxis = d3.axisLeft().scale(yScale);

        const makeLine = (xx) => d3.line()
            .x(function(d) { return xx(d.date) + xPadding; })
            .y(function(d) { return yScale(d.measurement) + yPadding; });

        // const xAxis = d3.axisBottom()
        //     .ticks(d3.timeDay.every())
        //     .tickFormat(d3.timeFormat('%Y'))
        //     .scale(xScale);


        /* LINES */
        const line = d3.line()
            .x(function(d) { return xScale(d.date) + xPadding; })
            .y(function(d) { return yScale(d.measurement) + yPadding; });

        let id = 0;
        const ids = function () {
            return "line-"+id++;
        }

        /* SVG */
        var svg = d3.select("#vis1")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(" + xPadding + "," + yPadding +")")
            .call(make_y_gridlines()
                .tickSize(-(width - margin.right))
                .tickFormat("")
            )

        /* DRAW AXIS */
        const x_axis = svg.append("g")
            .attr("class", "axis")
            .attr("fill", "#786B50")
            .attr("transform", "translate(" + xPadding + "," + padding +")")
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + xPadding + "," + yPadding +")")
            .call(yAxis);

        const xAxiss = (g, x) => g
            .attr("transform", "translate(" + xPadding + "," + (height + margin.top + margin.bottom)  +")")
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

        function zoomed(event) {
            var xz = event.transform.rescaleX(xScale);
            x_axis.call(xAxiss,xz);
            lines.selectAll("path")
                .attr("d", d => makeLine(xz)(d.values));
        }

        const zoom = d3.zoom()
            .scaleExtent([1, 18])
            .extent([[margin.left, 0], [width - margin.right, height]])
            .translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]])
            .on("zoom", zoomed);
            // .extent([[xPadding, 0], [1000, height]])
            // .translateExtent([[xPadding, -Infinity], [1000, Infinity]])
            // .on("zoom", zoomed);

        svg.call(zoom)
            .transition()
            .duration(100)
            .call(zoom.scaleTo, 1, [xScale(Date.UTC(2004, 1, 1)), 0]);

        /* DRAW LINES */
        const lines = svg.selectAll("lines")
            .data(slices)
            .enter()
            .append("g");

        lines.append("path")
            .attr("class", ids)
            .style("fill","none")
            .style("stroke","#94CDA7")
            .style("stroke-width", "3px")
            .attr("d", function(d) { return line(d.values); });

        /* DRAW TEXT */
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 50)
            .attr("x", -350)
            .attr("dy", "1em")
            .style("fill", "#786B50")
            .style("text-anchor", "middle")
            .text("Total Sales (Measured in millions)");

        svg.append("text")
            .attr("transform", "translate(" + ((w / 2) + 50) + "," + bottomTitle +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Date");

        svg.append("text")
            .attr("class", "title")
            .attr("transform", "translate(" + xPadding * 3 + "," + 30 +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Trending Volume of \"Animal Crossing\" from 2004 - 2021");

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(yScale)
                .ticks(10)
        }



    });
}

function main() {
    createLineChart();
}

main();