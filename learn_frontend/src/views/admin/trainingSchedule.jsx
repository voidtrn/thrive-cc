import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import {  env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';


const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    // const file_path = props.file_path

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Date
                    </th>
                    <th>
                        Start Time 
                    </th>
                    <th >
                        End Time
                    </th> 
                    <th >
                        End Registration
                    </th>
                    <th>
                        Schedule Confirmation
                    </th>
                    <th >
                        Capacity
                    </th>
                    <th >
                        Total Employee
                    </th>
                    <th >
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td >{item.schedule_date_indo}</td>
                        <td >{item.schedule_start_time_indo}</td>
                        <td >{item.schedule_end_time_indo}</td>
                        <td >{item.registration_end_date_indo}</td>
                        <td >
                        <span style={ item.schedule_confirmation == '1' ? {} :{  color:"#ff0707" } }>{item.schedule_confirmation == '1' ? 'Yes' :'No'}</span>    
                        </td>
                        
                        <td >{item.capacity}</td>
                        <td >{item.total_user}</td>
                        <td style={{width:"150px"}}>
                            {item.user_deleted > 0?
                                <span className='btn btn-danger btn-sm'>{"Delete in " + item.date_deleted}</span>
                            :
                                <span>
                                    <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this, item.id,'detail')}>
                                        <i className="fa fa-pencil"></i>&nbsp; Edit
                                    </a> {' '}
                                    <a className="btn btn-success btn-xs tt" onClick={props.edit.bind(this, item.id,'employee')} >
                                        <i className="fa fa-users"></i>&nbsp; Employee
                                    </a>
                                </span>
                            }
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function TrainingSchedule(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [trainingData, setTrainingData] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [editData, setEditData] = useState(false)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const file_path = env.userDocument;

    const md5IdFromURL = new URLSearchParams(props.location.search).get('uid');
    
    const pageRangeDisplayed = 10
    const limit = 10000

    const getTrainingData= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbTraining/SelectData',data);
            if(response.status === 200){
                setTrainingData(response.data.data)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[props.location.search])

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id:platform_id,
            training_id:md5IdFromURL
        };

        let isi = await axiosLibrary.postData('awbTrainingSchedule/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset, trainingData.id])

    const getData = useCallback(async () => {

        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id,
            training_id:md5IdFromURL
        };

        let isi = await axiosLibrary.postData('awbTrainingSchedule/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,getTotalPage, trainingData.id])

    useEffect(()=>{
        getTrainingData()
    },[platform_id])

    useEffect(()=>{
        getData()
    },[trainingData.id])

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const getDetail= async(param, mode)=>{
        const idParam = param;
        let ID=""
        if(mode !== ''){
            let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
            ID =responseJson.data.data; 
        }
        
        let pathname=''
        if(mode === 'detail' || mode === 'create'){
            pathname = routeAdmin.trainingScheduleDetailAdmin.path
        }
        if(mode === 'employee'){
            pathname = routeAdmin.trainingScheduleUserAdmin.path
        }
        if(mode !== 'create'){
            history.push({
                pathname: pathname,
                search: "?" + new URLSearchParams({data: ID}).toString()+"&"+ new URLSearchParams({uid:trainingData.id})// your data array of objects
            })
        }else{
            history.push({
                pathname: pathname,
                search: "?" + new URLSearchParams({uid:trainingData.id})// your data array of objects
            })
        }
        
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
                                <a className="pull-right btn btn-primary btn-sm tt" onClick={getDetail.bind(this,'','create')} ><i class="fa fa-plus aria-hidden="></i> Add new</a>  
                                </div>
                            </div>
                        </div>
                        <div className="clearfix">
                            <div className="panel-body">
                                <a className="float-right btn btn-default" href={routeAdmin.trainingAdmin.path} label="Back to overview" data-ui-loader="">
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
                                            <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+trainingData.name: 'New Data' }</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                            <div className="table-responsive">
                                                <div id="h182093w0" className="grid-view">
                                                    {/* <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div> */}
                                                        <Table items={items} file_path={file_path} loading={loading} edit={getDetail}/>
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

export default TrainingSchedule;