import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function QuizDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = ""
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)

    const [checkedBox, setCheckedBox] = useState({
        checkedA: false,
        checkedB: false,
        checkedC: false,
        checkedD: false,
    })
    

    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    // const user_account = securityData.Security_UserAccount()

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){ 
            if (props.location.pathname !== routeAdmin.quizCreate.path){
                setEditData(true)
                let response = await axiosLibrary.postData('awbQuiz/SelectData',data);
                if(response.status === 200){
                    setItems(response.data.data)
                    setCheckBoxMode3(response.data.data.answer_choice_mode_3)
                    setLoading(false)
                }else{
                    alert(response);
                    setLoading(false)
                }
            }else{
                let response = await axiosLibrary.postData('awbQuiz/SelectArticle',data);
                if(response.status === 200){
                    setItems(items =>({...items, trn_article_id:response.data.data.id}));
                    setLoading(false)
                }else{
                    alert(response);
                    setLoading(false)
                }
            }
        }else{
            alert("key value does not exist")
        }


    },[props.location.search])

    const DeleteConfirm=  async ()=>{
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Are you sure to delete this data?")) 
        {
            setDeleteData(true)
            setCancelDelete(false)
        } 
        else
        {
            setCancelDelete(true)
        } 
    }

    const submit= async (e) =>{
        e.preventDefault();
        if(!cancelDelete){
            if(!deleteData){
                let answerMode3 = setAnswerChoiceMode3()
                const fd = new FormData();
                
                fd.append("question", items.question);
                fd.append("question_ind", items.question_ind);
                fd.append("choice_1", items.choice_1);
                fd.append("choice_1_ind", items.choice_1_ind);
                fd.append("choice_2", items.choice_2);
                fd.append("choice_2_ind", items.choice_2_ind);
                fd.append("choice_3", items.choice_3);
                fd.append("choice_3_ind", items.choice_3_ind);
                fd.append("choice_4", items.choice_4);
                fd.append("choice_4_ind", items.choice_4_ind);
                fd.append("answer_summary", items.answer_summary);
                fd.append("answer_summary_ind", items.answer_summary_ind);
                fd.append("answer_mode", items.answer_mode);
                fd.append("point", items.point);
                fd.append("answer_choice_idx", items.answer_choice_idx);
                fd.append("answer_choice_mode_3", answerMode3);
                fd.append("flag_active", items.flag_active);
                fd.append("trn_article_id", items.trn_article_id);
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);

                if(items.answer_mode === '1'){
                    fd.append("choice_3", '');
                    fd.append("choice_3_ind", '');
                    fd.append("choice_4", '');
                    fd.append("choice_4_ind", '');
                }

                if(items.answer_mode !== '1'){
                    fd.append("answer_summary", '');
                    fd.append("answer_summary_ind", '');
                }

                if(items.answer_mode !== '3'){
                    fd.append("answer_choice_mode_3", '');
                }

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbQuiz/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        handleBackToList()
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbQuiz/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        handleBackToList()
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbQuiz/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    handleBackToList()
                }else{
                    alert(responseJson);
                }
            }
        }
    }

    const setAnswerChoiceMode3 = () => {
        let answer3 = (checkedBox.checkedA?'A':'')+(checkedBox.checkedB?'|B':'')
            +(checkedBox.checkedC?'|C':'')+(checkedBox.checkedD?'|D':'');
        answer3 = (answer3[0] === '|'? answer3.substr(1):answer3);
        setItems(items =>({...items, answer_choice_mode_3:answer3}));
        return(answer3)
    }

    const setCheckBoxMode3 = (answerMode3) => {
        if(answerMode3){
            setCheckedBox(checkedBox =>({...checkedBox, checkedA:(answerMode3.includes('A'))}))
            setCheckedBox(checkedBox =>({...checkedBox, checkedB:(answerMode3.includes('B'))}))
            setCheckedBox(checkedBox =>({...checkedBox, checkedC:(answerMode3.includes('C'))}))
            setCheckedBox(checkedBox =>({...checkedBox, checkedD:(answerMode3.includes('D'))}))
        } 
    }

    const handleCheckboxMode3 = (option) => {
        // alert(option.target.checked + ' ' +option.target.value)
        switch(option.target.value){
            case 'A':
                setCheckedBox(checkedBox =>({...checkedBox, checkedA:option.target.checked}))
                break;
            case 'B':
                setCheckedBox(checkedBox =>({...checkedBox, checkedB:option.target.checked}))
                break;
            case 'C':
                setCheckedBox(checkedBox =>({...checkedBox, checkedC:option.target.checked}))
                break;
            case 'D':
                setCheckedBox(checkedBox =>({...checkedBox, checkedD:option.target.checked}))
                break;
            default:
                
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

    const setDefaultValue = () => {
        if(props.location.pathname === routeAdmin.quizCreate.path){
            setItems(items =>({...items, answer_mode:'1'}))
        }
    }

    useEffect(()=>{
        getDetail()
        setDefaultValue()
    },[Columns])

    const handleBackToList=async()=>{
        var md5ArticleIdParam =''
        if(props.location.pathname === routeAdmin.quizCreate.path){
            md5ArticleIdParam= new URLSearchParams(props.location.search).get('data')
            // alert(md5ArticleIdParam)
        } else {
            md5ArticleIdParam = await axiosLibrary.getmd5FromBackend(items.trn_article_id)
        }
        var path=routeAdmin.quiz.path
        
        history.push({
            pathname: path,
            search: "?" + new URLSearchParams({data:md5ArticleIdParam }).toString()// your data array of objects
        })
    }

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="float-right btn btn-default" onClick={handleBackToList} label="Back to list" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to list</a>
                </div>
            </div>
            <LoadingAdmin loading={loading}/> 
            <div className="panel-body" style={cssTarget(loading)}>
            {/* <div className="panel-body"> */}
                <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                   
                    <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                        <Row className="clearfix">
                            <Col sm={12}>
                                <Nav variant="tabs" className="tab-menu tab-header">
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Quiz Article : '+items.article_title: 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" forHtml="usereditform-email">&nbsp;Question Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <textarea style={{width:"100%",height:"80px"}} className="form-control" name="question" aria-required="true" 
                                                value={items.question} onChange={handleInputChange} maxLength="1000" aria-invalid="false"></textarea>
                                            <ul className="file-upload-requirement">
                                                    <li>
                                                    max 1000 of chars
                                                    </li>
                                                </ul>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" forHtml="usereditform-email">&nbsp;Question Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <textarea style={{width:"100%",height:"80px"}} className="form-control" name="question_ind" aria-required="true" 
                                                value={items.question_ind} onChange={handleInputChange} maxLength="1000" aria-invalid="false"></textarea>
                                            <ul className="file-upload-requirement">
                                                    <li>
                                                    max 1000 of chars
                                                    </li>
                                                </ul>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" forHtml="usereditform-email">&nbsp;Point <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"20%"}} className="form-control" name="point" 
                                                maxlength="5" value={items.point} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Question Type</label>
                                            <select id="answer_mode" style={{width:"150px"}} className="form-control" 
                                                value={items.answer_mode} onChange={handleInputChange.bind(this)} required name="answer_mode" aria-invalid="false">
                                                {/* {editData ? null: <option value="">... Select this ...</option> } */}
                                                <option value="1">Yes / No</option>
                                                <option value="2">Multiple Choice</option>
                                                <option value="3">Multiple Anwser</option>
                                            </select>

                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required" id="option_a">
                                            <div className="row">
                                                <div className="col-md-5">
                                                    <label className="control-label" forHtml="usereditform-email">&nbsp;Option A Eng <span style={{color:"#ff0404"}}>(*<small>max 1000 of chars</small>)</span></label>
                                                    <textarea style={{width:"100%",height:"85px"}} className="form-control" name="choice_1" aria-required="true" 
                                                        value={items.choice_1} onChange={handleInputChange} maxLength="1000" aria-invalid="false"></textarea>
                                                </div>
                                                <div className="col-md-5">
                                                    <label className="control-label" forHtml="usereditform-email">&nbsp;Option A Ind <span style={{color:"#ff0404"}}>(*<small>max 1000 of chars</small>)</span></label>
                                                    <textarea style={{width:"100%",height:"85px"}} className="form-control" name="choice_1_ind" aria-required="true" 
                                                        value={items.choice_1_ind} onChange={handleInputChange} maxLength="1000" aria-invalid="false"></textarea>
                                                </div>
                                                {items.answer_mode == '3'?
                                                    <div className="col-md-2 mode-class-3">
                                                        <p style={{position:"relative",top:"15px"}}>
                                                            <input type="checkbox" name="cbx_choice[]" value="A" checked={checkedBox.checkedA}
                                                                onChange={handleCheckboxMode3.bind(this)} />
                                                            <label className="control-label" style={{display:"inline",fontWeight:"normal"}} forHtml="usereditform-email">&nbsp;tick for the correct answer</label>
                                                        </p>
                                                    </div>
                                                :''
                                                }
                                            </div>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required" id="option_b">
                                            <div className="row">
                                                <div className="col-md-5">
                                                    <label className="control-label" forHtml="usereditform-email">&nbsp;Option B Eng <span style={{color:"#ff0404"}}>(*<small>max 1000 of chars</small>)</span></label>
                                                    <textarea style={{width:"100%",height:"85px"}} className="form-control" name="choice_2" aria-required="true" 
                                                        value={items.choice_2} onChange={handleInputChange} maxLength="1000" aria-invalid="false"></textarea>
                                                </div>
                                                <div className="col-md-5">
                                                    <label className="control-label" forHtml="usereditform-email">&nbsp;Option B Ind <span style={{color:"#ff0404"}}>(*<small>max 1000 of chars</small>)</span></label>
                                                    <textarea style={{width:"100%",height:"85px"}} className="form-control" name="choice_2_ind" aria-required="true" 
                                                        value={items.choice_2_ind} onChange={handleInputChange} maxLength="1000" aria-invalid="false"></textarea>
                                                </div>
                                                {items.answer_mode == '3'?
                                                    <div className="col-md-2 mode-class-3">
                                                        <p style={{position:"relative",top:"15px"}}>
                                                            <input type="checkbox" name="cbx_choice[]" value="B" checked={checkedBox.checkedB}
                                                                onChange={handleCheckboxMode3.bind(this)}/>
                                                            <label className="control-label" style={{display:"inline",fontWeight:"normal"}} forHtml="usereditform-email">&nbsp;tick for the correct answer</label>
                                                        </p>
                                                    </div>
                                                :''
                                                }
                                            </div>
                                            <div className="help-block"></div>
                                        </div>

                                        {items.answer_mode != '1'?
                                            <div className="form-group field-usereditform-email required" id="option_c">
                                                <div className="row">
                                                    <div className="col-md-5">
                                                        <label className="control-label" forHtml="usereditform-email">&nbsp;Option C Eng <span style={{color:"#ff0404"}}>(*<small>max 1000 of chars</small>)</span></label>
                                                        <textarea style={{width:"100%",height:"85px"}} className="form-control" name="choice_3" aria-required="true" 
                                                            value={items.choice_3} onChange={handleInputChange} maxLength="1000" aria-invalid="false"></textarea>
                                                    </div>
                                                    <div className="col-md-5">
                                                        <label className="control-label" forHtml="usereditform-email">&nbsp;Option C Ind <span style={{color:"#ff0404"}}>(*<small>max 1000 of chars</small>)</span></label>
                                                        <textarea style={{width:"100%",height:"85px"}} className="form-control" name="choice_3_ind" aria-required="true" 
                                                            value={items.choice_3_ind} onChange={handleInputChange} maxLength="1000" aria-invalid="false"></textarea>
                                                    </div>
                                                    {items.answer_mode == '3'?
                                                        <div className="col-md-2 mode-class-3">
                                                            <p style={{position:"relative",top:"15px"}}>
                                                                <input type="checkbox" name="cbx_choice[]" value="C" checked={checkedBox.checkedC}
                                                                onChange={handleCheckboxMode3.bind(this)}/>
                                                                <label className="control-label" style={{display:"inline",fontWeight:"normal"}} forHtml="usereditform-email">&nbsp;tick for the correct answer</label>
                                                            </p>
                                                        </div>
                                                    :''
                                                    }
                                                </div>
                                                <div className="help-block"></div>
                                            </div>
                                        :''
                                        }

                                        {items.answer_mode != '1'?
                                            <div className="form-group field-usereditform-email required" id="option_d">
                                                <div className="row">
                                                    <div className="col-md-5">
                                                        <label className="control-label" forHtml="usereditform-email">&nbsp;Option D Eng <span style={{color:"#ff0404"}}>(*<small>max 1000 of chars</small>)</span></label>
                                                        <textarea style={{width:"100%",height:"85px"}} className="form-control" name="choice_4" aria-required="true" 
                                                            value={items.choice_4} onChange={handleInputChange} maxLength="1000" aria-invalid="false"></textarea>
                                                    </div>
                                                    <div className="col-md-5">
                                                        <label className="control-label" forHtml="usereditform-email">&nbsp;Option D Ind <span style={{color:"#ff0404"}}>(*<small>max 1000 of chars</small>)</span></label>
                                                        <textarea style={{width:"100%",height:"85px"}} className="form-control" name="choice_4_ind" aria-required="true" 
                                                            value={items.choice_4_ind} onChange={handleInputChange} maxLength="1000" aria-invalid="false"></textarea>
                                                    </div>
                                                    {items.answer_mode == '3'?
                                                    <div className="col-md-2 mode-class-3">
                                                        <p style={{position:"relative",top:"15px"}}>
                                                            <input type="checkbox" name="cbx_choice[]" value="D" checked={checkedBox.checkedD}
                                                                onChange={handleCheckboxMode3.bind(this)}/>
                                                            <label className="control-label" style={{display:"inline",fontWeight:"normal"}} forHtml="usereditform-email">&nbsp;tick for the correct answer</label>
                                                        </p>
                                                    </div>
                                                    :''
                                                    }
                                                </div>
                                                <div className="help-block"></div>
                                            </div>
                                        :''
                                        }

                                        {items.answer_mode != '3'?
                                            <div className="form-group field-profile-country anwser-option">
                                                <label className="control-label" forHtml="profile-country">&nbsp;Answer</label>
                                                <select id="answer_choice_idx" required style={{width:"150px"}} className="form-control" 
                                                    value={items.answer_choice_idx}  onChange={handleInputChange} name="answer_choice_idx" aria-invalid="false">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    <option value="1" >A</option>
                                                    <option value="2" >B</option>
                                                    {items.answer_mode == '2'?
                                                        <option value="3" >C</option>
                                                    :''
                                                    }
                                                    {items.answer_mode == '2'?
                                                        <option value="4" >D</option>
                                                    :''
                                                    }
                                                    
                                                </select>

                                                <div className="help-block"></div>
                                            </div>
                                        :''
                                        }
                                        {items.answer_mode == '1'?
                                            <div className="form-group field-usereditform-email required " id="answer_summary">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label className="control-label" forHtml="usereditform-email">&nbsp;Answer Summary Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                                        <textarea id="answer_summary" style={{width:"100%",height:"100px"}} className="form-control" name="answer_summary" 
                                                            value={items.answer_summary} onChange={handleInputChange} aria-required="true" aria-invalid="false"></textarea>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="control-label" forHtml="usereditform-email">&nbsp;Answer Summary Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                                        <textarea id="answer_summary_ind" style={{width:"100%",height:"100px"}} className="form-control" name="answer_summary_ind" 
                                                            value={items.answer_summary_ind} onChange={handleInputChange} aria-required="true" aria-invalid="false"></textarea>
                                                    </div>
                                                </div>
                                                <div className="help-block"></div>
                                            </div>
                                        :''
                                        }

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.flag_active} onChange={handleInputChange.bind(this)} required name="flag_active" aria-invalid="false">
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                <option value="1">active</option>
                                                <option value="0"> inactive</option>
                                            </select>

                                            <div className="help-block"></div>
                                        </div>
                                    
                                        <br/>
                                        <hr/>

                                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="submit">Save</button>&nbsp;
                                        {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}       

                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </form>  
        </div>
        </div>
    </div>
    )
}

export default QuizDetail;