import math

class Electrolyte:
    def __init__(self, data):
        
        # Parse data from the dictionary
        self.mode= data.get('mode')
        self.type= data.get('type')
        self.strength = data.get('strength')
        self.name = data.get('name')
        self.tcid = data.get('theoreticalConductivityAtInfiniteDilution')
        self.length = data.get('length')
        self.concentrations = data.get('concentrations', [])
        self.temperatures = data.get('temperatures', [])
        
        self.gcid = 0.0 # initialize the graphical conductivity at infinite dilution

        if self.mode == 'concentrations':
            self.storedC = data.get('storedConductivitiesForConcentrations', [])
        else:
            self.storedC = data.get('storedConductivitiesForTemperatures', [])
            
        for  i  in range(self.length): # Initialize storedC to 0.0 if None
            if(self.storedC[i] is None):
                self.storedC[i] = 0.0
    
        self.alpha = [0.0] * self.length #initialize dissociation coeficients
        self.mc = [0.0] * self.length # initialize molar conductivities
        self.kd = [0.0] * self.length # initialize kd
        self.pH = [0.0] * self.length # initialize pH
        self.pOH = [0.0] * self.length #initialize pOH
        self.calcMolarConductivities()
        self.calcDissociationCoeficient()
        self.calcKd()
        self.calc_pH_and_pOH()
    
    def calcMolarConductivities(self):
        for i in range(self.length):
            if self.storedC[i] != 0.0:
                self.mc[i]=(1000*self.storedC[i])/(self.concentrations[i])
            
    def calcDissociationCoeficient(self):
       for i in range(self.length):
           if(self.storedC[i] != 0.0):
               if(self.strength == 'weak'):
                     self.alpha[i] = self.mc[i]/self.tcid
               elif(self.strength == 'strong'):
                       self.alpha[i] = 1.0         
    
    def calcKd(self):
        for i in range(self.length):
            if(self.storedC[i] != 0.0):
                if(self.strength == 'weak'):
                    self.kd[i]=(pow(self.alpha[i],2)*self.concentrations[i])/(1-self.alpha[i])
                elif(self.strength == 'strong'):
                    self.kd[i]=(pow(self.mc[i],2)*self.concentrations[i])/(self.tcid*(self.tcid-self.mc[i]))                
    
    def calc_pH_and_pOH(self):
        if(self.name != 'KCl'):
            for i in range(self.length):
                if(self.storedC[i] != 0.0):
                    if(self.type == 'acid'):
                        self.pH[i]= -1*math.log10(self.alpha[i]*self.concentrations[i])
                        self.pOH[i]=14-self.pH[i]
                    elif(self.type == 'base'):
                        self.pOH[i]= -1*math.log10(self.concentrations[i])
                        self.pH[i]=14-self.pOH[i]
        