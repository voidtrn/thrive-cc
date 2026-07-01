import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
// import { cssTarget, LoadingAdmin } from '../../components/Loading';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const routeAdmin = routeAll.routesAdmin

function CalendarHoliday(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [currentEvent, setCurrentEvent] = useState([])

    const offset=0
    // const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()

    const [calendarValue, setCalendarValue] = useState(new Date());

    const [offsetTable, setOffsetTable] = useState(0)
    const [activePage, setActivePage] = useState(1)
    
    const pageRangeDisplayed = 5
    const limit = 99999999

    const getData = useCallback(async () => {
        // setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbCalendar/ListData',credentials);
        setItems(isi.data.data)
    },[offset])

    useEffect(()=>{
        getData()
    },[getData])

    const onChangeCalendar = (value)=>{
        setCalendarValue(value)
        let itemCalendar = items.filter(item => isSameDay(new Date(item.calendar_date), value))
        if (itemCalendar.length <= 0) {
            setCurrentEvent([])
        }
    }

    const getDetail=async(param)=>{
        // alert(param)
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.calendarDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }
   
    const isSameDay=(first, second)=> {
        const firstDate =  first.toDateString();
    
        const secondDate = second.toDateString();
        
        return firstDate === secondDate
    
    }
    
    const tileContent=useCallback(( {date, view} )=> {
        // Add class to tiles in month view only
        if (view === 'month') {
            // Check if a date React-Calendar wants to check is on the list of dates to add class to
            let itemCalendar = items.filter(item => isSameDay(new Date(item.calendar_date), date))
            if (itemCalendar.length > 0) {
                return (
                    <p style={{marginBottom:"0",paddingTop:"5px"}}>
                        <a className="btn btn-primary btn-xs tt" onClick={()=>setCurrentEvent(itemCalendar)} ><i className="fa fa-eye"></i>&nbsp;See Event</a>
                    </p>
                )
            }
        }
    },[items])

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffsetTable(offsetNew)
    }

    return(
            <div className="col-md-9">
                <style>
                    {`
                        .table-responsive {
                            overflow-x: unset !important;
                        }
                        .react-calendar {
                            width:100%;
                            border:none;
                        }
                        .react-calendar__tile {
                            height:100px;
                            border-right: 1px solid #a0a096 !important;
                            border-bottom: 1px solid #a0a096 !important;
                        }
                        .react-calendar__month-view__days{
                            font-size:18px;
                        }
                        .react-calendar__month-view__weekdays{
                            font-size:18px;
                        }
                        .react-calendar__navigation__label__labelText,.react-calendar__navigation__arrow{
                            font-size:20px;
                        }
                        .react-calendar__month-view__weekdays__weekday{
                            border-right: 1px solid #a0a096 !important;
                            border-bottom: 1px solid #a0a096 !important;
                            border-top: 1px solid #a0a096;
                        }
                        .react-calendar__month-view {
                            border-left: 1px solid #a0a096;
                        }
                        .react-calendar__month-view__days__day--weekend {
                            color: #000;
                        }
                        .react-calendar__month-view__days__day--neighboringMonth {
                            color: #d0d0d0;
                        }
                        .react-calendar__year-view__months{
                            border-top: 1px solid #a0a096;
                            border-left: 1px solid #a0a096;
                        }
                        .react-calendar__decade-view__years{
                            border-top: 1px solid #a0a096;
                            border-left: 1px solid #a0a096;
                        }
                        .react-calendar__century-view__decades{
                            border-top: 1px solid #a0a096;
                            border-left: 1px solid #a0a096;
                        }
                    `}
                </style>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>{props.pageName}</strong> 
                    </div>
                    <div className="panel-body">
                        <div className="clearfix">
                            <div className="pull-right">
                                <a className="pull-right btn btn-primary btn-sm tt" href={routeAdmin.calendarDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                            </div>
                        </div> 
                        <br/>
                        <Calendar
                            onChange={onChangeCalendar}
                            value={calendarValue}
                            tileContent={tileContent.bind(this)}
                            nextLabel={<i class="fa fa-arrow-right"></i>}
                            prevLabel={<i class="fa fa-arrow-left"></i>}
                        />
                        <br/>
                        <div className="table-responsive">
                            <div id="h182093w0" className="grid-view">
                                <div className="summary">Showing <b>{offsetTable+1} - {limit*(activePage-1)+currentEvent.length}</b> of <b>{currentEvent.length}</b> records.</div>
                                    <Table items={currentEvent} getDetail={getDetail}/>
                            </div> 
                            {currentEvent.length > limit ?
                                <div style={{display:"flex",justifyContent:"center"}}>
                                    <Pagination
                                    itemClass="page-item"
                                    linkClass="page-link"
                                    activePage={activePage}
                                    itemsCountPerPage={limit}
                                    totalItemsCount={currentEvent.length}
                                    pageRangeDisplayed={pageRangeDisplayed}
                                    onChange={handlePageChange.bind(this)}
                                    />
                                </div> : ''
                            }
                        </div>

                    </div>
                </div>
            </div>
    )
}

function Table(props){
    const items = props.items

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Event Time
                    </th>
                    <th>
                        Title
                    </th>
                    <th>
                        Sub Title
                    </th>
                    <th>
                        Description
                    </th>
                    <th >
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>{item.calendar_date_time}</td>
                        <td>{item.calendar_event}<br/><br/>{item.calendar_event_ind}</td>
                        <td>{item.calendar_event_subtitle}<br/><br/>{item.calendar_event_subtitle_ind}</td>
                        <td><div dangerouslySetInnerHTML={{__html: item.calendar_event_description}}/><br/><br/><div dangerouslySetInnerHTML={{__html: item.calendar_event_description_ind}}/></td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.getDetail.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a> 
                        </td>
                    </tr>
            )}   
            </tbody>
        </table>
    )
}

export default CalendarHoliday;