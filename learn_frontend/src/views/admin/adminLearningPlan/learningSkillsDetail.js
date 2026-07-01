import React, {  
    useEffect, 
    useState
} from 'react';
import { useHistory } from '../../../helpers/useHistory';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { env,securityData } from '../../../helpers/globalHelper';
import routeAll from '../../../helpers/route';
import { 
    cssTarget, 
    LoadingAdmin 
} from '../../../components/Loading';
import { Tab, Row, Col, Nav } from 'react-bootstrap';
import AdminDetailInput from '../../../components/adminDetailInput';

const routeAdmin = routeAll.routesAdmin

function LearningSkillsDetail(props){
    const [loading, setLoading] = useState(true)
    const history = useHistory()

    const [items, setItems] = useState([])

    const [columnHtml, setColumnHtml] = useState([])
    const [editData, setEditData] = useState(false)

    const [submitData,setSubmitData]=useState(false)

    const platform_id = securityData.Security_getPlatformId()

    const [mainFocusData, setMainFocusData] = useState([])

    const [keyBehavior, setKeyBehavior] = useState([])

    const [optionSkill,setOptionSkill] = useState([])

    const [file, setFile] = useState([])
    const reader = new FileReader()
    const file_path = env.userDocument +'learning_skill/'

    const getMainFocusData = async ()=>{
        const credentials = {
            platform_id:platform_id
        };
        let isi = await axiosLibrary.postData('awbLearningMainFocus/ListData',credentials);
        setMainFocusData(isi.data.data.map(v=>{return{value:v.id,label:v.title_menu}}))
        setLoading(false)
    }

    const getKeyBehavior = async () =>{
        const credentials = {
            platform_id:platform_id,
            id_main_focus:items.id_main_focus,
            status_active:1
        };
        let isiActive = await axiosLibrary.postData(`awbLearningKeyBehavior/ListData`,credentials);
        setKeyBehavior(isiActive.data.data.map(v=>{return{value:v.id,label:v.title_eng}}))
    }

    const getCategoryLvl3 = async ()=>{
        const param = {
            platform_id:platform_id
        }

        let isi = await axiosLibrary.postData(`awbLearningListSkill/ListDataCategorylvl3`,param);
        setOptionSkill(
            isi.data.data.map(v=>{return{value:v.id,label:v.title}})
        )
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
            let response = await axiosLibrary.postData('awbLearningListSkill/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
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
                id_key:items.id_key_behavior,
                from:'admin',
                status_active:1,
            };
    
            let isi = await axiosLibrary.postData(`awbLearningListSkill/ListData?page=1`,credentials);
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
        const fd = new FormData();
        Object.keys(items).map(key =>
            {
                if(items[key]!=="null" || items[key] || items[key]!==''||items[key]!== undefined){
                    fd.append(key,items[key])
                }
            }
        )
        let responseJson = await axiosLibrary.postData("awbLearningListSkill/UpdateData", fd);
        if(responseJson.status === 200){
            if(editData){
                alert("DATA HAS BEEN UPDATED");
            }else{
                alert("DATA HAS BEEN CREATED");
            }
            setSubmitData(false)
            history.push(routeAdmin.learningSkills.path)
        }else{
            alert(responseJson);
            setSubmitData(false)

        }
    }
    
    useEffect(()=>{
        if(platform_id){
            getDetail()
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
    },[items,submitData,editData,mainFocusData,keyBehavior,optionSkill,file])

    useEffect(()=>{
        if(!editData && keyBehavior && items.id_key_behavior){
            getTotalActive()
        }

        if(keyBehavior && items.id_key_behavior){
            getCategoryLvl3()
        }
    },[items.id_key_behavior,keyBehavior])

    useEffect(()=>{
        if(items.id_main_focus){
            getKeyBehavior()
        }
    },[items.id_main_focus])

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


    const backTo = ()=>{
        history.push({
            pathname: routeAdmin.learningSkills.path,
            search: "?" + new URLSearchParams({page: editData ? new URLSearchParams(props.location.search).get('page'):1})// your data array of objects
        })
    }

    const ColumnHtml = ()=>{
        const columnHtml = [
            {label:'Main Focus', inputName:'id_main_focus', inputValue:items.id_main_focus, inputType:'select_search', inputWidth:'100%', inputRequired: true, inputReadOnly: editData, inputSelect:mainFocusData, inputLoading:mainFocusData.length>0?false:true},
            {label:'Key Behavior', inputName:'id_key_behavior', inputValue:items.id_key_behavior, inputType:'select_search', inputWidth:'100%', inputRequired: true, inputReadOnly: editData?true:!editData && !items.id_main_focus? true:false, inputSelect:keyBehavior, inputLoading:keyBehavior.length>0?false:true},
            {label:'Sort Number', inputName:'seqnum', inputValue:items.seqnum, inputType:'text', inputWidth:'25%', inputRequired: true, inputReadOnly: true, inputSelect:[]},
            {label:'Skills', inputName:'id_category_lvl_3', inputValue:items.id_category_lvl_3, inputType:'select_search', inputWidth:'100%', inputRequired: true, inputReadOnly: items.id_key_behavior?false:true, inputSelect:optionSkill, inputLoading:optionSkill.length>0?false:true},
            {label:'Rating', inputName:'rating', inputValue:items.rating, inputType:'text', inputWidth:'25%', inputRequired: false, inputReadOnly: true, inputSelect:[]},
            {label:'Learning Hours', inputName:'learning_hours', inputValue:items.learning_hours, inputType:'text', inputWidth:'50%', inputRequired: true, inputReadOnly: items.id_key_behavior?false:true, inputSelect:[]},
            // {label:'File Image', inputName:'image', inputValue:items.image, inputType:'file', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputRuleImage:[
            //     'one file only','4 MB limit','Allowed types for image : png jpg jpeg gif','Images larger than 200 x 100 pixels will be resized.'
            // ], InputAcceptData:'image/jpg,image/png,image/jpeg,image/gif', maxSizeFile:2, srcInput:file['image'], inputSelect:[]},
            {label:'Status Active', inputName:'status_active', inputValue:items.status_active, inputType:'select', inputWidth:'25%', inputRequired: true, inputReadOnly: items.id_key_behavior?false:true, inputSelect:[
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
                            <a className="float-right btn btn-default" onClick={()=>backTo()} label="Back to overview" data-ui-loader="">
                                <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                        </div>
                    </div>
                    <LoadingAdmin loading={loading}/> 
                <div className="panel-body" style={cssTarget(loading)}>
                        <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                            <Row className="clearfix">
                                <Col sm={12}>
                                    <Nav variant="tabs" className="tab-menu tab-main tab-header">
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-0">{editData ? 'Edit Data': 'New Data' }</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                            <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                                {
                                                    <AdminDetailInput 
                                                        data={columnHtml} 
                                                        changeData={(e,action)=>handleInputChange(e,action)} 
                                                        fileUpload={ajaxFileUploadImage.bind()} 
                                                        filePath={file_path}
                                                        editData={editData}
                                                    />
                                                }
                                                <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">{submitData?`Please Wait`:`SAVE`}</button>
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

export default LearningSkillsDetail;