import numpy as np


class Electrolyte:
    def __init__(self, data):
        # Parse data from the dictionary
        self.mode = data.get("mode")
        self.is_acid = True if data.get("type") == "acid" else False
        self.is_strong = True if data.get("strength") == "strong" else False
        self.name = data.get("name")
        self.tcid = np.float64(data.get("theoreticalConductivityAtInfiniteDilution"))
        self.length = np.int32(data.get("length"))
        self.concentrations = np.array(data.get("concentrations", []), dtype=np.float64)
        self.temperatures = np.array(data.get("temperatures", []), dtype=np.float64)

        # initialize the graphical conductivity at infinite dilution
        self.gcid = np.float64(0)

        if self.mode == "concentrations":
            tmp = data.get("storedConductivitiesForConcentrations", [])
        else:
            tmp = data.get("storedConductivitiesForTemperatures", [])

        # TODO (Fix): Shrink arrays to fit data. Random zeros here and there will mess up the regression results.
        for i in range(self.length):  # Initialize storedC to 0.0 if None
            if tmp[i] is None:
                tmp[i] = 0.0

        self.conductivities = np.array(tmp, dtype=np.float64)

        # initialize molar conductivities:
        self.mc = 1000 * self.conductivities / self.concentrations

        # initialize dissociation coeficients:
        self.alpha = (
            np.ones(self.length, dtype=np.float64)
            if self.is_strong
            else self.mc / self.tcid
        )

        self.kd = (
            (self.mc**2) * self.concentrations / (self.tcid * (self.tcid - self.mc))
            if self.is_strong
            else (self.alpha**2) * self.concentrations / (1 - self.alpha)
        )
        # initialize pH & pOH
        # TODO: fix
        if self.is_acid:
            self.pH = -1 * np.log10(self.alpha * self.concentrations)
            self.pOH = 14 - self.pH
        else:
            self.pOH = -1 * np.log10(self.concentrations)
            self.pH = 14 - self.pOH
