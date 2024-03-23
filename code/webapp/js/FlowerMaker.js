import {updateFeatureDropdown} from './FlagLoading.js'

let flowerPositions = [
    { x: 0, y: 400 },
    { x: 0, y: 400 },
    { x: 0, y: 400 },
];

let width = 0;
let height = 0;

let flowerWidthInner = 0;
let flowerHeightInner = 0;
let yScale = 0;

const margin = {
    top: 50,
    left: 60,
    right: 20,
    bottom: 20,
};

const tooltip = d3.select('#flowersContainer').append('div')
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

export function displayFlower(container, countryCode, positionIndex, shouldAddFlower, data, petalCategories, year) {
  let svg = d3.select(container).select('svg');
  if (svg.empty()) {
        width = container.offsetWidth;
        height = container.offsetHeight;

        flowerWidthInner = width - margin.left - margin.right;
        flowerHeightInner = height - margin.top - margin.bottom;

        // Offset by 50, and then equally spead out flowers.
        flowerPositions = [
            { x: (flowerWidthInner/3) - 50, y: 0 },
            { x: (flowerWidthInner*2/3) - 50, y: 0 },
            { x: (flowerWidthInner) - 50, y: 0 },
        ]

        svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height);

        // SCALE
        yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([flowerHeightInner, margin.top]);

        // AXES
        const g = svg
            .append('g')
            .attr(
                'transform',
                `translate(${margin.left},${margin.top})`,
            )
        g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Freedom Score");

        g.append('g').call(d3.axisLeft(yScale));
    }

  const flowerId = `flower-${positionIndex}`;
  const { x: flowerX, y: flowerY } = flowerPositions[positionIndex];
  const petalSize = 25;
  const centerSize = 30;
  const numPetals = 6;
  let petalData = data.filter(d => d.CountryCode === countryCode && d.Year === String(year));
  let freedomScore = petalData.map(d => d.TotalFreedomScore)
  const petalColours = ["pink", "red", "orange", "yellow", "green", "blue"]

  if (shouldAddFlower) {
      if (svg.select(`#${flowerId}`).empty()) {
        const flowerGroup = svg.append('g').attr('id', flowerId);

        // Flower position and stem height. This is where the magic happens.
        let flowerY = yScale(freedomScore) + margin.top;
        let stemHeight = height - margin.bottom - flowerY;

        // Add stem
        flowerGroup.append('rect')
            .attr('x', flowerX)
            .attr('y', flowerY)
            .attr('width', 5)
            .attr('height',stemHeight)
            .attr('fill', 'green');

        for (let i = 0; i < numPetals; i++) {
            const angle = ((Math.PI * 2 / numPetals) * i) + 0.5;
            const petalX = flowerX + Math.cos(angle) * petalSize * 2;
            const petalY = flowerY + Math.sin(angle) * petalSize * 2;
            
            let currCat = petalCategories[i]
            const petalDataEntry = petalData[0];
            const isDataEmpty = currCat.some(field => petalDataEntry[field] === "");
            flowerGroup.append('circle')
                .attr('cx', petalX)
                .attr('cy', petalY)
                .attr('r', petalSize)
                .attr('fill', isDataEmpty ? 'grey' : petalColours[i])
                .attr('id', i)
                .on('click', (event) => {
                    updateFeatureDropdown(currCat)
                })
                .on('mouseover', (event, d) => {
                    let petalId = d3.select(event.target).attr('id');
                    let offsetX = 0
                    let offsetY = 0
                    if (petalId === 0 || petalId === 5){
                        offsetX = Math.cos(angle) * petalSize;
                        offsetY = Math.sin(angle) * petalSize;
                    } else if (petalId === 2 || petalId ===  3){
                        offsetX = Math.cos(angle) * petalSize * 2;
                        offsetY = Math.sin(angle) * petalSize;
                    } else{
                        offsetX = Math.cos(angle) * petalSize;
                        offsetY = Math.sin(angle) * petalSize;
                    }
                    const tooltipHtml = currCat.map(field => `${field}: ${petalDataEntry[field]}`).join('<br/>');
                    tooltip.html(tooltipHtml)
                    .style('left', event.pageX + offsetX + 'px')
                    .style('top', event.pageY + offsetY +  'px')
                    .transition()
                    .duration(200)
                    .style('opacity', .9);
                })
                .on('mouseout', function () {
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });
        }


          // Add flag pattern to the center of the flower
          const flagUrl = `./../../data/flags/${countryCode}.svg`;
          d3.xml(flagUrl).then((data) => {
              if (!data || !data.documentElement) {
                  console.error('Flag SVG data is null or malformed for:', countryCode);
                  return;
              }
            let iconWidth = 0;
            let iconHeight = 0;
            const svgNode = data.getElementsByTagName('svg')[0];
            const svgWidth = svgNode.getAttribute('width');
            const svgHeight = svgNode.getAttribute('height');
            console.log(`${svgWidth} ${svgHeight}`)
            if (svgWidth !== null){
                iconWidth = svgWidth;
            } else{
                iconWidth = 900;
            }
            if (svgHeight !== null){
                iconHeight = svgHeight;
            } else{
                iconHeight = 600;
            }

            const patternId = `flagPattern-${countryCode}`;
            let defs = svg.select('defs');
            if (defs.empty()) {
                defs = svg.append('defs');
            }

            const flagPattern = defs.append("pattern")
                .attr("id", patternId)
                .attr("patternUnits", "objectBoundingBox")
                .attr("width", 1)
                .attr("height", 1)
                .attr("viewBox", `0 0 ${iconWidth} ${iconHeight}`)
                .attr("preserveAspectRatio", "xMidYMid slice");

            flagPattern.node().appendChild(data.documentElement);

            flowerGroup.append('circle')
                .attr('cx', flowerX)
                .attr('cy', flowerY)
                .attr('r', centerSize)
                .attr('fill', `url(#${patternId})`);

          }).catch(err => {
              console.error('Error loading flag:', err);
          });
      }
  } else {
      // Remove the flower if it exists
      svg.select(`#${flowerId}`).remove();
  }
}