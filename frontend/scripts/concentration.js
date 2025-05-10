/* NOTE: regardless of the unit of measurement that the user provides, the program will always convert that unit of measurement
 to the unit of measurement used in the international system and each time we will have to display a specific unit, we will always
 convert from the international system to that specific unit.

 For concentration study, the user must introduce conductivity in μS/cm!

*/
class Electrolyte {
    constructor(name, cation, anion, strength, type) {
        this.type = type; // 'acid' or 'base', used to determine the pH and pOH
        this.strength = strength; // 'strong' or 'weak', used to determine the dissociation
        this.name = name;
        this.cation = cation; // used to calculate the theoretical conductivity at infinite dilution
        this.anion = anion; // used to calculate the theoretical conductivity at infinite dilution
        this.tcid = cation + anion; // theoretical conductivity at infinite dilution
        this.alpha = [0, 0, 0, 0, 0, 0, 0]; // initially set to 0

        if (this.strength === 'strong') // strong electrolytes have a linear regression, therefore we can calculate gcid = B, where y=A*x+B
            this.gcid = 0.0 // initialize graphical conductivity at infinite dilution (it will be received back from the server)

        if (name != 'NaOH' && name != 'KCl')
            this.concentrations = [0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 1];
        else
            this.concentrations = [0.0005, 0.001, 0.005, 0.01, 0.05, 0.1]; // NaOH and KCl don't have C=1

        // initliazing all the arrays
        this.mc = [0, 0, 0, 0, 0, 0, 0]; // molar conductivities
        this.pOH = [0, 0, 0, 0, 0, 0, 0];
        this.pH = [0, 0, 0, 0, 0, 0, 0];
        this.kd = [0, 0, 0, 0, 0, 0, 0];

        // New fields to store entered conductivities
        this.conductivities = Array(this.concentrations.length).fill(null);

        // Flag to check if the table and graph have been generated
        this.generated = false;

        this.A = 0; // First component of the exponential/linear regression
        this.B = 0; // Second component of the exponential/linear regression
        this.R2 = 0; // Value of R^2

    }

    // Function used to test the data from excel without manual introduction in the input fields
    initializeConductivities() {
        if (this == aceticAcid) {
            this.conductivities[0] = 0.0000339;   // 33.9 μS/cm  = 0.0000339 S/cm
            this.conductivities[1] = 0.0000492;  // 49.2 μS/cm  = 0.0000492 S/cm
            this.conductivities[2] = 0.000115;   // 115 μS/cm  = 0.000115 S/cm
            this.conductivities[3] = 0.000163;   // 163 μS/cm  = 0.000163 S/cm
            this.conductivities[4] = 0.00037;   // 370 μS/cm  = 0.00037 S/cm
            this.conductivities[5] = 0.00052;   // 520 μS/cm  = 0.00052 S/cm
            this.conductivities[6] = 0.00125;  // 1250 μS/cm  = 0.00125 S/cm
        }
        else if (this == naoh) {
            this.conductivities[0] = 0.00012245;
            this.conductivities[1] = 0.0002445;
            this.conductivities[2] = 0.001203;
            this.conductivities[3] = 0.00238;
            this.conductivities[4] = 0.01138;
            this.conductivities[5] = 0.02212;
        }
        else if (this == hcl) {
            this.conductivities[0] = 0.00021135;
            this.conductivities[1] = 0.0004214;
            this.conductivities[2] = 0.002079;
            this.conductivities[3] = 0.00412;
            this.conductivities[4] = 0.019955;
            this.conductivities[5] = 0.03913;
            this.conductivities[6] = 0.3328;
        }
        else if (this == kcl) {
            this.conductivities[0] = 0.0000739;
            this.conductivities[1] = 0.0001469;
            this.conductivities[2] = 0.0007175;
            this.conductivities[3] = 0.001413;
            this.conductivities[4] = 0.00667;
            this.conductivities[5] = 0.0129;
            //this.conductivities[6] = 0.1119; // we will leave this here for the moment
        }
    }
}

// Create electrolyte objects
const hcl = new Electrolyte('HCl', 349.6, 76.4, 'strong', "acid");
const naoh = new Electrolyte('NaOH', 50.1, 197.8, 'strong', "base");
const kcl = new Electrolyte('KCl', 73.5, 76.4, 'strong', "salt");
const aceticAcid = new Electrolyte('CH₃COOH', 349.6, 40.9, 'weak', "acid");


// Store the electrolytes in an object for easy access
const electrolytes = {
    'HCl': hcl,
    'NaOH': naoh,
    'KCl': kcl,
    'CH₃COOH': aceticAcid
};

// Event listener for the dropdown
document.getElementById('electrolyteSelector').addEventListener('change', (event) => {
    const selectedSolution = event.target.value; // Get the selected solution
    const selectedElectrolyte = electrolytes[selectedSolution]; // Get the corresponding Electrolyte object

    console.log('Selected electrolyte:', selectedElectrolyte);

    const generateGraphButton = document.getElementById('concentrationGenerateButton');
    generateGraphButton.hidden = false;

    updateInputFields(selectedElectrolyte);

    // Recreate the table and the graph if they existed before
    const generateContainer = document.getElementById('concentrationGenerateContainer');
    generateContainer.innerHTML = ''; // Clear previous table and graph
    if (selectedElectrolyte.generated) {
        createResultTableAndGraph(selectedElectrolyte); // Create the table and graph again
    }
});

// Function to update the input fields based on the selected electrolyte
function updateInputFields(electrolyte) {
    const inputContainer = document.getElementById('concentrationInputContainer');
    inputContainer.innerHTML = ''; // Clear any existing text boxes

    // Get the data to display based on the current electrolyte
    let data;
    let storedValues;
    let labelPrefix;
    let unit;

    data = electrolyte.concentrations;
    storedValues = electrolyte.conductivities;
    labelPrefix = 'Concentrație';
    unit = 'mol/L';


    // Dynamically create rows with labels and input fields
    for (let i = 0; i < electrolyte.concentrations.length; i++) {
        // Create a container for each row
        const row = document.createElement('div');
        row.className = 'input-row'; // Add a class for styling

        // Create a label for the value
        const label = document.createElement('label');
        label.textContent = `${labelPrefix}: ${data[i]} ${unit}`;
        label.className = 'concentration-label'; // Add a class for styling

        // Create an input field for the conductivity
        const inputField = document.createElement('input');
        inputField.type = 'number';
        inputField.step = 'any'; // Allow float values
        inputField.placeholder = 'Conductivitatea măsurată (μS/cm)';
        inputField.id = `input-${i}`;
        inputField.className = 'dynamic-input'; // Add a class for styling

        // Restore the stored value if it exists
        if (storedValues[i] !== null) {
            inputField.value = storedValues[i] * 1000000; // convert S to μS
        }

        // Add an event listener to dynamically update the stored values
        inputField.addEventListener('input', (event) => {
            if (electrolyte.generated) // Clear previous table and graph if they exist when typing
            {
                electrolyte.generated = false; // Reset the table creation flag
                let generateContainer = document.getElementById('concentrationGenerateContainer');
                generateContainer.innerHTML = '';
            }
            const value = event.target.value.trim();
            if (value === '') {
                storedValues[i] = null; // Remove the value if the input is empty
            } else {
                const floatValue = parseFloat(value);
                if (!isNaN(floatValue)) {
                    storedValues[i] = floatValue / 1000000; // Store the entered float value / 10^6 (convert from μS to S)

                } else {

                    storedValues[i] = null; // Reset if the value is invalid
                }
            }
        });

        // Append the label and input field to the row
        row.appendChild(label);
        row.appendChild(inputField);

        // Append the row to the input container
        inputContainer.appendChild(row);
    }
}

// Event listener for the "Generați grafic" button
document.getElementById('concentrationGenerateButton').addEventListener('click', () => {
    const selectedSolution = document.getElementById('electrolyteSelector').value;

    const selectedElectrolyte = electrolytes[selectedSolution];

    if(selectedElectrolyte.generated){
        alert("Deja ai generat tabelul cu valori si graficul.");
        return;
    }

    // Only use this to check if the values from the table and the graph are good
    // selectedElectrolyte.initializeConductivities();

    let ok = true;
    for (let i = 0; i < selectedElectrolyte.concentrations.length; i++) {
        if (selectedElectrolyte.conductivities[i] === null) {
            ok = false;
            break;
        }
    }

    if (!ok) {
        alert('Te rog să completezi toate câmpurile înainte de a genera tabelul și graficul!');
        return;
    }

    if (ok) {
        const dataToSend = {
            mode: 'concentrations',
            type: selectedElectrolyte.type,
            strength: selectedElectrolyte.strength,
            name: selectedElectrolyte.name,
            theoreticalConductivityAtInfiniteDilution: selectedElectrolyte.tcid,
            concentrations: selectedElectrolyte.concentrations,
            conductivities: selectedElectrolyte.conductivities,
        };

        // Convert the data to JSON
        const jsonData = JSON.stringify(dataToSend);

        // Send the JSON to the Python backend
        fetch('http://127.0.0.1:5000/receive-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to send data to the server.');
                }
            })
            .then((responseData) => {
                console.log('Received back:', responseData);

                // Update the selectedElectrolyte with the responseData
                selectedElectrolyte.alpha = responseData.alpha;
                selectedElectrolyte.mc = responseData.mc;
                selectedElectrolyte.kd = responseData.kd;
                selectedElectrolyte.pH = responseData.pH;
                selectedElectrolyte.pOH = responseData.pOH;
                if (selectedElectrolyte.strength === 'strong')
                    selectedElectrolyte.gcid = responseData.B;
                selectedElectrolyte.A = responseData.A;
                selectedElectrolyte.B = responseData.B;
                selectedElectrolyte.R2 = responseData.R2;

                createResultTableAndGraph(selectedElectrolyte); // Now create the table and the graph

            })
            .catch((error) => {
                console.error('Error:', error);
                alert('A apărut o eroare la trimiterea datelor.');
            });
    }

});

// CREATE THE TABLE AND THE GRAPH
function createResultTableAndGraph(electrolyte) {

    const generateContainer = document.getElementById('concentrationGenerateContainer');

    const table = document.createElement('table');
    table.className = 'result-table'; // For styling

    // Create header
    const header = table.insertRow();
    const headers = [
        'Concentrație (mol / L)',
        'Conductivitate măsurată λ (μS/cm)',
        'Conductivitate măsurată λ (S/cm)',
        'Conductivitate molară Λ(S·cm²/mol)',
    ];

    if (electrolyte.strength === 'weak') {
        headers.push('Coeficient de disociere (α)');
        headers.push('Constanta de disociere Kd (mol/L)');
    }

    if (electrolyte.name !== 'KCl') {
        if (electrolyte.type === 'acid') {
            headers.push('pH');
            headers.push('pOH');
        }
        else {
            headers.push('pOH');
            headers.push('pH');
        }
    }

    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        header.appendChild(th);
    });

    // Fill the rows
    for (let i = 0; i < electrolyte.concentrations.length; i++) {
        if (electrolyte.conductivities[i] !== null) {
            const row = table.insertRow();
            let microConductivities = electrolyte.conductivities.map(c => c * 1000000);
            const cells = [
                electrolyte.concentrations[i],
                microConductivities[i].toFixed(2),
                electrolyte.conductivities[i],
                electrolyte.mc[i].toFixed(2),
            ];

            if (electrolyte.strength === 'weak') {
                cells.push(electrolyte.alpha[i].toFixed(6));
                cells.push(electrolyte.kd[i].toFixed(6));
            }

            if (electrolyte.name !== 'KCl') {
                if (electrolyte.type === 'acid') {
                    cells.push(electrolyte.pH[i].toFixed(2));
                    cells.push(electrolyte.pOH[i].toFixed(2));
                }
                else {
                    cells.push(electrolyte.pOH[i].toFixed(2));
                    cells.push(electrolyte.pH[i].toFixed(2));
                }
            }

            cells.forEach(cellData => {
                const cell = row.insertCell();
                cell.textContent = cellData;
            });
        }
    }
    // Append the table to the container
    generateContainer.appendChild(table);

    //==============================================

    // Display R^²
    const rLabel = document.createElement('div');
    rLabel.id = 'regressionLabel';
    rLabel.textContent = `R² = ${electrolyte.R2.toFixed(6)}`;
    rLabel.style.marginTop = '10px';
    rLabel.style.textAlign = 'center';
    rLabel.style.fontWeight = 'bold';
    generateContainer.appendChild(rLabel);

    // If the electrolyte is strong, then we can determine the graphical value of the conductivity at infinite dilution
    if(electrolyte.strength === 'strong'){
        const gcidLabel = document.createElement('div');
        gcidLabel.textContent = `Valoarea grafică a conductivității infinite la diluție Λ₀: ${electrolyte.gcid.toFixed(2)}`;
        gcidLabel.style.marginTop = '10px';
        gcidLabel.style.textAlign = 'center';
        gcidLabel.style.fontWeight='bold';
        generateContainer.appendChild(gcidLabel);
    }
    // Now, let's generate the graph:
    graphContainer = document.createElement('div');
    graphContainer.id = 'concentrationGraphContainer';
    generateContainer.appendChild(graphContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'myGraph';
    graphContainer.appendChild(canvas);

    if (electrolyte.strength == 'weak') {
        const bottomLimit = Math.sqrt(0.0005);
        const upperLimit = Math.sqrt(1);
        const stepSize = (upperLimit - bottomLimit) / 400;

        // Ensure regression is populated before chart
        const regression = generateDataMonomial(bottomLimit, upperLimit, stepSize);

        // Draw the chart
        const ctx = document.getElementById('myGraph').getContext('2d');
        new Chart(ctx, {
            data: {
                labels: electrolyte.concentrations.map(x => Math.sqrt(x)),
                datasets: [
                    {
                        type: 'scatter',
                        label: 'Coordonate',
                        data: electrolyte.mc,
                        pointRadius: 5,
                        backgroundColor: 'red'
                    },
                    {
                        type: 'line',
                        label: 'Regresie',
                        data: regression,
                        borderColor: 'blue',
                        fill: false,
                        pointRadius: 0,
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Concentrație √(mol/L)',
                            font: {
                                size: 20
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Conductivitate molară (S·cm²/mol)',
                            font: {
                                size: 20
                            }
                        }
                    }
                }
            }
        });

        // Generate regression data
        function generateDataMonomial(bottomLimit, upperLimit, stepSize) {
            const regressionPoints = [];
            for (let x = bottomLimit; x <= upperLimit; x += stepSize) {
                regressionPoints.push({
                    x: x,
                    y: electrolyte.A * Math.pow(x, electrolyte.B)
                });
            }
            return regressionPoints;
        }

    }
    else { //  electrolyte.strength == 'strong'
        const bottomLimit = Math.sqrt(0.0005);
        const upperLimit = Math.sqrt(electrolyte.name !== 'NaOH' ? 1 : 0.1);
        const stepSize = (upperLimit - bottomLimit) / 100;

        // Ensure regression is populated before chart
        const regression = generateDataLinear(bottomLimit, upperLimit, stepSize);

        // Draw the chart
        const ctx = document.getElementById('myGraph').getContext('2d');
        new Chart(ctx, {
            data: {
                labels: electrolyte.concentrations.map(x => Math.sqrt(x)),
                datasets: [
                    {
                        type: 'scatter',
                        label: 'Coordonate',
                        data: electrolyte.mc,
                        pointRadius: 5,
                        backgroundColor: 'red'
                    },
                    {
                        type: 'line',
                        label: 'Regresie',
                        data: regression,
                        borderColor: 'blue',
                        fill: false,
                        pointRadius: 0,
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Concentrație √(mol/L)',
                            font: {
                                size: 20
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Conductivitate molară (S·cm²/mol)',
                            font: {
                                colour: "red",
                                size: 20
                            }
                        }
                    }
                }
            }
        });

        // Generate regression data
        function generateDataLinear(bottomLimit, upperLimit, stepSize) {
            const regressionPoints = [];
            for (let x = 0; x <= upperLimit; x += stepSize) {
                regressionPoints.push({
                    x: x,
                    y: electrolyte.A * x + electrolyte.B
                });
            }
            return regressionPoints;
        }
    }

    // Set the flag to true
    electrolyte.generated = true;
}

