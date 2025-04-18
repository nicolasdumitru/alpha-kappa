class Electrolyte {
    constructor(name, cation, anion, strength) {
        this.strength = strength;
        this.name = name;
        this.cation = cation;
        this.anion = anion;
        this.theoreticalInfiniteDilutionConductivity = cation + anion;
        if (this.strength == 'strong') {
            this.alpha = 1;
        } else {
            this.alpha = [0, 0, 0, 0, 0, 0, 0];
        }
        if (name != 'NaOH') {
            this.length = 7;
        } else {
            this.length = 6; // we won't calculate for C=1 for NaOH
        }
        this.concentrations = [0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 1];
        this.temperatures = [25, 30, 35, 40, 45, 50, 55];
        if (name != 'KCl') {
            this.pho = [0, 0, 0, 0, 0, 0, 0];
            this.ph = [0, 0, 0, 0, 0, 0, 0];
        }
    
        this.equivalentConductivities = [0, 0, 0, 0, 0, 0, 0];
        this.kd = [0, 0, 0, 0, 0, 0, 0];
        this.isGraph1 = false;
        this.isGraph2 = false;

        // New fields to store entered conductivities
        this.storedConductivitiesForConcentrations = Array(this.length).fill(null);
        this.storedConductivitiesForTemperatures = Array(this.length).fill(null);
    }
}

// Create electrolyte objects
const hcl = new Electrolyte('HCl', 349.6, 76.4, 'strong');
const naoh = new Electrolyte('NaOH', 50.1, 197.8, 'strong');
const kcl = new Electrolyte('KCl', 73.5, 76.4, 'strong');
const aceticAcid = new Electrolyte('CH₃COOH', 349.6, 40.9, 'weak');

// Store the electrolytes in an object for easy access
const electrolytes = {
    'HCl': hcl,
    'NaOH': naoh,
    'KCl': kcl,
    'CH₃COOH': aceticAcid
};

let currentMode = 'concentrations'; // Default mode is concentrations

// Event listener for the dropdown
document.getElementById('solutionSelector').addEventListener('change', (event) => {
    const selectedSolution = event.target.value; // Get the selected solution
    const selectedElectrolyte = electrolytes[selectedSolution]; // Get the corresponding Electrolyte object

    // Show the toggle and generate graph button when a solution is selected
    const toggleButton = document.getElementById('toggleModeButton');
    toggleButton.hidden = false;

    const generateGraphButton = document.getElementById('generateGraphButton');
    generateGraphButton.hidden = false;

    updateInputFields(selectedElectrolyte);
});

// Event listener for the toggle button
document.getElementById('toggleModeButton').addEventListener('click', () => {
    // Toggle the mode
    if (currentMode === 'concentrations') {
        currentMode = 'temperatures';
    } else {
        currentMode = 'concentrations';
    }

    // Update the button text
    const toggleButton = document.getElementById('toggleModeButton');
    if (currentMode === 'concentrations') {
        toggleButton.textContent = 'Schimbă la temperaturi';
    } else {
        toggleButton.textContent = 'Schimbă la concentrații';
    }

    // Get the currently selected solution
    const selectedSolution = document.getElementById('solutionSelector').value;
    if (selectedSolution) {
        const selectedElectrolyte = electrolytes[selectedSolution];
        updateInputFields(selectedElectrolyte);
    }
});

// Function to update the input fields based on the selected electrolyte and mode
function updateInputFields(electrolyte) {
    const inputContainer = document.getElementById('inputContainer');
    inputContainer.innerHTML = ''; // Clear any existing text boxes

    // Get the data to display based on the current mode
    let data;
    let storedValues;
    let labelPrefix;
    let unit;

    if (currentMode === 'concentrations') {
        data = electrolyte.concentrations;
        storedValues = electrolyte.storedConductivitiesForConcentrations;
        labelPrefix = 'Concentrație';
        unit = 'N';
    } else {
        data = electrolyte.temperatures;
        storedValues = electrolyte.storedConductivitiesForTemperatures;
        labelPrefix = 'Temperatură';
        unit = '°C';
    }

    // Dynamically create rows with labels and input fields
    for (let i = 0; i < electrolyte.length; i++) {
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
        inputField.placeholder = 'Introduceți conductivitatea măsurată';
        inputField.id = `input-${i}`;
        inputField.className = 'dynamic-input'; // Add a class for styling

        // Restore the stored value if it exists
        if (storedValues[i] !== null) {
            inputField.value = storedValues[i];
        }

        // Add an event listener to dynamically update the stored values
        inputField.addEventListener('input', (event) => {
            const value = event.target.value.trim();
            if (value === '') {
                storedValues[i] = null; // Remove the value if the input is empty
            } else {
                const floatValue = parseFloat(value);
                if (!isNaN(floatValue)) {
                    storedValues[i] = floatValue; // Store the entered float value
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

// Event listener for the "Creează grafic" button
document.getElementById('generateGraphButton').addEventListener('click', () => {
    const selectedSolution = document.getElementById('solutionSelector').value;
    if (!selectedSolution) {
        alert('Vă rugăm să selectați o soluție înainte de a crea graficul!');
        return;
    }

    const selectedElectrolyte = electrolytes[selectedSolution];
    const dataToSend = {
        mode: currentMode,
        strength: selectedElectrolyte.strength,
        name: selectedElectrolyte.name,
        cation: selectedElectrolyte.cation,
        anion: selectedElectrolyte.anion,
        theoreticalInfiniteDilutionConductivity: selectedElectrolyte.theoreticalInfiniteDilutionConductivity,
        alpha: selectedElectrolyte.alpha,
        length: selectedElectrolyte.length,
        concentrations: selectedElectrolyte.concentrations,
        temperatures: selectedElectrolyte.temperatures,
        equivalentConductivities: selectedElectrolyte.equivalentConductivities,
        kd: selectedElectrolyte.kd,
        ph: selectedElectrolyte.ph,
        pho: selectedElectrolyte.pho,
        storedConductivitiesForConcentrations: selectedElectrolyte.storedConductivitiesForConcentrations,
        storedConductivitiesForTemperatures: selectedElectrolyte.storedConductivitiesForTemperatures,
    };

    // Convert the data to JSON
    const jsonData = JSON.stringify(dataToSend);

    // Send the JSON to the Python backend
    fetch('http://127.0.0.1:5000/receive-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonData,
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to send data to the server.');
            }
        })
        .then((responseData) => {
            console.log('Response from server:', responseData);
            //alert('Datele au fost trimise cu succes!');
        })
        .catch((error) => {
            console.error('Error:', error);
            //alert('A apărut o eroare la trimiterea datelor.');
        });
});