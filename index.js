"use strict";
(function() {
    const svgSize = {
        width : 1000,
        height: 650,
    }
    const divMargin = 100;
    const margin = 30;
    const divSize = {
        width: 800,
        height:500,
    }
    let currData;
    let xScale;
    let yScale;
    let svg;
    let data;

    window.addEventListener("load", init);

    function init() {
        d3.select("#graph")
            .append("svg")
                .attr("width", svgSize.width + 2*margin)
                .attr("height", svgSize.height + 2*margin)
            .append("g")
                .attr("translate", "transform(" + margin + "," + margin + ")");
        d3.csv("gapminder.csv")
            .then((resp) => makeScatterPlot(resp));
    }

    function makeScatterPlot(resp) {
        data = resp;
        drawAxis(resp);
        let population = currData.map((row) => parseInt(row["population"]));
        let popScale = d3.scaleLinear()
                        .domain([d3.min(population), d3.max(population)])
                        .range([0, 30]);
        let div = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0)

        let divSvg = div.append('svg')
                .attr('width', divSize.width)
                .attr('height', divSize.height)

        svg.selectAll("circle")
            .data(currData)
            .enter()
            .append("circle")
                .attr("cx", function(d) {
                    return xScale(d["fertility"]) + margin*2;
                })
                .attr("cy", function(d) {
                    return yScale(d["life_expectancy"]);
                })
                .attr("r", function(d) {
                    //console.log(popScale(d["population"]));
                    return popScale(d["population"]);
                })
                .style("stroke", "steelblue")
                .style("stroke-width", 2)
                .attr("fill", "white")
                .on("mouseover", function(d) {
                    divSvg.selectAll("*").remove()
                    div.transition()
                        .duration(200)
                        .style('opacity', 0.9)
                    plotPop(d.country, divSvg)
                    div.style('left', d3.event.pageX + "px")
                        .style('top', (d3.event.pageY - 28) + "px")
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(300)
                        .style('opacity', 0)
                });

        let largePop = currData.filter(function(d) { return d["population"] > 100000000 })

        svg.selectAll('.text')
            .data(largePop)
            .enter()
            .append('text')
                .attr('x', function(d) { return xScale(+d['fertility']) + margin*2 + 20 + "px" })
                .attr('y', function(d) { return yScale(+d['life_expectancy']) })
                .attr("font-size", "10pt")
                .text(function(d) {
                    console.log(d["country"]);
                    return d['country'] });
    }

    function plotPop(country, divSvg) {
        let countryData = data.filter((row) => {return row.country == country})
        let population = countryData.map((row) => parseInt(row["population"]));
        let year = countryData.map((row) => parseInt(row["year"]));

        let divxScale = d3.scaleLinear()
            .domain([d3.min(year) - 0.5,d3.max(year) + 0.5])
            .range([0 + divMargin, divSize.width - divMargin]);

        divSvg.append("g")
            .attr("transform","translate(0, " + (divSize.height - divMargin) + ")")
            .call(d3.axisBottom(divxScale));

        divSvg.append("text")
            .attr('x', (divSize.width - 2 * divMargin) / 2)
            .attr('y', divMargin / 2)
            .style('font-size', '10pt')
            .text("Graph of " + country +  " : Year vs Population");

        let divyScale = d3.scaleLinear()
            .domain([d3.min(population) + 5, d3.max(population) - 5])
            .range([divSize.height - divMargin, divMargin]);

        divSvg.append("g")
        .attr("transform","translate(" + divMargin + ", 0)")
        .call(d3.axisLeft(divyScale));


        divSvg.append('text')
        .attr('x', (divSize.width - 2 * divMargin + 200) / 2)
        .attr('y', divSize.height - divMargin/2)
        .style('font-size', '10pt')
        .text("Year");

        divSvg.append("text")
        .attr("transform","translate(" + divMargin/5 + "," + (divSize.height/2+30) + ") rotate(-90)")
        .style('font-size', '10pt')
        .text("Population");

        const line = d3.line()
            .x(d => divxScale(d['year'])) // set the x values for the line generator
            .y(d => divyScale(d['population'])); // set the y values for the line generator 

        divSvg.append("path")
            .datum(countryData)
            .attr("d", function(d) { 
                return line(d)
             })
            .attr("fill", "none")
            .attr("stroke", "steelblue");
        
    }

    function drawAxis(resp) {
        currData = resp.filter(function(d) {
            return d["year"] == 1980;
        })
        let exp = currData.map((row) => parseInt(row["life_expectancy"]));
        let fert = currData.map((row) => parseInt(row["fertility"]));
        xScale = d3.scaleLinear()
                            .domain([d3.min(fert),d3.max(fert)])
                            .range([0,svgSize.width - margin]);
        svg = d3.select("svg");
        
        svg.append("g")
            .attr("transform","translate(" + margin * 2 + "," + (svgSize.height - margin) + ")")
            .call(d3.axisBottom(xScale));
        svg.append("text")
            .attr("transform","translate(" + (svgSize.width/2) + "," + (margin + svgSize.height) + ")")
            .text("Fertility");

        yScale = d3.scaleLinear()
                        .domain([d3.min(exp) - 5, d3.max(exp) + 5])
                        .range([svgSize.height - margin, margin]);
        svg.append("g")
            .attr("transform","translate(" + margin * 2 + "," + 0 + ")")
            .call(d3.axisLeft(yScale));
        
        svg.append("text")
            .attr("transform","translate(" + margin/2 + "," + (svgSize.height/2) + ") rotate(-90)")
            .text("Life Expectancy");
    }

    function id(name) {
        return document.getElementById(name);
    }

    function qs(query) {
        return document.querySelector(query);
    }

    function qsa(query) {
        return document.querySelectorAll(query);
    }

    function gen(elType) {
        return document.createElement(elType);
    }
})();