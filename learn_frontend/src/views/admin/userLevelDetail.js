import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from 'react-router';
import { env, securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';
import AdminDetailInput from '../../components/adminDetailInput';

function UserLevelDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    const [items, setItems] = useState([])
    const [columnHtml, setColumnHtml] = useState([])
    const [optionTargetGreenCard, setOptionTargetGreenCard] = useState([]);
    const [optionTargetLevelUp, setOptionTargetLevelUp] = useState([]);

    const [editData, setEditData] = useState(false)
    const [submitData,setSubmitData]=useState(false)

    const [loading, setLoading] = useState(true)
    const [file, setFile] = useState([])
    const reader = new FileReader()
    const file_path = env.userDocument +'level/'

    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    // const user_id = securityData.Security_UserId()
    // const user_account = securityData.Security_UserAccount()

    const getTargetGreenCard = async()=>{
        const credentials = {
            limit: 999,
            offset:0,
            category:"",
            platform_id:platform_id,
            status_active:1
        };
        let isi = await axiosLibrary.postData('awbUserLevel/ListData',credentials);
        if(isi.status===200){
            setOptionTargetGreenCard(isi.data.data.filter(v=>v.id!=items.id).map(v=>{return{value:v.id,label:v.title}}))
            setOptionTargetLevelUp(isi.data.data.map(v=>{return{value:v.id,label:v.title}}))
        }
    }

    const getTotalActive = async () => {
        var seqnumData = 0
        if(items.status_active==0){
            seqnumData = 999
        }else{
            const credentials = {
                limit: 1,
                offset:0,
                category:"COUNT",
                platform_id:platform_id,
                status_active:1
            };
    
            let isi = await axiosLibrary.postData('awbUserLevel/ListData',credentials);
            seqnumData = isi.data.data+1
        }

        setItems(items=>({
            ...items, 
            seqnum:seqnumData
        }))
    }

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbUserLevel/SelectData',data);
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

    const handleInputChange = (event,action) => {
        var value = ''
        var key = ''
        if(event.target){
            const target = event.target;
            value = target.type === 'checkbox' ? target.checked : target.type==="radio"? target.id : target.value;
            key = target.name;
        }else{
            key = action.name
            value = event.value || event
        }

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;
        setItems(stateCopy)
    }

    const ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png|\.mp4/i;

        if(upload_field.target.files[0]!== undefined){
            var filename = upload_field.target.value;
            var name = upload_field.target.name;
            const targetElement = columnHtml.filter(v=>v.inputName===name)
            var maxSize = targetElement[0].maxSizeFile
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {

                    if (filename.search(re_text) == -1) 
                    {
                        alert("File must be an image");
                        upload_field.target.form.reset();
                        return 0;
                    }
                    var FileSize = upload_field.target.files[0].size / 1024 / 1024 ; // in MB
                    if (FileSize > maxSize) {
                        alert(`File size exceeds ${maxSize} MB`);
                        upload_field.target.form.reset();
                        return 0;
                    }
                    setItems({...items,
                        [name]:upload_field.target.files[0],
                    })
                    setFile({...file,
                        [name]:URL.createObjectURL(upload_field.target.files[0]),
                    })
                    var imagename = filename==null? "": filename.replace("C:\\fakepath\\","");

                    document.getElementById(`${name}-span`).innerHTML =  imagename + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')'         
                };
                img.onerror = () => {
                    alert('Invalid Image Content')

                    setItems({...items,
                        [name]:null,
                    })
                    setFile({...file,
                        [name]:null,
                    })
                };
                img.src = e.target.result;

            };
            
            reader.readAsDataURL(upload_field.target.files[0]);
        }       
    }

    const formatSizeUnits = (bytes) =>
    {

        if      (bytes>=1073741824) {bytes=(bytes/1073741824).toFixed(2)+' GB';}
        else if (bytes>=1048576)    {bytes=(bytes/1048576).toFixed(2)+' MB';}
        else if (bytes>=1024)       {bytes=(bytes/1024).toFixed(2)+' KB';}
        else if (bytes>1)           {bytes=bytes+' bytes';}
        else if (bytes===1)          {bytes=bytes+' byte';}
        else                        {bytes='0 byte';}
        return bytes;
    }

    const submit= async (e) =>{
        e.preventDefault();
        if(items.status_active==0){
            setItems(items=>({
                ...items, 
                seqnum:999
            }))
        }
        if(items.seqnum===999& items.status_active==1){
            getTotalActive()
        }
        if(platform_id){
            setItems(items=>({
                ...items, 
                platform_id:platform_id
            }))
        }
        setSubmitData(true)
    }

    const submitDetail = async ()=>{
        const fd = new FormData();
        Object.keys(items).map(key =>
            {
                if(items[key]){
                    fd.append(key,items[key])
                }
            }
        )

        let responseJson = await axiosLibrary.postData("awbUserLevel/UpdateData", fd);
        if(responseJson.status === 200){
            alert("DATA HAS BEEN UPDATED");
            setSubmitData(false)
            history.push(routeAdmin.userLevel.path)
        }else{
            alert(responseJson);
            setSubmitData(false)
        }
    }

    useEffect(()=>{
        if(platform_id){
            getDetail()
            getTargetGreenCard()
        }
    },[])

    useEffect(()=>{
        if(items){
            ColumnHtml();
        }
        if(submitData){
            submitDetail()
        }
    },[items,submitData,editData,optionTargetGreenCard,optionTargetLevelUp,file])

    useEffect(()=>{
        if(!editData && items.id){
            getTotalActive()
        }
    },[items.id])

    const ColumnHtml = ()=>{
        const columnHtml = [
            {label:'Level', inputName:'seqnum', inputValue:items.seqnum, inputType:'text', inputWidth:'25%', inputRequired: true, inputReadOnly: true, inputSelect:[]},
            {label:'Title', inputName:'title', inputValue:items.title, inputType:'text', inputWidth:'500px', inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'level Image', inputName:'level_image', inputValue:items.level_image, inputType:'file', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputRuleImage:[
                'one file only','4 MB limit','Allowed types for image : png jpg jpeg gif'
            ], InputAcceptData:'image/jpg,image/png,image/jpeg,image/gif', maxSizeFile:4, srcInput:file['level_image'], inputSelect:[]},
            {label:'Sub Title (Eng)', inputName:'sub_title', inputValue:items.sub_title, inputType:'textarea', inputWidth:'100%',inputHeight:"100px", inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'Sub Title (Ind)', inputName:'sub_title_ind', inputValue:items.sub_title_ind, inputType:'textarea', inputWidth:'100%',inputHeight:"100px", inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'Your Privilege (Eng)', inputName:'descr_your_previlege', inputValue:items.descr_your_previlege, inputType:'textarea', inputWidth:'100%',inputHeight:"100px", inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'Your Privilege (ind)', inputName:'descr_your_previlege_ind', inputValue:items.descr_your_previlege_ind, inputType:'textarea', inputWidth:'100%',inputHeight:"100px", inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'How to Get There (Eng)', inputName:'descr_how_to_get_there', inputValue:items.descr_how_to_get_there, inputType:'textarea', inputWidth:'100%',inputHeight:"100px", inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'How to Get There (Ind)', inputName:'descr_how_to_get_there_ind', inputValue:items.descr_how_to_get_there_ind, inputType:'textarea', inputWidth:'100%',inputHeight:"100px", inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'Target point', inputName:'points_needed', inputValue:items.points_needed, inputType:'text', inputWidth:'25%', inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'Total Create Learning Plan', inputName:'total_create_learning_plan', inputValue:items.total_create_learning_plan, inputType:'text', inputWidth:'25%', inputRequired: false, inputReadOnly: false, inputSelect:[]},
            {label:'Total Complete Learning Plan', inputName:'total_complete_learning_plan', inputValue:items.total_complete_learning_plan, inputType:'text', inputWidth:'25%', inputRequired: false, inputReadOnly: false, inputSelect:[]},
            {label:'Total Complete SFF', inputName:'total_complete_sff', inputValue:items.total_complete_sff, inputType:'text', inputWidth:'25%', inputRequired: false, inputReadOnly: false, inputSelect:[]},
            {label:'Total Submit UGC', inputName:'total_submit_ugc', inputValue:items.total_submit_ugc, inputType:'text', inputWidth:'25%', inputRequired: false, inputReadOnly: false, inputSelect:[]},
            {label:'Target Green Card', inputName:'target_green_card', inputValue:items.target_green_card, inputType:'select_search', inputWidth:'50%', inputRequired: false, inputReadOnly: false, inputSelect:optionTargetGreenCard, inputLoading:optionTargetGreenCard.length>0?false:true},
            {label:'Bonus Level Up Points', inputName:'bonus_point', inputValue:items.bonus_point, inputType:'text', inputWidth:'25%', inputRequired: false, inputReadOnly: false, inputSelect:[]},
            {label:'Target Level Up', inputName:'target_level_id', inputValue:items.target_level_id, inputType:'select_search', inputWidth:'50%', inputRequired: true, inputReadOnly: false, inputSelect:optionTargetLevelUp, inputLoading:optionTargetLevelUp.length>0?false:true},
            {label:'Status Active', inputName:'status_active', inputValue:items.status_active, inputType:'select', inputWidth:'25%', inputRequired: true, inputReadOnly: items.id?false:true, inputSelect:[
                {value:1, label:'active'},
                {value:0, label:'inactive'}
            ]},
        ]
        setColumnHtml(columnHtml)
    }

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="float-right btn btn-default" href={routeAdmin.userLevel.path} label="Back to overview" data-ui-loader="">
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
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.title: 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        {
                                            <AdminDetailInput 
                                                data={columnHtml} 
                                                changeData={(e,action)=>handleInputChange(e,action)} 
                                                fileUpload={ajaxFileUploadImage.bind()} 
                                                filePath={file_path}
                                                editData={editData}
                                            />
                                        }
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>

                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="submit">{submitData?`Please Wait`:`Update`}</button>&nbsp;
                </form>
                
        </div>
        </div>
    </div>
    )
}

export default UserLevelDetail;