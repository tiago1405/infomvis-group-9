const scatter_margin = {top: 40, right: 100, bottom: 60, left: 60};

let scatter_width = 800 - scatter_margin.left - scatter_margin.right;
let scatter_height = 250 - scatter_margin.top - scatter_margin.bottom;

let scatter_svg = d3.select("#scatter-plot-container")
    .append("svg")
    .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
    .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom)
    .append("g")
    .attr("transform", "translate(" + scatter_margin.left + "," + scatter_margin.top + ")");


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

// let selectColorScale = d3.scaleOrdinal(d3.schemeCategory10);

// X-Axis
let scatter_xScale = d3.scaleLinear()
    .range([0, scatter_width]);
let scatter_xAxis = d3.axisBottom()
    .scale(scatter_xScale)
    .ticks(6)
    .tickFormat(d3.format("d"));
let scatter_xAxisGroup = scatter_svg.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${scatter_height})`);
// Y-Axis
let scatter_yScale = d3.scaleLinear()
    .range([scatter_height, 0]);
let scatter_yAxis = d3.axisLeft()
    .scale(scatter_yScale)
    .ticks(6);
let scatter_yAxisGroup = scatter_svg.append('g')
    .attr('id', 'y-axis');

// Add Y-Axis Label
scatter_svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - scatter_margin.left)
    .attr("x", 0 - (scatter_height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Freedom Score");

// Dynamic X-Axis label for whatever variable is selected
let xAxisLabel = scatter_svg.append("text")
    .attr("transform", `translate(${scatter_width / 2}, ${scatter_height + scatter_margin.bottom - 10})`)
    .attr("class", "x-axis-label")
    .style("text-anchor", "middle")
    .text("");

const selectedColourPalette = ["#EF821A", "#46CDF0", "#D051F0"]

function makeScatterplot(data, scatter_xScale, scatter_yScale, variables, selectedCountryCodes) {
    let nonSelectColorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Status))
        .range(["#665216", "#14560f", "#641515"]);
    let selectColorScale = d3.scaleOrdinal()
        .domain(d3.range(selectedCountryCodes.length)) // Use range for index-based domain
        .range(selectedColourPalette);

    // Bind the data to the circles, using CountryCode and Year as a key for each data point
    const dots = scatter_svg.selectAll('.dot')
        .data(data, d => d.Year);

    dots.enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => scatter_xScale(d[variables[1]]))
        .attr('cy', d => scatter_yScale(d[variables[0]]))
        .attr('r', d => selectedCountryCodes.includes(d.CountryCode) ? 7 : 5)
        .style('fill', d => {
            const index = selectedCountryCodes.indexOf(d.CountryCode);
            if (index !== -1) {
                // If the country is selected, use its index to get the color
                return selectColorScale(index);
            } else {
                // If the country is not selected, use its status to get the color
                return nonSelectColorScale(d.Status);
            }
        })
        .attr('fill-opacity', d => selectedCountryCodes.includes(d.CountryCode) ? 1 : 0.6)
        .on('mouseover', function (event, d) {
            d3.select(this).transition()
                .duration('100')
                .attr("r", d => selectedCountryCodes.includes(d.CountryCode) ? 9 : 7)
                .attr('fill-opacity', 1);
            const tooltipHtml = [`${d.CountryName}`].join('<br/>');
            tooltip.html(tooltipHtml)
                .style('left', event.pageX + 'px')
                .style('top', event.pageY +  'px')
                .transition()
                .duration(200)
                .style('opacity', .9);

        })
        .on('mouseout', function (event, d) {
            d3.select(this).transition()
                .duration('200')
                .attr("r", d => selectedCountryCodes.includes(d.CountryCode) ? 7 : 5)
                .attr('fill-opacity', d => selectedCountryCodes.includes(d.CountryCode) ? 1 : 0.6);
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .merge(dots)
        .transition()
        .duration(500)
        .attr('cx', d => scatter_xScale(d[variables[1]]))
        .attr('cy', d => scatter_yScale(d[variables[0]]))
        .each(function (d) {
            if (selectedCountryCodes.includes(d.CountryCode)) {
                d3.select(this).raise();
            }
        });

    // Exit selection: Remove elements that no longer have associated data.
    dots.exit().transition().duration(500).remove();

    // Update the X and Y axes
    scatter_xAxisGroup.transition().duration(500).call(scatter_xAxis);
    scatter_yAxisGroup.transition().duration(500).call(scatter_yAxis);
}

let selectedCountries = [];

export async function updateScatterplot(scatter_data, selectedCountryCodes, year, feature, fname) {
    try {
        selectedCountries = selectedCountryCodes;
        let variables = ['TotalFreedomScore', feature];
        let updateData = scatter_data.filter(d => d.Year == year);

        scatter_xScale.domain([0, d3.max(updateData, d => +d[feature])]); // Ensure conversion to number

        scatter_yScale.domain([0, d3.max(updateData, d => d[variables[0]])]);
        xAxisLabel.text(fname);
        makeScatterplot(updateData, scatter_xScale, scatter_yScale, variables, selectedCountryCodes);

    } catch (error) {
        console.error('Error in updateScatterplot:', error);
    }
}