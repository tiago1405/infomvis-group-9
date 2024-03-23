export function createDropdown(options, containerID, onChangeCallback, dropdownLabel, dropdownCSSName, initialValue) {
    const dropdownContainer = d3.select(`#${containerID}`);
    const label = dropdownContainer.append('label')
        .text(dropdownLabel)
        .attr('for', `${containerID}-dropdown`)
        .attr('class', `${dropdownCSSName}-label`);

    const dropdown = dropdownContainer.append('select')
        .attr('id', `${containerID}-dropdown`)
        .attr('class', dropdownCSSName)
        .on('change', function() {
            const selectedValue = d3.select(this).property('value');
            onChangeCallback(selectedValue); // Call the callback function with the selected value
        });

    // Append options to the select element
    dropdown.selectAll('option')
        .data(options)
        .enter().append('option')
        .text(d => d)
        .attr('value', d => d);
    dropdown.property('value', initialValue);
}

export function updateDropdownOptions(newValues, containerID, onChangeCallback, initialValue){
    const dropdown = d3.select(`#${containerID}-dropdown`);
    
    dropdown.selectAll('option').remove();
    
    dropdown.selectAll('option')
        .data(newValues)
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d);
    
    // Update the 'on change' event handler for the dropdown
    dropdown.on('change', function(event) {
        // Pass the event to the callback
        onChangeCallback(d3.select(this).property('value'), event);
    });
    dropdown.property('value', initialValue)
}

export function wrapText(text, textContent, width) {
    text.text(textContent);
    text.each(function() {
        let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // Adjust as needed
            x = text.attr("x"),
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy"));

        let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}