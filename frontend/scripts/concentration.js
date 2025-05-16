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
            this.storedConcentrations = [0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 1];
        else
            this.storedConcentrations = [0.0005, 0.001, 0.005, 0.01, 0.05, 0.1]; // NaOH and KCl don't have C=1

        // Fields to store entered conductivities
        this.storedConductivities = Array(this.storedConcentrations.length).fill(null);

        // initliazing all the arrays to be actually used in calculations and graphical representations
        this.mc = Array(); // molar conductivities
        this.pOH = Array();
        this.pH = Array();
        this.kd = Array();
        this.concentrations = Array();
        this.conductivities = Array();

        // Flag to check if the table and graph have been generated
        this.generated = false;

        this.A = 0; // First component of the exponential/linear regression
        this.B = 0; // Second component of the exponential/linear regression
        this.R2 = 0; // Value of R^2

    }

    clearArrays(){
        this.mc = Array();
        this.pOH = Array();
        this.pH = Array();
        this.kd = Array();
        this.concentrations = Array();
        this.conductivities = Array();
    }

    // Function used to test the data from excel without manual introduction in the input fields
    initializeConductivities() {
        if (this == aceticAcid) {
            this.storedConductivities[0] = 0.0000339;   // 33.9 μS/cm  = 0.0000339 S/cm
            this.storedConductivities[1] = 0.0000492;  // 49.2 μS/cm  = 0.0000492 S/cm
            this.storedConductivities[2] = 0.000115;   // 115 μS/cm  = 0.000115 S/cm
            this.storedConductivities[3] = 0.000163;   // 163 μS/cm  = 0.000163 S/cm
            this.storedConductivities[4] = 0.00037;   // 370 μS/cm  = 0.00037 S/cm
            this.storedConductivities[5] = 0.00052;   // 520 μS/cm  = 0.00052 S/cm
            this.storedConductivities[6] = 0.00125;  // 1250 μS/cm  = 0.00125 S/cm
        }
        else if (this == naoh) {
            this.storedConductivities[0] = 0.00012245;
            this.storedConductivities[1] = 0.0002445;
            this.storedConductivities[2] = 0.001203;
            this.storedConductivities[3] = 0.00238;
            this.storedConductivities[4] = 0.01138;
            this.storedConductivities[5] = 0.02212;
        }
        else if (this == hcl) {
            this.storedConductivities[0] = 0.00021135;
            this.storedConductivities[1] = 0.0004214;
            this.storedConductivities[2] = 0.002079;
            this.storedConductivities[3] = 0.00412;
            this.storedConductivities[4] = 0.019955;
            this.storedConductivities[5] = 0.03913;
            this.storedConductivities[6] = 0.3328;
        }
        else if (this == kcl) {
            this.storedConductivities[0] = 0.0000739;
            this.storedConductivities[1] = 0.0001469;
            this.storedConductivities[2] = 0.0007175;
            this.storedConductivities[3] = 0.001413;
            this.storedConductivities[4] = 0.00667;
            this.storedConductivities[5] = 0.0129;
            //this.storedConductivities[6] = 0.1119; // we will leave this here for the moment
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

    const imageContainer = document.getElementById('electrolyteImageContainer');
    imageContainer.innerHTML = ''; // Clear previous image

    const img = document.createElement('img');
    img.src = `../images/${selectedElectrolyte.name}.png`; // Adjust the path/filename logic as needed
    img.alt = `Imagine ${selectedElectrolyte.name}`;
    img.className = 'electrolyte-image'; // Optional: for styling

    imageContainer.appendChild(img);

    const img2 = document.createElement('img');
    img2.src = `../images/concentration.png`; // second image
    img2.alt = `Imagine suplimentară ${selectedElectrolyte.name}`;
    img2.className = 'electrolyte-image';
    
    imageContainer.appendChild(img2);

    const generateGraphButton = document.getElementById('concentrationGenerateButton');
    generateGraphButton.style.display = 'block';

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

    data = electrolyte.storedConcentrations;
    storedValues = electrolyte.storedConductivities;
    labelPrefix = 'Concentrație';
    unit = 'mol/L';


    // Dynamically create rows with labels and input fields
    for (let i = 0; i < electrolyte.storedConcentrations.length; i++) {
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

    const e = electrolytes[selectedSolution]; // this is the electrolyte object

    if (e.generated) {
        alert("Deja ai generat tabelul cu valori si graficul.");
        return;
    }

    // Only use this to check if the values from the table and the graph are good
    // e.initializeConductivities();

    let ok = false;
    e.storedConductivities.forEach(function checkOk(value) { if(value!=null) ok=true});

    if (!ok) {
        alert('Te rog să completezi toate câmpurile înainte de a genera tabelul și graficul!');
        return;
    }

    if (ok) {

        e.clearArrays(); // reset the arrays to being empty

        function empty(value){
            return value == null;
        }

        for(let i=0; i< e.storedConductivities.length;i++){
            if(!empty(e.storedConductivities[i])){
                e.concentrations.push(e.storedConcentrations[i]);
                e.conductivities.push(e.storedConductivities[i]);
            }
        }
        console.log(e.concentrations);
        console.log(e.conductivities);

        const dataToSend = {
            mode: 'concentrations',
            type: e.type,
            strength: e.strength,
            name: e.name,
            theoreticalConductivityAtInfiniteDilution: e.tcid,
            concentrations: e.concentrations,
            conductivities: e.conductivities,
        };

        // Convert the data to JSON
        const jsonData = JSON.stringify(dataToSend);

        //Send the JSON to the Python backend
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
                e.alpha = responseData.alpha;
                e.mc = responseData.mc;
                e.kd = responseData.kd;
                e.pH = responseData.pH;
                e.pOH = responseData.pOH;
                if (e.strength === 'strong')
                    e.gcid = responseData.B;
                e.A = responseData.A;
                e.B = responseData.B;
                e.R2 = responseData.R2;

                createResultTableAndGraph(e); // Now create the table and the graph

            })
            .catch((error) => {
                console.error('Error:', error);
                alert('A apărut o eroare la trimiterea datelor.');
            });
    }

});

// CREATE THE TABLE AND THE GRAPH
function createResultTableAndGraph(e) {

    const generateContainer = document.getElementById('concentrationGenerateContainer');

    const table = document.createElement('table');
    table.className = 'result-table'; // For styling

    // Create header
    const header = table.insertRow();
    const headers = [
        'Concentrație (mol / L)',
        'Conductivitate măsurată λ (μS/cm)',
        'Conductivitate măsurată λ (S/cm)',
        'Conductivitate echivalentă Λ(S·cm²/mol)',
    ];

    if (e.strength === 'weak') {
        headers.push('Coeficient de disociere (α)');
        headers.push('Constanta de disociere Kd (mol/L)');
    }

    if (e.name !== 'KCl') {
        if (e.type === 'acid') {
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
    for (let i = 0; i < e.concentrations.length; i++) {
        if (e.conductivities[i] !== null) {
            const row = table.insertRow();
            let microConductivities = e.conductivities.map(value => value * 1000000);
            const cells = [
                e.concentrations[i],
                microConductivities[i].toFixed(2),
                e.conductivities[i],
                e.mc[i].toFixed(2),
            ];

            if (e.strength === 'weak') {
                cells.push(e.alpha[i].toFixed(6));
                cells.push(e.kd[i].toFixed(6));
            }

            if (e.name !== 'KCl') {
                if (e.type === 'acid') {
                    cells.push(e.pH[i].toFixed(2));
                    cells.push(e.pOH[i].toFixed(2));
                }
                else {
                    cells.push(e.pOH[i].toFixed(2));
                    cells.push(e.pH[i].toFixed(2));
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
    rLabel.textContent = `R² = ${e.R2.toFixed(6)}`;
    rLabel.style.marginTop = '10px';
    rLabel.style.textAlign = 'center';
    rLabel.style.fontWeight = 'bold';
    generateContainer.appendChild(rLabel);

    const tcidExample = document.createElement('div');
    tcidExample.style.marginTop = '10px';
    tcidExample.style.textAlign = 'center';
    tcidExample.style.fontWeight = 'bold';
    generateContainer.appendChild(tcidExample);

    if (e.name === 'CH₃COOH') {
        tcidExample.textContent = `Conductivitate echivalentă limită teoretică Λ₀: \u039B°(CH₃COOH) = ν₊λ₊° + ν₋λ₋° = 1(349.6) + 1(40.9)= ${e.tcid.toFixed(2)} S/cm`;
    }
    if (e.name === 'HCl') {
        tcidExample.textContent = `Conductivitate echivalentă limită teoretică Λ₀: \u039B°(HCl) = ν₊λ₊° + ν₋λ₋° = 1(349.6) + 1(76.4)= ${e.tcid.toFixed(2)} S/cm`;
    }
    else if(e.name === 'KCl'){
        tcidExample.textContent = `Conductivitate echivalentă limită teoretică Λ₀: \u039B°(KCl) = ν₊λ₊° + ν₋λ₋° = 1(73.5) + 1(76.4)= ${e.tcid.toFixed(2)} S/cm`;
    }
    else if(e.name === 'NaOH'){
        tcidExample.textContent = `Conductivitate echivalentă limită teoretică Λ₀: \u039B°(NaOH) = ν₊λ₊° + ν₋λ₋° = 1(50.1) + 1(197.8)= ${e.tcid.toFixed(2)} S/cm`;
    }

    // Display the theoretical value of conductivity at infinite dilution
    // const tcidLabel = document.createElement('div');
    //     tcidLabel.textContent = `Valoarea teoretică a conductivității echivalente limită Λ₀: ${e.tcid.toFixed(2)} S/cm`;
    //     tcidLabel.style.marginTop = '10px';
    //     tcidLabel.style.textAlign = 'center';
    //     tcidLabel.style.fontWeight = 'bold';
    //     generateContainer.appendChild(tcidLabel);

    // If the electrolyte is strong, then we can determine the graphical value of the conductivity at infinite dilution
    if (e.strength === 'strong') {
        const gcidLabel = document.createElement('div');
        gcidLabel.textContent = `Valoarea grafică a conductivității echivalente limită Λ₀: ${e.gcid.toFixed(2)} S/cm`;
        gcidLabel.style.marginTop = '10px';
        gcidLabel.style.textAlign = 'center';
        gcidLabel.style.fontWeight = 'bold';
        generateContainer.appendChild(gcidLabel);
    }

    // Now, let's generate the graph:
    const canvas = document.createElement('canvas');
    canvas.id = 'myGraph';  // Add an ID for styling and accessing the canvas
    generateContainer.appendChild(canvas);

    if (e.strength == 'weak') {
        const bottomLimit = Math.sqrt(0.0005);
        const upperLimit = Math.sqrt(1);
        const stepSize = (upperLimit - bottomLimit) / 400;

        // Ensure regression is populated before chart
        const regression = generateDataMonomial(bottomLimit, upperLimit, stepSize);

        // Draw the chart
        const ctx = document.getElementById('myGraph').getContext('2d');
        new Chart(ctx, {
            data: {
                labels: e.concentrations.map(x => Math.sqrt(x)),
                datasets: [
                    {
                        type: 'scatter',
                        label: 'Coordonate',
                        data: e.mc,
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
                            text: 'Conductivitate echivalentă (S·cm²/mol)',
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
                    y: e.A * Math.pow(x, e.B)
                });
            }
            return regressionPoints;
        }

    }
    else { //  e.strength == 'strong'
        const bottomLimit = Math.sqrt(0.0005);
        const upperLimit = Math.sqrt(e.name !== 'NaOH' ? 1 : 0.1);
        const stepSize = (upperLimit - bottomLimit) / 100;

        // Ensure regression is populated before chart
        const regression = generateDataLinear(bottomLimit, upperLimit, stepSize);

        // Draw the chart
        const ctx = document.getElementById('myGraph').getContext('2d');
        new Chart(ctx, {
            data: {
                labels: e.concentrations.map(x => Math.sqrt(x)),
                datasets: [
                    {
                        type: 'scatter',
                        label: 'Coordonate',
                        data: e.mc,
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
                            text: '√Concentrație √(mol/L)',
                            font: {
                                size: 20
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Conductivitate echivalentă (S·cm²/mol)',
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
                    y: e.A * x + e.B
                });
            }
            return regressionPoints;
        }
    }

    // Set the flag to true
    e.generated = true;
}

