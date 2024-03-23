import { wrapText } from './auxFunctions.js'

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

const line_margin = {top: 40, right: 100, bottom: 60, left: 80};
const line_width = 800 - line_margin.left - line_margin.right;
const line_height = 250 - line_margin.top - line_margin.bottom;

const line_svg = d3
    .select("#line-chart-container")
    .append("svg")
    .attr("width", line_width + line_margin.left + line_margin.right)
    .attr("height", line_height + line_margin.top + line_margin.bottom)
    .append("g")
    .attr("transform", "translate(" + line_margin.left + "," + line_margin.top + ")");

const line_xScale = d3.scaleTime().range([0, line_width]);
const line_xAxis = d3.axisBottom().scale(line_xScale)
    .ticks(4);
const line_xAxisGroup = line_svg.append("g")
  .attr("id", "x-axis")
  .attr("transform", `translate(0,${line_height})`);

const line_yScale = d3.scaleLinear().range([line_height, 0]);
const line_yAxis = d3.axisLeft().scale(line_yScale);
const line_yAxisGroup = line_svg.append("g").attr("id", "y-axis");

// Dynamic Y-Axis label for whatever variable is selected
let yAxisLabel = line_svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - line_margin.left)
    .attr("x", 0 - (line_height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("");

// X-Axis Label
line_svg.append("text")
    .attr("transform", `translate(${line_width / 2}, ${line_height + line_margin.bottom - 10})`)
    .attr("class", "x-axis-label")
    .style("text-anchor", "middle")
    .text("Year");

const selectedColourPalette = ["#EF821A", "#46CDF0", "#D051F0"]

function drawLines(line_svg, data, line_xScale, line_yScale, variable, selectedCountryCodes, years) {
    const line = d3.line()
        .x(d => line_xScale(d.Year))
        .y(d => line_yScale(d[variable]));

    let selectColorScale = d3.scaleOrdinal()
        .domain(d3.range(selectedCountryCodes.length))
        .range(selectedColourPalette);

    line_xAxis.tickFormat(function(_, i){ return years[i] });

    // Clear previous lines and dots
    line_svg.selectAll('.line-path').remove();
    line_svg.selectAll('.dot').remove();


    // Draw lines for each series
    data.forEach((series, index) => {
        // Draw the line for the series
        line_svg.append('path')
            .datum(series)
            .attr('class', `line-path series-${index}`)
            .attr('d', line)
            .attr('stroke', selectColorScale(index))
            .attr('fill', 'none')
            .attr('stroke-width', 2);

        // Draw dots for the series
        line_svg.selectAll(`.dot.series-${index}`)
            .data(series, d => `${d.CountryCode}-${d.Year}`)
            .enter()
            .append('circle')
            .attr('class', `dot series-${index}`)
            .attr('cx', d => line_xScale(d.Year))
            .attr('cy', d => line_yScale(d[variable]))
            .attr('r', 5)
            .attr('fill', selectColorScale(index))
            .on('mouseover', function (event, d) {
                const tooltipHtml = [`${d.CountryName} : ${d[variable]}`].join('<br/>');
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
    });

    // Update Axes
    line_xAxisGroup.transition().duration(500).call(line_xAxis);
    line_yAxisGroup.transition().duration(500).call(line_yAxis);
}


export function updateLineChart(data, selectedCountries, variable, fname) {
    // Sort data
    let lineData = data

    // Sort data
    lineData.sort((a, b) => d3.ascending(a.Year, b.Year));
    const filtLineData = selectedCountries.map(code => lineData.filter(d => d.CountryCode === code));

    // Set domains for the scales based on the filtered data
    let years = Array.from(new Set(filtLineData.flat().map(d => d.Year)));
    line_xScale.domain(d3.extent(lineData, d => d.Year));
    line_yScale.domain([0, d3.max(filtLineData.flat(), d => +d[variable])]);
    wrapText(yAxisLabel, fname, line_height + line_margin.top + line_margin.bottom - 10);
    // yAxisLabel.text(fname);
    // Call the function to draw the lines
    drawLines(line_svg, filtLineData, line_xScale, line_yScale, variable, selectedCountries, years);
}

