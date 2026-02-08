# MMM-Ecobee

Module for MagicMirror² that supports ecobee thermostats.

## Dependencies

* An installation of [MagicMirror²](https://github.com/MichMich/MagicMirror)

## Installation

1. Clone this repo into `MagicMirror/modules` directory.
1. Configure your `MagicMirror/config/config.js`:

```js
{
  module: 'MMM-Ecobee',
  position: "top_left",
  config: {
  }
}
```

Ensure that the user running MagicMirror has write access to the module's directory so that the module can save the authentication token. If you are unable to do this for any reason, you can instead create a `tokens.json` file in the module's directory yourself and chown it to the user who is running MagicMirror.

## Authorizing the module on your ecobee account

To authorize this application to access your Ecobee:

1. Go to <https://auth.ecobee.com/u/login>
2. Log in to your thermostat console
3. Select `My Apps` from the menu on the top right.
4. Click `Add Application`
5. Enter the code provided.

Codes refresh every ~10mins.
The module will check for the completed authorization every 30sec.

If a code is not used for a long time (Magic Mirror is off, module is turned off, etc.) a new authorization may be required.

See the [Installation](#installation) section above for notes about how authorization is stored and how to fix it if it doesn't seem to remember the authorization token.

## Config Options

| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `updateInterval` | `5 * 60 * 1000` | How often to update the thermostat's data, in milliseconds. Defaults to 5 minutes. This cannot be less than 3 minutes, per ecobee. |
| `showSensors` | `true` | If true, will show thermostat(s) as well as remote sensor(s). If false, will only show thermostat(s). |
| `showHumidity` | `true` | If true, will show current humidity for a thermostat, if available. |
| `showSetTemperature` | `true` | If true, will show the temperature a thermostat is set to cool/heat to. |
| `useColoredDots` | `false` | If true, displays colored status indicators (green for ON, red for OFF) instead of text labels. |
| `dotColorOn` | `'#7cff7c'` | Hex color code for the "ON" status indicator. Only used when `useColoredDots` is true. |
| `dotColorOff` | `'#f65151'` | Hex color code for the "OFF" status indicator. Only used when `useColoredDots` is true. |

## Screenshot

![Screenshot](/sample.png?raw=true)
![Screenshot](/sample_colored_dots.png?raw=true)
