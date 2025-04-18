import math

class Electrolyte:
    def __init__(self, data):
        # Parse data from the dictionary
        self.mode= data.get('mode')
        self.strength = data.get('strength')
        self.name = data.get('name')
        self.cation = data.get('cation')
        self.anion = data.get('anion')
        self.theoreticalInfiniteDilutionConductivity = data.get('theoreticalInfiniteDilutionConductivity')
        self.alpha = data.get('alpha')
        self.length = data.get('length')
        self.concentrations = data.get('concentrations', [])
        self.temperatures = data.get('temperatures', [])
        self.mode = data.get('mode')
        if self.mode == 'concentrations':
            self.storedC = data.get('storedConductivitiesForConcentrations', [])
        else:
            self.storedC = data.get('storedConductivitiesForTemperatures', [])
        for  i  in range(self.length): # Initialize storedC to 0.0 if None
            if self.storedC[i] is None:
                self.storedC[i] = 0.0
        self.equivalentConductivities = data.get('equivalentConductivities', [])
        self.kd = data.get('kd')
        self.ph = data.get('ph')
        self.pho = data.get('pho')
        self.calculateEquivalentConductivity()
        self.calculateAlpha()
        self.calculateKd()
        self.calculatePh()
    def __repr__(self):
        return f"Electrolyte(name={self.name}, cation={self.cation}, anion={self.anion}, alpha={self.alpha})"
    
    def calculateEquivalentConductivity(self):
        for i in range(self.length):
            if self.storedC[i] != 0:
                self.equivalentConductivities[i] = 1000 * self.storedC[i] / self.concentrations[i]
            
    def calculateAlpha(self):
        if self.strength == 'weak':
            for i in range(self.length):
                if self.equivalentConductivities[i] != 0:
                    self.alpha[i] = self.equivalentConductivities[i] / self.theoreticalInfiniteDilutionConductivity
    
    def calculateKd(self):
        for i in range(self.length):
            if self.strength == 'weak':
                if self.alpha[i] != 0:
                    self.kd[i] = self.alpha[i] * self.alpha[i] * self.concentrations[i] / (1 - self.alpha[i])
            elif self.equivalentConductivities[i] != 0:
                self.kd[i] = 0.9999 * 0.9999 * self.concentrations[i] / (1 - 0.9999)
    
    def calculatePh(self):
        if self.strength == 'weak':
            for i in range(self.length):
                if self.alpha[i] != 0:
                    self.ph[i] = -math.log10(self.alpha[i] * self.concentrations[i])
        