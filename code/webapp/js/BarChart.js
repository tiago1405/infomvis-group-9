const tooltip = d3.select('#scatter-plot-container').append('div')
    .attr('class', 'tooltip') // Use this class to style your tooltip
    .style('opacity', 1)
    .style('position', 'absolute')
    .style('text-align', 'center')
    .style('width', 'auto')
    .style('height', 'auto')
    .style('padding', '2px')
    .style('font', '12px sans-serif')
    .style('background', 'black')
    .style('border', '0px')
    .style('border-radius', '8px')
    .style('pointer-events', 'none');

const barchart_margin = {top: 40, right: 100, bottom: 60, left: 80};
let barchart_width = 800 - barchart_margin.left - barchart_margin.right;
let barchart_height = 250 - barchart_margin.top - barchart_margin.bottom;

let barchart_svg = d3.select("#bar-chart-container")
    .append("svg")
    .attr("width", barchart_width + barchart_margin.left + barchart_margin.right)
    .attr("height", barchart_height + barchart_margin.top + barchart_margin.bottom)
    .append("g")
    .attr("transform", `translate(${barchart_margin.left},${barchart_margin.top})`);

let barchart_xScale = d3.scaleLinear()
    .range([0, barchart_width]);

let barchart_xAxis = d3.axisBottom(barchart_xScale).ticks(6);
let barchart_xAxisGroup = barchart_svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${barchart_height})`);

let barchart_yScale = d3.scaleBand()
    .range([0, barchart_height])
    .padding(0.2);

let barchart_yAxis = d3.axisLeft(barchart_yScale);
let barchart_yAxisGroup = barchart_svg.append('g')
    .attr('class', 'y-axis');

let xAxisLabel = barchart_svg.append("text")
    .attr("transform", `translate(${barchart_width / 2}, ${barchart_height + barchart_margin.bottom - 10})`)
    .attr("class", "x-axis-label")
    .style("text-anchor", "middle")
    .text("");

const selectedColourPalette = ["#EF821A", "#46CDF0", "#D051F0"]
function makeBarChart(dataBarChart, countryList, countryCodes, variable, xScale, yScale) {
    // Update the yScale domain
    yScale.domain(countryList.map(d => d.CountryName));
    barchart_yAxisGroup
        .transition()
        .duration(500)
        .call(barchart_yAxis)
        .selectAll("text") 
        .style("text-anchor", "end")
        .attr("dx", "0.8em")
        .attr("dy", "-0.8em")
        .attr("transform", "rotate(-40)");

    let selectColorScale = d3.scaleOrdinal()
        .domain(d3.range(countryCodes.length))
        .range(selectedColourPalette);

    // Select all bars and bind data
    const bars = barchart_svg.selectAll('.rect')
        .data(dataBarChart, d => d.CountryName);

    // Enter selection
    bars.enter()
        .append('rect')
        .attr('class', 'rect')
        .attr('x', 0)
        .attr('y', d => yScale(d.CountryName))
        .attr('height', yScale.bandwidth())
        .attr('width', 0) // Start with a width of 0 for animation
        .attr('fill', function(d) {
            let index = countryCodes.indexOf(d.CountryCode);
            return selectColorScale(index);
        })
        .attr('stroke', 'black')
        .on('mouseover', function (event, d) {
            const tooltipHtml = [`${d[variable]}`].join('<br/>');
            tooltip.html(tooltipHtml)
                .style('left', event.pageX + 'px')
                .style('top', event.pageY +  'px')
                .transition()
                .duration(200)
                .style('opacity', .9);

        })
        .on('mouseout', function (event, d) {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .attr('width', d => xScale(d[variable]));

    // Update selection: Update attributes of existing bars
    bars.transition()
        .duration(500)
        .ease(d3.easeLinear)
        .attr('fill', function(d) {
            let index = countryCodes.indexOf(d.CountryCode);
            return selectColorScale(index);
        })
        .attr('y', d => yScale(d.CountryName))
        .attr('height', yScale.bandwidth())
        .attr('width', d => xScale(d[variable]));

    // Exit selection
    bars.exit()
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .attr('width', 0)
        .remove();

    // Update the x-axis
    barchart_xAxisGroup
        .transition()
        .duration(500)
        .call(barchart_xAxis);
}


export async function updateBarChart(data, selectedCountryCodes, year, feature, fname) {
    try{
    let updateData = data.filter(d => selectedCountryCodes.includes(d.CountryCode) && d.Year == year);

    let countryList = updateData.map(d => ({ CountryName: d.CountryName }));

    barchart_xScale.domain([0, d3.max(updateData, d => +d[feature])]);
    barchart_yScale.domain(countryList.map(d => d.CountryName));
    xAxisLabel.text(fname);
    makeBarChart(updateData, countryList, selectedCountryCodes, feature, barchart_xScale, barchart_yScale);
    }catch (error) {
        console.error('Error loading data:', error);
    }
}