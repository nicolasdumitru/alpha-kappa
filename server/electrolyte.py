from enum import Enum

import numpy as np
from numpy.typing import NDArray
import scipy


def linear_regression(x, y) -> tuple[np.float64, np.float64, np.float64]:
    res = scipy.stats.linregress(x, y)
    return (
        np.float64(res.slope),  # slope
        np.float64(res.intercept),  # y-intercept
        np.float64(res.rvalue) ** 2,  # R^2
    )


def monomial_regression(
    x: NDArray[np.float64], y: NDArray[np.float64]
) -> tuple[np.float64, np.float64, np.float64]:
    def model(x: NDArray[np.float64], a: float, b: float) -> NDArray[np.float64]:
        return a * np.power(x, b)

    params, _ = scipy.optimize.curve_fit(model, x, y)

    a = np.float64(params[0])  # scale factor (multiplicative constant)
    b = np.float64(params[1])  # exponent

    y_pred = model(x, a, b)
    rss = np.sum(np.square(y - y_pred))
    tss = np.sum(np.square(y - np.mean(y)))
    r_squared = np.float64(1 - rss / tss)

    return a, b, r_squared


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
        self.mode = data.get("mode")  # WARNING: might be deprecated in the future

        self.type = (
            Acid
            if data.get("type") == "acid"
            else Base if data.get("type") == "base" else Salt
        )
        self.is_strong = True if data.get("strength") == "strong" else False
        self.name = data.get("name")
        self.tcid = np.float64(data.get("theoreticalConductivityAtInfiniteDilution"))
        self.concentrations = np.array(data.get("concentrations", []), dtype=np.float64)

        self.conductivities = np.array(data.get("conductivities", []), dtype=np.float64)

        # calculate molar conductivities:
        self.mc = 1000 * self.conductivities / self.concentrations

        # calculate dissociation coeficients:
        self.alpha = (
            np.ones(len(self.concentrations), dtype=np.float64)
            if self.is_strong
            else self.mc / self.tcid
        )

        self.kd = (
            np.zeros(len(self.concentrations), dtype=np.float64)
            if self.is_strong
            else (
                np.square(self.mc)
                * self.concentrations
                / (self.tcid * (self.tcid - self.mc))
            )
        )

        # initialize pH & pOH
        if self.type == Acid:
            self.ph = -1 * np.log10(self.alpha * self.concentrations)
            self.poh = 14 - self.ph
        elif self.type == Base:
            self.poh = -1 * np.log10(self.concentrations)
            self.ph = 14 - self.poh
        else:  # Salt
            self.ph = np.zeros(len(self.concentrations), dtype=np.float64)
            self.poh = np.zeros(len(self.concentrations), dtype=np.float64)

        # Regression:
        # strong electrolytes => linear regression
        # weak electrolytes => monomial regression
        x = np.sqrt(self.concentrations)  # x axis data
        y = self.mc  # y axis data
        self.a, self.b, self.r_squared = (
            linear_regression(x, y) if self.is_strong else monomial_regression(x, y)
        )

    def display_attributes(self):
        print("mode:", self.mode)
        print("name:", self.name)
        print("type:", self.type)
        print("is strong:", self.is_strong)
        print("Stored conductivities:", self.conductivities)
        print("Molar conductivities:", self.mc)
        print("Alpha:", self.alpha)
        print("Kd:", self.kd)
        print("pH:", self.ph)
        print("pOH:", self.poh)

    def to_dict(self):
        return {
            "alpha": self.alpha.tolist(),
            "mc": self.mc.tolist(),
            "kd": self.kd.tolist(),
            "pH": self.ph.tolist(),
            "pOH": self.poh.tolist(),
            "A": self.a,
            "B": self.b,
            "R^2": self.r_squared,
        }
