import { Timezones, ArrayDecomposer, ArrayCloneMachine, SingleTimezone, UTCinterpreter } from "./classes.mjs";
//note that the WorldTimeAPI is inaccurate with respect to GMT countries and the DST properties
let coreTimezonesArray = JSON.parse(localStorage.getItem('timezones'));

async function fetchTimezones() {
    //remove this when publishing
    if (!coreTimezonesArray) {
        let coreTimezoneObject = new Timezones();
        coreTimezonesArray = await coreTimezoneObject.getArray();
        localStorage.setItem('timezones',JSON.stringify(coreTimezonesArray));
    } else {
        coreTimezonesArray = JSON.parse(localStorage.getItem('timezones'));
    }
};
function populateDropDown(id, array, filter1, filter2, arrayNumber) {
    let arrayCloneMachine = new ArrayCloneMachine();
    array = arrayCloneMachine.filterOutX(array, filter1, filter2)
    let arrayDecomposer = new ArrayDecomposer();
    arrayDecomposer.splitBySlash(array);
    //let firstArray = arrayDecomposer.array1;
    let dropdown = document.getElementById(id)
    dropdown.innerHTML = '';
    let pleaseSelect = document.createElement('option');
    pleaseSelect.textContent = 'Select an Option';
    pleaseSelect.value = '';
    dropdown.appendChild(pleaseSelect);
    if (arrayDecomposer[arrayNumber].length == 0) {
      dropdown.innerHTML = '';
    } else {
    arrayDecomposer[arrayNumber].forEach(function(e) {
        let option = document.createElement('option');
        option.value = e;

        //get rid of underscores?? set value to e
        option.textContent = e.replace(/_/g,' ');
        dropdown.appendChild(option);
    });
    }
}
window.onload = async function() {
    await fetchTimezones();
    populateDropDown('fromLocation', coreTimezonesArray,null,null, 'array1');
    populateDropDown('toLocation', coreTimezonesArray,null,null, 'array1');
    const fromLocation = document.getElementById('fromLocation');
    const fromArea = document.getElementById('fromArea');
    const fromRegion = document.getElementById('fromRegion');
    const toLocation = document.getElementById('toLocation');
    const toArea = document.getElementById('toArea');
    const toRegion = document.getElementById('toRegion');
    fromLocation.addEventListener('change', function(l) {
        if (l.target.value === '') {
            fromArea.innerHTML = '';
            fromRegion.innerHTML = '';
        } else {
            populateDropDown('fromArea',coreTimezonesArray, l.target.value,null, 'array2');
        }
        displayButtons(l.target.value,null,null,'fromTimezoneDisplay');
    });
    toLocation.addEventListener('change', function(l) {
        if (l.target.value === '') {
            toArea.innerHTML = '';
            toRegion.innerHTML = '';
        } else {
            populateDropDown('toArea',coreTimezonesArray, l.target.value,null, 'array2');
        }
        displayButtons(l.target.value,null,null,'toTimezoneDisplay');
    });
    fromArea.addEventListener('change', function(a) {
        if (a.target.value === '') {
            fromRegion.innerHTML = '';
        } else {
            populateDropDown('fromRegion', coreTimezonesArray,fromLocation.value,a.target.value,'array3');
        }
        displayButtons(fromLocation.value,a.target.value,null,'fromTimezoneDisplay');
    });
    toArea.addEventListener('change', function(a) {
        if (a.target.value === '') {
            toRegion.innerHTML = '';
        } else {
            populateDropDown('toRegion', coreTimezonesArray,toLocation.value,a.target.value,'array3');
        }
        displayButtons(toLocation.value,a.target.value,null,'toTimezoneDisplay');
    });
    fromRegion.addEventListener('change', function(e) {
        displayButtons(fromLocation.value, fromArea.value, e.target.value,'fromTimezoneDisplay');
    });
    toRegion.addEventListener('change', function(e) {
        displayButtons(toLocation.value, toArea.value, e.target.value,'toTimezoneDisplay');
    });
    let now = new Date();
    let aYearAhead = new Date();
    aYearAhead.setFullYear(now.getFullYear()+1);
    let sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate()-60);
    function formatDate(date) {
        let day = String(date.getDate()).padStart(2,'0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        let hours = String(date.getHours()).padStart(2,'0');
        let minutes = String(date.getMinutes()).padStart(2,'0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    dateTimePicker.min = formatDate(sixtyDaysAgo);
    dateTimePicker.max = formatDate(aYearAhead);   
}

//factory
function displayButtons(filterCountry,filterArea,filterRegion, sectionItsFor) {
    document.getElementById(sectionItsFor).innerHTML = '';
    if (filterCountry == '') {
        return;
    }
    let arrayCloneMachine = new ArrayCloneMachine();
    let filtered = arrayCloneMachine.filterOutX(coreTimezonesArray,filterCountry,filterArea,filterRegion);
    filtered.forEach(c => {
        let button = document.createElement('button');
        button.value = c;
        button.textContent = c.replace(/_/g, ' ');
        button.addEventListener('click', (e) => addSelected(e,sectionItsFor));
        document.getElementById(sectionItsFor).appendChild(button);
    });
}
//visitor
async function addSelected(e, sectionItsFor) {
    let siblings = e.target.parentNode.children;
    for (let s of siblings) {
        if (s !== e.target) {
            s.classList.remove('selected');
        }
    }
    if (e.target.classList.contains('selected')) {
        e.target.classList.remove('selected');
        depopulateUTCstats(sectionItsFor);
        calculateTime();
    } else {
        e.target.classList.add('selected');
        await populateUTCstats(e,sectionItsFor);
        calculateTime();
    }
    showTimeCalculations();
   
}
let regex = new RegExp('^(to|from)');
//visitor
async function populateUTCstats(e,sectionItsFor){
    let buttonValue = e.target.value;
    let buttonArray = buttonValue.split('/');
    let UTCselected = new SingleTimezone(buttonArray[0], buttonArray[1], buttonArray[2]);
    let data = await UTCselected.getData();
    console.log(data);
    let prefix = sectionItsFor.match(regex);
    document.getElementById(prefix[0]+'UTCOffset').textContent = data.utc_offset;
    console.log(data.dst);
    if (data.dst_from == null) {
        data.dst = "Does not have";
    } else {
        switch (data.dst) {
            case true:
                data.dst = 'On now';
                break;
            case false:
                data.dst = "Not now";
                break;
            default:
                data.dst = "Unknown";
        }
    }
    document.getElementById(prefix[0] + 'DSTboolean').textContent = data.dst;
    let startString = parseStandardStringToReadable(data.dst_from);
    let untilString = parseStandardStringToReadable(data.dst_until);
    let periodRange = '<b>'+ startString +'</b>' + '<br>' + ' to ' + '<br>' + '<b>'+ untilString+ '</b>';
    if (startString == null) {
        periodRange = null;
    }
    document.getElementById(prefix[0] + 'DSTperiod').innerHTML = periodRange
    document.getElementById(prefix[0] + 'DSTperiod').setAttribute('data-start',data.dst_from);
    document.getElementById(prefix[0] + 'DSTperiod').setAttribute('data-until',data.dst_until);

}
function depopulateUTCstats(sectionItsFor) {
    let prefix = sectionItsFor.match(regex);
    document.getElementById(prefix[0] + 'UTCOffset').innerHTML = '';
    document.getElementById(prefix[0] + 'DSTboolean').innerHTML = '';
    document.getElementById(prefix[0] + 'DSTperiod').innerHTML = '';
}

//visitor
function showTimeCalculations() {
    let timeInput = document.getElementById('fromTimeInput');
    let timeOutput = document.getElementById('toTimeOutput');
    let selectedFrom = document.querySelector("#fromTimezoneDisplay .selected");
    let selectedTo = document.querySelector("#toTimezoneDisplay .selected");
    if (selectedFrom && selectedTo) {
        timeInput.classList.add('visible');
        timeOutput.classList.add('visible');
    } else {
        timeInput.classList.remove('visible');
        timeOutput.classList.remove('visible');
    }
}
//interpreter
function parseStandardStringToReadable(datestring) {
    if (datestring == null) {
        return;
    }
    let year = datestring.substring(0,4);
    let month = datestring.substring(5,7);
    switch (month) {
        case '01':
            month = 'Jan (01)';
            break;
        case '02':
            month = 'Feb (02)';
            break;
        case '03':
            month = 'Mar (03)';
            break;
        case '04':
            month = 'Apr (04)';
            break;
        case '05':
            month = 'May (05)';
            break;
        case '06':
            month = 'Jun (06)';
            break;
        case '07':
            month = 'Jul (07)';
            break;
        case '08':
            month = 'Aug (08)';
            break;
        case '09':
            month = 'Sep (09)';
            break;
        case '10':
            month = 'Oct (10)';
            break;
        case '11':
            month = 'Nov (11)';
            break;
        case '12':
            month = 'Dec (12)';
            break;
        default:
            month = 'Unknown';
    }
    let day = datestring.substring(8,10);
    let hour = datestring.substring(11,13);
    let minute = datestring.substring(14,16);
    let AMPM = "";
    if (Number(hour)>12) {
        hour = Number(hour) % 12;
        AMPM = "PM";
    } else if (Number(hour) == 12) {
        AMPM = "PM";
    }
    return day + " " + month + " " + year + " " + hour + ":" + minute + AMPM + ' (UTC)';
}

//observer
const dateTimePicker = document.getElementById('dateTimePicker');
dateTimePicker.addEventListener('change', calculateTime);

//to do:
//limit to previous 7 days and 365 days in future
//calculation function into Time calculated
function calculateTime() {
    let inputValue = dateTimePicker.value;
    if (!inputValue) {
        document.getElementById("calculatedDateTime").innerHTML = '';
        return;
    }
    const previousDisclaimer = dateTimePicker.parentElement.querySelector('div');
    if (previousDisclaimer) {
        previousDisclaimer.remove();
    }
    let date = new Date(inputValue);
    let unixInput = date.getTime();
    let statusFromInput = state(unixInput, 'from');
    if (statusFromInput == 1) {
        let disclaimer = document.createElement('div');
        disclaimer.textContent = "This is in Daylight Savings time (UTC+1)"
        e.target.parentElement.appendChild(disclaimer);
    } else if (statusFromInput == -1) {
        let disclaimer = document.createElement('div');
        disclaimer.textContent = "This is not in Daylight Savings time (UTC-1)"
        e.target.parentElement.appendChild(disclaimer);
    }
    let utcInterpreter = new UTCinterpreter();
    let fromUTCunix = utcInterpreter.UTCOffsetUnix(document.getElementById('fromUTCOffset').textContent);
    let toUTCunix = utcInterpreter.UTCOffsetUnix(document.getElementById('toUTCOffset').textContent);
    let difference = toUTCunix - fromUTCunix;
    let statusToInput = state(unixInput,'to');
    if (statusToInput == 1) {
        difference = difference + (60*60*1000);
    } else if (statusToInput == -1) {
        difference = difference - (60*60*1000);
    }
    let unixOutput = unixInput + difference;
    document.getElementById("calculatedDateTime").textContent = utcInterpreter.UnixtoDate(unixOutput);
}


//state
function state(unixInput, toOrFromZone) {
    let dstStatus = document.getElementById(toOrFromZone + 'DSTboolean').textContent;
    if (dstStatus == null) {
        return null;
    }
    let dstStart = document.getElementById(toOrFromZone + 'DSTperiod').getAttribute('data-start');
    dstStart = new Date(dstStart);
    dstStart = dstStart.getTime();
    let dstUntil = document.getElementById(toOrFromZone + 'DSTperiod').getAttribute('data-until');
    dstUntil = new Date(dstUntil);
    dstUntil = dstUntil.getTime();
    let withinPeriod = (unixInput >= dstStart && unixInput <= dstUntil);
        if (withinPeriod && dstStatus == "Not now") {
        return +1;
    }
    if (!withinPeriod && dstStatus == "On now") {
        return -1;
    }

}

