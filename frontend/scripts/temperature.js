class TemperatureStudy {
    constructor(name) {
        this.name = name;

        this.temperatures = [25, 50, 100];  // Temp1, Temp2, Temp3
        this.concentrations = [0.01, 0.1, 1, 2, 5, 6, 7, 8, 10, 12];  // Different concentrations

        // Initialize arrays for conductivities
        this.conductivities = Array(this.concentrations.length).fill(null).map(() => Array(this.temperatures.length).fill(null));
        this.mc = Array(this.concentrations.length).fill(null).map(() => Array(this.temperatures.length).fill(null));

        this.generated = false;
    }

    // calculate molar conductivities
    calculateMc() {
        for(let i=0;i<this.concentrations.length;i++)
            for(let j=0;j<this.temperatures.length;j++)
                if(this.conductivities[i][j]!==null)
                    this.mc[i][j]=(1000*this.conductivities[i][j])/this.concentrations[i];
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
            th.textContent = `Temp ${temp} °C`;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Create rows for each concentration
        this.concentrations.forEach((concentration, i) => {
            const row = document.createElement('tr');

            // Row label for concentration
            const concentrationCell = document.createElement('td');
            concentrationCell.textContent = `Concentrație ${concentration} mol/m^3`;
            row.appendChild(concentrationCell);

            // Input fields for each temperature at the current concentration
            this.temperatures.forEach((temp, j) => {
                const cell = document.createElement('td');

                const input = document.createElement('input');
                input.type = 'number';
                input.step = 'any';
                input.placeholder = `Introduceți conduc. Temp ${temp}`;
                input.id = `concentration-${i}-temp-${j}`;

                // Set event listener to capture the input values
                input.addEventListener('input', (event) => {
                    if (this.generated) {
                        // Destroy existing chart if needed
                        Chart.getChart('temperatureGraphContainer').destroy();
                        this.generated = false;
                    }
                    const value = event.target.value.trim();
                    if (value === '') {
                        this.conductivities[i][j] = null;
                    } else {
                        const floatValue = parseFloat(value);
                        if (!isNaN(floatValue)) {
                            this.conductivities[i][j] = floatValue;
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

    // Check if all fields are filled before generating the graph
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

    // Generate graph based on input conductivities
    generateTemperatureGraph() {
        const validTemperatures = this.checkFilledFields();

        if (validTemperatures.length === 0) {
            alert("Te rog să introduci măcar 2 pentru una din temperaturi");
            return;
        }

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
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (this.generated) {
                // Destroy existing chart if needed
                Chart.getChart('temperatureGraphContainer').destroy();
            }

            // Colors for each temperature
            const colors = ['blue', 'orange', 'red'];

            // Create new graph
            const temperatureChart = new Chart(ctx, {
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
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Conductivitate (S/cm)',
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

            this.generated = true;
        }
    }

    // Generate graph for molar conductivity vs concentration
generateMolarConductivityGraph() {
    const validTemperatures = this.checkFilledFields();

    if (validTemperatures.length === 0) {
        alert("Te rog să introduci măcar 2 pentru una din temperaturi");
        return;
    }

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
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (this.molarGenerated) {
            Chart.getChart('molarConductivityGraphContainer').destroy();
        }

        const colors = ['blue', 'orange', 'red'];

        const molarChart = new Chart(ctx, {
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
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Conductivitate molară (S·cm²/mol)',
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const concentration = validConcentrations[context.dataIndex];
                                const mcValue = context.raw;
                                return `Concentrație: ${concentration} mol/L\nConductivitate molară: ${mcValue} S·cm²/mol`;
                            }
                        }
                    }
                }
            },
        });

        this.molarGenerated = true;
    }
}
//END OF CLASS
}

// Initialize the temperature study and handle functionality
const temperatureStudy = new TemperatureStudy("KOH");
temperatureStudy.createTemperatureInputs();

// Event listener for generating graph after data input
document.getElementById('temperatureGenerateButton').addEventListener('click', () => {
    //temperatureStudy.initializeConductivities(); // Initialize conductivities before generating graph
    temperatureStudy.calculateMc();
    temperatureStudy.generateTemperatureGraph();
    temperatureStudy.generateMolarConductivityGraph();
});
