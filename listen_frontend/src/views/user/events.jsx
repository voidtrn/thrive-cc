import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { Modal } from 'react-bootstrap';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import {Alert} from '../../components/popupAlert';
import { isMobile } from 'react-device-detect';

let items = []
const user_id = securityData.Security_UserId();
const theme = securityData.Security_getTheme();
const platform_id = securityData.Security_getPlatformId()
const file_path = env.userDocument
const animatedComponents = makeAnimated();

function PopupInitiate(props){
    
    items = props.chgItem
    const [md5PlatformId, setMd5PlatformId] = useState("")
    const [showModal, setShowModal] = useState(true)
    const [isLoadingName, setIsLoadingName] = useState(true)
    const [isLoadingFunction, setIsLoadingFunction] = useState(true)
    const [isLoadingHos, setIsLoadingHos] = useState(true)
    const [isDisabledName, setIsDisabledName] = useState(true)
    const [isDisabledHos, setIsDisabledHos] = useState(true)
    const [optionFunction, setOptionFunction] = useState([])
    const [optionSelectedFunction, setOptionSelectedFunction] = useState([])
    const [optionName, setOptionName] = useState([])
    const [optionSelectedName, setOptionSelectedName] = useState({})
    const [optionHos, setOptionHos] = useState([])
    const [optionSelectedHos, setOptionSelectedHos] = useState({})

    const getAllFunction = async()=>{
        setIsLoadingFunction(true)

        let responseJson = await axiosLibrary.postData('GetMd5',{id:platform_id});
        if(responseJson.data.data !== ""){
            let responseJsonAllFunction = await axiosLibrary.postData('dialogueUserHof/GetDistinctFunction',{md5ID:responseJson.data.data});
            var response = responseJsonAllFunction.data.data.map(({directorate}) => {
                return {
                    value: directorate,
                    label: directorate
                }
              });
            setOptionFunction(response)
            setIsLoadingFunction(false)
            setMd5PlatformId(responseJson.data.data)
        }
    }

    const getDetail= async() =>{
        setOptionSelectedHos([])
        setIsLoadingHos(true)
        
        const data = {
            platform_id: platform_id,
            directorate: optionSelectedFunction.value
        }
        let responseJson = await axiosLibrary.postData('dialogueUserHof/SelectDataUserHofEvent', data);
        if(responseJson.status === 200){
            var response = responseJson.data.data.map(({ id, name})=>{
                return {
                    value: id,
                    label: name
                }
            })
            setOptionHos(response)
            setIsLoadingHos(false)
            setIsDisabledHos(false)
        }else{
            alert(response);
        }
    }

    const getAllEmpl = async()=>{
        setOptionSelectedName([])
        setIsDisabledName(false)
        setIsLoadingName(true)
        const responseMd5 = await axiosLibrary.postData('GetMd5',{id:platform_id});
        if(responseMd5.data.data !== ""){
            setMd5PlatformId(responseMd5.data.data)
        }
        const param = {
            md5ID: md5PlatformId,
        }
        const responseJson = await axiosLibrary.postData('dialogueUserHof/GetAllEmployee', param);
        var response = responseJson.data.data.map(({ id, account, name})=>{
            return {
                value: id,
                label: '( '+account+' ) '+name
            }
        })
        setOptionName(response)
        setIsLoadingName(false)
    }
    
    const getDefaultEmpl = ()=>{
        const source = optionName.filter(v=>v.value === user_id);
        const returnedTarget = Object.assign({}, optionSelectedName)
        if(source.length > 0){
            returnedTarget['value'] = source[0].value
            returnedTarget['label'] = source[0].label
            setOptionSelectedName(returnedTarget)
        }
    }

    useEffect(()=>{
        if(showModal){
            getAllEmpl()
            getAllFunction()
        }
    },[showModal])

    useEffect(()=>{
        if(optionName){
            getDefaultEmpl()
        }
    },[optionName])

    useEffect(()=>{
        if(optionSelectedFunction.value){
            getDetail()
        }
    },[optionSelectedFunction])

    const loadOptions = (inputValue, callback) => {
        const requestResults = optionName.filter(
            x =>
            x.label.toLocaleLowerCase().includes(inputValue)
            ).slice(0,20)
        //const requestResults = this.state.optionAdHoc.slice(0,10);
        callback(requestResults)
    }

    /* register initiate */
    const submitInitiate = async () => {
        if(optionSelectedFunction.value){
            if(optionSelectedHos.value){
                const param = {
                    'user_id' : optionSelectedName.value,
                    'host_hof' : optionSelectedHos.value,
                    'user_created' : user_id,
                    'user_modified' : user_id,
                    'platform_id': platform_id
                }
                let responseInsert = await axiosLibrary.postData("dialogueInitiate/InsertData", param);
                if(responseInsert.status === 200){
                    let responseFeedback = await axiosLibrary.postData("dialogueFeedback/GenerateActivityFeedback", param);
                    if(responseFeedback.status === 200){
                        setShowModal(false);
                        // console.log(responseFeedback);
                        // props.submitSuccess({txtMessage:theme.txt_alert_thank_your_for_your_interest, showSubmit:true})
                        props.submitSuccess(theme.txt_alert_thank_your_for_your_interest);
                    }
                    // alert("Thank you for your interest!");
    
                } else {
                    alert(responseInsert);
                }
            } else {
                // alert('Host Name is mandatory')
                props.submitSuccess(theme.txt_popup_dialogue_host_name + ' is mandatory');
            }
        } else {
            // alert('Host Function is mandatory')
            props.submitSuccess(theme.txt_popup_dialogue_host_function + ' is mandatory');
        }
    }

    return(
        <>
        <style>{`
            h5.modal-title {
                color: #b7b7b7;
                margin: 10px 10% 0;
                font-size: 16px;
                text-align: center;
                font-family: 'ubuntumedium';
        }`}
        </style>
        <Modal
            show={showModal}
            size="large"
            aria-labelledby="contained-modal-title-vcenter"
            onHide={()=>setShowModal(false)}
            onExited={()=>{props.chgState(false); props.submitSuccess(false) }}
            backdrop={true}
            keyboard={false}
        >
            <Modal.Header>
                {<span className="close" onClick={()=>setShowModal(false)}>
                    <i className="fa fa-close custom" ></i>
                </span>}
            </Modal.Header>
            <Modal.Body style={{margin:"1% 1%"}}>
                <h4 className="modal-title">{theme.txt_popup_dialogue_title}</h4>
                <h5 className="modal-title">{theme.txt_popup_dialogue_subtitle}</h5>
                <br/>
                <div className="tab-content">
                    <div className="tab-pane active" data-tab-index="0" id="tab-0">
                        <div className="mb-3 field-usereditform-email required">
                            <label className="form-label">&nbsp;{theme.txt_popup_dialogue_employee_name}: <span style={{color:'#ff0404'}}>(*)</span></label>
                            <AsyncSelect components={animatedComponents} 
                                isLoading={isLoadingName} 
                                isDisabled={isDisabledName} 
                                className="basic-single" 
                                classNamePrefix="select" 
                                name="optionName" 
                                onChange={(e)=>setOptionSelectedName(e)} 
                                value={optionSelectedName}
                                loadOptions={loadOptions.bind(this)}
                                />
                        </div>
                        <div className="mb-3 field-usereditform-email required">
                            <label className="form-label" >&nbsp;{theme.txt_popup_dialogue_host_function}: <span style={{color:'#ff0404'}}>(*)</span></label>
                            <Select components={animatedComponents} 
                                isLoading={isLoadingFunction} 
                                options={optionFunction} 
                                className="basic-single" 
                                classNamePrefix="select" 
                                name="optionFunction" 
                                onChange={(e)=>setOptionSelectedFunction(e)} 
                                value={optionSelectedFunction}
                                />
                        </div>
                        <div className="mb-3 field-usereditform-email required">
                            <label className="form-label" >&nbsp;{theme.txt_popup_dialogue_host_name}: <span style={{color:'#ff0404'}}>(*)</span></label>
                            <Select components={animatedComponents} 
                                isLoading={isLoadingHos} 
                                isDisabled={isDisabledHos} 
                                options={optionHos} 
                                className="basic-single" 
                                classNamePrefix="select" 
                                name="optionHos" 
                                onChange={(e)=>setOptionSelectedHos(e)} 
                                value={optionSelectedHos}
                                />
                            <span style={{fontSize:'12'}}>{theme.txt_popup_dialogue_label_host_name}</span>
                        </div>
                    </div>
                </div>                      
            </Modal.Body>
            <Modal.Footer>
                <input type="hidden" id="hdnId" name="hdnId" />
                <input type="submit" className="btn-style" id="btnSubmit" name="btnSubmit" value="Submit" onClick={submitInitiate.bind(this)} />
            </Modal.Footer>
        </Modal>
        </>
    )
}

function PopupEvent(props){

    items = props.chgItem
    const [showModal, setShowModal] = useState(true)
    const [isLoadingName, setIsLoadingName] = useState(true)
    const [optionSelectedName, setOptionSelectedName] = useState({})
    const [optionName, setOptionName] = useState([])
    const [isDisabledName, setIsDisabledName] = useState(true)
    const [md5PlatformId, setMd5PlatformId] = useState("")

    const getAllEmpl = async()=>{
        setOptionSelectedName([])
        setIsDisabledName(false)
        setIsLoadingName(true)
        const responseMd5 = await axiosLibrary.postData('GetMd5',{id:platform_id});
        if(responseMd5.data.data !== ""){
            setMd5PlatformId(responseMd5.data.data)
        }
        const param = {
            md5ID: md5PlatformId,
        }
        const responseJson = await axiosLibrary.postData('dialogueUserHof/GetAllEmployee', param);
        var response = responseJson.data.data.map(({ id, account, name})=>{
            return {
                value: id,
                label: '( '+account+' ) '+name
            }
        })
        setOptionName(response)
        setIsLoadingName(false)
    }

    const getDefaultEmpl = ()=>{
        const source = optionName.filter(v=>v.value === user_id);
        const returnedTarget = Object.assign({}, optionSelectedName)
        if(source.length > 0){
            returnedTarget['value'] = source[0].value
            returnedTarget['label'] = source[0].label
            setOptionSelectedName(returnedTarget)
        }
    }

    useEffect(()=>{
        if(showModal){
            getAllEmpl()
        }
    },[showModal])

    useEffect(()=>{
        if(optionName){
            getDefaultEmpl()
        }
    },[optionName])

    /* register event */
    const submitEvent = async () => {
        
        /// 17Nov2022 userId langsung by login ---- 'user_id' : optionSelectedName.value,
        const param = {
            'event_id' : ''+items.id,
            'user_id' : user_id,
            'user_created' : user_id,
            'user_modified' : user_id,
            'platform_id': platform_id
        }
        let checkUserRegistered = await axiosLibrary.postData("dialogueEvent/CheckUserRegistered", param);
        if(checkUserRegistered.status === 200){
            // console.log(checkUserRegistered)
            if(checkUserRegistered.data.data === true){
                // alert("We're sorry, you've already registered.");
                setShowModal(false)
                props.submitSuccess(theme.txt_alert_already_registered);
            } else {
                let responseJson = await axiosLibrary.postData("dialogueEvent/InsertData", param);
                if(responseJson.status === 200){
                    let responseFeedback = await axiosLibrary.postData("dialogueFeedback/GenerateActivityFeedback", param);
                    if(responseFeedback.status === 200){
                        // console.log(responseFeedback);
                        setShowModal(false)
                        props.submitSuccess(theme.txt_alert_thank_you_for_your_registration);
                    }                    
                    // alert("Thank you for your registration!");
                }else{
                    alert(responseJson);
                }
            }
        } else {
            alert(checkUserRegistered);
        }
    }

    const loadOptions = (inputValue, callback) => {
        const requestResults = optionName.filter(
            x =>
            x.label.toLocaleLowerCase().includes(inputValue)
            ).slice(0,20)
        //const requestResults = this.state.optionAdHoc.slice(0,10);
        callback(requestResults)
    }

    return(
        <>
        <style>{`
            h5.modal-title {
                color: #b7b7b7;
                margin: 10px 10% 0;
                font-size: 16px;
                text-align: center;
                font-family: 'ubuntumedium';
        }`}
        </style>
        <Modal
            show={showModal}
            size="large"
            aria-labelledby="contained-modal-title-vcenter"
            onHide={()=>setShowModal(false)}
            onExited={()=>{props.chgState(false); props.submitSuccess(false)}}
            backdrop={true}
            keyboard={false}
        >
        <Modal.Header>
            {<span className="close" onClick={()=>setShowModal(false)}>
                <i className="fa fa-close custom" ></i>
            </span>}
        </Modal.Header>
        <Modal.Body style={{margin:"1% 1%"}}>
                    <h4 className="modal-title">{items.title}</h4>
                    <h5 className="modal-title" id="myModalLabelTitle">
                    { items.place}<br/>
                    { items.schedule_date }<br/>
                    { items.schedule_time}<br/>
                    Max: { items.total_participant + ' ' + theme.txt_dialogue_participants} 
                    </h5>
                    <br/>
                    <div className="tab-content">
                        <div className="tab-pane active" data-tab-index="0" id="tab-0">
                            {/* 
                            //// 17Nov2022 userId langsung by login
                            <div className="mb-3 field-usereditform-email required">
                                <AsyncSelect components={animatedComponents} 
                                    isLoading={isLoadingName} 
                                    isDisabled={isDisabledName} 
                                    // options={optionName} 
                                    className="basic-single" 
                                    classNamePrefix="select" 
                                    name="optionName" 
                                    onChange={(e)=>setOptionSelectedName(e)} 
                                    value={optionSelectedName}
                                    loadOptions={loadOptions.bind(this)}
                                    />
                            </div> */}
                            <input type="hidden" name="id" value={items.id} readOnly />
                            <div className="disclaimer">
                                <p><div dangerouslySetInnerHTML={{ __html: theme.txt_popup_dialogue_disclaimer}}>
                                    </div>
                                </p>
                            </div>
                        </div>
                    </div>                      
        </Modal.Body>
        <Modal.Footer>
            <input type="submit" className="btn-style" id="btnSubmit" name="btnSubmit" value={theme.txt_dialogue_submit} onClick={submitEvent} />
        </Modal.Footer>
        </Modal>
        </>
    )
}

function Schedules(props){

    items = props.items
    const [showModal, setShowModal] = useState(false)
    const [stateItem, setStateItem] = useState([])
    const [profileHover, setProfileHover] = useState('')


    const [modalMessage, setModalMessage] = useState ({
        modalShow: false,
        txtMessage: 'test',
        subtitle: false,
        txtSubtitle: ''
    })

    const showPopUp = (val)=>{
        if(val){
            setModalMessage({
                modalShow: true,
                txtMessage: val,
                subtitle: false,
                txtSubtitle: ''
            })
        }
    }

    const handleClick = (val) =>{
        if(val===false){
            setShowModal(false)
        }else{
            setShowModal(true)
        }
    }

    // useEffect(()=>{
    //     if(modalMessage.modalShow){
    //         showPopUp()
    //     }
    // },[modalMessage])

    return(
        <>
        {items.map((item) =>
            <div className="col-xs-12 col-sm-6 col-lg-4" key={item.id}>
                <div className="dialogue-events" 
                    onClick={()=>{setShowModal(true);setStateItem(item)}}
                    onMouseEnter={()=>{setProfileHover(item.id);setModalMessage({modalShow:false})}}
                    onMouseLeave={()=>{setProfileHover('');setModalMessage({modalShow:false})}}
                >
                    <style>{` #profile`+item.id +`::after {background-image:url(`+file_path+ "schedule/" + item.schedule_image +`) }`}</style>
                    <div className={profileHover===item.id? 'event-profile box-selected' : 'event-profile'} id={'profile'+item.id}>
                    </div>
                    <div className="event-content">
                        <p className="event-title">{ item.title}</p>
                        <p className="event-place">{ item.place}</p>
                        <p className="event-date">{ item.schedule_date }</p>
                        <p className="event-time">{ item.schedule_time}</p>
                        <p className="event-participant">Max: { item.total_participant + ' ' + theme.txt_dialogue_participants}</p>
                        <button className={profileHover===item.id ? 'btn-event-submit float-end btn-selected' : 'btn-event-submit float-end'}>{theme.txt_dialogue_submit}</button>
                    </div>
                </div>
            </div>
        )}
        { showModal ? <PopupEvent chgState={handleClick} chgItem={stateItem} submitSuccess={showPopUp}/> : null }
        <Alert {...modalMessage}/>
        </> 
    )
}

function Events(props){

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const stateItem = []
    const [modalMessage, setModalMessage] = useState ({
        modalShow: false,
        txtMessage: 'test',
        subtitle: false,
        txtSubtitle: ''
    })

    const handleClick = (val) =>{
        if(val===false){
            setShowModal(false)
        }else{
            setShowModal(true)
        }
    }
    
    const showPopUp = (val)=>{
        if(val){
            setModalMessage({
                modalShow: true,
                txtMessage: val,
                subtitle: false,
                txtSubtitle: ''
            })
        } 
        // else {
        //     setModalMessage({
        //         modalShow: false
        //     })
        // }
    }

    const getData = async () => {
        setLoading(true)
        const credentials = {
            limit: 10,
            offset: 0,
            category: "",
            status_active: 1,
            platform_id: platform_id
        };
        let isi = await axiosLibrary.postData('dialogueSchedule/ListData', credentials);
        setItems(isi.data.data)
        setLoading(false)
    }

    const insertLogPage= async()=>{
        if(!securityData.Security_getInsertLogEvents()){
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
                        Cz_dlg_events:'1'
                    }
                    dataUser = {...dataUser, ...dataLogYawa}
                    localStorage.setItem('userinfo',JSON.stringify(dataUser));
                }
            }
        }
    }

    useEffect(()=>{
        getData()
        insertLogPage()
    },[])

    return(
        <>
        <style>
            {`
            .event-profile{
                position: relative;
                -webkit-border-radius:50px;
                -moz-border-radius:50px;
                border-radius:20%;
                width:266px;
                height:266px;
            }
              
            .event-profile:after {
                position: absolute;
                display: block;
                top: 8px;
                left: 8px;
                width: 250px;
                height: 250px;
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
                padding: 70px 30px;
                height: 280px;
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
        `}
        </style>
        <div id="page-contents">
            <Alert {...modalMessage}/>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="initiate-dialogue-banner" >
                            <img src={theme.img_submit_dialogue_initiate} 
                                onClick={()=>{setShowModal(true)}}
                            />
                            { showModal ? <PopupInitiate chgState={handleClick} chgItem={stateItem} submitSuccess={showPopUp}/> : null }
                        </div>
                    </div>
                </div>
                <div className="row" style={{textAlign:'center'}}>
                { loading ? 
                    <div className="text-center"><img src={env.assets+"images/lazyloading.gif"} alt="loading_img"/></div> : 
                    <Schedules items={items}></Schedules>
                }
                </div>
            </div>
        </div>
        <br/> 
        </>
    )
}

export default Events;