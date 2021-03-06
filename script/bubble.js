// bubble chart adapted from: https://bl.ocks.org/officeofjane/a70f4b44013d06b9c0a973f163d8ab7a

function main() {

    /* DECLARE TOOLTIP */
    var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

    /* SET HEIGHT AND WIDTH PARAMETERS */
    const width = 1050;
    const height = 900;
    const centre = { x: width/2 - 100, y: height/2 };
    // strength to apply to the position forces
    const forceStrength = 0.03;

    /* SET NODE VARIABLES */
    // these will be set in createNodes and chart functions
    let svg = null;
    let bubbles = null;
    let labels = null;
    let nodes = [];

    // charge dependent on size of node
    function charge(d) {
        return Math.pow(d.radius, 2.0) * 0.01
    }

    // force simulation on startup
    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(charge))
        .force('x', d3.forceX().strength(forceStrength).x(centre.x))
        .force('y', d3.forceY().strength(forceStrength).y(centre.y))
        .force('collision', d3.forceCollide().radius(d => d.radius + 1));

    //stops the simulation
    simulation.stop();

    const fillColour = d3.scaleOrdinal()
        .domain(["Big Sister", "Cranky", "Jock", "Lazy", "Normal", "Peppy", "Smug", "Snooty"])
        .range(["#F6AF4E", "#AD7A3E", "#71B6F7", "#DBB4F9", "#B7B398", "#F7ACC7", "#66B888", "#9379C2"]);

    var villagersData = d3.csv("script/data/villagers.csv", function (d) {
        return {
            name: d["Name"],
            personality: d["Personality"],
            species: d["Species"],
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

                tooltip.html("<b>Name:</b> " + d.name + "<br><b>Personality:</b> " + d.personality + "<br><b>Species:</b> " + d.species + "<br><b>Search Volume:</b> " +  d3.format(".2s")(d.volume))
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px')
            })
            .on('mouseout', function() {
                tooltip.transition().duration(600).style('opacity', 0)
            });

        // add text only to the top 20 villagers
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

        //////////////////////// LEGEND  ////////////////////////////

        // scale for the color of nodes - Personality
        var ordinal = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(["Big Sister", "Cranky", "Jock", "Lazy", "Normal", "Peppy", "Smug", "Snooty"])
            .range(["#F6AF4E", "#AD7A3E", "#71B6F7", "#DBB4F9", "#B7B398", "#F7ACC7", "#66B888", "#9379C2"]);

        svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(850,150)");

        var legendOrdinal = d3.legendColor()
            .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
            .shapePadding(10)
            .title("Personality Types")
            //use cellFilter to hide the "e" cell
            .cellFilter(function(d){ return d.label !== "e" })
            .scale(ordinal);

        svg.select(".legendOrdinal")
            .call(legendOrdinal);

        // scale for the radius of the nodes - Volume
        svg.append("text")
            .attr("class", "title")
            .attr("transform", "translate(" + (width / 2) + "," + 30 +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Most Popular Villagers based on Google Searches");

        svg.append("g")
            .attr("class", "legendSize")
            .attr("transform", "translate(850, 425)");

        var legendSize = d3.legendSize()
            .scale(radiusScale)
            .shape('circle')
            .shapePadding(15)
            .title("Search Volume")
            .cellFilter(function(d){ return d.label !== "0.0" })
            .orient('vertical');

        svg.select(".legendSize")
            .call(legendSize);

        //////////////////////// TITLE TEXTS  ////////////////////////////
        svg.append("text")
            .attr("class", "title")
            .attr("transform", "translate(" + (width / 2) + "," + 30 +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Most Popular Villagers based on Google Searches");

        svg.append("text")
            .attr("class", "source")
            .attr("transform", "translate(" + ((width/2) -300) + "," + 800 +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Source: Keyword Surfer");
    });
}

main();