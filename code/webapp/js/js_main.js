let margin = {top: 40, right: 40, bottom: 60, left: 30};

let width = 640 - margin.left - margin.right;
let height = 250 - margin.top - margin.bottom;

let svg = d3.select("#upperLeft")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// First select all free countries and make a row out of them
// Do the same for semi-free and not free countries.


const flagCode = ['../../data/flags/AND.svg',]
svg.selectAll("image")
    .data(flagCode)
    .enter()
    .append('image')
    .attr("x", (d, i) => i * 50) // Adjust the positioning based on your preference
    .attr("y", 10) // Change the y value based on the freedom score.
    .attr("width", 45)
    .attr("height", 30)
    .attr("xlink:href", d => d);


loadData()


let parseDate = d3.timeParse("%Y");

function convertToInt(feature) {
    d.feature = +d.feature
    return d.feature
}

function loadData() {
    d3.csv('../../data/combined_data.csv', d => {
        // Change data if needed
        const features = ['ElectoralProcess', 'FreedomOfExpressionAndBelief', 'FunctioningOfGovernment', 'AssociationalAndOrganizationalRights', 'PersonalAutonomyAndIndividualRights', 'PoliticalPluralismAndParticipation', 'RuleOfLaw', 'TotalCivilLiberties', 'TotalFreedomScore', 'TotalPoliticalRights']
        features.forEach(feature => {
            d[feature] = +d[feature]
        })
        const timeFeatures = ['Year']
        timeFeatures.forEach(feature => {
            d[feature] = parseDate(d[feature].toString())
        })
        return d
    }).then(data => {
        console.log(data)
        // Make an automatic reference to the flags.
        const flagCode = ['../../data/flags/AND.svg']


    })
}


