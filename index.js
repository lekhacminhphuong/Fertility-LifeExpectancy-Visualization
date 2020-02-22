const margin = { top: 50, right: 50, bottom: 50, left: 100 }
    , width = 1200 - margin.left - margin.right
    , height = 600 - margin.top - margin.bottom


// load data
d3.csv('./gapminder.csv').then((data) => {

    // append svg for graph to body
    const svg = d3.select('body').append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)


    // create x and y axes' labels
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + margin.right + "," + (height / 2 + 40) + ")rotate(-90)")
        .attr("fill", "#154360")
        .style('font-size', '10pt')
        .style('font-weight', 'bolder')
        .text("Life Expectancy");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (width / 2 + 90) + "," + (height + margin.top * 2 - 5) + ")")
        .attr("fill", "#154360")
        .style('font-size', '10pt')
        .style('font-weight', 'bolder')
        .text("Fertility");


    // get only data for the year 1980
    const tooltipData = data;
    data = data.filter(d => d['year'] == 1980 && d['population'] != "NA")


    // create and append x-axis (data: fertility)
    const fertilityLimits = d3.extent(data, d => d['fertility'])

    const xScale = d3.scaleLinear()
        .domain([fertilityLimits[0], fertilityLimits[1]])
        .range([margin.left, width + margin.left])

    svg.append("g")
        .attr("transform", "translate(0," + (height + margin.top) + ")")
        .call(d3.axisBottom(xScale))


    // create and append y-axis (data: life_expectancy)
    const lifeExpectancyLimits = d3.extent(data, d => d['life_expectancy'])

    const yScale = d3.scaleLinear()
        .domain([lifeExpectancyLimits[1], lifeExpectancyLimits[0]])
        .range([margin.top, margin.top + height])

    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(yScale))


    // helper function for formating big numbers: 1K for 1000; 1M for 1000000; ...
    var tickLabelFormat = function (d) {
        var bigNum = [1000000000, 1000000, 1000];
        var shortNum = ['B', 'M', 'K'];
        for (var i in bigNum) {
            if (d > bigNum[i]) {
                return (d / bigNum[i]).toFixed() + shortNum[i];
            }
        }
        return d;
    };

    // append the div for tooltip to body
    const div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'white')
        .style('box-shadow', "5px 0 10px #999999")

    // append svg for tooltips
    const tooltipSvg = div.append("svg")
        .attr("id", "lineGraph")
        .attr('width', 350)
        .attr('height', 300)
        .style('margin-left', '10px')
        .style('margin-top', '20px')


    // append dots to svg to track data points
    svg.selectAll('.dot').data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d['fertility']))
        .attr('cy', d => yScale(d['life_expectancy']))
        .attr('r', 5)
        .attr('stroke', '#154360')
        .attr('stroke-width', '1.5')
        .attr("fill", "#f0f0f0")
        .style("cursor", "pointer")

        .on("mouseover", function (e) {
            // Line Graph in Tooltips
            // filter data
            const currentCountry = e['country']
            const filterData = tooltipData.filter(d => d['population'] != "NA" && d['country'] == currentCountry)

            // create and append axes to tooltip svg
            let year = filterData.map((row) => parseInt(row["year"]))
            let population = filterData.map((row) => parseFloat(row["population"]))
    
            const limits = findMinMax(year, population)
    
            let xScaleLine = d3.scaleLinear()
                .domain([limits.yrmin, limits.yrmax])
                .range([50, 330])
    
            let yScaleLine = d3.scaleLinear()
                .domain([limits.populationMin, limits.populationMax])
                .range([250, 0])

            function findMinMax(year, population) {
                return {
                    yrmin: d3.min(year),
                    yrmax: d3.max(year),
                    populationMin: d3.min(population),
                    populationMax: d3.max(population)
                }
            }

            // append line to tooltip svg
            tooltipSvg.append("path")
                .datum(filterData)
                .attr("d", d3.line()
                    .x(d => xScaleLine(d['year']))
                    .y(d => yScaleLine(d['population']))
                )
                .attr("fill", "none")
                .attr("stroke", "#154360")
                .attr("stroke-width", 1.5)

            // append axes to tooltip svg
            tooltipSvg.append("g")
                .attr("transform", "translate(0," + 250 + ")")
                .call(d3.axisBottom(xScaleLine)
                    .ticks(7))

            tooltipSvg.append("g")
                .attr("transform", "translate(" + 50 + ",0)")
                .call(d3.axisLeft(yScaleLine)
                    .tickFormat(tickLabelFormat))

            // append axes labels to tooltip svg
            tooltipSvg.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + 15 + "," + 140 + ")rotate(-90)")
                .style('font-size', '11px')
                .attr("fill", "#154360")
                .text("Population");

            tooltipSvg.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + 180 + "," + 280 + ")")
                .style('font-size', '11px')
                .attr("fill", "#154360")
                .text("Year");

            div.transition()
                .duration(200)
                .style('opacity', 1)

            div
                .style('left', (d3.event.pageX) + "px")
                .style('top', (d3.event.pageY + 20) + "px")
        })

        .on("mouseout", function (d) {
            d3.select('#lineGraph').selectAll('path').remove()
            d3.select('#lineGraph').selectAll('g').remove()
            d3.select('#lineGraph').selectAll('text').remove()

            div.transition()
                .duration(300)
                .style('opacity', 0)
                .style("cursor", "default")

        })

    // append country names next to plot points
    // filter out the countries that have over 100,000,000 people -> not include text label for very small population
    let bigPopulation = data.filter(function (d) { return +d['population'] > 100000000 })

    svg.selectAll('.text')
        .data(bigPopulation)
        .enter()
        .append('text')
        .attr('x', function (d) { return xScale(+d['fertility']) + 20 })
        .attr('y', function (d) { return yScale(+d['life_expectancy']) })
        .text(function (d) { return d['country'] })
        .style('fill', '#FFB51F')
        .style('font-size', '14px')
})