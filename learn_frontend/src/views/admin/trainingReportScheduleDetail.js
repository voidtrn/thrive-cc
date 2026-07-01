import React, { useEffect, useState} from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
// import GlobalState from '../../helpers/globalState';
//import ReactHTMLTableToExcel from 'react-html-table-to-excel';

function Table(props){
    const scheduleList = props.scheduleList
    const userList = props.userList

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th >
                        Date
                    </th>
                    <th >
                        Start Time
                    </th>
                    <th >
                        End Time
                    </th> 
                    <th >
                        End Registration
                    </th>
                    <th >
                        Capacity
                    </th>
                    <th >
                        Total Employee
                    </th>
                </tr>
            </thead>
            {scheduleList.length > 0?
                scheduleList.map(
                    (schedule) =>
                    <>
                        <tr key={schedule.id} style={{backgroundColor:"#ddd",color:"#000"}}>
                            <td>{schedule.schedule_date_indo}</td>
                            <td>{schedule.schedule_start_time_indo}</td>
                            <td>{schedule.schedule_end_time_indo}</td>
                            <td>{schedule.registration_end_date_indo}</td>
                            <td>{schedule.capacity}</td>
                            <td>{schedule.total_user}</td>
                        </tr>
                        <UserRow userList={userList} scheduleId={schedule.id} />
                    </>
                )  
            :
                <tr><th colspan='7' style={{textAlign:'center'}}>No Data</th></tr>    
            }
        </table>
    )
}

function UserRow(props){
    const scheduleId = props.scheduleId
    let userList = []
    for (let i=0; i < props.userList.length; i++){
        if (props.userList[i].length > 0){
            if(props.userList[i][0].awb_training_schedule_id == scheduleId){
                userList = props.userList[i]
            }
        }
    }

    return(
        <>
            <tr>
                <th >
                    Employee Id
                </th>
                <th colspan='2'>
                    Account Name
                </th>
                <th >
                    Name
                </th> 
                <th >
                    Registration Date
                </th>
                <th >
                    Attended Date
                </th>
            </tr>
            {userList.map(
                (user) =>
                    <tr key={user.id} >
                        <td>{user.employee_id}</td>
                        <td colspan="2">{user.account}</td>
                        <td>{user.name}</td>
                        <td>{user.date_rsvp? user.date_rsvp:'-'}</td>
                        <td>{user.date_attended? user.date_attended:'-'}</td>
                    </tr>
                )  
            }
        </>
    )
}

function TrainingReportScheduleDetail(props){

    const [trainingData, setTrainingData] = useState([])
    const [scheduleList, setScheduleList] = useState([])
    const [userList, setUserList] = useState([])
    const [totalUser, setTotalUser] = useState([])
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const [htmlTable, setHtmlTable] = useState('')
    const [excelFileName, setExcelFileName] = useState('')

    const getData = async () => {
        setLoading(true)
        const credentials = {
            schedule_id:props.scheduleID,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbTrainingReport/ScheduleDetail',credentials);
        setTrainingData(isi.data.data1)
        setScheduleList(isi.data.data2)
        setUserList(isi.data.data3)
        setTotalUser(isi.data.data4)
        // setTotalSchedule(isi.data.data5)
        excelHtml()
        setLoading(false)
    }

    useEffect(()=>{
        if(props.scheduleDetail){
            getData()
        }
    },[props.scheduleID, props.scheduleDetail])

    const excelHtml = async () => {
        
        const credentials = {
            schedule_id:props.scheduleID,
            platform_id:platform_id
        };

        let response = await axiosLibrary.postData('awbTrainingReport/ExportDataSchedule',credentials);
        if(response.status === 200){
           setHtmlTable(response.data.data1)
           setExcelFileName(response.data.data2.replace(/\..+$/, ''))
        }else{
            alert(response)
        }

    }

    const handleExport = async (e) => {
        e.preventDefault();
        const param = {
            schedule_id:props.scheduleID,
            platform_id:platform_id
        }
    
        let response = await axiosLibrary.postDataFile("awbTrainingReport/ScheduleDetailExport", param);
        if(response.status === 200){            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Training - '+trainingData.name+'.xlsx');
            document.body.appendChild(link);
            link.click();
        }else{
            alert(response);
        }   
    }
    
    return(
        <>
            <style>
                {
                    `
                    #export-excel:before{
                        content: '\\f1c3';
                        font-family: 'FontAwesome';
                    }
                    `
                }
            </style>
            <LoadingAdmin loading={loading}/> 
            <div className="panel-body" style={cssTarget(loading)}>
                {/* <form id="search-form" onSubmit={exportToExcel} method="post" style={{display: "block"}} encType='multipart/form-data' > */}
                    <div className="form-group field-usereditform-email required">
                        <label className="control-label" style={{textDecoration:"underline"}} forHtml="usereditform-email">
                            {trainingData.name}
                        </label>
                    </div>
                    <div className="form-group field-usereditform-email required">
                        <span className="btn btn-success"  title="Total Employee">
                            <i className="fa fa-users" ></i> 
                            &nbsp;{totalUser}
                        </span> 
                    </div>
                    {/* <ReactHTMLTableToExcel
                        id="export-excel"
                        className="btn btn-warning "
                        table="schedule"
                        filename={excelFileName}
                        sheet={excelFileName}
                        buttonText="&nbsp; Export to Excel" /> */}
                
                <div hidden dangerouslySetInnerHTML={{__html: htmlTable}}></div>
                

                <div className="table-responsive" >
                    

                <button onClick={handleExport} type="reset" className="btn btn-primary btn-sm" ><i className="fa fa-file-excel-o"></i>&nbsp;Export XLSX</button>
                    <div id="h182093w0" className="grid-view">
                        {/* <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div> */}
                            <Table scheduleList={scheduleList} userList={userList} />
                    </div> 
                    
                </div>
                
            </div>   
        </>                                
    )
}

export default TrainingReportScheduleDetail;