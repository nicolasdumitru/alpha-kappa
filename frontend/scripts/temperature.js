// NOTE: user must introduce conductivities in μS/cm and then be converted into S/cm
class TemperatureStudy {
    constructor(name) {
        this.name = name;

        this.temperatures = [25, 50, 100];  // Temp1, Temp2, Temp3
        this.concentrations = [0.01, 0.1, 1, 2, 5, 6, 7, 8, 10, 12];  // Different concentrations

        // Initialize arrays for conductivities
        this.conductivities = Array(this.concentrations.length).fill(null).map(() => Array(this.temperatures.length).fill(null));
        this.mc = Array(this.concentrations.length).fill(null).map(() => Array(this.temperatures.length).fill(null));

        this.graphsGenerated = false;
        this.tablesGenerated = false;
    }

    // calculate molar conductivities
    calculateMc() {
        for (let i = 0; i < this.concentrations.length; i++)
            for (let j = 0; j < this.temperatures.length; j++)
                if (this.conductivities[i][j] !== null)
                    this.mc[i][j] = (1000 * this.conductivities[i][j]) / this.concentrations[i];
    }

    // Calculate pOH and pH
    calculatePOHAndPH(concentration) {
        if (concentration > 0) {
            const pOH = -Math.log10(concentration);
            const pH = 14 - pOH;
            return { pOH: pOH.toFixed(2), pH: pH.toFixed(2) };
        } else {
            return { pOH: 'N/A', pH: 'N/A' };
        }
    }

    // Initialize all the conductivites values so that you dont have to manually introduce them all
    initializeConductivities() {
        // indexing starts from 0
        // C= 0.01
        this.conductivities[0][0] = 0.00243; // concentration 0, conductivity value for 25 degrees
        this.conductivities[0][1] = 0.00323; // concentration 0, conductivity value for 50 degrees
        this.conductivities[0][2] = 0.00503; // concentration 0, conductivity value for 100 degrees

        // C= 0.1
        this.conductivities[1][0] = 0.0241;
        this.conductivities[1][1] = 0.032;
        this.conductivities[1][2] = 0.0499;

        // C= 1
        this.conductivities[2][0] = 0.2153;
        this.conductivities[2][1] = 0.2901;
        this.conductivities[2][2] = 0.4604;

        // C= 2
        this.conductivities[3][0] = 0.3778;
        this.conductivities[3][1] = 0.5183;
        this.conductivities[3][2] = 0.8379;

        // C= 5
        this.conductivities[4][0] = 0.6121;
        this.conductivities[4][1] = 0.8933;
        this.conductivities[4][2] = 1.5356;

        // C= 6
        this.conductivities[5][0] = 0.6266;
        this.conductivities[5][1] = 0.936;
        this.conductivities[5][2] = 1.6441;

        // C= 7
        this.conductivities[6][0] = 0.6196;
        this.conductivities[6][1] = 0.9481;
        this.conductivities[6][2] = 1.7011;

        // C= 8
        this.conductivities[7][0] = 0.5976;
        this.conductivities[7][1] = 0.9356;
        this.conductivities[7][2] = 1.7127;

        // C= 10
        this.conductivities[8][0] = 0.5331;
        this.conductivities[8][1] = 0.8625;
        this.conductivities[8][2] = 1.6249;

        // C= 12 
        this.conductivities[9][0] = 0.4832;
        this.conductivities[9][1] = 0.7666;
        this.conductivities[9][2] = 1.4308;
    }
    // Dynamically create input fields for each concentration and temperature
    createTemperatureInputs() {
        const inputContainer = document.getElementById('temperatureInputContainer');

        // Create table-like structure for inputs
        const table = document.createElement('table');
        const headerRow = document.createElement('tr');

        // Add header for temperatures
        headerRow.appendChild(document.createElement('th')); // Empty cell for row label
        this.temperatures.forEach(temp => {
            const th = document.createElement('th');
            th.style.textAlign = 'center';  // Center the header text
            th.style.fontWeight = 'bold';   // Make the header bold
            th.className='ceva';
            th.textContent = `Temperatură: ${temp} °C`;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Create rows for each concentration
        this.concentrations.forEach((concentration, i) => {
            const row = document.createElement('tr');

            // Row label for concentration
            const concentrationCell = document.createElement('td');
            concentrationCell.textContent = `Concentrație ${concentration} mol/L`;
            row.appendChild(concentrationCell);

            // Input fields for each temperature at the current concentration
            this.temperatures.forEach((temp, j) => {
                const cell = document.createElement('td');

                const input = document.createElement('input');
                input.type = 'number';
                input.step = 'any';
                input.placeholder = `Conductivitate (μS/cm)`;
                input.id = `concentration-${i}-temp-${j}`;

                // Set event listener to capture the input values
                input.addEventListener('input', (event) => {
                    if (this.graphsGenerated) {
                        // Destroy existing charts and tables if needed
                        Chart.getChart('temperatureGraphContainer').destroy();
                        Chart.getChart('molarConductivityGraphContainer').destroy();
                        this.graphsGenerated = false;
                    }
                    if (this.tablesGenerated) {
                        document.getElementById('temperatureTablesContainer').innerHTML = '';
                        this.tablesGenerated = false;
                    }
                    const value = event.target.value.trim();
                    if (value === '') {
                        this.conductivities[i][j] = null;
                    } else {
                        const floatValue = parseFloat(value);
                        if (!isNaN(floatValue)) {
                            this.conductivities[i][j] = floatValue / 1000000; // convert μS to S 
                        }
                    }
                });

                cell.appendChild(input);
                row.appendChild(cell);
            });

            table.appendChild(row);
        });

        inputContainer.appendChild(table);
    }

    // Check if at least one field for one temperature is filled
    checkAtLeastOneFilledField() {
        let validTemperatures = [];

        for (let i = 0; i < this.temperatures.length; i++) {
            for (let j = 0; j < this.concentrations.length; j++) {
                if (this.conductivities[j][i] !== null) {
                    validTemperatures.push(i);
                    break;
                }
            }
        }
        return validTemperatures;
    }

    // Check if at least 2 fields for one temperature are filled
    checkFilledFields() {
        let validTemperatures = [];

        for (let i = 0; i < this.temperatures.length; i++) {
            let counter = 0;
            for (let j = 0; j < this.concentrations.length; j++) {
                if (this.conductivities[j][i] !== null) {
                    counter++;
                    if (counter >= 2) {
                        validTemperatures.push(i); // Store index of temperature if valid
                        break;
                    }
                }
            }
        }
        return validTemperatures;
    }

    // Generate temperature tables
    generateTemperatureTables(validTemperatures) {
        const container = document.getElementById('temperatureTablesContainer');

        validTemperatures.forEach(tempIdx => {
            const temp = this.temperatures[tempIdx];

            // Create title for the table
            const title = document.createElement('h3');
            title.textContent = `Temperatură: ${temp} °C`;
            container.appendChild(title);

            // Create table
            const table = document.createElement('table');

            // Header row
            const headerRow = document.createElement('tr');
            ['Concentrație (mol/L)', 'Conductivitate (μS/cm)', 'Conductivitate (S/cm)', 'Conductivitate echivalentă (S·cm²/mol)', 'pOH', 'pH'].forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            // Data rows
            for (let i = 0; i < this.concentrations.length; i++) {
                const conductivity = this.conductivities[i][tempIdx];
                const mc = this.mc[i][tempIdx];

                if (conductivity !== null && this.concentrations[i] <= 1) { // we don't show null cells or pH and pOH for concentrations > 1
                    const row = document.createElement('tr');

                    const conc = this.concentrations[i];
                    const { pOH, pH } = this.calculatePOHAndPH(conc);

                    const µSvalue = conductivity * 1_000_000; // Convert S/cm to μS/cm

                    row.innerHTML = `
                        <td>${conc}</td>
                        <td>${µSvalue.toFixed(2)}</td>
                        <td>${conductivity.toFixed(6)}</td>
                        <td>${mc !== null ? mc.toFixed(2) : '—'}</td>
                        <td>${pOH}</td>
                        <td>${pH}</td>
                    `;

                    table.appendChild(row);
                }
            }

            container.appendChild(table);
        });
    }
    // Generate graph based on input conductivities
    generateTemperatureGraph(validTemperatures) {

        const validConcentrations = [];
        const validConductivities = [];

        for (let i = 0; i < this.concentrations.length; i++) {
            // Filter out concentrations where all temperatures have null conductivity values
            const conductivitiesAtTemp = this.conductivities[i];
            const validConductivityForConcentration = conductivitiesAtTemp.filter(c => c != null);

            // Only add concentrations that have at least one valid conductivity value
            if (validConductivityForConcentration.length > 0) {
                validConcentrations.push(this.concentrations[i]);
                // Replace null values with undefined or omit them so the chart won't try to plot them
                validConductivities.push(conductivitiesAtTemp.map(c => c != null ? c : undefined));
            }
        }

        const canvas = document.getElementById('temperatureGraphContainer');
        const existingChart = Chart.getChart('temperatureGraphContainer');
        if (existingChart) {
            existingChart.destroy();
        }

        // Colors for each temperature
        const colors = ['blue', 'orange', 'red'];

        // Create new graph
        const temperatureChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: validConcentrations,
                datasets: validTemperatures.map((tempIdx) => {
                    const temp = this.temperatures[tempIdx];
                    return {
                        label: `Temp ${temp} °C`,
                        data: validConductivities.map(conductivityArr => conductivityArr[tempIdx]), // Only include valid data
                        borderColor: colors[tempIdx],  // Blue for 25°C, Orange for 50°C, Red for 100°C
                        backgroundColor: `${colors[tempIdx]}99`, // Light color for the fill
                        fill: false,
                        pointRadius: 5,
                        spanGaps: true,  // Ignore gaps in data, draw the line through missing points
                    };
                }),
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Concentrație (mol / L)',
                            font: {
                                size: 20
                            }
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Conductivitate (S/cm)',
                            font: {
                                size: 20
                            }
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                // Get concentration and conductivity values for the tooltip
                                const concentration = validConcentrations[context.dataIndex];
                                const conductivityValue = context.raw;
                                return `Concentrație: ${concentration} mol/L\nConductivitate: ${conductivityValue} S/cm`;
                            }
                        }
                    }
                }
            },
        });
    }

    // Generate graph for molar conductivity vs concentration
    generateMolarConductivityGraph(validTemperatures) {

        const validConcentrations = [];
        const validMolarConductivities = [];

        for (let i = 0; i < this.concentrations.length; i++) {
            const mcAtTemp = this.mc[i];
            const validMcForConcentration = mcAtTemp.filter(mcVal => mcVal != null);

            if (validMcForConcentration.length > 0) {
                validConcentrations.push(this.concentrations[i]);
                validMolarConductivities.push(mcAtTemp.map(mcVal => mcVal != null ? mcVal : undefined));
            }
        }
        const canvas = document.getElementById('molarConductivityGraphContainer');
        const existingChart = Chart.getChart('molarConductivityGraphContainer');
        if (existingChart) {
            existingChart.destroy();
        }

        const colors = ['blue', 'orange', 'red'];

        const molarChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: validConcentrations,
                datasets: validTemperatures.map((tempIdx) => {
                    const temp = this.temperatures[tempIdx];
                    return {
                        label: `Temp ${temp} °C`,
                        data: validMolarConductivities.map(mcArr => mcArr[tempIdx]),
                        borderColor: colors[tempIdx],
                        backgroundColor: `${colors[tempIdx]}99`,
                        fill: false,
                        pointRadius: 5,
                        spanGaps: true,
                    };
                }),
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Concentrație (mol / L)',
                            font: {
                                size: 20
                            }
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Conductivitate echivalentă (S·cm²/mol)',
                            font: {
                                size: 20
                            }
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const concentration = validConcentrations[context.dataIndex];
                                const mcValue = context.raw;
                                return `Concentrație: ${concentration} mol/L\nConductivitate echivalentă: ${mcValue} S·cm²/mol`;
                            }
                        }
                    }
                }
            },
        });
    }
}
//END OF CLASS

// Initialize the temperature study and handle functionality
const temperatureStudy = new TemperatureStudy("KOH");
temperatureStudy.createTemperatureInputs();

// temperatureStudy.initializeConductivities(); // Initialize conductivities before generating graph

// Event listener for generating graph after data input
document.getElementById('temperatureTablesButton').addEventListener('click', () => {
    if (temperatureStudy.tablesGenerated) {
        alert("Deja ati generat tabele.");
        return;
    }
    temperatureStudy.calculateMc(); // ensure molar conductivity is calculated
    const validTemperatures = temperatureStudy.checkAtLeastOneFilledField();

    if (validTemperatures.length === 0) {
        alert("Introduceți cel puțin o valoare pentru una dintre temperaturi.");
        return;
    }

    temperatureStudy.generateTemperatureTables(validTemperatures);
    temperatureStudy.tablesGenerated = true;
});

document.getElementById('temperatureGraphsButton').addEventListener('click', () => {
    if (temperatureStudy.graphsGenerated) {
        alert("Deja ati generat grafice.");
        return;
    }
    temperatureStudy.calculateMc();
    const validTemperatures = temperatureStudy.checkFilledFields();

    if (validTemperatures.length === 0) {
        alert("Te rog să introduci măcar 2 pentru una din temperaturi");
        return;
    }
    else {
        temperatureStudy.generateTemperatureGraph(validTemperatures);
        temperatureStudy.generateMolarConductivityGraph(validTemperatures);
        temperatureStudy.graphsGenerated = true;
    }

});