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


def compute_electrolyte_properties(data) -> dict:
    type = (
        Acid
        if data.get("type") == "acid"
        else Base if data.get("type") == "base" else Salt
    )
    is_strong = True if data.get("strength") == "strong" else False
    tcid = np.float64(data.get("theoreticalConductivityAtInfiniteDilution"))
    concentrations = np.array(data.get("concentrations", []), dtype=np.float64)

    conductivities = np.array(data.get("conductivities", []), dtype=np.float64)

    # calculate molar conductivities:
    mc = 1000 * conductivities / concentrations

    # calculate dissociation coeficients:
    alpha = np.ones(len(concentrations), dtype=np.float64) if is_strong else mc / tcid

    kd = (
        np.zeros(len(concentrations), dtype=np.float64)
        if is_strong
        else (np.square(mc) * concentrations / (tcid * (tcid - mc)))
    )

    # initialize pH & pOH
    if type == Acid:
        ph = -1 * np.log10(alpha * concentrations)
        poh = 14 - ph
    elif type == Base:
        poh = -1 * np.log10(concentrations)
        ph = 14 - poh
    else:  # Salt
        ph = np.zeros(len(concentrations), dtype=np.float64)
        poh = np.zeros(len(concentrations), dtype=np.float64)

    # Regression:
    # strong electrolytes => linear regression
    # weak electrolytes => monomial regression
    x = np.sqrt(concentrations)  # x axis data
    y = mc  # y axis data
    a, b, r_squared = (
        linear_regression(x, y) if is_strong else monomial_regression(x, y)
    )

    return {
        "alpha": alpha.tolist(),
        "mc": mc.tolist(),
        "kd": kd.tolist(),
        "pH": ph.tolist(),
        "pOH": poh.tolist(),
        "A": a,
        "B": b,
        "R2": r_squared,
    }
