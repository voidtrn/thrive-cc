import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
import { Col, Nav, Row, Tab } from 'react-bootstrap';
import AdminDetailInput from '../../components/adminDetailInput';
import defaultLang from '../../helpers/lang';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const file_path = props.file_path
    const showSorting = false

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Level
                    </th>
                    <th>
                        Title
                    </th>
                    <th>
                        image
                    </th>
                    <th>
                        how to get there
                    </th>
                    <th>
                        privilege
                    </th>
                    <th>
                        Bonus Points
                    </th>
                    <th>
                        Status
                    </th>
                    <th>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td style={{ width:"50px" }}>{item.seqnum}</td>
                        <td style={{ width:"20%" }}>{item.title}</td>
                        <td><img  style={{width:"90px",height:"auto"}} src={file_path + 'level/' + item.level_image} alt={item.level_image} /></td>
                        <td><div dangerouslySetInnerHTML={{__html: item.descr_how_to_get_there}}/></td>
                        <td><div dangerouslySetInnerHTML={{__html: item.descr_your_previlege}}/></td>
                        <td>{item.bonus_point}</td>
                        <td style={{width:"100px"}}><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'active' :'inactive'}</span></td>
                        <td>
                            <a className="btn btn-primary btn-xs tt m-1" onClick={props.edit.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a>
                            {/* <a className="btn btn-danger btn-xs tt m-1"  onClick={props.deleteItem.bind(this,item.id)} ><i className="fa fa-times"></i>&nbsp; delete</a><br/> */}
                            {showSorting &&
                                <p style={{paddingTop:"4px", display:'inline-block'}}>
                                    { (item.status_active == 1) ? 
                                        (item.seqnum > 1) ?
                                            <div style={{display : 'inline-block'}}>
                                                <a className="btn btn-warning btn-xs tt m-1" onClick={props.moveUp.bind(this,item.id,item.seqnum)} ><i className="fa fa-arrow-up"></i></a>
                                                &nbsp;
                                            </div>                        
                                        : ''
                                    : ''
                                    } 
                                    { (item.status_active == 1) ? 
                                        (item.seqnum < props.totalData) ?
                                            <a className="btn btn-warning btn-xs tt m-1" onClick={props.moveDown.bind(this,item.id,item.seqnum)} ><i className="fa fa-arrow-down"></i></a>
                                        : ''
                                    : ''
                                    } 
                                </p>  
                            }
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function UserLevel(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    
    const pageRangeDisplayed = 10
    const limit = 5
    const file_path = env.userDocument

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbUserLevel/ListData',credentials);
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

        let isi = await axiosLibrary.postData('awbUserLevel/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,getTotalPage])

    const moveUp = async(id,seqnum)=>{
        const param = {
            id:id,
            seqnum: seqnum,
            platform_id:platform_id,
        }
        let responseJson = await axiosLibrary.postData('awbUserLevel/MoveUp',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const moveDown = async(id,seqnum)=>{
        const param = {
            id:id,
            seqnum: seqnum,
            platform_id:platform_id,
        }
        let responseJson = await axiosLibrary.postData('awbUserLevel/MoveDown',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const deleteItem = async(id)=>{
        const param = {
            id:id,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbUserLevel/DeleteData',param);
        if(responseJson.status===200){
            alert('Data has been deleted')
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    useEffect(()=>{
        getData()
    },[getData])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.userLevelDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()// your data array of objects
        })
    }

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    //enhancement reset level
    const [stateResetLevel, setStateResetLevel] = useState({
        platform_id:platform_id
    });
    const [listLevel, setListLevel] = useState([]);
    const [columnHtml, setColumnHtml] = useState([]);
    const [submitData, setSubmitData] = useState(false);

    useEffect(()=>{
        if(platform_id){
            ColumnHtml();
        }
    },[platform_id,listLevel,stateResetLevel])

    useEffect(()=>{
        if(platform_id){
            if(items){
                mappingListLevel()
            }
        }
    },[platform_id,items,])

    const handleInputChange = (event,action) => {
        var value = ''
        var key = ''
        if(event.target){
            const target = event.target;
            value = target.type === 'checkbox' ? target.checked : target.value;
            key = target.name;
        }else{
            key = action.name
            value = event.value || event
        }

        var stateCopy = Object.assign({}, stateResetLevel);
        stateCopy[key] = value;
        setStateResetLevel(stateCopy)
    }

    const mappingListLevel = () =>{
        let allList = [
            {value:"",label:"Select..."}
        ]
        const list = items.map((v)=>{
            return {
                    value : v.seqnum,
                    label : `(${v.seqnum}) ${v.title}`
            }
        });
        allList = [...allList,...list]
        setListLevel(allList)
    }

    const ColumnHtml =()=>{
        const columnHtml = [
            {label:'Reset level from', inputName:'from_level', inputValue:stateResetLevel.from_level, inputType:'select', inputWidth:'25%', inputRequired: true, inputReadOnly: false, inputSelect:listLevel},
            {label:'Reset level to', inputName:'to_level', inputValue:stateResetLevel.to_level||"", inputType:'select', inputWidth:'25%', inputRequired: true, inputReadOnly: stateResetLevel.from_level?false:true, inputSelect:listLevel.slice(0,-1).filter(v=>v.value < stateResetLevel.from_level)},
        ]
        setColumnHtml(columnHtml)
    }
    
    const submit = async (e) =>{
        e.preventDefault()
        if(stateResetLevel.to_level > stateResetLevel.from_level){
            alert(defaultLang.lang.errorResetToBiggerThanFrom);
        }else{
            setSubmitData(true)
            const fd = new FormData();
            Object.keys(stateResetLevel).map(key =>
                {
                    if(stateResetLevel[key]){
                        fd.append(key,stateResetLevel[key])
                    }
                }
            )
            let responseJson = await axiosLibrary.postData("awbUserLevel/UpdateLevel", fd);
            if(responseJson.status === 200){
                alert("RESET SUCCESS");
                setSubmitData(false)
                history.push(routeAdmin.userLevel.path)
            }else{
                alert(responseJson);
                setSubmitData(false)
            }
        }
    }

    //end enhancement reset level

    return(
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>{props.pageName}</strong> 
                    </div>
                    <div className="panel-body">
                        <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                            <Row className="clearfix">
                                <Col sm={12}>
                                    <Nav variant="tabs" className="tab-menu tab-header">
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-0">List Level</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-1">Reset Level</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                            <div className="table-responsive">
                                                {/* <div className="float-end">
                                                    <a className="float-end btn btn-primary btn-sm tt" href={routeAdmin.platformDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                                                </div> */}

                                                <div id="h182093w0" className="grid-view">
                                                    <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                                        <Table items={items} edit={getDetail} moveUp={moveUp} moveDown={moveDown} deleteItem={deleteItem} totalData={totalData} loading={loading} file_path={file_path}/>
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
                                        <Tab.Pane eventKey="#tab-1">
                                            <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                                <div className="table-responsive">
                                                        <AdminDetailInput 
                                                            data={columnHtml} 
                                                            changeData={(e,action)=>handleInputChange(e,action)} 
                                                            fileUpload={""} 
                                                            filePath={""}
                                                            editData={true}
                                                        />
                                                </div>
                                                <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">{submitData?`Please Wait`:`RESET`}</button>
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

export default UserLevel;