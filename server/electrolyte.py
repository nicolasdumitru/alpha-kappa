import numpy as np
from enum import Enum


class ElectrolyteType(Enum):
    Acid = 0
    Base = 1
    Salt = 2


Acid = ElectrolyteType.Acid
Base = ElectrolyteType.Base
Salt = ElectrolyteType.Salt


class Electrolyte:
    def __init__(self, data):
        # Parse data from the dictionary
        # WARNING: might be deprecated in the future
        self.mode = data.get("mode")

        self.type = (
            Acid
            if data.get("type") == "acid"
            else Base if data.get("type") == "base" else Salt
        )
        self.strong = True if data.get("strength") == "strong" else False
        self.name = data.get("name")
        self.tcid = np.float64(
            data.get("theoreticalConductivityAtInfiniteDilution"))
        self.concentrations = np.array(
            data.get("concentrations", []), dtype=np.float64)

        # initialize the graphical conductivity at infinite dilution
        self.gcid = np.float64(0)

        # initialize the elements for the mathematical regression y=A*x+B (strong electrolyte) or y=A*e^(B*x) (weak electrolyte)
        # we need these two inside the class for the toDict() method, but they are calculated
        self.A = 0.0
        self.B = 0.0

        self.conductivities = np.array(
            data.get("conductivities", []), dtype=np.float64)

        # calculate molar conductivities:
        self.mc = 1000 * self.conductivities / self.concentrations

        # calculate dissociation coeficients:
        if not self.strong:
            self.alpha = self.mc / self.tcid
        else: # strong
            self.alpha = np.ones(len(self.concentrations), dtype=np.float64) # make them ones for strong electrolytes

        if not self.strong:
            self.kd = self.mc**2 * self.concentrations / \
                (self.tcid * (self.tcid - self.mc))
        else: # strong
            self.kd = np.zeros(len(self.concentrations), dtype=np.float64) #just make them all zeros, we won't display Kd for strong electrolytes

        # calculate pH & pOH
        if self.type == Acid:
            self.ph = -1 * np.log10(self.alpha * self.concentrations)
            self.poh = 14 - self.ph
        elif self.type == Base:
            self.poh = -1 * np.log10(self.concentrations)
            self.ph = 14 - self.poh
        else:  # Salt
            self.ph = np.zeros(len(self.concentrations), dtype=np.float64)
            self.poh = np.zeros(len(self.concentrations), dtype=np.float64)

    def displayAttributes(self):
        print("mode:", self.mode)
        print("name:", self.name)
        print("type:", self.type)
        print("is strong:", self.strong)
        print("Stored conductivities:", self.conductivities)
        print("Molar conductivities:", self.mc)
        print("Alpha:", self.alpha)
        print("Kd:", self.kd)
        print("pH:", self.ph)
        print("pOH:", self.poh)

    def toDict(self):
        return {
            "mc": self.mc.tolist(),
            "alpha": self.alpha.tolist(),
            "kd": self.kd.tolist(),
            "pH": self.ph.tolist(),
            "pOH": self.poh.tolist(),
            "A": self.A,
            "B": self.B,
        }
