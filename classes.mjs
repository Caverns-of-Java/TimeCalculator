//singleton
class Timezones {
    constructor() {
        if (Timezones.instance) {
            return Timezones.instance;
        }
        Timezones.instance = this;
        this.initialize();
        this.array = null;
    }

    async initialize() {
        try {
            let response = await fetch('https://worldtimeapi.org/api/timezone');
            if (!response.ok) {
                throw new Error('Network down');
            }
            this.array = await response.json();
        } catch (error) {
            console.log(error.message);
        }
    }
    async getArray() {
        while (this.array == null) {
            await new Promise(resolve => setTimeout(resolve,100));
        }
        //that is, async 'declares' that it will be a promise
        //in this asynchronous function, it will check if this.array == null
        //if it is, it will wait 100ms to move in the loop (and check if this.array is null)
        //we 'await' this because we don't want the script execution to be held up by this 100ms, and, doing so every 100ms is not intensive
        return this.array;
    }
}
//interpreter
class ArrayDecomposer {
    constructor() {
        this.array1= [];
        this.array2 = [];
        this.array3 = [];
    }
    splitBySlash(array) {
        array.forEach(e => {
            let parts = e.split('/');
            if (parts[0] && !this.array1.includes(parts[0])) {
                this.array1.push(parts[0]);
            }
            if (parts[1] && !this.array2.includes(parts[1])) {
                this.array2.push(parts[1]);
            }
            if (parts[2] && !this.array3.includes(parts[2])) {
                this.array3.push(parts[2] || null);
            }
        });
    }
}

//prototyper? copy an array, and filter it further
class ArrayCloneMachine {
    copy(array) {
        let copy = array.map(i => i);
        return copy;
    }
    filterOutX(array, x1, x2,x3) {
        if (!x1){
            return array;
        }
        let regex;
        let filtered = array.filter(c => c.startsWith(x1));
        if (x2) {
            regex = new RegExp(`/${x2}.*`);
            filtered = filtered.filter(f => regex.test(f));
        }
        if (x3) {
            regex = new RegExp(`.+${x3}$`);
            filtered = filtered.filter(f => regex.test(f));
        }
        return filtered;
    }
}

//factory that outputs a selected timezone
class SingleTimezone {
    constructor(location, area, region) {
        this.data = null;
        this.initialize(location, area, region)
    }

    async initialize(location, area,region) {
        let url = `https://worldtimeapi.org/api/timezone/${location}`;
        if (area) {
            url += `/${area}`;
        }
        if (region) {
            url += `/${region}`;
        }
        try {
            let response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network down');
            }
            this.data = await response.json();
        } catch (error) {
            console.log(error.message);
        }
    }
    async getData() {
        while (this.data == null) {
            await new Promise(r => setTimeout(r,100));
        }
        return this.data;
    }
}

//interpreter
class UTCinterpreter {
    UTCOffsetUnix(offsetString) {
        let sign = offsetString.substring(0,1);
        let hourUnix = Number(offsetString.substring(1,3))*60*60*1000;
        let minuteUnix = Number(offsetString.substring(4,6))*60*1000;
        let totalUnix = hourUnix + minuteUnix;
        return sign ==="+" ? totalUnix : -totalUnix;
    }

    UnixtoDate(unixTimestamp) {
        let date = new Date(unixTimestamp);

        let day = String(date.getDate()).padStart(2,'0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        let hours = String(date.getHours()).padStart(2,'0');
        let minutes = String(date.getMinutes()).padStart(2,'0');
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
        let AMPM = "";
        if (Number(hours)>12) {
            hours = Number(hours) % 12;
            AMPM = "PM";
        } else if (Number(hours) == 12) {
            AMPM = "PM";
        } else {
            AMPM="AM"
        }
        if (Number(hours) == 0) {
            hours = 12;
        }

        return `${day} ${month} ${year} ${hours}:${minutes} ${AMPM}`;
    }
}
export {Timezones, ArrayDecomposer, ArrayCloneMachine, SingleTimezone, UTCinterpreter};
/*var timeZones = new Timezones;
(async () => {
    let array = await timeZones.getArray();
    console.log(array);
    let decomposer = new ArrayDecomposer();
    decomposer.splitBySlash(array);
    console.log(decomposer.array1);
    let filter = new ArrayCloneMachine();
    console.log(filter.filterOutX(array,'WET'));
    let object = new SingleTimezone('America', 'Mexico_City');
    let data = await object.getData();
    console.log(data.utc_offset);
})();*/
