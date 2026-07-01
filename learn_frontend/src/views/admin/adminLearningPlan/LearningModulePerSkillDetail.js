import React, {  
    useEffect, 
    useState
} from 'react';
import {useHistory } from 'react-router';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { securityData } from '../../../helpers/globalHelper';
import routeAll from '../../../helpers/route';
import { 
    cssTarget, 
    LoadingAdmin 
} from '../../../components/Loading';
import { Tab, Row, Col, Nav } from 'react-bootstrap';
import Pagination from 'react-js-pagination';
import AdminDetailInput from '../../../components/adminDetailInput';

const routeAdmin = routeAll.routesAdmin

function LearningModulePerSkillDetail(props){

    const [loading, setLoading] = useState(false)
    const history = useHistory()

    const [items, setItems] = useState([])
    const [columnHtml, setColumnHtml] = useState([])
    const [editData, setEditData] = useState(false)

    const [submitData,setSubmitData]=useState(false)

    const platform_id = securityData.Security_getPlatformId()

    const [optionTypeOfContent, setOptionTypeOfContent] = useState([
    ])
    const [allContent, setAllContent] = useState([]);
    const [optionArticle, setOptionArticle] = useState([])

    const [allArticle, setAllArticle] = useState([])

    const getAllArticle = async()=>{
        const credentials = {
            platform_id:platform_id,
        }

        let result = await axiosLibrary.postData(`awbLearningModuleSkill/getAllArticle`,credentials);
        if(result.status === 200){
            setAllArticle(result.data)
        }
    }

    const getContentType = async () => {
        const credentials = {
            limit: 9999,
            offset:0,
            category:"",
            flag_active:1,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbContentType/ListData',credentials);
        if(isi.status===200){
            let typeContent = isi.data.data.map(v=>{
                return{
                    value:v.id,label:v.title
                }
            })
            setOptionTypeOfContent(typeContent)
        }
    }

    const getIdKeyBehaviorDtl = async() => {
        const data = {
            id: new URLSearchParams(props.location.search).get('data')
        }
        setItems(items=>({
            ...items, 
            platform_id:platform_id
        }))

        if(data.id!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbLearningListSkill/SelectData',data);
            setItems(items=>({
                ...items,
                skill:response.data.data.title_category, 
                id_key_behavior_dtl:response.data.data.id,
                status_active:1,
                flag_required:1
            }))
        }else{
            history.push(routeAdmin.learningSkills.path)
        }
    }

    const getTotalActive = async () => {
        var seqnumData = 0
        if(items.status_active==0){
            seqnumData = 999
        }else{
            const credentials = {
                limit: 1,
                platform_id:platform_id,
                id_key_behavior_dtl:items.id_key_behavior_dtl,
                from:'admin',
                status_active:1,
            };
    
            let isi = await axiosLibrary.postData(`awbLearningModuleSkill/ListData?page=1`,credentials);
            seqnumData = isi.data.data.total+1
        }

        setItems(items=>({
            ...items, 
            seqnum:seqnumData
        }))
    }

    const submit = async (e)=>{
        e.preventDefault()
        if(items.status_active==0){
            setItems(items=>({
                ...items, 
                seqnum:999
            }))
        }
        if(items.seqnum===999& items.status_active==1){
            getTotalActive()
        }
        setSubmitData(true)
    }

    const submitDetail = async ()=>{
        setSubmitData(false)
        setLoading(true);
        const fd = new FormData();
        Object.keys(items).forEach(key => fd.append(key, items[key]));
        let responseJson = await axiosLibrary.postData("awbLearningModuleSkill/UpdateData", fd);
        if(responseJson.status === 200){
            setItems(items=>({
                ...items, 
                type_of_content:"",
                id_article:""
            }))
            getData()
            setLoading(false);
        }else{
            alert(responseJson);
        }
    }

    const getContentFromType = async () => {
        const param = {
            // content_type_id: items.type_of_content,
            platform_id:platform_id
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbContentType/GetContentFromType',param);
        if(isi.status===200){
            setAllContent(isi.data.data)
        }
    }

    useEffect(()=>{
        if(platform_id){
            getIdKeyBehaviorDtl()
            getAllArticle()
            getContentType()
            getContentFromType()
        }
    },[])

    useEffect(()=>{
        if(items){
            ColumnHtml();
        }
        if(submitData){
            submitDetail()
        }
    },[items,submitData,editData,optionArticle,optionTypeOfContent])

    useEffect(()=>{
        if(items.type_of_content){
            setOptionArticle([])
            const listDataOptionModule = allContent.filter(v=>v.contentId==items.type_of_content).map(v=>{
                return{
                    value:v.id,label:v.title
                }
            })
            setOptionArticle(listDataOptionModule)
            setItems(state=>({...state,id_article:""}))
            // getContentFromType()
            // switch (items.type_of_content) {
            //     case 1:
            //         setOptionArticle(allArticle.dataArticle.filter(v=>v.content_type_id===1).map((v)=>{
            //             return {
            //                 value:v.id,
            //                 label:v.title
            //             }
            //         }))
            //         break;
            //     case 2:
            //         setOptionArticle(allArticle.dataWorkShop.map((v)=>{
            //             return {
            //                 value:v.id,
            //                 label:v.title
            //             }
            //         }))
            //         break;
            //     case 3:
            //         setOptionArticle(allArticle.dataCourse.map((v)=>{
            //             return {
            //                 value:v.id,
            //                 label:v.title
            //             }
            //         }))
            //         break;
            //     case 4:
            //         setOptionArticle(allArticle.dataArticle.filter(v=>v.content_type_id===4).map((v)=>{
            //             return {
            //                 value:v.id,
            //                 label:v.title
            //             }
            //         }))
            //         break;
            //     case 5:
            //         setOptionArticle(allArticle.dataEvent.map((v)=>{
            //             return {
            //                 value:v.id,
            //                 label:v.title
            //             }
            //         }))
            //         break;
            //     default:
            //         setOptionArticle(allArticle.dataArticle.map((v)=>{
            //             return {
            //                 value:v.id,
            //                 label:v.title
            //             }
            //         }))
            //         break;
            // }
        }
    },[items.type_of_content])

    const handleInputChange = (event,action) => {
        var value = ''
        var key = ''
        if(event.target){
            const target = event.target;
            value = target.type === 'checkbox' ? target.checked : target.value;
            key = target.name;
        }else{
            key = action.name
            value = event.value
        }

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;
        setItems(stateCopy)
    }

    const backTo = ()=>{
        history.push({
            pathname: routeAdmin.learningSkills.path,
            search: "?" + new URLSearchParams({page: editData ? new URLSearchParams(props.location.search).get('page'):1})// your data array of objects
        })
    }

    const ColumnHtml = ()=>{
        const columnHtml = [
            {label:'Skill', inputName:'skill', inputValue:items.skill, inputType:'text', inputWidth:'50%', inputRequired: false, inputReadOnly: true, inputSelect:[]},
            {label:'Sort Number', inputName:'seqnum', inputValue:items.seqnum, inputType:'text', inputWidth:'25%', inputRequired: true, inputReadOnly: true, inputSelect:[]},
            {label:'Type Content', inputName:'type_of_content', inputValue:items.type_of_content, inputType:'select_search', inputWidth:'25%', inputRequired: true, inputReadOnly: false, inputSelect:optionTypeOfContent, inputLoading:optionTypeOfContent.length>0?false:true},
            {label:'Module', inputName:'id_article', inputValue:items.id_article, inputType:'select_search', inputWidth:'25%', inputRequired: true, inputReadOnly: items.type_of_content?false:true, inputSelect:optionArticle, inputLoading:optionArticle.length>0?false:true},
            {label:'Status Active', inputName:'status_active', inputValue:items.status_active, inputType:'select', inputWidth:'25%', inputRequired: true, inputReadOnly: false, inputSelect:[
                {value:1, label:'active'},
                {value:0, label:'inactive'}
            ]},
            {label:'Required', inputName:'flag_required',inputValue:items.flag_required, inputType:'select', inputWidth:'25%', inputRequired: true, inputReadOnly: false, inputSelect:[
                {value:1, label:'required'},
                {value:0, label:'optional'}
            ]},
        ]
        setColumnHtml(columnHtml)
    }

    //untuk list data module
    const [dataList, setDataList] = useState([])
    const [paginate, setPaginate] = useState([])
    const [paginateActiveData, setPaginateActiveData] = useState([])
    const [activePage, setActivePage] = useState(new URLSearchParams(props.location.search).get('page') ?? 1)
    const limit = 10

    const getData = async () =>{
        setLoading(true)
        const credentials = {
            limit: limit,
            platform_id:platform_id,
            id_key_behavior_dtl:items.id_key_behavior_dtl,
            from:'admin'
        };

        let isi = await axiosLibrary.postData(`awbLearningModuleSkill/ListData?page=${activePage}`,credentials);
        setDataList(isi.data.data.data)
        setPaginate(isi.data.data)
        setLoading(false)
    }

    const getTotalActiveData = async()=>{
        const credentials = {
            limit: limit,
            platform_id:platform_id,
            id_key_behavior_dtl:items.id_key_behavior_dtl,
            from:'total',
            status_active:1
        };
        let isiActive = await axiosLibrary.postData(`awbLearningModuleSkill/ListData?page=1`,credentials);
        setPaginateActiveData(isiActive.data.data)
    }
    
    const activeInactive=async(param)=>{
        const idParam = param.id;
        if(param.status_active){
            param.status_active = 0

        }else{
            param.status_active = 1
        }
        const paramApi = {
            id:idParam,
            status_active:param.status_active,
            platform_id:platform_id,
            id_key_behavior_dtl:items.id_key_behavior_dtl,
            seqnum:999
        }
        let responseJson = await axiosLibrary.postData("awbLearningModuleSkill/UpdateData", paramApi);
        if(responseJson.status===200){
            getData()
        }
    }

    const SetRequired=async(param)=>{
        const idParam = param.id;

        let flag_required = 0
        if(event.target.checked){
            flag_required = 1
        }else{
            flag_required = 0
        }
        // alert(event.target.checked)
        const paramApi = {
            id:idParam,
            flag_required:flag_required,
            platform_id:platform_id,
            id_key_behavior_dtl:items.id_key_behavior_dtl
        }
        let responseJson = await axiosLibrary.postData("awbLearningModuleSkill/UpdateData", paramApi);
        if(responseJson.status===200){
            getData()
        }
    }

    const moveUp = async(id,sort_index,id_key_behavior_dtl)=>{
        const param = {
            id:id,
            seqnum: sort_index,
            platform_id:platform_id,
            id_key_behavior_dtl:id_key_behavior_dtl
        }
        let responseJson = await axiosLibrary.postData('awbLearningModuleSkill/MoveUp',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const moveDown = async(id,sort_index,id_key_behavior_dtl)=>{
        const param = {
            id:id,
            seqnum: sort_index,
            platform_id:platform_id,
            id_key_behavior_dtl:id_key_behavior_dtl
        }
        let responseJson = await axiosLibrary.postData('awbLearningModuleSkill/MoveDown',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    useEffect(()=>{
        if(items.id_key_behavior_dtl){
            getData()
        }

    },[items.id_key_behavior_dtl,activePage])

    useEffect(()=>{
        if(items.id_key_behavior_dtl){
            if(loading){
                getTotalActiveData()
                getTotalActive()    
            }
        }
    },[items.id_key_behavior_dtl,loading])


    //end

    return(
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong> 
            </div>
            <div className="clearfix">
                    <div className="panel-body">
                        <a className="float-right btn btn-default" onClick={()=>backTo()} label="Back to overview" data-ui-loader="">
                            <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                    </div>
                </div>
            <div className="panel-body" style={cssTarget(loading)}>
                <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                    <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                        <Row className="clearfix">
                            <Col sm={12}>
                                <Nav variant="tabs" className="tab-menu tab-header">
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Add & Edit Module': 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        {
                                            // renderColumn()
                                            <AdminDetailInput 
                                                data={columnHtml} 
                                                changeData={(e,action)=>handleInputChange(e,action)} 
                                                fileUpload={""} 
                                                filePath={""}
                                                editData={editData}
                                            />
                                        }
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>

                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Add</button>
                </form>
            </div>
            <hr/>
            <div className="panel-body">
                <div className="table-responsive">
                <div id="h182093w0" className="grid-view">
                        <div className="summary">Showing <b>{paginate.from} - {paginate.to}</b> of <b>{paginate.total}</b> records.</div>
                                <Table dataList={dataList} dataModule={allArticle} activeInactive={activeInactive} SetRequired={SetRequired}
                                    moveUp={moveUp} moveDown={moveDown} loading={loading} totalData={paginateActiveData} />
                        </div> 
                        {paginate.total > limit ?
                            <div style={{display:"flex",justifyContent:"center"}}>
                                <Pagination
                                itemClass="page-item"
                                linkClass="page-link"
                                activePage={activePage}
                                itemsCountPerPage={limit}
                                totalItemsCount={paginate.total}
                                pageRangeDisplayed={paginate.per_page}
                                onChange={(e)=>setActivePage(e)}
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
    const items = props.dataList
    const dataModule = props.dataModule
    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Title Article
                    </th>
                    <th>
                        Type Content
                    </th>
                    <th>
                        Status
                    </th>
                    <th>
                        Required
                    </th>
                    <th style={{width: '25%'}}>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item,idx) =>
                    <tr key={idx}>
                        <td>{
                                {
                                    [1]: dataModule.dataArticle.filter(v=>v.id==item.id_article).map(x=>x.title),
                                    [2]: dataModule.dataWorkShop.filter(v=>v.id==item.id_article).map(x=>x.title),
                                    [3]: dataModule.dataCourse.filter(v=>v.id==item.id_article).map(x=>x.title),
                                    [4]: dataModule.dataArticle.filter(v=>v.id==item.id_article).map(x=>x.title),
                                    [5]: dataModule.dataEvent.filter(v=>v.id==item.id_article).map(x=>x.title),
                                }[item.type_of_content]
                                || dataModule.dataArticle.filter(v=>v.id==item.id_article).map(x=>x.title)
                            }
                        </td>
                        <td>{item.type_of_content}</td>
                        <td><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'ACTIVE' :'INACTIVE'}</span></td>
                        <td style={{textAlign:'center'}}><input type="checkbox" name="no_registration_flag" value="1" 
                                checked={item.flag_required? true:false} 
                                onChange={props.SetRequired.bind(this, {id:item.id})}
                                />
                        </td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.activeInactive.bind(this,{id:item.id,status_active:item.status_active})} ><i className="fa fa-pencil"></i>&nbsp; set { item.status_active ? 'Inactive': 'Active'}</a>&nbsp;
                            <p style={{paddingTop:"4px", display:'inline-block'}}>
                            { (item.status_active == 1) ? 
                                (item.seqnum > 1) ?
                                    <div style={{display : 'inline-block'}}>
                                        <a className="btn btn-warning btn-xs tt" onClick={props.moveUp.bind(this,item.id,item.seqnum,item.id_key_behavior_dtl)} ><i className="fa fa-arrow-up"></i></a>
                                        &nbsp;
                                    </div>                        
                                : ''
                            : ''
                            } 
                            { (item.status_active == 1) ? 
                                (item.seqnum < props.totalData) ?
                                    <a className="btn btn-warning btn-xs tt" onClick={props.moveDown.bind(this,item.id,item.seqnum,item.id_key_behavior_dtl)} ><i className="fa fa-arrow-down"></i></a>
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

export default LearningModulePerSkillDetail;