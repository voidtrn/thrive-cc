import React, { 
    useCallback, 
    useEffect, 
    useState
} from 'react';
// import Pagination from 'react-js-pagination';
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

function LearningStepDetail(props){
    const [loading, setLoading] = useState(true)
    const history = useHistory()
    var Columns = ""

    const [items, setItems] = useState([])
    const [columnHtml, setColumnHtml] = useState([])
    const [editData, setEditData] = useState(false)

    const platform_id = securityData.Security_getPlatformId()

    const animated = makeAnimated()

    const getDetail = useCallback(async() => {
        const data = {
            id: new URLSearchParams(props.location.search).get('data')
        }
        if(data.id!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbLearningPlanStep/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                const detail = response.data.data
                const columnHtml = [
                    {label:'Sort Number', inputName:'seqnum', inputValue:detail.id, inputType:'text', inputWidth:'25%', inputRequired: true, inputReadOnly: true, inputSelect:[]},
                    {label:'Title Eng', inputName:'title_eng', inputValue:detail.title_eng, inputType:'text', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputSelect:[]},
                    {label:'Title Ind', inputName:'title_ind', inputValue:detail.title_ind, inputType:'text', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputSelect:[]},
                    {label:'Sub Title Eng', inputName:'sub_title_eng', inputValue:detail.sub_title_eng, inputType:'text', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputSelect:[]},
                    {label:'Sub Title Ind', inputName:'sub_title_ind', inputValue:detail.sub_title_ind, inputType:'text', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputSelect:[]},
                    {label:'Description Eng', inputName:'description_eng', inputValue:detail.description_eng, inputType:'textarea', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputSelect:[]},
                    {label:'Description Ind', inputName:'description_ind', inputValue:detail.description_ind, inputType:'textarea', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputSelect:[]},
                    {label:'Popup Description Eng', inputName:'popup_description_eng', inputValue:detail.popup_description_eng, inputType:'textarea', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputSelect:[]},
                    {label:'Popup Description Ind', inputName:'popup_description_ind', inputValue:detail.popup_description_ind, inputType:'textarea', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputSelect:[]},
                ]
                setColumnHtml(columnHtml)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }

            setLoading(false)
        }else{
            setLoading(false)
        }
    },[props.location.search])

    const submit = async (e)=>{
        e.preventDefault()
        const fd = new FormData();
        if(editData){
            Object.keys(items).forEach(key => fd.append(key, items[key]));
            let responseJson = await axiosLibrary.postData("awbLearningPlanStep/UpdateData", fd);
            if(responseJson.status === 200){
                alert("DATA HAS BEEN UPDATED");
                history.push(routeAdmin.learningStep.path)
            }else{
                alert(responseJson);
            }
        }else{
            alert("no edit")
        }
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
        if(platform_id){
            getDetail();
        }
        // setLoading(false))
    },[Columns])

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
                                defaultValue={v.inputValue} onChange={handleInputChange} name={v.inputName} aria-invalid="false" required={v.inputRequired} readOnly={v.inputReadOnly}>
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
                            />
                        </div>
                    )
                default:
                    return(
                        <div className="form-group field-usereditform-email required" key={idx}>
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <input type={v.inputType.toLowerCase()} id="usereditform-email" style={{width:v.inputWidth}} className="form-control"
                                name={v.inputName} defaultValue={v.inputValue} onChange={handleInputChange} aria-required="true" aria-invalid="false" required={v.inputRequired} readOnly={v.inputReadOnly} />
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
                            <a className="float-right btn btn-default" href={routeAdmin.learningStep.path} label="Back to overview" data-ui-loader="">
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
                                    <Tab.Content animation>
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

export default LearningStepDetail;