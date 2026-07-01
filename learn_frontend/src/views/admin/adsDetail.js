import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { env, securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
import defaultLang from '../../helpers/lang';
import { Tab, Row, Col, Nav } from 'react-bootstrap';
import AdminDetailInput from '../../components/adminDetailInput';

function AdsDetail(props){
    
    const history = useHistory()

    const [items, setItems] = useState([])
    const [columnHtml, setColumnHtml] = useState([])

    const [editData, setEditData] = useState(false)
    const [submitData,setSubmitData]=useState(false)

    const [loading, setLoading] = useState(true)
    const [file, setFile] = useState([])
    const reader = new FileReader()
    const file_path = env.userDocument +'ads/'

    const routeAdmin = routeAll.routesAdmin
    const date = new Date();
    
    const platform_id = securityData.Security_getPlatformId()

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbAds/SelectData',data);
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

    const validate =()=>{
        let formIsValid = true;
        if(items.period_from > items.period_to){
            formIsValid = false;
            alert(defaultLang.lang.errorDate);
        }

        if(items.period_from < date){
            formIsValid = false;
            alert(defaultLang.lang.errorCurrDate);
        }
        return formIsValid;
    }

    const submit= async (e) =>{
        e.preventDefault();
        if(platform_id){
            setItems(items=>({
                ...items, 
                platform_id:platform_id
            }))
        }
        if (validate()){
            setSubmitData(true)
        }
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

        if (editData){
            let responseJson = await axiosLibrary.postData("awbAds/UpdateData", fd);
            if(responseJson.status === 200){
                alert("DATA HAS BEEN UPDATED");
                setSubmitData(false)
                history.push(routeAdmin.ads.path)
            }else{
                alert(responseJson);
                setSubmitData(false)
            }
        }else{
            let responseJson = await axiosLibrary.postData("awbAds/InsertData", fd);
            if(responseJson.status === 200){
                alert("DATA HAS BEEN INSERTED");
                setSubmitData(false)
                history.push(routeAdmin.ads.path)
            }else{
                alert(responseJson);
                setSubmitData(false)
            }
        }
    }

    useEffect(()=>{
        if(platform_id){
            getDetail()
        }
    },[])

    useEffect(()=>{
        if(items){
            ColumnHtml();
        }
        if(submitData){
            submitDetail()
        }
    },[items,submitData,editData, file])

    const ColumnHtml = ()=>{
        const columnHtml = [
            {label:'Title (Eng)', inputName:'title', inputValue:items.title, inputType:'text', inputWidth:'100%',inputHeight:"100px", inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'Title (Ind)', inputName:'title_ind', inputValue:items.title_ind, inputType:'text', inputWidth:'100%',inputHeight:"100px", inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'Image', inputName:'image', inputValue:items.image, inputType:'file', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputRuleImage:[
                'one file only','4 MB limit','Allowed types for image : png jpg jpeg gif'
            ], InputAcceptData:'image/jpg,image/png,image/jpeg,image/gif', maxSizeFile:4, srcInput:file['image'], inputSelect:[]},
            {label:'Image (Ind)', inputName:'image_ind', inputValue:items.image_ind, inputType:'file', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputRuleImage:[
                'one file only','4 MB limit','Allowed types for image : png jpg jpeg gif'
            ], InputAcceptData:'image/jpg,image/png,image/jpeg,image/gif', maxSizeFile:4, srcInput:file['image_ind'], inputSelect:[]},
            {label:'Hyperlink URL', inputName:'hyperlink_url', inputValue:items.hyperlink_url, inputType:'text', inputWidth:'100%',inputHeight:"100px", inputRequired: false, inputReadOnly: false, inputSelect:[]},
            {label:'Open Type', inputName:'open_type', inputValue:items.open_type, inputType:'select', inputWidth:'25%', inputRequired: false, inputReadOnly: items.id?false:true, inputSelect:[
                {value:1, label:'New Page'},
                {value:0, label:'Same Page'}
            ]},
            {label:'Period From', inputName:'period_from', inputValue:items.period_from, inputType:'date', inputWidth:'25%',inputHeight:"100px", inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'Period To', inputName:'period_to', inputValue:items.period_to, inputType:'date', inputWidth:'25%',inputHeight:"100px", inputRequired: true, inputReadOnly: false, inputSelect:[]},
            {label:'Frequency', inputName:'frequency', inputValue:items.frequency, inputType:'number', inputWidth:'25%',inputHeight:"100px", inputRequired: true, inputReadOnly: false, inputSelect:[]},
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
                    <a className="float-right btn btn-default" href={routeAdmin.ads.path} label="Back to overview" data-ui-loader="">
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

                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="submit">{submitData?`Please Wait`: editData ? `Update` : 'Submit'}</button>&nbsp;
                </form>
                
        </div>
        </div>
    </div>
    )
}

export default AdsDetail;