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

const routeAdmin = routeAll.routesAdmin

function LearningKeyBehaviorDetail(props){
    const [loading, setLoading] = useState(true)
    const history = useHistory()

    const [items, setItems] = useState([])
    const [columnHtml, setColumnHtml] = useState([])
    const [editData, setEditData] = useState(false)

    const [submitData,setSubmitData]=useState(false)

    const animated = makeAnimated()

    const platform_id = securityData.Security_getPlatformId()

    const [mainFocusData, setMainFocusData] = useState([])

    const backTo = ()=>{
        history.push({
            pathname: routeAdmin.learningKeyBehavior.path,
            search: "?" + new URLSearchParams({page: editData ? new URLSearchParams(props.location.search).get('page'):1})// your data array of objects
        })
    }

    const getMainFocusData = async ()=>{
        const credentials = {
            platform_id:platform_id
        };
        let isi = await axiosLibrary.postData('awbLearningMainFocus/ListData',credentials);
        if(isi.status === 200){
            setMainFocusData(isi.data.data.map(v=>{return{value:v.id,label:v.title_menu}}))
        }
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
            let response = await axiosLibrary.postData('awbLearningKeyBehavior/SelectData',data);
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
    }

    const ColumnHtml = ()=>{
        const columnHtml = [
            {label:'Main Focus', inputName:'id_main_focus', inputValue:items.id_main_focus, inputType:'select_search', inputWidth:'100%', inputRequired: true, inputReadOnly: editData, inputSelect:mainFocusData, inputLoading:mainFocusData.length>0?false:true},
            {label:'Sort Number', inputName:'seqnum', inputValue:items.seqnum, inputType:'text', inputWidth:'25%', inputRequired: true, inputReadOnly: true, inputSelect:[]},
            {label:'Title Eng', inputName:'title_eng', inputValue:items.title_eng, inputType:'text', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'Title Ind', inputName:'title_ind', inputValue:items.title_ind, inputType:'text', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputSelect:[]},
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
                id_main_focus:items.id_main_focus,
                from:'admin',
                status_active:1,
            };
    
            let isi = await axiosLibrary.postData(`awbLearningKeyBehavior/ListData?page=1`,credentials);
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
        const fd = new FormData();
        Object.keys(items).forEach(key => fd.append(key, items[key]));
        let responseJson = await axiosLibrary.postData("awbLearningKeyBehavior/UpdateData", fd);
        if(responseJson.status === 200){
            if(editData){
                alert("DATA HAS BEEN UPDATED");
            }else{
                alert("DATA HAS BEEN CREATED");
            }
            history.push(routeAdmin.learningKeyBehavior.path)
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
            getMainFocusData();
        }
    },[])

    useEffect(()=>{
        if(items){
            ColumnHtml();
        }
        if(submitData){
            submitDetail()
        }
    },[items,submitData,editData,mainFocusData])

    useEffect(()=>{
        if(!editData && mainFocusData && items.id_main_focus){
            getTotalActive()
        }
    },[items.id_main_focus,mainFocusData])

    const renderColumn = ()=>columnHtml.map((v,idx)=>
        {
            switch (v.inputType.toLowerCase()) {
                case 'textarea':
                    return(
                        <div className="form-group field-usereditform-email required" key={idx}>
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <textarea id={v.inputName} style={{width:v.inputWidth,height:"200px"}} className="form-control" name={v.inputName} onChange={handleInputChange.bind(this)} aria-required="true" aria-invalid="false" defaultValue={v.inputValue} required={v.inputRequired} readOnly={v.inputReadOnly}></textarea>
                            <div className="help-block"></div>
                        </div>
                    )
                case 'select':
                    return(
                        <div className="form-group field-profile-country" key={idx}>
                            <label className="control-label" htmlFor="profile-country">&nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <select id={v.inputName} style={{width:v.inputWidth}} className="form-control" 
                                value={v.inputValue} onChange={(e)=>handleInputChange(e)} name={v.inputName} aria-invalid="false" required={v.inputRequired} readOnly={v.inputReadOnly}>
                                {editData ? null: <option value="">... Select this ...</option> }
                                {v.inputSelect.map((x,idx_v)=><option value={x.value} key={idx_v}>{x.label}</option>)}
                            </select>

                            <div className="help-block"></div>
                        </div>
                    )
                case 'select_search':
                    return(
                        <div className="form-group field-usereditform-email required" key={idx}>
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
                        <div className="form-group field-usereditform-email required" key={idx}>
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <input type={v.inputType.toLowerCase()} id="usereditform-email" style={{width:v.inputWidth}} className="form-control"
                                name={v.inputName} defaultValue={v.inputValue} onChange={(e)=>handleInputChange(e)} aria-required="true" aria-invalid="false" required={v.inputRequired} readOnly={v.inputReadOnly} />
                            <div className="help-block"></div>
                        </div>
                    )
            }
        }
    )
     
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
                <LoadingAdmin loading={loading}/> 
                <div className="panel-body" style={cssTarget(loading)}>
                    <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                        <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                            <Row className="clearfix">
                                <Col sm={12}>
                                    <Nav variant="tabs" className="tab-menu tab-header">
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.title_eng: 'New Data' }</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                            {
                                                renderColumn()
                                            }
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>

                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LearningKeyBehaviorDetail;