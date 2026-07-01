import React, { useEffect, useState } from 'react';
import { Alert, Modal } from 'react-bootstrap';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import {Alert as ModalAlert} from '../../components/popupAlert';
import { isMobile } from 'react-device-detect';

const theme = securityData.Security_getTheme();
const platform_id = securityData.Security_getPlatformId();
const default_flag = securityData.Security_getTheme().default_flag;
const user_doc = env.userDocument;
const style = 
        <style>
        {`
        #listResults .checkbox * {
            cursor: pointer;
            }
            #listResults .checkbox {
            padding-left: 20px;
            width: 100%;
            height: 20px;
            margin-top: 1px;
            }

            #listResults .checkbox label {
            display: inline-block;
            vertical-align: middle;
            position: relative;
            padding-left: 5px;
            }

            #listResults .checkbox label::before {
            content: "";
            display: inline-block;
            position: absolute;
            width: 20px;
            height: 20px;
            left: 0;
            margin-left: -20px;
            border: 1px solid #555;
            border-radius: 3px;
            background-color: #fff;
            -webkit-transition: border 0.15s ease-in-out, color 0.15s ease-in-out;
            -o-transition: border 0.15s ease-in-out, color 0.15s ease-in-out;
            transition: border 0.15s ease-in-out, color 0.15s ease-in-out;
            }

            #listResults .checkbox label::after {
                display: inline-block;
                position: absolute;
                width: 20px;
                height: 20px;
                left: 0;
                top: 0px;
                margin-left: -20px;
                padding-left: 3px;
                padding-top: 0px;
                font-size: 14px;
                color: #555555;
            }

            #listResults .checkbox input[type="checkbox"]{
            opacity: 0;
            z-index: 1;
            width: 20px;
            height: 20px;
            }


            #listResults .checkbox input[type="checkbox"]:checked + label::after{
            font-family: "FontAwesome";
            content: "\\f00c";
            }

            #listResults .checkbox.checkbox-circle label::before {
            border-radius: 50%;
            }

            #listResults .checkbox.checkbox-inline {
            margin-top: 0;
            }

            #listResults .checkbox-green  input[type="checkbox"]:checked + label::after
            {color: #fff;}

            #listResults .checkbox-green input[type="checkbox"] + label::before
            {background-color: #008000;  border-color: #008000;}

            input[type="checkbox"].styled:checked + label:after {
            font-family: 'FontAwesome';
            content: "\\f00c";
            }

            input#employee_name {
                text-align: center;
            }
            h5.modal-title {
                color: #b7b7b7;
                margin: 10px 10% 0;
                font-size: 16px;
                text-align: center;
                font-family: 'ubuntumedium';
            }


            .chosen-container-single .chosen-single span {
                text-align: center;
            }

            a.btn.btn-default {
                white-space: normal;
                text-align: left;
            }
            
            
            input#employee_name {
                text-align: center;
            }
            h5.modal-title {
                color: #b7b7b7;
                margin: 10px 10% 0;
                font-size: 16px;
                text-align: center;
                font-family: 'ubuntumedium';
            }
            
            
            
            .event-profile{
            position: relative;
            -webkit-border-radius:50px;
            -moz-border-radius:50px;
            border-radius:20%;
            width:170px;
            height:170px;
            }
            
            .event-profile:after {
            position: absolute;
            display: block;
            top: 8px;
            left: 8px;
                width: 155px;
                height: 155px;
            content: "";
            background-color: #fff;
            background-repeat: no-repeat;
            background-size: cover;
            border-radius: 20%;
            overflow: hidden;
            }
            
            .event-content {
                text-align: left;
                position: relative;
                top: -50px;
                z-index: -1;
                left: 0px;
                padding: 85px 30px;
                margin: 0 10px;
                width: 250px;
                background-color: #f4f4f4;
            }
            
            .btn-event-submit {
                position: absolute;
                bottom: 0;
                left: 0;
                padding: 10px 30px;
                border: 0px solid #f5821f;
                font-size: 16px;
                color: #fff;
                text-align: center;
                width: 100%;
                font-family: 'ubuntumedium';
            }
            
            .chosen-container-single .chosen-single span{
                text-align: left;
            }
            #yawa_message{
                height: 100px !important;
            }
        `}
        </style>

function Yawa(props){
    const [listAllQna, setListAllQna] = useState([])
    const [classYawaProfile, setClassYawaProfile] = useState('')
    const [modalShow, setModalShow] = useState(false)
    const [checked, setChecked] = useState(true)
    const [items, setItems] = useState([])
    const [listYawaHof,setListYawaHof] = useState([])
    const [showInputOtherHof, setShowInputOtherHof] = useState(true)
    const [showAlert, setShowAlert] = useState({show:false, message:''})
    const [modalMessage, setModalMessage] = useState ({
        modalShow:false,
        txtMessage:'test',
        subtitle:false,
        txtSubtitle:''
    })

    const insertLog= async()=>{
        const param = {
            userName: securityData.Security_UserName(),
            userId: securityData.Security_UserId(),
            userAccount: securityData.Security_UserAccount(),
            userEmail: securityData.Security_UserEmail(),
            isMobile: isMobile,
            moduleName: 'Dialogue - ' + securityData.Security_getPlatformName(),
            feature: props.pageName
        }
        if(securityData.Security_getPlatformName()){
            let response = await axiosLibrary.postData("user/ActivityLog",param);
            if(response.status===200){
                let dataUser = axiosLibrary.getUserInfo();
                let dataLogYawa = {
                    Cz_dlg_yawa:'1'
                }
                dataUser = {...dataUser, ...dataLogYawa}
                localStorage.setItem('userinfo',JSON.stringify(dataUser));
            }
        }
    }

    const getListAllQna = async () => {
        const param = {
            platform_id: platform_id,
            category:''
        }
        let response = await axiosLibrary.postData('dialogueQna/ListAllQna',param)
        if(response.status===200){
            setListAllQna(response.data.data)
        }

    }

    const getListYawaHof = async ()=>{
        const param = {
            platform_id: platform_id,
        }
        let response = await axiosLibrary.postData('dialogueUserHof/getListYawaHof',param)
        if(response.status===200){
            setListYawaHof(response.data.data)
        }
    }

    useEffect(()=>{
        if(modalShow){
            getListYawaHof()
        }
    },[modalShow])

    useEffect(()=>{
        getListAllQna()
        if(!securityData.Security_getInsertLogYawa()){
            insertLog()
        }
    },[])

    useEffect(()=>{
        if(items.host_hof==="0"){
            setShowInputOtherHof(true)
        }else{
            setShowInputOtherHof(false)
            var stateCopy = Object.assign({}, items);
            stateCopy['host_hof_other'] = '';
            setItems(stateCopy)
        }
    },[items.host_hof])

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;
        setItems(stateCopy)
    }

    const formValidation = () => {
        if(!items.host_hof){
            setShowAlert({
                show: true,
                message:theme.txt_alert_yawa_submit_select_host_null
            })
            return false
        }else{
            if(items.host_hof==="0"){
                if(!items.host_hof_other || items.host_hof_other===''){
                    setShowAlert({
                        show: true,
                        message:theme.txt_alert_yawa_submit_input_host_null
                    })
                    return false
                }
            }
        }

        if(!items.message || items.message===''){
            setShowAlert({
                show: true,
                message:theme.txt_alert_yawa_submit_input_message
            })
            return false
        }
        setShowAlert({
            show: false,
            message:''
        })
        return true
    }

    const SubmitYawa = async () => {
        if(formValidation()){
            items.flag_anonymous = checked? 1 : 0
            items.user_created = securityData.Security_UserId()
            items.user_modified = securityData.Security_UserId()
            items.platform_id = securityData.Security_getPlatformId()

            setItems(items)

            let response = await axiosLibrary.postData('dialogueYawa/InsertData',items)
            if(response.status === 200){
                setModalShow(false)
                setModalMessage({
                    modalShow:true,
                    txtMessage:theme.txt_alert_thank_your_for_your_question,
                    subtitle:false,
                    txtSubtitle:'',
                })
            }else{
                setShowAlert({
                    show: true,
                    message:`failed insert with code : ${response.status}`
                })
            }
        }
    }

    return(
        <>
        {style}
        <div id="page-contents">
            <ModalAlert {...modalMessage}/>
            <div className="container">
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-lg-10 col-lg-offset-2">
                        <div className="initiate-yawa" >
                            <a onClick={()=>setModalShow(true)}><img className="yawa-feature" src={theme.img_submit_yawa}/></a>
                        </div>
                    </div>
                </div>
                <div>
                    {listAllQna.map((value)=>
                        <div className="row" key={value.id}>
                            <div className="col-md-2">
                                <div className="yawa-content yawa-profile" onMouseEnter={()=>setClassYawaProfile(value.id)} onMouseLeave={() => {setClassYawaProfile('')}}>
                                    <style>
                                        {`
                                            #profile_${value.id}:after{
                                                background-image:url(${user_doc}qna/${value.qna_image})
                                            }
                                        `}
                                    </style>
                                    <div className={classYawaProfile===value.id ? "event-profile yawa-event yawa-box-selected":"event-profile yawa-event"} id={`profile_${value.id}`}></div>
                                    <p>
                                        {theme.txt_yawa_answered_by}
                                    </p>
                                    <span>{value.answered_by}</span>
                                </div>
                            </div>
                            <div className="col-md-10">
                                <div className="yawa-question">
                                    <div className="detail-question">
                                        {default_flag===1 ? value.question:value.question_sec}
                                    </div>
                                    <div className="detail-answer">
                                        {default_flag===1 ? value.answer:value.answer_sec}
                                    </div>
                                </div>  
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <Modal
            show={modalShow}
            onHide={()=>setModalShow(false)}
        >
            <br/>
            <br/>
            <Modal.Header>
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true" onClick={()=>setModalShow(false)}><img src={theme.img_close_popup}/></button>
                <h4 className="modal-title" id="myModalTitle">{theme.txt_popup_yawa_title}</h4>
                <h5 className="modal-title" id="myModalTitle">
                    <div dangerouslySetInnerHTML={{
                        __html:theme.txt_popup_yawa_subtitle
                    }}/>
                </h5>
                <span className="modal-disclaimer">
                    <div dangerouslySetInnerHTML={{
                        __html:theme.txt_popup_yawa_disclaimer
                    }}/>
                </span>
            </Modal.Header>
            <Modal.Body>
                <div className="tab-content">
                    <div className="tab-pane active" data-tab-index="0" id="tab-0">
                        {showAlert.show? 
                            <Alert bsStyle="danger">
                                {showAlert.message}
                            </Alert>
                        : 
                            null
                        }
                        <div className="form-group field-usereditform-email required">
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;{theme.txt_popup_yawa_to} : <span style={{color:'#ff0404'}}>(*)</span></label>
                            <div id="listResults" className="pull-right">
                                    <div className="checkbox checkbox-circle checkbox-green">

                                        <input id="cbxAnonymous" name="cbxAnonymous" type="checkbox" checked={checked} onChange={()=>setChecked(!checked)}/>
                                        <label>
                                            {theme.txt_popup_yawa_set_myself_as_anonymous}
                                        </label>
                                    </div>
                            </div>
                            <select className="form-control" id="yawa_hof" name="host_hof" value={items.host_hof||""} onChange={handleInputChange}>

                                {listYawaHof.map((value,idx)=>
                                    <optgroup label={value.directorate} key={idx}>
                                        {value.hof.map(optionValue=>
                                            <option value={optionValue.id} key={optionValue.id}>{optionValue.name}</option>
                                        )}
                                    </optgroup>
                                )}
                                <optgroup label="Others">
                                    <option value="0">input host name</option>
                                    {items.host_hof?
                                        null
                                        :
                                        <option value="">-- Select this --</option>
                                    }
                                </optgroup>
                            </select>
                        </div>
                        <div className="form-group field-usereditform-email required" id="div_hof_other" style={{display:showInputOtherHof?'block':'none'}}>
                            <input  id="yawa_hof_other"  maxLength="50" style={{width:"75%"}} className="form-control" name="host_hof_other" value={items.host_hof_other||''} onChange={handleInputChange}></input>
                        </div>
                        <div className="form-group field-usereditform-email required">
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Message : <span style={{color:'#ff0404'}}>(*)</span></label>
                            <textarea  id="yawa_message"  maxLength="1000" style={{width:"75%"}} className="form-control" name="message" value={items.message||''} onChange={handleInputChange}/>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <input type="submit" className="btn-style" id="btnSubmit" name="btnSubmit" value="Submit" onClick={SubmitYawa}></input>
            </Modal.Footer>
        </Modal>

        </>
    )
}

export default Yawa;