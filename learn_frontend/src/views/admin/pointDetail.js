import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function PointDetail(props){
    
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [items, setItems] = useState([])
    const [pointHistoryList, setPointHistoryList] = useState([])
    // const [streakLoginList, setStreakLoginList] = useState([])
    const [contentLevelList, setContentLevelList] = useState([])

    const [editData, setEditData] = useState(false)
    const [loading, setLoading] = useState(true)

    const [adjustDirection, setAdjustDirection] = useState('add')
    const [addPoint, setAddPoint] = useState(0)
    const [adjustNotes, setAdjustNotes] = useState('')
    const [contentTitle, setContentTitle] = useState('')
    const [contentDate, setContentDate] = useState(null)
    const [contentDescription, setContentDescription] = useState('')


    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    // const user_account = securityData.Security_UserAccount()

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            const param = {
                md5ID: data.md5ID,
                platform_id:securityData.Security_getPlatformId()
            }
            let response = await axiosLibrary.postData('awbUser/SelectData',param);
            if(response.status === 200){
                setItems(response.data.data)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[props.location.search])

    const getPointHistory= useCallback(async() =>{
        const data = {
            md5UserID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbUser/ListPointHistory',data);
            if(response.status === 200){
                setPointHistoryList(response.data.data)
            }else{
                alert(response);
                
            }
        }
    },[props.location.search])

    // const getStreakLogin= useCallback(async() =>{
    //     const data = {
    //         md5UserID: new URLSearchParams(props.location.search).get('data')
    //     }
    //     if(data.md5ID!== null){
    //         setEditData(true)
    //         let response = await axiosLibrary.postData('awbUser/ListStreakLogin',data);
    //         if(response.status === 200){
    //             setStreakLoginList(response.data.data)
    //         }else{
    //             alert(response);
    //         }
    //     }
    // },[props.location.search])

    const getContentLevel= useCallback(async() =>{
        const data = {
            md5UserID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbUser/ListContentLevel',data);
            if(response.status === 200){
                setContentLevelList(response.data.data)
                
            }else{
                alert(response);
                
            }
        }
    },[props.location.search])

    const submitAdjustPoint= async (e) =>{
        setLoading(true)
        e.preventDefault();
        const fd = new FormData();

        fd.append("user_id", items.id);
        fd.append("point_add", addPoint);
        fd.append("notes", adjustNotes);
        fd.append("operator", adjustDirection);

        fd.append("user_modified", user_id);
        fd.append("platform_id", platform_id);

        //for edit data
        let responseJson = await axiosLibrary.postData("awbUser/AdjustPoint", fd);
        if(responseJson.status === 200){
            alert("Point has been adjusted");
           
            getDetail()
            getPointHistory()
            resetAdjustInput()
        }else{
            alert(responseJson);
        }
        setLoading(false)
            
    }

    const validateContentSubmission = (e) => {
        e.preventDefault();
        if(contentTitle==''){
            alert("Title cannot be empty");
        }else{
            if(contentDate == null || contentDate == ''){
                alert("Date cannot be empty")
            }else{
                if(contentDescription === ''){
                    alert("Description cannot be empty")
                }else{
                    submitContent()
                }
            }
        }
    }

    const submitContent= async () =>{
        
        const fd = new FormData();

        fd.append("user_id", items.id);
        fd.append("content_title",contentTitle);
        fd.append("content_date", contentDate);
        fd.append("contentDescription", contentDescription);
        
        fd.append("user_created", user_id);
        fd.append("user_modified", user_id);
        fd.append("platform_id", platform_id);

        
        let responseJson = await axiosLibrary.postData("awbUser/InsertUserContent", fd);
        if(responseJson.status === 200){
            alert("User Content has been submitted");
            getContentLevel()
            resetUserContentFrm()
        }else{
            alert(responseJson);
        }
            
    }

    const resetAdjustInput = () => {
        setAdjustDirection('add')
        setAddPoint(0)
        setAdjustNotes('')
    }

    const resetUserContentFrm = () => {
        setContentTitle('')
        setContentDate('')
        setContentDescription('')
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;

        setItems(stateCopy)
    }

    useEffect(()=>{
        getDetail()
        getPointHistory()
        // getStreakLogin()
        getContentLevel()
    },[Columns])

    return( 
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>  
                </div>
                <div className="clearfix">
                    <div className="panel-body">
                        <a className="float-right btn btn-default" href={routeAdmin.users.path} label="Back to overview" data-ui-loader="">
                            <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                    </div>
                </div>
                <LoadingAdmin loading={loading}/> 
                <div className="panel-body" style={cssTarget(loading)}>
                {/* <div className="panel-body"> */}                   
                    <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                        <Row className="clearfix">
                            <Col sm={12}>
                                <Nav variant="tabs" className="tab-menu tab-header">
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-0">Account</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-1">History</Nav.Link>
                                    </Nav.Item>
                                    {/* <Nav.Item>
                                        <Nav.Link eventKey="#tab-2">Streak Login</Nav.Link>
                                    </Nav.Item> */}
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-3">Submitted Content</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <div className="form-group field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;IMDL ID </label>
                                            <input type="text" id="usereditform-username" style={{width:"45%"}} className="form-control" maxLength="50"
                                                disabled= {editData ? true: false}
                                                name="id" value={items.id} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Account </label>
                                            <input type="text" id="usereditform-username" style={{width:"45%"}} className="form-control" maxLength="50"
                                                disabled={items.flag_temporary===0? true: false} required={items.flag_temporary!==0?true:false}
                                                name="account" value={items.account} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Email </label>
                                            <input type="text" id="usereditform-username" style={{width:"75%"}} className="form-control" maxLength="250"
                                                disabled={items.flag_temporary===0? true: false} required={items.flag_temporary!==0?true:false}
                                                name="email" value={items.email} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Status Active </label>
                                            <input type="text" id="usereditform-username" style={{width:"75%"}} className="form-control" disabled maxLength="2"
                                                name="status_active" value={items.status_active===1?'active':'inactive'} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-username required">
                                            <label className="control-label" style={{display: "block"}} forHtml="usereditform-username">Current Redeem Points, Level Points & Level</label>
                                            <input type="text" id="usereditform-username" style={{width:"20%",display:"inline-table",textAlign:"right"}} className="form-control" 
                                                name="id" placeholder="redeem points" value={items.redeem_point? items.redeem_point:'0'} disabled aria-required="true" aria-invalid="false" maxLength="50" />{' '}
                                            <input type="text" id="usereditform-username" style={{width:"20%",display:"inline-table",textAlign:"right"}} className="form-control" name="id" 
                                                placeholder="tier points" value={items.tier_point? items.tier_point : '0'} disabled aria-required="true" aria-invalid="false" maxLength="50" />{' '}
                                            <input type="text" id="usereditform-username" style={{width:"40%",display:"inline-table"}} className="form-control" name="id" 
                                                placeholder="user level" value={items.user_level? items.user_level: ''} disabled aria-required="true" aria-invalid="false" maxLength="50" />
                                            <div className="help-block"></div>
                                        </div>
                                        <hr/>
                                        <h4>Point Adjustment</h4>
                                        <form id="adjustPointFrm" onSubmit={submitAdjustPoint} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                            <div className="form-group usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Adjustment Type </label>
                                                <select id="adjustDirection" name="adjustDirection" className="form-control" value={adjustDirection}
                                                    onChange={e => {setAdjustDirection(e.target.value);}} style={{width:"100px",position:"relative",top:"2px"}}>
                                                    <option value="add">add</option>
                                                    <option value="substract">substract</option>
                                                </select>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Point </label>
                                                <input type="number" id="addPoint" name="addPoint" className="form-control" maxLength="5" value={addPoint}
                                                    onChange={e => {setAddPoint(e.target.value);}} style={{width:"70px",position:"relative",top:"2px"}} />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Notes </label>
                                                <input type="text" id="adjustNotes" name="adjustNotes" className="form-control" maxLength="200" value={adjustNotes}
                                                    onChange={e => {setAdjustNotes(e.target.value);}} style={{width:"45%"}} placeholder="point adjustment notes" aria-required="true" aria-invalid="false"/>
                                                <div className="help-block"></div>
                                            </div>

                                            <button type="submit" className="btn btn-primary" name="btnSubmit" value="adjust">Adjust</button>&nbsp;
                                            
                                        </form>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="#tab-1">
                                        <PointHistoryTable pointHistoryList={pointHistoryList} loading={loading} />
                                    </Tab.Pane>
                                    {/* <Tab.Pane eventKey="#tab-2">
                                        <StreakLoginTable streakLoginList={streakLoginList} loading={loading} />
                                    </Tab.Pane> */}
                                    <Tab.Pane eventKey="#tab-3">
                                        <ContentLevelTable contentLevelList={contentLevelList} loading={loading} />
                                        <hr style={{border:"1px dashed #ededed"}} />
                                        <form id="submitContentFrm" onSubmit={validateContentSubmission} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                            <div className="form-group usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Title </label>
                                                <input type="text" id="contentTitle" name="contentTitle" className="form-control" maxLength="200" value={contentTitle}
                                                    onChange={e => {setContentTitle(e.target.value);}} style={{width:"80%"}} placeholder="content title" aria-required="true" aria-invalid="false"/>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Date <span style={{color:"#ff0404"}}>(*)</span> </label>
                                                <input type="date" id="contentDate" name="contentDate" className="form-control datepicker" value={contentDate}
                                                    onChange={e => {setContentDate(e.target.value);}} style={{width:"150px"}} placeholder="date"/>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Description </label>
                                                <textarea type="text" id="contentDescription" maxLength="500" style={{width:"75%",height:"100px"}} className="form-control" 
                                                    name="contentDescription" placeholder="content description" aria-required="true" aria-invalid="false" value={contentDescription}
                                                    onChange={e => {setContentDescription(e.target.value);}}></textarea>   
                                                <div className="help-block"></div>
                                            </div>

                                            <button type="submit" className="btn btn-primary" name="btnSubmitContent" value="submitContent">Submit</button>&nbsp;
                                            
                                        </form>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>                
                </div>
            </div>
        </div>
    )
}

function PointHistoryTable(props){
    const items = props.pointHistoryList

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th >
                        Id
                    </th>
                    <th>
                        Date
                    </th>
                    <th>
                        Point
                    </th>
                    <th>
                        Source
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td >{item.id}</td>
                        <td >{item.status_date}</td>
                        <td >{item.point}</td>
                        <td >{item.source}</td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

// function StreakLoginTable(props){
//     const items = props.streakLoginList

//     return(
//         <table className="table table-hover">
//             <thead>
//                 <tr>
//                     <th style={{textAlign:"center"}}>
//                         Index
//                     </th>
//                     <th style={{textAlign:"center"}}>
//                         Login Date
//                     </th>
//                     <th style={{textAlign:"center"}}>
//                         Current Level
//                     </th>
//                     <th style={{textAlign:"center"}}>
//                         Target Level
//                     </th>
//                 </tr>
//             </thead>
//             <tbody style={cssTarget(props.loading)}>

//             {items.map(
//                 (item) =>
//                     <tr key={item.id}>
//                         <td style={{textAlign:"center"}}>{item.login_index}</td>
//                         <td style={{textAlign:"center"}}>{item.date_login}</td>
//                         <td style={{textAlign:"center"}}>{item.current_level}</td>
//                         <td style={{textAlign:"center"}}>{item.target_level}</td>
//                     </tr>
//             )}   
//             </tbody>
//             <LoadingAdmin loading={props.loading}/> 
//         </table>
//     )
// }

function ContentLevelTable(props){
    const items = props.contentLevelList

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th style={{textAlign:"center"}}>
                        No
                    </th>
                    <th style={{textAlign:"center"}}>
                        Title
                    </th>
                    <th style={{textAlign:"center"}}>
                        Date
                    </th>
                    <th style={{textAlign:"center"}}>
                        Description
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td style={{textAlign:"center",width:"50px"}}>{item.contentNo}</td>
                        <td style={{textAlign:"center",width:"150px"}}>{item.content_title}</td>
                        <td style={{textAlign:"center",width:"150px"}}>{item.content_date}</td>
                        <td style={{textAlign:"center"}}>{item.content_description}</td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

export default PointDetail;