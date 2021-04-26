function main() {
    var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

    const width = 950;
    const height = 900;

    const centre = { x: width/2, y: height/2 };

    // strength to apply to the position forces
    const forceStrength = 0.03;

    // these will be set in createNodes and chart functions
    let svg = null;
    let bubbles = null;
    let labels = null;
    let nodes = [];

    // charge is dependent on size of the bubble, so bigger towards the middle
    function charge(d) {
        return Math.pow(d.radius, 2.0) * 0.01
    }

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(charge))
        .force('x', d3.forceX().strength(forceStrength).x(centre.x))
        .force('y', d3.forceY().strength(forceStrength).y(centre.y))
        .force('collision', d3.forceCollide().radius(d => d.radius + 1));

    simulation.stop();

    const fillColour = d3.scaleOrdinal()
        .domain(["Big Sister", "Cranky", "Jock", "Lazy", "Normal", "Peppy", "Smug", "Snooty"])
        .range(["#F6AF4E", "#AD7A3E", "#71B6F7", "#DBB4F9", "#B7B398", "#F7ACC7", "#66B888", "#9379C2"]);

    var villagersData = d3.csv("script/data/villagers.csv", function (d) {
        return {
            name: d["Name"],
            personality: d["Personality"],
            volume: +d["search_volume"]
        };
    }).then(function(data) {
        console.log(data);

        const maxSize = d3.max(data, d => d.volume);

        // size bubbles based on area
        const radiusScale = d3.scaleSqrt()
            .domain([0, maxSize])
            .range([0, 40])

        const nodes = data.map(d => ({
            ...d,
            radius: radiusScale(d.volume),
            size: d.volume,
            x: Math.random() * 900,
            y: Math.random() * 800
        }))

        console.log("created nodes",nodes)

        // create svg element inside provided selector
        svg = d3.select("#vis3")
            .append('svg')
            .attr('width', width)
            .attr('height', height)

        // bind nodes pages to circle elements
        const elements = svg.selectAll('.bubble')
            .data(nodes, d => d.name)
            .enter()
            .append('g');

        bubbles = elements
            .append('circle')
            .classed('bubble', true)
            .attr('r', d => d.radius)
            .attr('fill', d => fillColour(d.personality))
            .on('mouseover', function(event, d) {
                tooltip.transition().duration(200).style('opacity', 1)

                tooltip.html("Name: " + d.name + "<br>Personality: " + d.personality + "<br>Search Volume: " + d.volume)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px')
            })
            .on('mouseout', function() {
                tooltip.transition().duration(600).style('opacity', 0)
            });

        labels = elements
            .append('text')
            .attr('dy', '.3em')
            .style('text-anchor', 'middle')
            .style('font-size', 10)
            .text(function (d) {
                return d.radius >= 25 ? d.name : ""
            } )

        simulation.nodes(nodes)
            .on('tick', ticked)
            .restart();

        function ticked() {
            bubbles
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
            labels
                .attr('x', d => d.x)
                .attr('y', d => d.y)
        }


        var ordinal = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(["Big Sister", "Cranky", "Jock", "Lazy", "Normal", "Peppy", "Smug", "Snooty"])
            .range(["#F6AF4E", "#AD7A3E", "#71B6F7", "#DBB4F9", "#B7B398", "#F7ACC7", "#66B888", "#9379C2"]);

        svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(850,150)");

        var legendOrdinal = d3.legendColor()
            .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
            .shapePadding(10)
            //use cellFilter to hide the "e" cell
            .cellFilter(function(d){ return d.label !== "e" })
            .scale(ordinal);

        svg.select(".legendOrdinal")
            .call(legendOrdinal);

        svg.append("text")
            .attr("class", "title")
            .attr("transform", "translate(" + (width / 2) + "," + 30 +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Most Popular Villagers based on Google Searches");
    });
}

main();