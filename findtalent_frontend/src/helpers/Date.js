class DateFunction {

    static getCurrentDate(){    
        var date = new Date().toString();
        var dateArr = date.split(' ');
        var dayName = dateArr[0];
        var dateFormat = dayName + ', ' + dateArr[2] + ' ' + dateArr[1] + ' ' + dateArr[3];
        global.vDate = dateFormat;
        return dateFormat;
    }

    static getCurrentDateFormated() {
        var tempDate = new Date();
        var date = tempDate.getFullYear() + '-' + (tempDate.getMonth()+1) + '-' + tempDate.getDate() +' '+ tempDate.getHours()+':'+ tempDate.getMinutes()+':'+ tempDate.getSeconds();
        //const currDate = "Current Date= "+date;
        return date;
    }
}

export default {DateFunction};