import React from 'react';


class durationPicker extends React.Component{

    static setDurationPicker(secondsVal, showSeconds=true, showDays=true){
        
        let durationArray={
            months:0,
            weeks:0,
            days:0,
            hours:0,
            minutes:0,
            seconds:0,
            showSeconds: showSeconds,
            showDays: showDays
        }

        let total = parseInt(secondsVal, 10);
        durationArray.seconds = total % 60;
        // console.log(total + " after seconds")
        total = Math.floor(total / 60);
        // console.log(total + " after total seconds")
        durationArray.minutes = total % 60;
        // console.log(total + " after minutes")
        total = Math.floor(total / 60);
        // console.log(total + " after total minutes")
        if (durationArray.showDays) {
            durationArray.hours = total % 24;
            // console.log(total + " after hours")
            total = Math.floor(total / 24);
            // console.log(total + " after total hours")
            durationArray.days = total % 7;
            // console.log(total + " after days")
            total = Math.floor(total / 7);
            // console.log(total + " after total days")
            durationArray.weeks = total % 4
            // console.log(total + " after weeks")
            durationArray.months = Math.floor(total / 4);
            // console.log(total + " after month")
        } else {
            durationArray.hours = total;
            durationArray.days = 0;
            durationArray.weeks = Math.floor(((total % 24)/24)/7);
        }

        return durationArray;
    }

    static getTotalSecondDuration(durationArray){

        const total = durationArray.seconds +
            durationArray.minutes * 60 +
            durationArray.hours * 60 * 60 +
            durationArray.days * 24 * 60 * 60 +
            durationArray.weeks * 7 * 24 * 60 * 60 +
            durationArray.months * 4 * 7 * 24 * 60 * 60;

        return total;
    }

    static durationPickerUI(props){
        let durationArray=props.durationArray
        const onChangeProp = props.onChange
        
        const onChangeInput=(e)=>{
            durationArray[e.target.id]=e.target.value
            onChangeProp(durationArray)
        }

        return(
            <div>
                <style>
                    {`
                        .bdp-input input {
                            display: inline-block;
                            margin-bottom: 3px;
                            width: 60px;
                        }

                        .bdp-block {
                            display: inline-block;
                            line-height: 1;
                            text-align: center;
                            padding: 5px 3px;
                        }
                    `
                    }
                </style>
                <div className="bdp-input">
                    <div className="bdp-block">
                        <input className="form-control input-sm" type="number" id="months" min="0" value={durationArray.months} onChange={onChangeInput.bind(this)}/>
                        <div id="bdp-months-label">months</div>
                    </div>
                    <div className="bdp-block">
                        <input className="form-control input-sm" type="number" id="weeks" min="0" max="3" value={durationArray.weeks} onChange={onChangeInput.bind(this)}/>
                        <div id="bdp-weeks-label">weeks</div>
                    </div>
                    {durationArray.showDays?
                        <div className="bdp-block">
                            <input className="form-control input-sm" type="number" id="days" min="0" max="6" value={durationArray.days} onChange={onChangeInput.bind(this)}/>
                            <div id="bdp-days-label">days</div>
                        </div>
                    :''
                    }
                    <div className="bdp-block">
                        <input className="form-control input-sm" type="number" id="hours" min="0" max={durationArray.showDays?"23":"99999"} value={durationArray.hours} onChange={onChangeInput.bind(this)}/>
                        <div id="bdp-hours-label">hours</div>
                    </div>
                    <div className="bdp-block">
                        <input className="form-control input-sm" type="number" id="minutes" min="0" max="59" value={durationArray.minutes} onChange={onChangeInput.bind(this)}/>
                        <div id="bdp-minutes-label">minutes</div>
                    </div>
                    {durationArray.showSeconds?
                        <div className="bdp-block">
                            <input className="form-control input-sm" type="number" id="seconds" min="0" max="59" value={durationArray.seconds} onChange={onChangeInput.bind(this)}/>
                            <div id="bdp-seconds-label">seconds</div>
                        </div>
                    :''
                    }
                </div>
            </div>
        )
    }
}

export {durationPicker};