const margin = {top: 50, right: 50, bottom: 50, left: 100}
, width = 1200 - margin.left - margin.right
, height = 600 - margin.top - margin.bottom 


// load data
d3.csv('./gapminder.csv').then((data) => {

    // append the div for tooltip to body
    const div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'white')


    // append svg for graph to body
    const svg = d3.select('body').append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)


    // append svg for tooltips
    const tooltipSvg = div.append("svg")
    .attr('width', 220)
    .attr('height', 190)
    .style('box-shadow', "0 0 5px #999999")

    // Creating x and y axes' labels
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + margin.right + "," + (height/2 + 40) + ")rotate(-90)")
        .attr("fill", "#154360")
        .style('font-size', '10pt')
        .style('font-weight', 'bolder')
        .text("Life Expectancy");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (width/2 + 90) + "," + (height + margin.top*2 - 5) + ")")
        .attr("fill", "#154360")
        .style('font-size', '10pt')
        .style('font-weight', 'bolder')
        .text("Fertility");
    

    // get only data for the year 1980
    const tooltipData = data;
    data = data.filter(d => d['year'] == 1980)


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


    // Line Graph in Tooltips
    // d3's line generator
    const yearLimits = d3.extent(tooltipData, d => d['year']) 
    const xScaleLine = d3.scaleLinear()
        .domain([yearLimits[0], yearLimits[1]])
        .range([margin.top/3 + 3, (margin.top + (800 - margin.top - margin.bottom))/4])

    const populationLimits = d3.extent(data, d => d['population']) 
    const yScaleLine = d3.scaleLinear()
        .domain([populationLimits[1], populationLimits[0]])
        .range([margin.top/5, (margin.top + (800 - margin.top - margin.bottom))/5])
    
    const line = d3.line()
        .x(d => xScaleLine(d['year'])) 
        .y(d => yScaleLine(d['population'])) 

    // append line to svg
    tooltipSvg.append("path")
        .datum(data)
        .attr("d", function(d) { return line(d) })
        .attr("fill", "#154360")

    tooltipSvg.append("g")
        .attr("transform", "translate(0," + ((800 - margin.top - margin.bottom) + margin.top)/5 + ")")
        .call(d3.axisBottom(xScaleLine).ticks(7))

    tooltipSvg.append("g")
        .attr("transform", "translate(" + margin.left/5 + ",0)")
        .call(d3.axisLeft(yScaleLine))

    // append axes labels for tooltip line graph
    tooltipSvg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + 11 + "," + 95 + ")rotate(-90)")
        .attr("fill", "gray")
        .style('font-size', '11px')
        .text("Population");

    tooltipSvg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + 100 + "," + 185 + ")")
        .attr("fill", "gray")
        .style('font-size', '11px')
        .text("Year");
    

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

            .on("mouseover", function(d) {
                // div is tooltips
                div.transition()
                    .duration(200)
                    .style('opacity', 1)

                div
                    .style('left', (d3.event.pageX) + "px")
                    .style('top', (d3.event.pageY + 20) + "px")
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(300)
                    .style('opacity', 0)
                    .style("cursor", "default")
            })
        
    // append country names next to plot points
    // filter out the countries that have over 100,000,000 people -> not include text label for very small population
    let bigPopulation = data.filter(function(d) { return +d['population'] > 100000000})

    svg.selectAll('.text')
        .data(bigPopulation)
        .enter()
        .append('text')
            .attr('x', function(d) { return xScale(+d['fertility']) + 20 })
            .attr('y', function(d) { return yScale(+d['life_expectancy']) })
            .text(function(d) { return d['country'] })
            .style('fill', '#FFB51F')
            .style('font-size', '14px')
})