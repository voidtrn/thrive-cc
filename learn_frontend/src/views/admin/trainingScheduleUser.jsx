import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import {  env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    // const file_path = props.file_path
    const totalData = props.totalData

    let sortIndex = 0
    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        No
                    </th>
                    <th>
                        Employee ID 
                    </th>
                    <th >
                        Account
                    </th> 
                    <th >
                        Name
                    </th>
                    <th >
                        Confirm Date
                    </th>
                    <th >
                        Attended Date
                    </th>
                    <th >
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {totalData>0?
                items.map(
                    (item) =>
                        <tr key={item.id}>
                            <span hidden>{sortIndex = sortIndex + 1}</span>
                            <td >{sortIndex}</td>
                            <td >{item.employee_id}</td>
                            <td >{item.account}</td>
                            <td >{item.name}</td>
                            <td >{item.date_rsvp != null? item.date_rsvp: '-'}</td>
                            <td >{item.date_attended != null? item.date_attended: '-'}</td>
                            <td style={{width:"250px"}}>
                                <span>
                                    <a className="btn btn-danger btn-xs tt" onClick={props.deleteEmployee.bind(this, item.id)}>
                                        <i className="fa fa-trash"></i>&nbsp; Delete
                                    </a> {' '}
                                    <a className="btn btn-warning btn-xs tt"  onClick={props.showModal.bind(this,item.id, item.employee_id, item.name)}>
                                        <i className="fa fa-trash"></i>&nbsp; Move To
                                    </a>
                                </span>
                            </td>
                        </tr>
                )
            :
                <tr><th colspan='7' style={{textAlign:'center'}}>No Data</th></tr>
            }   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function TrainingScheduleUser(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [scheduleData, setScheduleData] = useState([])
    const [listAvailSchedule, setListAvailSchedule] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const file_path = env.userDocument;

    const [showModalState, setShowModalState] = useState(false)
    const [employeeIdModal, setEmployeeIdModal] = useState('')
    const [employeeNameModal, setEmployeeNameModal] = useState('')
    const [userScheduleIdModal, setUserScheduleIdModal] = useState('')
    
    const pageRangeDisplayed = 10
    const limit = 10000

    const getScheduleData= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            let response = await axiosLibrary.postData('awbTrainingSchedule/SelectData',data);
            if(response.status === 200){
                setScheduleData(response.data.data)
                listAvailableSchedule(response.data.data.id)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[props.location.search])

    const listAvailableSchedule = useCallback(async (schedule_id) => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id,
            training_id:new URLSearchParams(props.location.search).get('uid'),
            schedule_id:schedule_id
        };

        let isi = await axiosLibrary.postData('awbTrainingSchedule/ListData',credentials);
        let filteredList = isi.data.data.filter(
            x =>
            (x.date_deleted == null)
            )
        setListAvailSchedule(filteredList)
    },[scheduleData.id])

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id:platform_id,
            awb_training_schedule_id:new URLSearchParams(props.location.search).get('data')
        };

        let isi = await axiosLibrary.postData('awbTraining/ListDataScheduleUser',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id,
            awb_training_schedule_id:new URLSearchParams(props.location.search).get('data')
        };

        let isi = await axiosLibrary.postData('awbTraining/ListDataScheduleUser',credentials);
        setItems(isi.data.data)
        getTotalPage()
        getScheduleData()
    },[offset,getTotalPage])

    useEffect(()=>{
        getData()
    },[platform_id])

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const importExcel= async()=>{
        let md5ScheduleId = new URLSearchParams(props.location.search).get('data')
        let trainingId= new URLSearchParams(props.location.search).get('uid')
        history.push({
            pathname: routeAdmin.trainingUserExcel.path,
            search: "?" + new URLSearchParams({data:md5ScheduleId}) +'&'+new URLSearchParams({uid:trainingId})// your data array of objects
        })
        
    }

    const deleteEmployee = useCallback(async (param) => {
        setLoading(true)
        const parameter = {
            id:param
        };
        let responseJson = await axiosLibrary.postData("awbTraining/deleteEmployee", parameter);
        if(responseJson.status === 200){
            if (responseJson.data.data){
                alert("Employee has been deleted");
                getData()
            }else{
                alert("Employee cannot be deleted");
            }
        }else{
            alert(responseJson);
        }
    })
    
    const backToOverview= async()=>{
        const idParam = new URLSearchParams(props.location.search).get('uid')
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.trainingScheduleAdmin.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+ new URLSearchParams({uid:idParam})// your data array of objects
        })
    }

    const moveEmployee = useCallback(async (id, scheduleId) => {
        setShowModalState(false)
        setLoading(true)
        const parameter = {
            id:id,
            schedule_id:scheduleId
        };
        let responseJson = await axiosLibrary.postData("awbTraining/moveEmployee", parameter);
        if(responseJson.status === 200){
            if (responseJson.data.data){
                alert("Employee has been moved");
                getData()
            }else{
                alert("Employee cannot be moved");
                setLoading(false)
            }
        }else{
            alert(responseJson);
            setLoading(false)
        }
    })

    const showModal = (userScheduleId, employeeId, employeeName)=>{
        setUserScheduleIdModal(userScheduleId)
        setEmployeeIdModal(employeeId)
        setEmployeeNameModal(employeeName)
        setShowModalState(true)
    }

    return(
        <>
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div className="row">
                            <div className="col-md-8">
                                <strong>{props.pageName}</strong> 
                            </div>
                            <div className="col-md-4">
                                <div className="pull-right">  
                                <a className="pull-right btn btn-success btn-sm tt" onClick={importExcel.bind(this)} ><i class="fa fa-file-excel-o aria-hidden"></i>&nbsp; New from Excel</a>  
                                </div>
                            </div>
                        </div>
                        <div className="clearfix">
                            <div className="panel-body">
                                <a className="float-end btn btn-default" onClick={backToOverview.bind(this)} label="Back to overview" data-ui-loader="">
                                    <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                            </div>
                        </div>
                    </div>
                    <LoadingAdmin loading={loading}/> 
                    <div className="panel-body" style={cssTarget(loading)}>
                        <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                            <Row className="clearfix">
                                <Col sm={12}>
                                    <Nav variant="tabs" className="tab-menu tab-header">
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-0">
                                                {scheduleData.training_name +': '+scheduleData.schedule_date+' '+scheduleData.schedule_start_time+' - '+scheduleData.schedule_end_time }
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                            <div className="table-responsive">
                                                <div id="h182093w0" className="grid-view">
                                                    {/* <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div> */}
                                                        <Table items={items} file_path={file_path} loading={loading} totalData={totalData} showModal={showModal} deleteEmployee={deleteEmployee}/>
                                                </div> 
                                                {totalData > limit ?
                                                    <div style={{display:"flex",justifyContent:"center"}}>
                                                        <Pagination
                                                        itemClass="page-item"
                                                        linkClass="page-link"
                                                        activePage={activePage}
                                                        itemsCountPerPage={limit}
                                                        totalItemsCount={totalData}
                                                        pageRangeDisplayed={pageRangeDisplayed}
                                                        onChange={handlePageChange.bind(this)}
                                                        />
                                                    </div>   
                                                :''
                                                }
                                            </div>

                                            <Modal show={showModalState}
                                                animation={true}
                                                onHide={()=>setShowModalState(false)}
                                                onExited={()=>setShowModalState(false)}
                                                >
                                                <Modal.Header closeButton style={{justifyContent:'center', padding:"0px"}}>
                                                    
                                                </Modal.Header>
                                                <Modal.Body style={{padding:" 10px 50px"}}>
                                                    <center>
                                                        <h4 className="modal-title" id="employeeName">{employeeIdModal + ' - '+employeeNameModal}</h4>
                                                        <h4 className="modal-title">Move to Schedule</h4>
                                                        <br/>
                                                        {listAvailSchedule.map(
                                                            (availSchedule) =>
                                                            <div key={availSchedule.id}>
                                                                <a className="btn btn-success tt"  onClick={moveEmployee.bind(this,userScheduleIdModal, availSchedule.id)} >
                                                                    <i className="fa fa-calendar"></i>&nbsp; 
                                                                    {availSchedule.schedule_date+' | '+availSchedule.schedule_start_time_indo+' - '+availSchedule.schedule_end_time_indo}
                                                                    
                                                                </a>
                                                                <br/>
                                                                <br/>
                                                            </div>
                                                        )}  
                                                            
                                                    </center>
                                                </Modal.Body>
                                            </Modal>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TrainingScheduleUser;