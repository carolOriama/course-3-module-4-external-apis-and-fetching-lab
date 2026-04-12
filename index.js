const weatherApi = "https://api.weather.gov/alerts/active?area=";

// ADded stste abbreviations so that i don't gues states that don't exist
const availableStateAbbreviations = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
const availableStateSet = new Set(availableStateAbbreviations);

const cityInput = document.getElementById("city-input");
const fetchButton = document.getElementById("fetch-weather");
const weatherDisplay = document.getElementById("weather-display");
const errorMessage = document.getElementById("error-message");
const loadingSpinner = document.getElementById("loading-spinner");
const availableStatesElement = document.getElementById("available-states");

function renderAvailableStates() {
  if (!availableStatesElement) return;
  const listText = availableStateAbbreviations.join(", ");
  availableStatesElement.innerHTML = `
    <p><strong>Available state abbreviations:</strong></p>
    <p>${listText}</p>
  `;
}

function isValidState(state) {
  return availableStateSet.has(state.trim().toUpperCase());
}

function clearError() {
  if (!errorMessage) return;
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}

function showError(message) {
  if (!errorMessage) return;
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function clearAlerts() {
  if (!weatherDisplay) return;
  weatherDisplay.innerHTML = "";
}

function showLoading(show) {
  if (!loadingSpinner) return;
  loadingSpinner.style.display = show ? "block" : "none";
}

function displayAlerts(data, stateAbbr) {
  clearAlerts();

  const features = Array.isArray(data.features) ? data.features : [];
  const title = data.title
    ? data.title
    : `Current watches, warnings, and advisories for ${stateAbbr}`;
  const alertCount = features.length;

  const summary = document.createElement("p");
  summary.textContent = `${title}: ${alertCount}`;
  weatherDisplay.appendChild(summary);

  if (alertCount === 0) {
    const none = document.createElement("p");
    none.textContent = "No active alerts for this state.";
    weatherDisplay.appendChild(none);
    return;
  }

  const list = document.createElement("ul");
  features.forEach((feature) => {
    const headline =
      feature?.properties?.headline || "Alert headline unavailable";
    const item = document.createElement("li");
    item.textContent = headline;
    list.appendChild(item);
  });
  weatherDisplay.appendChild(list);
}

function fetchWeatherAlerts(state) {
  const normalizedState = state.trim().toUpperCase();
  if (
    !normalizedState ||
    !/^[A-Z]{2}$/.test(normalizedState) ||
    !isValidState(normalizedState)
  ) {
    return Promise.reject(
      new Error(
        "Please enter a valid 2-letter state abbreviation from the available list.",
      ),
    );
  }

  showLoading(true);
  return fetch(`${weatherApi}${normalizedState}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      return data;
    })
    .finally(() => {
      showLoading(false);
    });
}

function handleFetchAlerts() {
  if (!cityInput) return;

  const state = cityInput.value;
  clearError();
  clearAlerts();

  fetchWeatherAlerts(state)
    .then((data) => {
      displayAlerts(data, state.trim().toUpperCase());
      cityInput.value = "";
    })
    .catch((error) => {
      console.log(error.message);
      showError(error.message);
      cityInput.value = "";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  renderAvailableStates();

  if (fetchButton) {
    fetchButton.addEventListener("click", handleFetchAlerts);
  }

  if (cityInput) {
    cityInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleFetchAlerts();
      }
    });
  }
});
