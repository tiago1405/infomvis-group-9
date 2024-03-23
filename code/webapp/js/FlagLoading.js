import { displayFlower } from './FlowerMaker.js';
import { updateBarChart } from './BarChart.js';
import { updateScatterplot } from './ScatterPlot.js';
import {createDropdown, updateDropdownOptions} from './auxFunctions.js';
import { updateLineChart } from './LineChart.js';

const flowerPositions = [
    { x: 125, y: 400, taken: false },
    { x: 350, y: 400, taken: false },
    { x: 575, y: 400, taken: false },
  ];

const countryPositionIndexMap = {};
let selectedCountries = [];
let freedomScores = []

let currYear = 2013
let currFeature = 'TotalFreedomScore'

let allYears = []
const features = ['PopulationTotal', 'AddA', 'AddQ', 'AssociationalAndOrganizationalRights', 'CLRating',
                'ElectoralProcess', 'FreedomOfExpressionAndBelief', 'FunctioningOfGovernment', 'PRRating',
                'PersonalAutonomyAndIndividualRights', 'PoliticalPluralismAndParticipation', 'RuleOfLaw',
                'TotalCivilLiberties', 'TotalFreedomScore', 'TotalPoliticalRights']
const featuresNames = {"TotalFreedomScore": "Freedom Score", "SchoolEnrollmentPrimary": ["Ratio of Primary School Enrollments" + "\n" + "vs Expected Enrollments"].join(""), 
                "SchoolEnrollmentSecondary": ["Ratio of Secondary School Enrollments" + "\n" + "vs Expected Enrollments"].join(""), 
                "SchoolEnrollmentTertiary": ["Ratio of Tertiary School Enrollments" + "\n" + "vs Expected Enrollments"].join(""), 
                "EmploymentIndustryPer": ["People employed in Industry" + "\n" + "(% of Employed Population)"].join(""), 
                "EmploymentAgriculturePer": ["People employed in Agriculture" + "\n" + "(% of Employed Population)"].join(""), 
                "EmploymentServicesPer": ["People employed in Services " + "\n" + " (% of Employed Population)"].join(""), 
                "ElectricityAccessPer": "Access to Electricity (% of Population)", 
                "LiteracyRateAdultPer": "Adult Literacy Rate (% of population aged 15+)", 
                "LiteracyRateYouthPer": "Youth Literacy Rate (% of population aged 15-24)", 
                "PopulationRuralPer": ["Population living in Rural areas" + "\n" + "(% of population)"].join(""), 
                "PopulationUrbanPer": ["Population living in Urban areas" + "\n" + "(% of population)"].join("")}

const education = ['SchoolEnrollmentPrimary', 'SchoolEnrollmentSecondary', 'SchoolEnrollmentTertiary'];
const employment = ['EmploymentIndustryPer', 'EmploymentAgriculturePer', 'EmploymentServicesPer',];
const electricity = ['ElectricityAccessPer'];
const literacy = ['LiteracyRateAdultPer', 'LiteracyRateYouthPer'];
const urbanicity = ['PopulationRuralPer', 'PopulationUrbanPer'];

const petalCategories = [education, employment, electricity, literacy, urbanicity, ["TotalFreedomScore"]]
let data = []
let chartingData = []

function loadData() {
    d3.csv('./../../data/combined_data.csv', d =>{
        let temp = d
        features.forEach(feature => {
            d[feature] = +d[feature]
        });
        return Array(temp, d)
    }).then(loadedData => {
        loadedData.forEach((dataArray, index) => {
            data[index] = dataArray[0];
            chartingData[index] = dataArray[1];
        });
        allYears = new Set(
            data.map(d => d.Year
        ));
        // Filter the data for the year 2016 and by freedom status
        data.sort((a, b) =>
            b.TotalFreedomScore - a.TotalFreedomScore
        )
        let rightYear = data.filter(country => country.Year === '2016');
        let freeList = rightYear.filter(country => country.Status === 'F');
        let partiallyFreeList = rightYear.filter(country => country.Status === 'PF');
        let notFreeList = rightYear.filter(country => country.Status === 'NF');

        // Map to get arrays of country codes
        let freeCountryLinks = freeList.map(country => [country.CountryCode, country.CountryName]);
        let partlyFreeCountryLinks = partiallyFreeList.map(country => [country.CountryCode, country.CountryName]);
        let notFreeCountryLinks = notFreeList.map(country => [country.CountryCode, country.CountryName]);
        // Set up event handlers for each flag
        freeCountryLinks.forEach(createFlagRows("#FreeCountriesList"));
        partlyFreeCountryLinks.forEach(createFlagRows("#SemiFreeCountriesList"));
        notFreeCountryLinks.forEach(createFlagRows("#NotFreeCountriesList"));

        updateScatterplot(chartingData, [], currYear, currFeature, featuresNames[currFeature]);
        updateBarChart(chartingData, [], currYear, currFeature, featuresNames[currFeature]);
        updateLineChart(chartingData, [], currFeature, featuresNames[currFeature]);
        createDropdown(
            allYears,
            "year-dropdown-container", 
            yearChangeHandler, 
            "Select Year",
            "year-dropdown",
            currYear
            );
        
        createDropdown(
            [],
            "features-dropdown-container",
            featureChangeHandler,
            "Select Feature",
            "features-dropdown",
            ""
            );
    });
}

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

function createFlagRows(listSelector) {
    return function (countryData) {
        const countryCode = countryData[0]
        const countryName = countryData[1]
        d3.select(listSelector)
            .append("li")
            .attr('class', 'flag')
            .append('img')
            .attr('src', `./../../data/flags/${countryCode}.svg`)
            .attr('id', countryCode)
            .on('click', function () {
                flagSelected(countryCode);
            })
            .on('mouseover', function (event, d){
                const tooltipHtml = [`${countryName}`].join('<br/>');
                tooltip.html(tooltipHtml)
                    .style('left', event.pageX + 'px')
                    .style('top', event.pageY +  'px')
                    .transition()
                    .duration(200)
                    .style('opacity', .9);
            })
            .on('mouseout', function (event, d){
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    }
}

function flagSelected(countryCode) {
    const flowerContainer = document.getElementById('flowersContainer');
    const isSelected = selectedCountries.includes(countryCode);
    const flagElement = d3.select(`#${countryCode}`);

    if (isSelected) {
        flagElement.classed('flag-selected', !isSelected);
        const positionIndex = countryPositionIndexMap[countryCode];
        flowerPositions[positionIndex].taken = false;
        displayFlower(flowerContainer, countryCode, positionIndex, false, data, petalCategories, currYear);
        selectedCountries = selectedCountries.filter(code => code !== countryCode);
        updateScatterplot(chartingData, selectedCountries, currYear, currFeature, featuresNames[currFeature]);
        updateBarChart(chartingData, selectedCountries, currYear, currFeature, featuresNames[currFeature]);
        updateLineChart(chartingData, selectedCountries, currFeature, featuresNames[currFeature]);
        delete countryPositionIndexMap[countryCode];
    } else {
        const availablePositionIndex = flowerPositions.findIndex(p => !p.taken);
        if (availablePositionIndex !== -1) {
            flagElement.classed('flag-selected', !isSelected);
            flowerPositions[availablePositionIndex].taken = true;
            countryPositionIndexMap[countryCode] = availablePositionIndex;
            selectedCountries.push(countryCode);
            displayFlower(flowerContainer, countryCode, availablePositionIndex, true, data, petalCategories, currYear);
            updateScatterplot(chartingData, selectedCountries, currYear, currFeature, featuresNames[currFeature]);
            updateBarChart(chartingData, selectedCountries, currYear, currFeature, featuresNames[currFeature]);
            updateLineChart(chartingData, selectedCountries, currFeature, featuresNames[currFeature]);
        } else {
            console.warn("No available positions for new flowers.");
        }
    }
}


export function updateFeatureDropdown(newOptions){
    updateDropdownOptions(newOptions, "features-dropdown-container", featureChangeHandler, newOptions[0])
    updateScatterplot(chartingData, selectedCountries, currYear, newOptions[0], featuresNames[newOptions[0]])
    updateBarChart(chartingData, selectedCountries, currYear, newOptions[0], featuresNames[newOptions[0]]);
    updateLineChart(chartingData, selectedCountries, newOptions[0], featuresNames[newOptions[0]]);
    currFeature = newOptions[0];
}

function yearChangeHandler(selectedYear) {
    try{
        if(!selectedCountries) {
            console.warn("No countries selected yet");
        } else{
            // Update scatterplot with selected year
            currYear = selectedYear;
            const flowerContainer = document.getElementById('flowersContainer');
            selectedCountries.forEach(countryCode => {
                const positionIndex = countryPositionIndexMap[countryCode];
                displayFlower(flowerContainer, countryCode, positionIndex, false, data, petalCategories, currYear);
                displayFlower(flowerContainer, countryCode, positionIndex, true, data, petalCategories, currYear);
            });
            updateScatterplot(chartingData, selectedCountries, currYear, currFeature, featuresNames[currFeature]);
            updateBarChart(chartingData, selectedCountries, currYear, currFeature, featuresNames[currFeature]);
        }
    } catch (error) {
        console.error("Error in year change handler", error);
    }
}

function featureChangeHandler(selectedFeature){
    try{
        if(!selectedCountries) {
            console.warn("No countries selected yet");
        } else {
            currFeature = selectedFeature
            updateScatterplot(chartingData, selectedCountries, currYear, currFeature, featuresNames[currFeature]);
            updateBarChart(chartingData, selectedCountries, currYear, currFeature, featuresNames[currFeature]);
            updateLineChart(chartingData, selectedCountries, currFeature, featuresNames[currFeature]);
        }
    } catch (error) {
        console.error("Error in feature change handler", error);
    }

}

loadData();