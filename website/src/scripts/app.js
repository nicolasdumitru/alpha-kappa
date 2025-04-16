// Data for CH3COOH (acetic acid)
const aceticAcidData = {
    concentrations: [0.001, 0.01, 0.1, 1], // Example concentrations in mol/L
    conductivities: [0.16, 0.28, 0.55, 1.0], // Default conductivities in mS/cm
    temperatures: [20, 25, 30, 35], // Example temperatures in °C
    temperatureConductivities: [0, 0, 0, 0] // Placeholder for custom temperature conductivities
};

// Data for KCl (potassium chloride)
const kclData = {
    concentrations: [0.001, 0.01, 0.1, 1], // Example concentrations in mol/L
    conductivities: [1.3, 2.6, 6.5, 13.0], // Default conductivities in mS/cm
    temperatures: [20, 25, 30, 35], // Example temperatures in °C
    temperatureConductivities: [0, 0, 0, 0] // Placeholder for custom temperature conductivities
};

// Default concentrations for the form
const liveConcentrations = [0.001, 0.01, 0.1, 1];
const liveTemperatures = [20, 25, 30, 35];

// Store custom conductivities and graph states for each substance
const customConductivityData = {
    aceticAcid: {
        concentrations: null, // Custom concentration conductivities
        temperatures: null, // Custom temperature conductivities
        graphGenerated: false // Tracks if a graph was generated
    },
    kcl: {
        concentrations: null, // Custom concentration conductivities
        temperatures: null, // Custom temperature conductivities
        graphGenerated: false // Tracks if a graph was generated
    }
};

// Chart instance (initialized as null)
let substanceChart = null;
let currentGraphType = 'concentration'; // Default graph type

// Function to create or update the chart
const updateChart = (substance) => {
    // Get the chart data based on the selected substance
    const chartData = substance === 'aceticAcid' ? aceticAcidData : kclData;
    const chartLabel =
        currentGraphType === 'concentration'
            ? (substance === 'aceticAcid' ? 'CH₃COOH \u03BB=f(C)' : 'KCl \u03BB=f(C)')
            : (substance === 'aceticAcid' ? 'CH₃COOH \u03BB=f(T)' : 'KCl \u03BB=f(T)');
    const chartColor = substance === 'aceticAcid' ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)';
    const chartBgColor = substance === 'aceticAcid' ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)';

    // Determine the X-axis labels and Y-axis data based on the graph type
    const xLabels = currentGraphType === 'concentration' ? chartData.concentrations : chartData.temperatures;
    const yData =
        currentGraphType === 'concentration'
            ? customConductivityData[substance].concentrations
            : customConductivityData[substance].temperatures;

    // If no conductivities are available, destroy the chart and return
    if (!yData || yData.every((value) => value === 0)) {
        if (substanceChart) {
            substanceChart.destroy();
            substanceChart = null;
        }
        return;
    }

    // If a chart already exists, destroy it before creating a new one
    if (substanceChart) {
        substanceChart.destroy();
    }

    // Create a new chart
    substanceChart = new Chart(document.getElementById('substanceChart'), {
        type: 'line',
        data: {
            labels: xLabels, // X-axis: concentrations or temperatures
            datasets: [{
                label: chartLabel,
                data: yData, // Y-axis: conductivities
                borderColor: chartColor,
                backgroundColor: chartBgColor,
                borderWidth: 2,
                fill: false,
                tension: 0.1 // Smoothness of the line
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: currentGraphType === 'concentration' ? 'Concentrație (N)' : 'Temperatură (°C)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Conductivitate (S/cm)'
                    }
                }
            }
        }
    });
};

// Function to toggle input fields based on the graph type
const toggleInputFields = () => {
    const concentrationInputs = document.getElementById('concentrationInputs');
    const temperatureInputs = document.getElementById('temperatureInputs');

    if (currentGraphType === 'concentration') {
        concentrationInputs.style.display = 'block';
        temperatureInputs.style.display = 'none';
    } else {
        concentrationInputs.style.display = 'none';
        temperatureInputs.style.display = 'block';
    }
};

// Function to clear input fields
const clearInputFields = () => {
    const inputs = document.querySelectorAll('#concentrationInputs input, #temperatureInputs input');
    inputs.forEach((input) => {
        input.value = ''; // Clear the value of each input field
    });
};

// Event listener for the dropdown
document.getElementById('substanceSelector').addEventListener('change', (event) => {
    const selectedSubstance = event.target.value;

    // Save the current input values for the previously selected substance
    const customConductivities =
        currentGraphType === 'concentration'
            ? liveConcentrations.map((concentration) => {
                  const input = document.getElementById(`conductivity-${concentration}`);
                  return parseFloat(input.value) || 0; // Default to 0 if no value is entered
              })
            : liveTemperatures.map((temperature) => {
                  const input = document.getElementById(`conductivity-${temperature}`);
                  return parseFloat(input.value) || 0; // Default to 0 if no value is entered
              });

    const previousSubstance = document.getElementById('substanceSelector').dataset.previousSubstance;
    if (previousSubstance) {
        if (currentGraphType === 'concentration') {
            customConductivityData[previousSubstance].concentrations = customConductivities;
        } else {
            customConductivityData[previousSubstance].temperatures = customConductivities;
        }
    }

    // Clear the input fields
    clearInputFields();

    // Load the stored values for the newly selected substance
    const storedConductivities =
        currentGraphType === 'concentration'
            ? customConductivityData[selectedSubstance].concentrations
            : customConductivityData[selectedSubstance].temperatures;

    if (storedConductivities) {
        const inputs = currentGraphType === 'concentration' ? liveConcentrations : liveTemperatures;
        inputs.forEach((value, index) => {
            const input = document.getElementById(`conductivity-${value}`);
            input.value = storedConductivities[index] || ''; // Populate the input field with the stored value
        });
    }

    // Destroy the chart if switching substances
    if (substanceChart) {
        substanceChart.destroy();
        substanceChart = null;
    }

    // Save the newly selected substance as the previous substance
    document.getElementById('substanceSelector').dataset.previousSubstance = selectedSubstance;

    // If a graph was previously generated for the new substance, recreate it
    if (customConductivityData[selectedSubstance].graphGenerated) {
        updateChart(selectedSubstance);
    }
});

// Event listener for the form button
document.getElementById('updateChartButton').addEventListener('click', () => {
    const selectedSubstance = document.getElementById('substanceSelector').value;

    // Collect custom conductivity values from the form
    const customConductivities =
        currentGraphType === 'concentration'
            ? liveConcentrations.map((concentration) => {
                  const input = document.getElementById(`conductivity-${concentration}`);
                  return input.value === '' ? null : parseFloat(input.value); // Return null if the field is empty
              })
            : liveTemperatures.map((temperature) => {
                  const input = document.getElementById(`conductivity-${temperature}`);
                  return input.value === '' ? null : parseFloat(input.value); // Return null if the field is empty
              });

    // Check if all cells are completed
    if (customConductivities.includes(null)) {
        // Display an error message if any cell is empty
        alert('Toate câmpurile trebuie completate pentru a crea graficul!'); // "All fields must be completed to create the graph!"
        return; // Stop further execution
    }

    // Save the custom conductivities for the selected substance and graph type
    if (currentGraphType === 'concentration') {
        customConductivityData[selectedSubstance].concentrations = customConductivities;
    } else {
        customConductivityData[selectedSubstance].temperatures = customConductivities;
    }

    // Mark the graph as generated
    customConductivityData[selectedSubstance].graphGenerated = true;

    // Update the chart with the custom conductivities
    updateChart(selectedSubstance);
});

// Event listener for the toggle button
document.getElementById('toggleGraphButton').addEventListener('click', () => {
    // Destroy the existing chart if it exists
    if (substanceChart) {
        substanceChart.destroy();
        substanceChart = null;
    }

    // Toggle the graph type
    currentGraphType = currentGraphType === 'concentration' ? 'temperature' : 'concentration';

    // Update the input fields visibility
    toggleInputFields();

    // Update the graph title
    const graphTitle = document.getElementById('graphTitle');
    graphTitle.textContent =
        currentGraphType === 'concentration'
            ? 'Conductivitate în funcție de concentrație'
            : 'Conductivitate în funcție de temperatură';

    // Update the toggle button description
    const toggleButton = document.getElementById('toggleGraphButton');
    toggleButton.textContent =
        currentGraphType === 'concentration'
            ? 'Schimbă la Conductivitate în funcție de temperatura'
            : 'Schimbă la Conductivitate în funcție de concentrație';

    // Recreate the chart if it was previously generated
    const selectedSubstance = document.getElementById('substanceSelector').value;
    if (customConductivityData[selectedSubstance].graphGenerated) {
        updateChart(selectedSubstance);
    }
});

// Ensure the correct input fields and button description are visible on page load
toggleInputFields();
const toggleButton = document.getElementById('toggleGraphButton');
toggleButton.textContent = 'Schimbă la concentrație în funcție de temperatură';
document.getElementById('substanceSelector').dataset.previousSubstance = document.getElementById('substanceSelector').value;