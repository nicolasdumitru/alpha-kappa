document.getElementById('concentrationButton').addEventListener('click', function() {
    // Hide the temperature container and show the concentration container
    document.getElementById('temperatureContainer').hidden = true;
    document.getElementById('concentrationContainer').hidden = false;
});

document.getElementById('temperatureButton').addEventListener('click', function() {
    // Hide the concentration container and show the temperature container
    document.getElementById('concentrationContainer').hidden = true;
    document.getElementById('temperatureContainer').hidden = false;
});