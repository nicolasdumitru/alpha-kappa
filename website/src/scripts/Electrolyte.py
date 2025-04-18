class Electrolyte:
    def __init__(self, name, cation, anion):
        self.name = name
        self.cation = cation
        self.anion = anion
        self.theoretical_infinite_dilution_conductivity = cation + anion

        self.concentrations = [0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 1]
        self.temperatures = [25, 30, 35, 40, 45, 50, 55]

        if name != 'KCl':
            self.phos = [0, 0, 0, 0, 0, 0, 0]
            self.ph = [0, 0, 0, 0, 0, 0, 0]

        self.conductivities = [0, 0, 0, 0, 0, 0, 0]
        self.equivalent_conductivities = [0, 0, 0, 0, 0, 0, 0]
        self.kd = [0, 0, 0, 0, 0, 0, 0]
        self.is_graph1 = False
        self.is_graph2 = False

        # New fields to store entered conductivities
        self.stored_conductivities_for_concentrations = [None] * self.length
        self.stored_conductivities_for_temperatures = [None] * self.length

    def __repr__(self):
        return f"Electrolyte(name={self.name}, cation={self.cation}, anion={self.anion}, strength={self.alpha})"
    
    #TODO: make this class' constructor to work as to receive the data from the website and to store it in the class' attributes