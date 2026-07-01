import React, {  
    useEffect, 
    useState
} from 'react';
import { useHistory } from '../../../helpers/useHistory';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { securityData } from '../../../helpers/globalHelper';
import routeAll from '../../../helpers/route';
import { 
    cssTarget, 
    LoadingAdmin 
} from '../../../components/Loading';
import { Tab, Row, Col, Nav } from 'react-bootstrap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import TargetedPlan from './learningTargeted';

const routeAdmin = routeAll.routesAdmin

function LearningMainFocusDetail(props){
    const [loading, setLoading] = useState(true)
    const history = useHistory()
    var Columns = ""

    const [items, setItems] = useState([])
    const [directorate, setDirectorate] = useState([]);
    const [imdl, setImdl] = useState([]);
    const [columnHtml, setColumnHtml] = useState([])
    const [editData, setEditData] = useState(false)
    const [optionDimension, setOptionDimension] = useState([])
    const [submitData,setSubmitData]=useState(false)
    const [submitFrom, setSubmitFrom] = useState("nonTargeted");
    const [idFromCreate, setIdFromCreate] = useState(0);

    const animated = makeAnimated()

    const platform_id = securityData.Security_getPlatformId()

    const backTo = ()=>{
        history.push({
            pathname: routeAdmin.learningMainFocus.path,
            search: "?" + new URLSearchParams({page: editData ? new URLSearchParams(props.location.search).get('page'):1})// your data array of objects
        })
    }

    const getDetail = async() => {
        const data = {
            id: new URLSearchParams(props.location.search).get('data')
        }
        setItems(items=>({
            ...items, 
            platform_id:platform_id
        }))

        if(data.id!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbLearningMainFocus/SelectData',data);
            if(response.status === 200){
                let responseDirectorate = response.data.data2
                var responseImdl = response.data.data3
                setItems(response.data.data)
                setDirectorate(responseDirectorate)
                setImdl(responseImdl)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            getTotalActive()
            setLoading(false)
        }
    }

    const getDimension = async()=>{
        const param = {
            platform_id:platform_id
        }

        let isi = await axiosLibrary.postData(`awbLearningMainFocus/ListDataCategorylvl2`,param);
        setOptionDimension(
            isi.data.data.map(v=>{return{value:v.id,label:v.title}})
        )

    }

    const ColumnHtml = ()=>{
        const columnHtml = [
            {label:'Sort Number', inputName:'seqnum', inputValue:items.seqnum, inputType:'text', inputWidth:'25%', inputRequired: true, inputReadOnly: true, inputSelect:[]},
            {label:'Dimension', inputName:'id_category_lvl_2', inputValue:items.id_category_lvl_2, inputType:'select_search', inputWidth:'100%', inputRequired: true, inputReadOnly: editData, inputSelect:optionDimension, inputLoading:optionDimension.length>0?false:true},
            {label:'Type', inputName:'lp_type', inputValue:items.lp_type, inputType:'select', inputWidth:'25%', inputRequired: true, inputReadOnly: false, inputSelect:[
                {value:0, label:'core skills'},
                {value:1, label:'roles (function)'},
                {value:2, label:'roles (imdl)'},
                {value:3, label:'custom'},
            ]},
            {label:'Status Active', inputName:'status_active', inputValue:items.status_active, inputType:'select', inputWidth:'25%', inputRequired: true, inputReadOnly: false, inputSelect:[
                {value:1, label:'active'},
                {value:0, label:'inactive'}
            ]},
        ]
        setColumnHtml(columnHtml)
    }

    const getTotalActive = async () => {
        var seqnumData = 0
        if(items.status_active==0){
            seqnumData = 999
        }else{
            const credentials = {
                limit: 1,
                platform_id:platform_id,
                from:'admin'
            };
    
            let isi = await axiosLibrary.postData(`awbLearningMainFocus/ListData?page=1`,credentials);
            seqnumData = isi.data.data.total+1
        }

        setItems(items=>({
            ...items, 
            seqnum:seqnumData
        }))
        
    }

    const submit = async (e)=>{
        if(e){
            e.preventDefault()
        }
        if(items.status_active==0){
            setItems(items=>({
                ...items, 
                seqnum:999
            }))
        }
        setSubmitData(true)
    }

    const submitDetail = async ()=>{
        setSubmitData(false)
        const fd = new FormData();
        Object.keys(items).forEach(key => fd.append(key, items[key]));
        let responseJson = await axiosLibrary.postData("awbLearningMainFocus/UpdateData", fd);
        if(responseJson.status === 200){
            setIdFromCreate(responseJson.data.data.id)
            if(editData){
                alert("DATA HAS BEEN UPDATED");
            }else{
                alert("DATA HAS BEEN CREATED");
            }
            if(submitFrom==="nonTargeted"){
                history.push(routeAdmin.learningMainFocus.path)
            }
            
        }else{
            alert(responseJson);
        }

    }

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

    useEffect(()=>{
        if(platform_id){
            getDetail();
            getDimension();
        }
    },[Columns])

    useEffect(()=>{
        if(items){
            ColumnHtml();
        }
        if(submitData){
            submitDetail()
        }
    },[items,optionDimension,submitData,editData])

    const renderColumn = ()=>columnHtml.map((v,idx)=>
        {
            switch (v.inputType.toLowerCase()) {
                case 'textarea':
                    return(
                        <div className="mb-3 field-usereditform-email required" key={idx}>
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <textarea id={v.inputName} style={{width:v.inputWidth,height:"200px"}} className="form-control" name={v.inputName} onChange={handleInputChange.bind(this)} aria-required="true" aria-invalid="false" value={v.inputValue} required={v.inputRequired} readOnly={v.inputReadOnly}></textarea>
                            <div className="help-block"></div>
                        </div>
                    )
                case 'select':
                    return(
                        <div className="mb-3 field-profile-country" key={idx}>
                            <label className="control-label" htmlFor="profile-country">&nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <select id={v.inputName} style={{width:v.inputWidth}} className="form-control" 
                                value={v.inputValue} onChange={handleInputChange} name={v.inputName} aria-invalid="false" required={v.inputRequired} readOnly={v.inputReadOnly}>
                                {editData ? null: <option value="">... Select this ...</option> }
                                {v.inputSelect.map((x,idx_v)=><option value={x.value} key={idx_v}>{x.label}</option>)}
                            </select>

                            <div className="help-block"></div>
                        </div>
                    )
                case 'select_search':
                    return(
                        <div className="mb-3 field-usereditform-email required" key={idx}>
                            <label className="control-label"> &nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                value={v.inputSelect.filter(x=>x.value==v.inputValue)}
                                isDisabled={v.inputReadOnly}
                                onChange={(e,action)=>handleInputChange(e,action)}
                                name={v.inputName}
                                options={v.inputSelect}
                                components={animated}
                                isLoading={v.inputLoading}
                            />
                        </div>
                    )
                default:
                    return(
                        <div className="mb-3 field-usereditform-email required" key={idx}>
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <input type={v.inputType.toLowerCase()} id="usereditform-email" style={{width:v.inputWidth}} className="form-control"
                                name={v.inputName} value={v.inputValue} onChange={handleInputChange} aria-required="true" aria-invalid="false" required={v.inputRequired} readOnly={v.inputReadOnly} />
                            <div className="help-block"></div>
                        </div>
                    )
            }
        }
    )

    const submitWhenTargeted = (param) => {
        if(param){
            if(!editData){
                setSubmitFrom("targeted");
                submit()
            }
        }
    }

    return(
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong> 
                </div>
                <div className="clearfix">
                        <div className="panel-body">
                            <a className="float-end btn btn-default" onClick={()=>backTo()} label="Back to overview" data-ui-loader="">
                                <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                        </div>
                    </div>
                    <LoadingAdmin loading={loading}/> 
                <div className="panel-body" style={cssTarget(loading)}>
                        <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                            <Row className="clearfix">
                                <Col sm={12}>
                                    <Nav variant="tabs" className="tab-menu tab-header">
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.title_menu: 'New Data' }</Nav.Link>
                                        </Nav.Item>
                                        {
                                            items.lp_type && (items.lp_type==1 || items.lp_type==2)?
                                                <Nav.Item>
                                                    <Nav.Link eventKey="#tab-1">Targeted Learning Plan</Nav.Link>
                                                </Nav.Item>
                                            :
                                                null 
                                        }
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                            <form id="czfromMainFocus" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                                {
                                                    renderColumn()
                                                }
                                                
                                                <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>
                                            </form>
                                        </Tab.Pane>
                                        {
                                            items.lp_type && (items.lp_type==1 || items.lp_type==2)?
                                                <Tab.Pane eventKey="#tab-1">
                                                    <TargetedPlan data={
                                                        {id_main_focus:items.id || idFromCreate, platform_id:platform_id,lp_type:items.lp_type,listDirectorate:directorate,listImdl:imdl||[]}
                                                    } submitLearningPlan={submitWhenTargeted}/>
                                                </Tab.Pane>
                                            :
                                            null
                                        }

                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>

                </div>
            </div>
        </div>
    )
}

export default LearningMainFocusDetail;