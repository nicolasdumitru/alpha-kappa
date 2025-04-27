# Description of the FRONTEND objective and the JSON format
(don't change the JSON format, unless you want to change many other lines)

We have two studies:

1. The influence of concentration on molar conductivity (4 electrolytes)
2. The influence of temperature and concentration on conductivity (only KOH electrolyte)

Considering these choices, we will have 2 .js files for each study.
The only place where we send data to the python server is in the concetration.js file and the JSON will look like this:

## What we send from javascript to the python server:
```
dataToSend = {
            mode ('concentrations', high chances to become deprecated)
            type ("acid/base/salt")
            strength ("strong/weak")
            name (electrolyte's name)
            theoreticalConductivityAtInfiniteDilution (already calculated value inside constructor in javascript)
            concentrations (array with the electrolyte's specific concentrations studied)
            conductivities: (array with the measured conductivities introduced by the user)
        }
```
## What we receive back from the python server
All of the following are calculated data required for the creation of the table or the regression graphs

```
dataReceived = {
            alpha (array with dissociation coefficents)
            molar conductivities ('mc', array with molar conductivities) 
            kd (array with Kd values)
            pH (array with pH)
            pOH (array with pOH)
            A (first value from the regression equation for the graph)
            B (second value from the regression equation for the graph)
    }
```

For the other study, we will not use any communication with the server, since there is only one electrolyte and the presentation of the second study will be simpler than the first study.

# What the site should look like

## Apart from the algorithmics part
There has to be some kind of text and some kind of buttons that switch to different parts of electrolytes theory. Details must be discussed with the professor by the UX Designers.

## Related to the studies
1. The first study:
The user has to complete all the input fields with an externally measured conductivity for each concentration and the algorithms will create a table with the calculated values and a graph with exponential/liniar regression,
showcasing the evolution of molar conductivity based on the increase in concentration.

We also need animations that showcase the process of dipping the capsule (that measures the conductivity of the electrolyte) inside the glass containing the electrolyte substance, showcasing how molecules dissociate
from eachother.

Different looking animation for each substance. (example: different molecule's color and drawing the specific ions like hydrogen, sodium etc).

2. The second study:
The user may complete all input fields (or not) with an externally measured conductivity for each temperature and corresponding to each concentration and the algorithms will draw as many basic graph(s)
as the number of temperatures. The graphs will showcase the evolution of conductivity based on the increase in concentration for each temperature.  