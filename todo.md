## SMS Alert for:

- Overspeed. Message: "Vehicle [Vehicle ID] is exceeding the speed limit for its location. Current Speed: [Speed] km/h. Limit: [Speed Limit] km/h." (Done)
- Engine turned off and on. Message: "Ignition [ON/OFF] for Vehicle [Vehicle ID] at [Timestamp]." (Done)
- Battery Condition. Message: "Low Battery Alert for Vehicle [Vehicle ID]: Voltage is [Voltage]V." (Done)
- If new data has no change in battery, dont send the engine turned off message.

## Database Connection

- DB for speeding alerts, batt condition, ignition status, and realtime location.(Done)
- Could add a refresh button for history or automatically poll it after every second.
- Verify the data first if duplicate location, don't store it to database. 

## Realtime API Update

- Change into websocket instead of polling. (Done)

## Overspeeding depending on the location (Done)

