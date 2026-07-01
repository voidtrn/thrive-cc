import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
// import {useHistory } from 'react-router';
import axiosLibrary from '../../helpers/axiosLibrary';
import {  env, securityData } from '../../helpers/globalHelper';
// import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

// const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const file_path = props.file_path
    const totalData = props.totalData

    var sortIndex = 0

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Course ID
                    </th>
                    <th>
                        Title 
                    </th>
                    <th>
                        Description
                    </th>
                    {/* <th>
                        Status
                    </th> */}
                    <th>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.pinned_id}>
                        <td >{item.course_id}</td>
                        <td >{item.title}<br/>
                            <img  style={{width:"90px",height:"auto"}} src={file_path + 'course/' + item.course_image}  alt={item.course_image} />
                        </td>
                        <td>{item.description}</td>
                        {/* <td ><span style={ item.flag_active ? {} :{  color:"#ff0707" } }>{item.flag_active ? 'active' :'inactive'}</span></td> */}
                        <td style={{width:"150px"}}>
                            {item.flag_pinned == '1'?
                                <a className="btn btn-danger btn-xs tt" onClick={props.pinCourse.bind(this, item.course_id, 'U')} style={{marginTop:"3px"}}>
                                    <i className="fa fa-times"></i>&nbsp; un-pinned</a> 
                            :
                                <a className="btn btn-primary btn-xs tt" onClick={props.pinCourse.bind(this, item.course_id, 'P')} style={{marginTop:"3px"}}>
                                    <i className="fa fa-thumb-tack"></i>&nbsp; pinned</a> 
                            } 
                            <span hidden>{sortIndex = sortIndex + 1}</span>
                            <p style={{paddingTop:"4px"}}>
                                { (item.flag_active == 1) ? 
                                    (sortIndex > 1) ?
                                        <div style={{display : 'inline-block'}}>
                                            <a className="btn btn-warning btn-xs tt" onClick={props.moveUp.bind(this,item.pinned_id,item.sort_index)} ><i className="fa fa-arrow-up"></i></a>
                                            &nbsp;
                                        </div>                        
                                    : ''
                                : ''
                                } 
                                { (item.flag_active == 1) ? 
                                    (sortIndex < totalData) ?
                                        <a className="btn btn-warning btn-xs tt" onClick={props.moveDown.bind(this,item.pinned_id,item.sort_index)} ><i className="fa fa-arrow-down"></i></a>
                                    : ''
                                : ''
                                } 
                            </p>
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function CoursePinned(props){
    // const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const file_path = env.userDocument;
    
    const pageRangeDisplayed = 10
    const limit = 20

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbCourse/ListDataPinned',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbCourse/ListDataPinned',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset])

    useEffect(()=>{
        getData()
    },[platform_id, offset])

    useEffect(()=>{
        if (props.reloadPinned){
            getData()
            props.setReloadPinned(false)
        }
        
    },[props.reloadPinned])

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const pinCourse= async (idParam, mode) =>{
        // e.preventDefault();
        const fd = new FormData();
        
        fd.append("mode", mode);
        fd.append("course_id", idParam);
        fd.append("user_id", user_id);
        fd.append("platform_id", platform_id);
        let responseJson = await axiosLibrary.postData("awbCourse/PinUnpinCourse", fd);
        if(responseJson.status === 200){
            if (mode == 'P'){
                alert('Data has been pinned')
            }
            if (mode == 'U'){
                alert('Data has been unpinned')
            }
            getData()
            props.getDataCourse()
        }else{
            alert(responseJson);
        }
            
    }

    const moveUp = async(id,sort_index)=>{
        const param = {
            id:id,
            sort_index: sort_index,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbCourse/MoveUpPinned',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const moveDown = async(id,sort_index)=>{
        const param = {
            id:id,
            sort_index: sort_index,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbCourse/MoveDownPinned',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    return(
            
        <div className="panel-body">

            <div className="table-responsive">
                
                <div id="h182093w0" className="grid-view">
                    <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                        <Table items={items} file_path={file_path} loading={loading} totalData={totalData}
                            pinCourse={pinCourse} moveUp={moveUp} moveDown={moveDown} />
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
        </div>
             
    )
}

export default CoursePinned;