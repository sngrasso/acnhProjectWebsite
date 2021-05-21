// adapted from an in depth tutorial here: https://www.visualcinnamon.com/2015/08/stretched-chord/

function main() {
    /* DECLARE TOOLTIP */
    var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

    var screenWidth = $(window).width();

    var margin = {left: 50, top: 8, right: 50, bottom: 10},
        width = Math.min(screenWidth, 800) - margin.left - margin.right,
        height = Math.min(screenWidth, 800)*5/6 - margin.top - margin.bottom;
        opacityDefault = 0.7, //default opacity of chords
        opacityLow = 0.02;

    var svg = d3.select("#chart").append("svg")
        .attr("width", (width + margin.left + margin.right))
        .attr("height", (height + margin.top + margin.bottom));

    var wrapper = svg.append("g").attr("class", "chordWrapper")
        .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

    var outerRadius = Math.min(width, height) / 2  - 100,
        innerRadius = outerRadius * 0.95,
        opacityDefault = 0.7; //default opacity of chords

    var Names = ["Alligator","Anteater","Bear","Bird","Bull","Cat","Chicken","Cow","Cub","Deer","Dog","Duck","Eagle","Elephant","Frog","Goat","Gorilla","Hamster","Hippo","Horse","Kangaroo","Koala","Lion","Monkey","Mouse","Octopus","Ostrich","Penguin","Pig","Rabbit","Rhino","Sheep","Squirrel","Tiger","Wolf","","Big Sister","Cranky","Jock","Lazy","Normal","Peppy","Smug","Snooty",""];

    var f = "script/data/character.csv"
    d3.csv(f, function(err, data) {
        var respondents = 391, //Total number of respondents (i.e. the number that makes up the group)
            emptyPerc = 0.5, //What % of the circle should become empty in comparison to the visible arcs
            emptyStroke = Math.round(respondents*emptyPerc); //How many "units" would define this empty percentage

        //Calculate how far the Chord Diagram needs to be rotated clockwise
        //to make the dummy invisible chord center vertically
        var offset = Math.PI * (emptyStroke/(respondents + emptyStroke)) / 2;

        var matrix_v1 = [];
        var matrix = [];

        data.forEach(function (d) {
            const propertyValues = Object.values(d);
            matrix_v1.push(propertyValues);
        })

        matrix_v1.forEach(function (d,i) {
            var box = []
            d.forEach(function (g) {
                box.push(parseInt(g))
            })
            matrix.push(box)
        })
        console.log(matrix)

        var chord = d3.layout.chord()
            .padding(.02)
            .sortSubgroups(d3.descending) //sort the chords inside an arc from high to low
            .sortChords(d3.descending) //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
            .matrix(matrix);

        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(startAngle) //startAngle and endAngle now include the offset in degrees
            .endAngle(endAngle);

        var path = d3.svg.chord()
            .radius(innerRadius)
            .startAngle(startAngle)
            .endAngle(endAngle);

        var fill = d3.scale.ordinal()
            .domain(d3.range(Names.length))
            .range(["#C4C4C4","#C4C4C4","#C4C4C4","#E0E0E0","#EDC951","#CC333F","#00A0B0","#E0E0E0"]);

        //////////////////// Draw outer Arcs ///////////////////////

        var g = wrapper.selectAll("g.group")
            .data(chord.groups)
            .enter().append("g")
            .attr("class", "group")
            .on("mouseover", fade(opacityLow))
            .on("mouseout", fade(opacityDefault));

        g.append("path")
            .style("stroke", function(d,i) { return (Names[i] === "" ? "none" : "#94CDA7"); })
            .style("fill", function(d,i) { return (Names[i] === "" ? "none" : "#94CDA7"); })
            .attr("d", arc);

        ////////////////////// Append Names ////////////////////////

        g.append("text")
            .each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2) + offset;})
            .attr("dy", ".35em")
            .attr("class", "titles")
            .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d,i) {
                var c = arc.centroid(d);
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + (innerRadius + 55) + ")"
                    + (d.angle > Math.PI ? "rotate(180)" : "")
            })
            .on('mouseover', function(event, d) {
                tooltip.transition().duration(200).style('opacity', 1)
                console.log(event)
                tooltip.html("<b>" + event.value +"</b>" + " villager(s) in <b>" + Names[d] + "</b>")
                    .style('left', ((width/2) + 50) + 'px')
                    .style('top', (height + 15) + 'px')
            })
            .on('mouseout', function() {
                tooltip.transition().duration(600).style('opacity', 0)
            })
            .text(function(d,i) { return Names[i]; });

        //////////////////// Draw inner chords /////////////////////

        var chords = wrapper.selectAll("path.chord")
            .data(chord.chords)
            .enter().append("path")
            .attr("class", "chord")
            .style("stroke", "none")
            .style("fill", "#C4C4C4")
            .style("opacity", function(d) { return (Names[d.source.index] === "" ? 0 : opacityDefault); })
            .attr("d", path)
            .on("mouseover", fadeOnChord)
            .on("mouseout.u", fade(opacityDefault))
            .on('mouseover.u', function(event, d) {
                tooltip.transition().duration(200).style('opacity', 1)
                console.log(event)
                if (Names[event.source.index] === '') {
                    return;
                }
                tooltip.html("<b>" + event.source.value +"</b>" + " villager(s) from <b>" + Names[event.source.index]  + "</b> to <b>" + Names[event.target.index]  + "</b>")
                    .style('left', ((width/2) + 50) + 'px')
                    .style('top', (height + 15) + 'px')
            })
            .on('mouseout', function() {
                tooltip.transition().duration(600).style('opacity', 0)
            });

        ///////////////////////// Tooltip //////////////////////////

        //Arcs

        svg.append("text")
            .attr("class", "title")
            .attr("transform", "translate(" + ((width/2) + 50) + "," + 30 +")")
            .style("text-anchor", "middle")
            .style("fill", "#786B50")
            .text("Chord Diagram Linking Villager Personality Types to Species Type");

        function startAngle(d) { return d.startAngle + offset; }
        function endAngle(d) { return d.endAngle + offset; }

        // Returns an event handler for fading a given chord group
        function fade(opacity) {
            return function(d, i) {
                wrapper.selectAll("path.chord")
                    .filter(function(d) { return d.source.index !== i && d.target.index !== i && Names[d.source.index] !== ""; })
                    .transition()
                    .style("opacity", opacity);
            };
        }//fade

        // Fade function when hovering over chord
        function fadeOnChord(d) {
            var chosen = d;
            if (Names[chosen.source.index] === "") {
                return 0;
            }
            wrapper.selectAll("path.chord")
                .transition()
                .style("opacity", function(d) {
                    return d.source.index === chosen.source.index && d.target.index === chosen.target.index ? opacityDefault : opacityLow;
                });
        }//fadeOnChord

    });

}

main();