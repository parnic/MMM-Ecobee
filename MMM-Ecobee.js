/* Magic Mirror
 * Module: MMM-Ecobee
 *
 * By Fábio Alves and Parnic
 * MIT Licensed.
 */
Module.register("MMM-Ecobee", {
  defaults: {
    updateInterval: 5 * 60 * 1000, // updates every 5 minutes
    showSensors: true,
    showHumidity: true,
    showSetTemperature: true,
    useColoredDots: false,
    dotColorOn: '#7cff7c',
    dotColorOff: '#f65151',
  },

  getStyles() {
    return ["MMM-Ecobee.css"];
  },

  getDom() {
    var wrapper = document.createElement("table");
    wrapper.className = "small dimmed";

    if (this.tempData.length === 0) {
      if (this.pin) {
        wrapper.innerHTML =
          "These are the steps authorize this application to access your Ecobee:" +
          "<ol style='text-align: left'>" +
          "<li> Go to <a href='https://auth.ecobee.com/u/login'>https://auth.ecobee.com/u/login</a>" +
          "<li> Login to your thermostat console" +
          "<li> Select 'MY APPS' from the menu on the top right." +
          "<li> Click 'Add Application'" +
          "<li> Enter the following authorization code: <b>" + this.pin + "</b>" +
          "</ol>";
      } else {
        wrapper.innerHTML = "<img src='" + this.file("images/loading.gif") + "' width=100>";
      }
    } else {
      for (var e in this.tempData.thermostatList) {
        var thermo = this.tempData.thermostatList[e];

        var hvacMode = thermo.settings.hvacMode;
        var desiredHeat = this.getTemperature(thermo, thermo.runtime.desiredHeat);
        var desiredCool = this.getTemperature(thermo, thermo.runtime.desiredCool);

        for (var x in thermo.remoteSensors) {
          var device = thermo.remoteSensors[x];

          if (!this.config.showSensors && device.type !== "thermostat") {
            continue;
          }

          var capTemperature = null;
          var capHumidity = null;
          var capOccupancy = null;
          for (var cap in device.capability) {
            if (device.capability[cap].type === "temperature") {
              capTemperature = device.capability[cap];
            } else if (device.capability[cap].type === "occupancy") {
              capOccupancy = device.capability[cap];
            } else if (device.capability[cap].type === "humidity") {
              capHumidity = device.capability[cap];
            }
          }

          var eventWrapper = document.createElement("tr");
          eventWrapper.className = "normal";

          var symbolWrapper = document.createElement("td");
          symbolWrapper.className = "icon";
          if (device.type === "thermostat") {
            symbolWrapper.appendChild(this.getThermostatSVG(device.inUse));
          } else {
            if (capOccupancy) {
              symbolWrapper.appendChild(this.getSensorSVG(capOccupancy.value === "true", device.inUse));
            }
          }
          eventWrapper.appendChild(symbolWrapper);

          var titleWrapper = document.createElement("td");
          titleWrapper.innerHTML = device.name;
          titleWrapper.className = "title";
          eventWrapper.appendChild(titleWrapper);

          var currentLogo = document.createElement("td");
          currentLogo.className = "heat logo align-left";
          var currentLogoIcon = document.createElement("i");
          currentLogoIcon.classList = ["fas fa-thermometer-half"];
          currentLogo.appendChild(currentLogoIcon);
          eventWrapper.appendChild(currentLogo);

          var currentTemp = document.createElement("td");
          if (capTemperature) {
            currentTemp.className = "current_temp";
            currentTemp.innerHTML = this.getTemperature(thermo, capTemperature.value);
          }
          eventWrapper.appendChild(currentTemp);

          if (device.type === "thermostat") {
            if (this.config.showSetTemperature) {
              var programLogo = document.createElement("td");
              programLogo.className = "program logo align-center";

              var temperatureToDisplay = "";
              switch (hvacMode) {
                case "cool":
                  temperatureToDisplay = desiredCool;
                  programLogo.appendChild(this.getColdSVG());
                  break;
                case "heat":
                  temperatureToDisplay = desiredHeat;
                  programLogo.appendChild(this.getHeatSVG());
                  break;
                case "auto":
                  temperatureToDisplay = desiredCool + " - " + desiredHeat;
                  programLogo.appendChild(this.getAutoSVG());
                  break;
              }
              eventWrapper.appendChild(programLogo);

              var currentProgram = document.createElement("td");
              currentProgram.className = "current_program";
              currentProgram.innerHTML = temperatureToDisplay;
              eventWrapper.appendChild(currentProgram);
            }

            if (this.config.showHumidity) {
              var humLogo = document.createElement("td");
              humLogo.className = "program logo align-right";
              humLogo.appendChild(this.getHumiditySVG());
              eventWrapper.appendChild(humLogo);

              var currentHum = document.createElement("td");
              if (capHumidity) {
                currentHum.className = "current Humidity align-left";
                currentHum.innerHTML = capHumidity.value + "%";
              }
              eventWrapper.appendChild(currentHum);
            }
          }

          wrapper.appendChild(eventWrapper);
        }
      }
    }

    return wrapper;
  },

  getTemperature(thermo, temperature) {
    if (thermo && thermo.settings && !thermo.settings.useCelsius) {
      return Math.round(temperature / 10);
    }

    return Math.round(((temperature / 10) - 32) / 1.8);
  },

  getHumiditySVG() {
    var span = document.createElement("span");
    span.innerHTML = "<svg version=\"1.1\" id=\"system-mode-humidifier\" xmlns=\"http://www.w3.org/2000/svg\"" +
      "xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 20.741 28.006\" xml:space=\"preserve\">" +
      "<g>" +
      "    <path stroke-miterlimit=\"10\" d=\"M10.369,1.394C9.566,3.481,8.313,5.638,6.567,7.95" +
      "        C6.194,8.459,5.751,9.015,5.281,9.594C3.152,12.238,0.5,15.529,0.5,19.039c0,3.806,2.758,6.985,7.028,8.098l1.048,0.206" +
      "        c0.331,0.074,0.561,0.091,0.787,0.109c0.337,0.045,0.558,0.054,0.767,0.054l0.427-0.004c0.017-0.001,0.036,0,0.054,0" +
      "        c0.187,0,0.381-0.001,0.562-0.032c0.439-0.037,0.712-0.06,0.986-0.102l0.687-0.146c0.247-0.065,0.349-0.092,0.45-0.111" +
      "        c1.293-0.34,2.485-0.891,3.512-1.631c2.182-1.573,3.433-3.921,3.433-6.442c-0.021-3.157-2.188-6.164-4.217-8.734l-0.921-1.149" +
      "        c-0.347-0.419-0.68-0.829-0.971-1.226C12.406,5.623,11.166,3.471,10.369,1.394z\" />" +
      "    <g style=\"stroke: none\">" +
      "        <line stroke-linecap=\"round\" stroke-miterlimit=\"10\" x1=\"6.577\" y1=\"17.871\" x2=\"14.164\" y2=\"17.871\" />" +
      "        <line stroke-linecap=\"round\" stroke-miterlimit=\"10\" x1=\"10.371\" y1=\"14.077\" x2=\"10.371\" y2=\"21.664\" />" +
      "    </g>" +
      "</g>" +
      "</svg>";
    return span;
  },

  getSensorSVG(hasMotion, inUse) {
    var span = document.createElement("span");
    span.classList.add("sensor-svg");

    const motionIndicator = hasMotion
    	? ` M42.699,17.762
			c-0.385,0-0.698-0.324-0.698-0.722c0-5.957-4.792-10.802-10.684-10.802c-0.386,0-0.702-0.324-0.702-0.722
			c0-0.398,0.316-0.722,0.702-0.722c6.664,0,12.084,5.493,12.084,12.246C43.401,17.439,43.085,17.762,42.699,17.762z M47.294,9.417
			c-0.386,0-0.701-0.324-0.701-0.722c0-3.998-3.217-7.25-7.174-7.25c-0.386,0-0.699-0.324-0.699-0.722C38.72,0.324,39.033,0,39.418,0
			c4.727,0,8.574,3.9,8.574,8.695C47.992,9.093,47.679,9.417,47.294,9.417z`
    	: "";

    let statusIndicator = "";
    if (typeof inUse === "boolean") {
    	statusIndicator = this.config.useColoredDots
    	? `<circle cx="20" cy="28.5" r="4" fill="${inUse ? this.config.dotColorOn : this.config.dotColorOff}"/>`
    	: `<text x="0.2em" y="1.85em" textLength="1.8rem" lengthAdjust="spacingAndGlyphs">${inUse ? "ON" : "OFF"}</text>`;
    }

    var contents = `<svg version="1.1" id="sensor-motion" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
		x="0px" y="0px" viewBox="0 0 48 57" xml:space="preserve">
		<path d="M3.803,57.005c-0.385,0-0.698-0.324-0.698-0.722c0-0.398,0.313-0.722,0.698-0.722h14.038v-6.869h-5.756
			C5.42,48.691,0,43.198,0,36.445V23.08c0-6.753,5.42-12.247,12.084-12.247H25.29c6.664,0,12.084,5.494,12.084,12.247v13.365
			c0,6.753-5.42,12.246-12.084,12.246h-6.049v6.869h14.296c0.386,0,0.699,0.324,0.699,0.722c0,0.398-0.313,0.722-0.699,0.722H3.803z
			M12.084,12.278c-5.893,0-10.687,4.846-10.687,10.802v13.365c0,5.956,4.794,10.802,10.687,10.802H25.29
			c5.893,0,10.684-4.846,10.684-10.802V23.08c0-5.957-4.791-10.802-10.684-10.802H12.084z${motionIndicator}" />
		${statusIndicator}
	</svg>`;
    span.innerHTML = contents;
    return span;
  },

  getColdSVG() {
    var span = document.createElement("span");
    span.innerHTML = "<svg version=\"1.1\" id=\"system-mode-cool\" xmlns=\"http://www.w3.org/2000/svg\"" +
      "    xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 24.389 26.5\" xml:space=\"preserve\">" +
      "    <g>" +
      "        <g>" +
      "            <g>" +
      "                <g>" +
      "                    <line stroke-linecap=\"round\" stroke-miterlimit=\"10\" x1=\"12.195\" y1=\"0\" x2=\"12.195\" y2=\"26.5\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"9.767,24.703 12.195,22.276 " +
      "              14.622,24.703\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"9.767,21.769 12.195,19.342 " +
      "              14.622,21.769\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"14.622,1.797 12.195,4.224 " +
      "              9.767,1.797\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"14.622,4.731 12.195,7.158 " +
      "              9.767,4.731\" />" +
      "                </g>" +
      "                <line stroke-linecap=\"round\" stroke-miterlimit=\"10\" x1=\"12.195\" y1=\"0\" x2=\"12.195\" y2=\"26.5\" />" +
      "                <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"9.767,24.703 12.195,22.276 " +
      "            14.622,24.703\" />" +
      "                <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"9.767,21.769 12.195,19.342 " +
      "            14.622,21.769\" />" +
      "            </g>" +
      "            <g>" +
      "                <g>" +
      "                    <line stroke-linecap=\"round\" stroke-miterlimit=\"10\" x1=\"23.889\" y1=\"7.021\" x2=\"0.5\"" +
      "                        y2=\"19.479\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"0.945,16.492 4.229,17.493 " +
      "              3.227,20.776\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"3.535,15.112 6.818,16.114 " +
      "              5.817,19.397\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"23.444,10.008 20.161,9.007 " +
      "              21.162,5.724\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"20.855,11.388 17.571,10.386 " +
      "              18.573,7.103\" />" +
      "                </g>" +

      "                <line stroke-linecap=\"round\" stroke-miterlimit=\"10\" x1=\"23.889\" y1=\"7.021\" x2=\"0.5\" y2=\"19.479\" />" +
      "                <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"0.945,16.492 4.229,17.493 " +
      "            3.227,20.776\" />" +
      "                <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"3.535,15.112 6.818,16.114 " +
      "            5.817,19.397\" />" +
      "            </g>" +
      "            <g>" +
      "                <g>" +
      "                    <line stroke-linecap=\"round\" stroke-miterlimit=\"10\" x1=\"23.853\" y1=\"19.546\" x2=\"0.536\"" +
      "                        y2=\"6.954\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"3.271,5.672 4.253,8.961 " +
      "              0.964,9.944\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"5.852,7.066 6.835,10.355 " +
      "              3.545,11.338\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"21.119,20.828 20.136,17.539 " +
      "              23.425,16.556\" />" +
      "                    <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"18.537,19.434 17.555,16.145 " +
      "              20.844,15.162\" />" +
      "                </g>" +

      "                <line stroke-linecap=\"round\" stroke-miterlimit=\"10\" x1=\"23.853\" y1=\"19.546\" x2=\"0.536\" y2=\"6.954\" />" +
      "                <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"3.271,5.672 4.253,8.961 " +
      "            0.964,9.944\" />" +
      "                <polyline stroke-linecap=\"round\" stroke-miterlimit=\"10\" points=\"5.852,7.066 6.835,10.355 " +
      "            3.545,11.338\" />" +
      "            </g>" +
      "        </g>" +
      "    </g>" +
      "</svg>";
    return span;
  },

  getFanSVG() {
    var span = document.createElement("span");
    span.innerHTML = "<svg version=\"1.1\" id=\"system-mode-fan\" xmlns=\"http://www.w3.org/2000/svg\"" +
      "    xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 27.386 27.396\" xml:space=\"preserve\">" +
      "    <g>" +
      "        <g>" +
      "            <path stroke-miterlimit=\"10\" d=\"M26.878,13.064c0-6.102-5.111-6.7-5.175-6.707" +
      "                c-4.37-0.367-6.301,3.997-6.488,4.441c-0.007,0.007-0.007,0.013-0.013,0.019c-0.148,0.341-0.277,0.431-0.328,0.431" +
      "                c-0.084,0-0.232-0.148-0.315-0.283c-1.126-1.873,1.268-3.939,1.274-3.952c1.101-0.843,1.525-1.867,1.68-2.401" +
      "                c0.09-0.315,0.103-0.521,0.103-0.534c0.013-0.116,0.019-0.232,0.026-0.341c0.006-0.225-0.006-0.438-0.045-0.644" +
      "                c-0.064-0.38-0.193-0.727-0.399-1.03C16.264,0.654,14.173,0.5,13.317,0.5c-0.161,0-0.264,0.006-0.264,0.006" +
      "                c-1.937,0-3.514,0.515-4.699,1.519C7.955,2.367,7.64,2.733,7.389,3.094C7.234,3.313,7.099,3.532,6.99,3.738" +
      "                C6.861,3.982,6.758,4.214,6.681,4.413C6.41,5.121,6.352,5.649,6.346,5.675c-0.367,4.512,4.428,6.488,4.473,6.507" +
      "                c0,0,0.013,0.006,0.019,0.006c0.315,0.142,0.405,0.27,0.405,0.315c0.006,0.084-0.142,0.238-0.277,0.322" +
      "                c-0.341,0.199-0.702,0.302-1.081,0.302c-1.506,0-2.871-1.577-2.871-1.577C5.76,9.91,4.138,9.769,4.08,9.769" +
      "                c-1.068-0.122-1.88,0.167-2.491,0.817c-1.229,1.313-1.088,3.669-1.081,3.746c0,6.102,5.111,6.7,5.168,6.707" +
      "                c4.357,0.367,6.295-3.978,6.494-4.441c0-0.007,0.007-0.013,0.007-0.019c0.148-0.341,0.283-0.431,0.328-0.431" +
      "                c0.084,0,0.238,0.148,0.315,0.283c1.126,1.873-1.262,3.939-1.274,3.952c-1.101,0.843-1.519,1.86-1.673,2.394" +
      "                c-0.09,0.322-0.109,0.528-0.109,0.541c-0.013,0.129-0.019,0.251-0.026,0.373c0,0.225,0.013,0.438,0.052,0.644" +
      "                c0.064,0.348,0.187,0.669,0.367,0.953c0.92,1.448,3.038,1.609,3.907,1.609c0.167,0,0.27-0.006,0.27-0.006" +
      "                c1.937,0,3.521-0.515,4.699-1.525c0.386-0.328,0.695-0.682,0.94-1.03c0.161-0.219,0.29-0.438,0.399-0.644" +
      "                c0.142-0.257,0.245-0.496,0.328-0.708c0.277-0.708,0.335-1.236,0.335-1.268c0.367-4.506-4.422-6.488-4.473-6.507" +
      "                c-0.007,0-0.013,0-0.013,0c-0.322-0.148-0.405-0.27-0.412-0.315c-0.006-0.084,0.148-0.238,0.283-0.322" +
      "                c0.335-0.2,0.702-0.303,1.081-0.303c1.506,0,2.864,1.577,2.864,1.577c1.262,1.641,2.884,1.783,2.942,1.783" +
      "                c1.062,0.116,1.873-0.167,2.491-0.824C27.02,15.497,26.885,13.141,26.878,13.064z\" />" +
      "        </g>" +
      "    </g>" +
      "</svg>";
    return span;
  },

  getHeatSVG() {
    var span = document.createElement("span");
    span.innerHTML = "<svg version=\"1.1\" id=\"system-mode-heat\" xmlns=\"http://www.w3.org/2000/svg\"" +
      "    xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 19.418 27.9\" xml:space=\"preserve\">" +
      "    <path stroke-miterlimit=\"10\" d=\"M8.137,1.288c0.055,0.446,0.08,0.903,0.043,1.396" +
      "        C8.061,4.277,7.55,5.731,6.619,7.128C5.913,8.187,5.056,9.098,4.227,9.98l-0.051,0.054c-0.038,0.041-3.642,3.942-3.676,8.29v0.055" +
      "        C0.53,23.436,4.58,27.4,9.718,27.4c5.065,0,9.192-4.127,9.2-9.2l-0.003-0.253c0-0.028-0.015-1.874-0.997-3.533" +
      "        c-0.005,2.092-1.708,3.793-3.801,3.793c-1.142-0.001-2.196-0.428-2.897-1.171c-0.652-0.691-0.966-1.601-0.907-2.63l0.005-0.071" +
      "        c0.087-0.563,0.154-0.864,0.341-1.27l0.023-0.044C10.837,12.761,14.234,6.89,8.137,1.288z\" />" +
      "</svg>";
    return span;
  },

  getThermostatSVG(inUse) {
    var span = document.createElement("span");

    const statusIndicator = this.config.useColoredDots
    	? `<circle cx="28.5" cy="28.5" r="5" fill="${inUse ? this.config.dotColorOn : this.config.dotColorOff}"/>`
    	: `<text x="0.25em" y="1.85em" textLength="1.8rem" lengthAdjust="spacingAndGlyphs">${inUse ? "ON" : "OFF"}</text>`;

    span.innerHTML = `<svg version="1.1" id="ecobee" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
		y="0px" viewBox="0 0 57 57" style="height: 35px" xml:space="preserve">
		<g>
			<g>
				<path d="M33.794,0H23.206C10.411,0,0,10.411,0,23.207v10.586C0,46.59,10.411,57,23.206,57h10.589
					C46.589,57,57,46.59,57,33.793V23.207C57,10.411,46.589,0,33.794,0z M55.543,33.793c0,11.992-9.758,21.749-21.749,21.749H23.206
					c-11.991,0-21.749-9.757-21.749-21.749V23.207c0-11.992,9.758-21.749,21.749-21.749h10.589c11.991,0,21.749,9.756,21.749,21.749
					V33.793z M38.88,7.632c0.403,0,0.728-0.326,0.728-0.729c0-0.403-0.325-0.73-0.728-0.73c-0.081,0-0.164-0.011-0.242-0.03
					c-5.994-1.572-14.3-1.572-20.284-0.001c-0.076,0.019-0.157,0.03-0.233,0.03c-0.404,0-0.729,0.326-0.729,0.729
					c0,0.404,0.325,0.73,0.729,0.73c0.199,0,0.401-0.026,0.6-0.077c5.752-1.509,13.783-1.512,19.554,0.002
					C38.476,7.606,38.678,7.632,38.88,7.632z M41.56,26.419v-7.454c0-0.336-0.273-0.607-0.607-0.607c-0.335,0-0.608,0.272-0.608,0.607
					v7.454c-1.361,0.291-2.406,1.444-2.406,2.891c0,1.445,1.045,2.601,2.406,2.89v7.454c0,0.336,0.273,0.607,0.608,0.607
					c0.335,0,0.607-0.272,0.607-0.607v-7.454c1.361-0.29,2.406-1.445,2.406-2.89C43.966,27.863,42.92,26.71,41.56,26.419z
					M40.952,31.109c-0.992,0-1.799-0.807-1.799-1.799c0-0.992,0.807-1.799,1.799-1.799s1.799,0.807,1.799,1.799
					C42.751,30.302,41.944,31.109,40.952,31.109z" />
			</g>
		</g>
		${statusIndicator}
	</svg>`;
    return span;
  },

  getAutoSVG() {
    var span = document.createElement("span");
    span.innerHTML = "<svg viewbox=\"139 80 42 32\">" +
      "  <style type=\"text/css\">" +
      "    .system-mode-heat-on>.heat-icon {" +
      "      stroke: #F99B1F" +
      "    }" +

      "    .system-mode-cool-on>.cool-icon {" +
      "      stroke: #56C0EA" +
      "    }" +
      "  </style>" +
      "  <g id=\"autoIcon\" class=\"\">" +
      "    <line class=\"cool-icon\" x1=\"153\" y1=\"81.2\" x2=\"153\" y2=\"110.9\"></line>" +
      "    <polyline class=\"cool-icon\" points=\"150.3,108.9 153,106.2 155.8,108.9\"></polyline>" +
      "    <polyline class=\"cool-icon\" points=\"150.3,105.6 153,102.9 155.8,105.6\"></polyline>" +
      "    <polyline class=\"cool-icon\" points=\"155.8,83.2 153,85.9 150.3,83.2\"></polyline>" +
      "    <polyline class=\"cool-icon\" points=\"155.8,86.5 153,89.2 150.3,86.5\"></polyline>" +
      "    <line class=\"cool-icon\" x1=\"153\" y1=\"81.2\" x2=\"153\" y2=\"110.9\"></line>" +
      "    <polyline class=\"cool-icon\" points=\"150.3,108.9 153,106.2 155.8,108.9\"></polyline>" +
      "    <polyline class=\"cool-icon\" points=\"150.3,105.6 153,102.9 155.8,105.6\"></polyline>" +
      "    <polyline class=\"cool-icon\" points=\"140.4,99.7 144.1,100.8 143,104.5\"></polyline>" +
      "    <polyline class=\"cool-icon\" points=\"143.3,98.1 147,99.3 145.9,103\"></polyline>" +
      "    <line class=\"cool-icon\" x1=\"156.3\" y1=\"94.3\" x2=\"139.9\" y2=\"103.1\"></line>" +
      "    <polyline class=\"cool-icon\" points=\"140.4,99.7 144.1,100.8 143,104.5\"></polyline>" +
      "    <polyline class=\"cool-icon\" points=\"143.3,98.1 147,99.3 145.9,103\"></polyline>" +
      "    <polyline class=\"cool-icon\" points=\"143,87.6 144.1,91.3 140.4,92.4\"></polyline>" +
      "    <polyline class=\"cool-icon\" points=\"145.9,89.1 147,92.8 143.3,93.9\"></polyline>" +
      "    <line class=\"cool-icon\" x1=\"155.2\" y1=\"97.2\" x2=\"140\" y2=\"89\"></line>" +
      "    <polyline class=\"cool-icon\" points=\"143,87.6 144.1,91.3 140.4,92.4\"></polyline>" +
      "    <polyline class=\"cool-icon\" points=\"145.9,89.1 147,92.8 143.3,93.9\"></polyline>" +
      "    <path class=\"heat-icon\" d=\"M167.9,81.6c0.1,0.5,0.1,1,0,1.6c-0.1,1.8-0.7,3.5-1.8,5c-0.8,1.1-1.7,2.2-2.7,3.2l0,0 c-2.4,2.6-3.8,5.9-4.1,9.4l0,0c0,5.6,4.6,10.2,10.2,10.1h0.1c5.7,0,10.4-4.6,10.4-10.3v-0.3c-0.1-1.4-0.4-2.7-1.1-4 c0,2.3-1.9,4.2-4.3,4.2c-1.2,0-2.4-0.5-3.3-1.3c-0.7-0.8-1-1.9-0.9-2.9l0,0c0.1-0.5,0.2-1,0.4-1.4l0,0 C173.3,90.4,172.1,84.7,167.9,81.6z\"></path>" +
      "  </g>" +
      "</svg>";
    return span;
  },

  start() {
    Log.info("Starting module: " + this.name);

    this.tempData = new Array();
    this.sendSocketNotification("UPDATE_SENSORS");

    setInterval(() => {
      this.sendSocketNotification("ECOBEE_PING");
    }, 3 * 60 * 1000);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "UPDATE_MAIN_INFO") {
      Log.info("received the payload with the information to update!");
      this.tempData = payload;
      Log.info("1 - XXXXXXXXXX" + this.tempData.thermostatList[0].name);
      this.updateDom();
    } else if (notification === "UPDATE_PIN") {
      this.tempData = [];
      this.pin = payload.pin;
      this.expires_in = payload.expires_in;
      Log.info("@@@@@@  Updating DOM and PIN with this pin: " + this.pin);
      this.updateDom();
    } else if (notification === "ECOBEE_SEND_CONFIG") {
      this.sendSocketNotification("ECOBEE_RECEIVE_CONFIG", this.config);
      this.sendSocketNotification("UPDATE_SENSORS");
    }
  }
});
