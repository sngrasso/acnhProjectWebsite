////////////////////////////////////////////////////////////
//////////////////////// Set-up ////////////////////////////
////////////////////////////////////////////////////////////
var screenWidth = $(window).width();

var margin = {left: 50, top: 10, right: 50, bottom: 10},
    width = Math.min(screenWidth, 800) - margin.left - margin.right,
    height = Math.min(screenWidth, 800)*5/6 - margin.top - margin.bottom;
opacityDefault = 0.7, //default opacity of chords
    opacityLow = 0.02;

var svg = d3.select("#chart").append("svg")
    // .attr("width", (width + margin.left + margin.right))
    .attr("width", (width + margin.left + margin.right))
    .attr("height", (height + margin.top + margin.bottom));

var wrapper = svg.append("g").attr("class", "chordWrapper")
    .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");;

var outerRadius = Math.min(width, height) / 2  - 100,
    innerRadius = outerRadius * 0.95,
    opacityDefault = 0.7; //default opacity of chords

////////////////////////////////////////////////////////////
////////////////////////// Data ////////////////////////////
////////////////////////////////////////////////////////////

var Names = ["Alligator","Anteater","Bear","Bird","Bull","Cat","Chicken","Cow","Cub","Deer","Dog","Duck","Eagle","Elephant","Frog","Goat","Gorilla","Hamster","Hippo","Horse","Kangaroo","Koala","Lion","Monkey","Mouse","Octopus","Ostrich","Penguin","Pig","Rabbit","Rhino","Sheep","Squirrel","Tiger","Wolf","","Big Sister","Cranky","Jock","Lazy","Normal","Peppy","Smug","Snooty",""];

var respondents = 391, //Total number of respondents (i.e. the number that makes up the group)
    emptyPerc = 0.5, //What % of the circle should become empty in comparison to the visible arcs
    emptyStroke = Math.round(respondents*emptyPerc); //How many "units" would define this empty percentage

//Calculate how far the Chord Diagram needs to be rotated clockwise
//to make the dummy invisible chord center vertically
var offset = Math.PI * (emptyStroke/(respondents + emptyStroke)) / 2;


var matrix = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,1,0,0,1,0], // Alligator
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,2,1,1,0], //Anteater
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,5,1,1,1,2,2,0,0], //Bear
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,4,2,1,2,2,1,0], //Bird
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,2,0,0,0,0,0], //Bull
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,5,1,5,0], //Cat
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,1,0,1,2,0], //Chicken
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,2,0], //Cow
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,4,4,2,0,1,0], //Cub
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,2,1,0,2,1,0], //Deer
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,6,3,2,1,1,0], //Dog
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,4,1,4,0], //Duck
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,2,0,1,0,1,1,0], //Eagle
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,4,3,0,0,2,0], //Elephant
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,5,3,2,1,2,1,0], //Frog
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,0,1,1,0], //Goat
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,2,1,0,0,1,1,0], //Gorilla
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,2,1,0], //Hamster
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,0,1,1,1,1,0], //Hippo
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,3,2,2,3,2,0], //Horse
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,0,0,3,0,0,2,0], //Kangaroo
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,3,0,1,1,0], //Koala
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,1,0,0,2,0,0], //Lion
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,1,1,0,1,0], //Monkey
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,1,2,4,1,2,0], //Mouse
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0], //Octopus
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,2,1,1,3,0], //Ostrich
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,4,1,1,1,2,0], //Penguin
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,2,3,2,1,1,0], //Pig
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,4,1,8,1,2,0], //Rabbit
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,0,0,0,0], //Rhino
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,1,0,3,1,2,4,0], //Sheep
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,1,5,3,1,4,0], //Squirrel
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,0,0,2,0,1,0], //Tiger
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,1,1,1,3,0], //Wolf
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,emptyStroke], // Dummy
    [0,0,3,0,0,1,1,0,1,2,1,0,0,0,1,1,1,0,0,1,1,1,0,1,0,0,1,1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0], // Big Sister
    [1,1,5,1,3,2,1,0,2,1,1,0,4,1,3,1,3,1,2,1,2,1,1,1,2,1,0,1,2,1,1,0,2,1,5,0,0,0,0,0,0,0,0,0,0], // Cranky
    [2,1,1,4,1,3,1,0,2,1,1,2,2,1,5,1,2,1,1,1,0,1,3,1,3,0,1,2,3,2,1,1,1,3,0,0,0,0,0,0,0,0,0,0,0], // Jock
    [2,0,1,2,2,3,2,0,4,2,6,4,0,4,3,1,1,1,0,3,0,1,1,2,1,1,1,4,2,4,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0], // Lazy
    [1,1,1,1,0,3,1,1,4,1,3,2,1,3,2,2,0,1,1,2,3,3,0,1,2,1,2,1,3,1,2,3,5,0,1,0,0,0,0,0,0,0,0,0,0], // Normal
    [0,2,2,2,0,5,0,1,2,0,2,4,0,0,1,0,0,1,1,2,0,0,0,1,4,0,1,1,2,8,0,1,3,2,1,0,0,0,0,0,0,0,0,0,0], // Peppy
    [0,1,2,2,0,1,1,0,0,2,1,1,1,0,2,1,1,2,1,3,0,1,2,0,1,0,1,1,1,1,0,2,1,0,1,0,0,0,0,0,0,0,0,0,0], // Smug
    [1,1,0,1,0,5,2,2,1,1,1,4,1,2,1,1,1,1,1,2,2,1,0,1,2,0,3,2,1,2,0,4,4,1,3,0,0,0,0,0,0,0,0,0,0], // Snooty
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,emptyStroke,0,0,0,0,0,0,0,0,0] // Dummy
];

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

////////////////////////////////////////////////////////////
//////////////////// Draw outer Arcs ///////////////////////
////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////
////////////////////// Append Names ////////////////////////
////////////////////////////////////////////////////////////

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
    .text(function(d,i) { return Names[i]; });

//+ "translate(" + (innerRadius + 55) + ")"

////////////////////////////////////////////////////////////
//////////////////// Draw inner chords /////////////////////
////////////////////////////////////////////////////////////

var chords = wrapper.selectAll("path.chord")
    .data(chord.chords)
    .enter().append("path")
    .attr("class", "chord")
    .style("stroke", "none")
    .style("fill", "#C4C4C4")
    .style("opacity", function(d) { return (Names[d.source.index] === "" ? 0 : opacityDefault); })
    .attr("d", path)
    .on("mouseover", fadeOnChord)
    .on("mouseout", fade(opacityDefault));

////////////////////////////////////////////////////////////
///////////////////////// Tooltip //////////////////////////
////////////////////////////////////////////////////////////

//Arcs
g.append("title")
    .text(function(d, i) {return Math.round(d.value) + " villager(s) in " + Names[i];});

//Chords
chords.append("title")
    .text(function(d) {
        return [Math.round(d.source.value), " villager(s) from ", Names[d.target.index], " to ", Names[d.source.index]].join("");
    });

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