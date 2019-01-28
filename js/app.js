'use strict';

// Array of open hours that I can loop through; has global scope
var openHours = ['6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm'];

// GLOBAL VARIABLES FOR DOM ACCESS
var salesForm = document.getElementById('sales-form');
var clearSalesForm = document.getElementById('clear-sales-form');
var dailyTotalsTable = document.getElementById('dailytotalstable');
// Global array of all CookieStand objects
var allCookieStands = [];

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// FORM SUBMISSION FUNCTION DECLARATIONS

// Event handler function for submission of new locations
function handleFormSubmission(event) {
    event.preventDefault(); // Prevents page reload on a "submit" event
    var locationName = event.target.name.value;
    var minCustomers = parseInt(event.target.min.value);
    var maxCustomers = parseInt(event.target.max.value);
    var avgCookiesEachSale = parseInt(event.target.avg.value);

    // Validation to prevent empty form fields; check out HTML5 form validation for better way
    if (!event.target.name.value ||
        !event.target.min.value ||
        !event.target.max.value ||
        !event.target.avg.value) {
        return alert('Fields cannot be empty!')
    }

    var newStand = new CookieStand(locationName, minCustomers, maxCustomers, avgCookiesEachSale); 
    
    newStand.calcCookiesSoldHourly();

    // Empty form fields after data has been grabbed
    event.target.name.value = null;
    event.target.min.value = null;
    event.target.max.value = null;
    event.target.avg.value = null;

    renderTable();
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// COOKIE STAND FUNCTION DECLARATIONS

// Generate number btwn two values (learned from MDN doc on Math.random())
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; // The max is exclus and the min is inclus
}

// Calc num of cookies sold per hour
function cookiesSoldPerHr(custs, cookies) { // 1st param is rand no. of customers, 2nd param is avg no. of cookies per sale
    var cookiesPerHr = custs * cookies;
    return cookiesPerHr;
}

// Constructor function for CookieStand object
function CookieStand(locationName, minCustomers, maxCustomers, avgCookiesEachSale) {
    this.locationName = locationName;
    this.minCustomers = minCustomers;
    this.maxCustomers = maxCustomers;
    this.avgCookiesEachSale = avgCookiesEachSale;
    this.cookiesSoldEachHour = [];
    this.totalCookiesSold = 0;
    allCookieStands.push(this);
}

// Calc cookies sold each hour per each object
CookieStand.prototype.calcCookiesSoldHourly = function() {
    for (var i = 0; i < openHours.length; i++) {
        var randCustNum = getRandomInt(this.minCustomers,this.maxCustomers);
        var cookiesEachHr = Math.ceil(cookiesSoldPerHr(randCustNum,this.avgCookiesEachSale));
        this.cookiesSoldEachHour.push(cookiesEachHr);
        this.totalCookiesSold += this.cookiesSoldEachHour[i]; // Counter for summing total of cookies sold
    }
};

// Create instances of CookieStand object // Could actually omit the "var <name> =" part
var firstAndPikeStand = new CookieStand('1st and Pike', 23, 65, 6.3);
var seaTacAirportStand = new CookieStand('SeaTac Airport', 3, 24, 1.2);
var seattleCenterStand = new CookieStand('Seattle Center', 11, 38, 3.7);
var capitolHillStand = new CookieStand('Capitol Hill', 20, 38, 2.3);
var alkiStand = new CookieStand('Alki', 2, 16, 4.6);

// 1st table function: make header row
function renderHeaderRow() {
    // Create element for header row
    var trElmnt = document.createElement('tr');
    var thEl = document.createElement('th');
    thEl.textContent = 'Stand Location';
    trElmnt.appendChild(thEl);
    
    // Add hours via for loop
    for (var i = 0; i < openHours.length; i++) {
        thEl = document.createElement('th');
        thEl.textContent = openHours[i];
        trElmnt.appendChild(thEl); 
    }
    var thEl = document.createElement('th'); // Need or doesn't need fresh declaration
    
    // Add "Daily Location Total"
    thEl.textContent = 'Daily Location Total';
    trElmnt.appendChild(thEl);

    // Add to the DOM
    dailyTotalsTable.appendChild(trElmnt); 
}

// 2nd table function: makes a single row for table body content
CookieStand.prototype.tablify = function() {
    // Make element accessing this.locationName
    var trEl = document.createElement('tr');
    var tdEl = document.createElement('td'); // ADD CLASS SO I CAN STYLE WITH CSS
    tdEl.textContent = this.locationName;
    trEl.appendChild(tdEl);

    // For every hour grab the no. of cookies sold and add to table
    for (var i = 0; i < openHours.length; i++) {
        tdEl = document.createElement('td');
        tdEl.textContent = this.cookiesSoldEachHour[i];
        trEl.appendChild(tdEl);
    }
    var tdEl = document.createElement('td');

    // Populate Daily Location Total column
    tdEl.textContent = this.totalCookiesSold;
    trEl.appendChild(tdEl);

    // Add to the DOM
    dailyTotalsTable.appendChild(trEl);
}

// 3rd table function: make footer row
// Can define this as a global function rather than a prototype method b/c it just needs to access global arrays
function renderFooterRow() {
    var trElmnt = document.createElement('tr');
    var tdEl = document.createElement('td');
    tdEl.textContent = 'Totals';
    trElmnt.appendChild(tdEl);

    var totalOfTotals = 0; // Counter for total of totals is outside outer loop so doesn't reset to 0 with each loop iteration
    for (var i = 0; i < openHours.length; i++) { // "Rows" loop
        var totalPerHour = 0; // Set counter for total cookies sold per hour across all stands
        for (var j = 0; j < allCookieStands.length; j++) { // "Columns" loop
            totalPerHour += allCookieStands[j].cookiesSoldEachHour[i];
        }
        totalOfTotals += totalPerHour;
        tdEl = document.createElement('td');
        tdEl.textContent = totalPerHour;
        trElmnt.appendChild(tdEl); 
    }
    var tdEl = document.createElement('td');

    // Add up total of daily totals across all cookie stands
    tdEl.textContent = totalOfTotals; 
    trElmnt.appendChild(tdEl);
    dailyTotalsTable.appendChild(trElmnt); // Add to the DOM 
}

// Single function to render a row in table for *each* *individual* locations
function renderAllCookieStands() {
    for (var i = 0; i < allCookieStands.length; i++) {
        allCookieStands[i].tablify();
    }
}

// helper function
function renderTable() {
    dailyTotalsTable.textContent = '';
    renderHeaderRow();
    renderAllCookieStands();
    renderFooterRow();
}

function invokeConstructor() {
    for (var i = 0; i < allCookieStands.length; i++) {
        allCookieStands[i].calcCookiesSoldHourly();
    }
}

// Calls (in proper order) all my function calls for creating and populating the table
function pageLoad() {
    invokeConstructor();
    renderTable();
}

// Call pageLoad function that calls "render" on all object instances and also calls all 3 table functions
pageLoad();
