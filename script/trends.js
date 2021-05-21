/* AXES */
// tooltips are adapted from: https://bl.ocks.org/susielu/63269cf8ec84497920f2b7ef1ac85039
// zoom and brushing functions adapted from: https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172

function createLineChart() {
    var margin = {top: 80, right: 20, bottom: 200, left: 100},
        margin2 = {top: 470, right: 20, bottom: 10, left: 100},
        width = 960 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,
        height2 = 600 - margin2.top - margin2.bottom - 30;
    const w = 1000;
    const h = 725;
    const xPadding = 125;
    const yPadding = 50;
    const padding = 600 + yPadding;
    var bottomTitle = padding + 55;

    //////////////////////// DATASET  ////////////////////////////
    const timeConv = d3.timeParse("%Y-%m");
    const dataset = d3.csv("script/data/multiTimeline.csv");
    /* DATASET */

    //////////////////////// OPEN DATA FILE  ////////////////////////////
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

        const bisectDate = d3.bisector(function(d) { return d.date; }).left;

        //////////////////////// SCALES  ////////////////////////////
        const xScale = d3.scaleTime().range([0,width - margin.right]);
        const yScale = d3.scaleLinear().rangeRound([height, 0]);
        const xScale2 = d3.scaleTime().range([0, width - margin.right]);
        const yScale2 = d3.scaleLinear().range([height2, 0]);

        // set the domains for the scales
        xScale.domain(d3.extent(data, function(d){
            return timeConv(d.date);
        }));

        yScale.domain([(0), d3.max(slices, function(c) {
            return d3.max(c.values, function(d) {
                return d.measurement + 4; });
            })
        ]);

        xScale2.domain(xScale.domain());
        yScale2.domain(yScale.domain());
        /* SCALES */

        //////////////////////// AXES  ////////////////////////////
        const yAxis = d3.axisLeft().scale(yScale);
        const xAxis2 = d3.axisBottom(xScale2);

        const makeLine = (xx) => d3.line()
            .x(function(d) { return xx(d.date) + xPadding; })
            .y(function(d) { return yScale(d.measurement) + yPadding; });
        /* AXES */


        //////////////////////// LINE DRAW FUNCTIONS  ////////////////////////////
        const line = d3.line()
            .x(function(d) { return xScale(d.date) + xPadding; })
            .y(function(d) { return yScale(d.measurement) + yPadding; });

        const line2 = d3.line()
            .x(function (d) { return xScale2(d.date); })
            .y(function (d) { return yScale2(d.measurement); });

        let id = 0;

        const ids = function () {
            return "line-"+id++;
        }
        /* LINE DRAW FUNCTIONS */

        //////////////////////// CREATE SVG ////////////////////////////
        var svg = d3.select("#vis1")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        // we need this so that the lines will be clipped when zoomed in
        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", 820)
            .attr("height", height)
            .attr("x", 125)
            .attr("y", 50);

        /* CREATE SVG */

        //////////////////////// DRAW AXES  ////////////////////////////
        const x_axis = svg.append("g")
            .attr("class", "axis")
            .attr("fill", "#786B50")
            .attr("transform", "translate(" + xPadding + "," + (yScale(0) + yPadding) +")")
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + xPadding + "," + yPadding +")")
            .call(yAxis);

        // this is to redraw xAxis when necessary
        const xAxiss = (g, x) => g
            .attr("transform", "translate(" + xPadding + "," + (yScale(0) + yPadding)  +")")
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

        /* DRAW AXES */

        // const zoom = d3.zoom()
        //     .scaleExtent([1, 18])
        //     .extent([[margin.left, 0], [width - margin.right, height]])
        //     .translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]])
        //     .on("zoom", zoomed);
        var zoom = d3.zoom()
            .scaleExtent([1, 15])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        const brush = d3.brushX()
            .extent([[0, 0], [width, height2]])
            .on("brush end", brushed);

        // handles zoom
        // function zoomed(event) {
        //     if (event.sourceEvent && event.sourceEvent.type === "brush") return;
        //     var t = event.transform;
        //     var xz = event.transform.rescaleX(xScale);
        //     x_axis.call(xAxiss,xz);
        //     line_chart.selectAll("path")
        //         .attr("d", d => makeLine(xz)(d.values));
        //     context.select(".brush")
        //         .call(brush.move, xScale.range().map(t.invertX, t));
        //     makeAnnotations.updatedAccessors();
        // }

        // function brushed(event) {
        //     if (event.sourceEvent && event.sourceEvent.type === "zoom") return;
        //     var s = event.selection || xScale2.range();
        //     xScale.domain(s.map(xScale2.invert, xScale2));
        //     makeAnnotations.updatedAccessors();
        //     x_axis.call(xAxiss,xScale);
        //     line_chart.selectAll("path")
        //         .attr("d", d => makeLine(xScale)(d.values));
        // }


        // svg.call(zoom)
        //     .transition()
        //     .duration(100)
        //     .call(zoom.scaleTo, 1, [xScale(Date.UTC(2004, 1, 1)), 0]);

        //////////////////////// DRAW LINES  ////////////////////////////

        // add gridlines to y axis
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(" + xPadding + "," + yPadding +")")
            .call(make_y_gridlines()
                .tickSize(-(width - margin.right))
                .tickFormat("")
            )

        var line_chart = svg.selectAll("lines")
            .data(slices)
            .enter()
            .append("g")
            .attr("clip-path", "url(#clip)");

        line_chart.append("path")
            .attr("class", ids)
            .style("stroke","#94CDA7")
            .style("fill","none")
            .style("stroke-width", "3px")
            .attr("d", function(d) { return line(d.values); });

        // context is for the smaller graph that will handle the brushing
        var context = svg.selectAll("lines")
            .data(slices)
            .enter()
            .append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        context.append("path")
            .attr("class", "line")
            .style("stroke","#94CDA7")
            .style("fill","none")
            .style("stroke-width", "3px")
            .attr("d", function(d) { return line2(d.values); });

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, xScale.range());

        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + xPadding + "," + yPadding + ")")
            .call(zoom)
            .transition()
            .duration(100)
            .call(zoom.scaleTo, 1, [xScale(Date.UTC(2004, 1, 1)), 0]);

        /* DRAW LINES */


        //////////////////////// DRAW TEXT  ////////////////////////////
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 50)
            .attr("x", -200)
            .attr("dy", ".1em")
            .style("fill", "#786B50")
            .style("text-anchor", "middle")
            .text("Interest Over Time");

        svg.append("text")
            .attr("transform", "translate(" + ((width / 2) + 70) + "," + ((height2 * 6) + 70) +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Date");

        svg.append("text")
            .attr("class", "title")
            .attr("transform", "translate(" + ((width/2) + 75) + "," + 30 +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Interest over Time on Google Searches for \"Animal Crossing\" (2004 - 2021)");

        svg.append("text")
            .attr("class", "source")
            .attr("transform", "translate(" + ((width/2) - 300) + "," + 690 +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Source: Google Trends");

        /* DRAW TEXT */

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(yScale)
                .ticks(10)
        }

        //////////////////////// ANNOTATIONS  ////////////////////////////
        const labels = [
            {
                data: {date: "2005-12", measurement:5},
                note: { title: "December 2005", label: "Animal Crossings Wild World Released in US\""},
                dy: -20,
                dx: 25,
            },
            {
                data: {date: "2013-6", measurement:15},
                note: { title: "June 2013", label: "Animal Crossings New Leaf Released in US\""},
                dy: -20,
                dx: -25,
            },
            {
                note: { title: "March 2020", label: "Animal Crossings New Horizons Released"},
                data: {date: "2020-03",	measurement: 64},
                dy: 17,
                dx: -42,
            },
            {
                note: { title: "November 2008", label: "Animal Crossings City Folks Released"},
                data: {date: "2008-11",	measurement: 4},
                dy: -25,
                dx: -42,
            },
        ].map(l => {
            l.subject = { radius: 12}
            return l
        })

        const timeFormat = d3.timeFormat("%d-%b-%y")

        window.makeAnnotations = d3.annotation()
            .annotations(labels)
            .type(d3.annotationCalloutCircle)
            .accessors({ x: d => xScale(timeConv(d.date)) + xPadding,
                y: d => yScale(d.measurement) + yPadding
            })
            .accessorsInverse({
                date: d => timeFormat(x.invert(d.x)),
                measurement: d => y.invert(d.y)
            })
            .on('subjectover', function(annotation) {
                annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
                    .classed("hidden", false)
            })
            .on('subjectout', function(annotation) {
                annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
                    .classed("hidden", true)
            })

        svg.append("g")
            .attr("class", "annotation-test")
            .call(makeAnnotations)

        svg.selectAll("g.annotation-connector, g.annotation-note")
            .classed("hidden", true)

        /* ANNOTATIONS */

        //////////////////////// BRUSH AND ZOOM  ////////////////////////////
        function brushed(event) {
            if (event.sourceEvent && event.sourceEvent.type === "zoom") {
                return;
            }
            var s = event.selection || xScale2.range();
            console.log(s)
            xScale.domain(s.map(xScale2.invert, xScale2));
            x_axis.call(xAxiss,xScale);
            line_chart.selectAll("path")
                .attr("d", d => makeLine(xScale)(d.values));
        }

        function zoomed(event) {
            if (event.sourceEvent && event.sourceEvent.type === "brush") return;
            var t = event.transform;
            var xz = event.transform.rescaleX(xScale);
            x_axis.call(xAxiss,xz);
            xScale.domain(t.rescaleX(xScale2).domain());
            line_chart.selectAll("path")
                .attr("d", d => makeLine(xz)(d.values));
            context.select(".brush")
                .call(brush.move, xScale.range().map(t.invertX, t));
            makeAnnotations.updatedAccessors();
        }

        /* BRUSH AND ZOOM */

    });
    /* OPEN DATA FILE */
}

function main() {
    createLineChart();
}

main();