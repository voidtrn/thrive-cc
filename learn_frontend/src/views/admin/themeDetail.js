import React, { useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from 'react-router';
import Pagination from 'react-js-pagination';
import { env, securityData } from '../../helpers/globalHelper';

function fnBuildLabelName(sourcetext)
{
    var arr = sourcetext.split('_');
    var str_rtn = "";
    for(var x = 0; x < arr.length; x++){
        arr[x] = capitalize(arr[x]);
        str_rtn += arr[x] + " ";
    }
    return str_rtn;
}

function capitalize(str){
    return str[0].toUpperCase()+str.slice(1)
}

function paginate(array, page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function ThemeDetail(props){
    
    const history = useHistory()
    const [Columns, setColumns] = useState([])
    const [ColumnsPaginate, setColumnsPaginate] = useState([])
    const [items, setItems] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [srcImage, setSrcImage] = useState([])
    const routeAdmin = routeAll.routesAdmin
    const nameType = new URLSearchParams(props.location.search).get('type')
    const assets = env.assets
    const fileInput = React.createRef()
    const reader = new FileReader()
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const user_account = securityData.Security_UserAccount()

    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const pageRangeDisplayed = 10
    const limit = 10

    const ListFieldIgnored = ['id','user_modified', 'date_modified', 'default_flag', 'is_deleted', 'platform_id'];

    const getListColumns = async () => {
        let response = await axiosLibrary.postData('dialogueTheme/ListData',{category:"COLUMNS"})
        if(response.status === 200){
            const ColumnsFiltered = response.data.data.filter(v => !ListFieldIgnored.includes(v.Field))
            setColumns(ColumnsFiltered)
            setTotalData(ColumnsFiltered.length)
            setColumnsPaginate(paginate(ColumnsFiltered,limit,activePage))
        }
    }

    const getDetail = async () => {
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('dialogueTheme/SelectData',data);
            
            if(response.status === 200){
                let selectData = Object.entries(response.data.data).filter((v)=>v[1]!==null)
                selectData.map(v=>{
                    items[v[0]] = v[1]
                    setItems({...items})
                })
                // setItems(response.data.data)
                let onlyImage = Object.entries(response.data.data).filter((v)=>v[0].includes('img'))
                setSrcImageEditData(onlyImage)
            }else{
                alert(response);
            }
        }else{
            checkMaxTheme()
        }
    }

    const setSrcImageEditData=(dataKeyImage)=>{
        if(editData){
            var stateImage = Object.assign({}, srcImage);
            dataKeyImage.map(v =>{
                if(v[1]){
                    stateImage[v[0]]= `${env.userDocument}theme/${v[1]}`
                    setSrcImage(stateImage)
                }
            })
        }
    }

    const validateForm = () => {
        let valid = true
        let name_column = ''
        if(items.status_active== undefined || items.status_active==="" || !items.status_active){
            valid = false
            name_column = 'status active'
        }

        if(items.theme_name== undefined || items.theme_name==="" || !items.theme_name){
            valid = false
            name_column = 'theme name'
        }

        if(items.lang== undefined || items.lang==="" || !items.lang){
            valid = false
            name_column = 'lang'
        }

        if(!valid){
            alert(`Column ${name_column} required`)
        }

        return valid
    }

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
        if(validateForm){
            if(!cancelDelete){
                if(!deleteData){
                    const fd = new FormData();
    
                    Object.keys(items).map(key =>
                        {
                            if(items[key]!=="null" || items[key] || items[key]!==''||items[key]!== undefined){
                                fd.append(key,items[key])
                            }
                        }
                    )

                    fd.append("platform_id", platform_id);
                    fd.append("user_account", user_account)
                    fd.append("user_modified", user_id);
                    
                    if(editData){
                        fd.append("id",items.id);
                        let responseJson = await axiosLibrary.postData("dialogueTheme/UpdateData", fd);
                        if(responseJson.status === 200){
                            alert("DATA HAS BEEN UPDATED");
                            history.push(routeAdmin.theme.path)
                        }else{
                            alert(responseJson);
                        }
                    }else{
                        checkMaxTheme()
                        // fd.append("user_created", user_id);
                        let responseJson = await axiosLibrary.postData("dialogueTheme/InsertData", fd);
                        if(responseJson.status === 200){
                            alert("DATA HAS BEEN CREATED");
                            history.push(routeAdmin.theme.path)
                        }else{
                            alert(responseJson);
                        }
                    }
                }
                else{
                    const parameter = {
                        id:items.id
                    }
                    let responseJson = await axiosLibrary.postData("dialogueTheme/DeleteData", parameter);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN DELETED");
                        history.push(routeAdmin.theme.path)
                    }else{
                        alert(responseJson);
                    }
                }
            }
        }
        setCancelDelete(false)
    }

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;

        setItems(stateCopy)
    }

    const ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png/i;
        // fixing pentest by syofian 170321
        if(upload_field.target.files[0]!== undefined){
            var filename = upload_field.target.value;
            var name = upload_field.target.name;
            var stateCopy = Object.assign({}, items);
            var stateImage = Object.assign({}, srcImage);
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
                    if (FileSize > 2) {
                        alert('File size exceeds 2 MB');
                        upload_field.target.form.reset();
                        return 0;
                    }
                    
                    stateCopy[name] = upload_field.target.files[0];
                    stateImage[name] = URL.createObjectURL(upload_field.target.files[0])
                    setItems(stateCopy)
                    setSrcImage(stateImage)
                };
                img.onerror = () => {
                    alert('Invalid Image Content')

                    stateCopy[name] = null;
                    stateImage[name] = null;
                    setItems(stateCopy)
                    setSrcImage(stateImage)
                };
                img.src = e.target.result;

            };
            
            reader.readAsDataURL(upload_field.target.files[0]);
        }
        // end fixing  
    }

    const checkMaxTheme = async () => {
        if(editData===false){
            const credentials = {
                category:"COUNT",
                platform_id: platform_id
            };
    
            let isi = await axiosLibrary.postData('dialogueTheme/ListData',credentials);
            if(isi.data.data >=2){
                alert("you have reached the maximum limit in creating the theme, maximum limit: 2")
                history.push(routeAdmin.theme.path)
            }
        }
    }

    useEffect(()=>{
        getListColumns()
    },[])

    useEffect(()=>{
        getDetail()
    },[Columns])

    useEffect(()=>{
        setColumnsPaginate(paginate(Columns,limit,activePage))
    },[activePage])

    useEffect(()=>{
        new window.lc_color_picker('.form-inline input[class="form-control pickerColor"]',{
            modes:['solid', 'linear-gradient'],
            wrap_width:'100%',
            on_change:function(new_value, target_field) {
                var stateCopy = Object.assign({}, items);
                stateCopy[target_field.name] = new_value
                setItems(stateCopy)
            },
            preview_style : { 
                input_padding   : 50, // extra px padding eventually added to the target input to not cover text
                side            : 'right', // right or left
                width           : 100,
                separator_color : '#fff', // (string) CSS color applird to preview element as separator
            },
        })
    },[ColumnsPaginate, items])

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="pull-right btn btn-default" href={routeAdmin.theme.path} label="Back to overview" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                </div>
            </div>
            <div className="panel-body">
                <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                    <ul id="profile-tabs" className="nav nav-tabs" data-tabs="tabs">
                        <li className="active">
                            <a href="#tab-0" data-toggle="tab" aria-expanded="true">{editData ? 'Edit : '+nameType: 'New Data' }</a>
                        </li>
                    </ul>
                    <div className="tab-content">
                        <div className="tab-pane active" data-tab-index="0" id="tab-0">
                            <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+limit}</b> of <b>{totalData}</b> records.</div><br/>

                            {ColumnsPaginate.map((Col,idx)=>
                                <div className="form-group field-usereditform-email required" key={idx}>
                                    <label className="control-label" htmlFor="usereditform-email">&nbsp;{fnBuildLabelName(Col.Field)} <span style={{color:"#ff0404"}}>(*) </span></label>
                                    {Col.Comment === ""?
                                        Col.Field.includes("status_active")?
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" name="status_active"  value={items.status_active||''} onChange={handleInputChange.bind(this)} required={true}>
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                <option value="0">inactive</option>
                                                <option value="1">active</option>
                                            </select>
                                        :
                                        <input type="text" id="usereditform-email" className="form-control" name={Col.Field} value={items[Col.Field]||''} onChange={handleInputChange}   aria-required="true" aria-invalid="false" required={true}/>
                                    :
                                    Col.Field.includes("txt")?
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <input type="text" id="usereditform-email" className="form-control" name={`default-${Col.Field}`} value={`Default Value : ${Col.Comment||''}`} aria-required="true" aria-invalid="false" disabled={true}/>
                                            </div>
                                            <div className="col-sm-6">
                                                <input type="text" id="usereditform-email" className="form-control" name={Col.Field} value={items[Col.Field]||''} onChange={handleInputChange}   aria-required="true" aria-invalid="false"/>
                                            </div>
                                        </div>
                                    :
                                    Col.Field.includes("img")?
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <span>{Col.Comment||''}</span><br/>
                                                <img style={{width:"160px",height:"auto",marginTop:20}}  src={`${assets}images/default_theme/${Col.Comment.match(/(?<=\[)(.*?)(?=\])/gm)}`}  className="img-thumbnail" />
                                            </div>
                                            <div className="col-sm-6">
                                                <input type="file" name={Col.Field} id={Col.Field} size="40" accept="image/jpg,image/png,image/jpeg,image/gif" ref={fileInput} onChange={ajaxFileUploadImage} required={editData===false?true:false} />
                                                <br/><img className="img-thumbnail" style={{width:"160px",height:"auto"}} id={`show-${Col.Field}`} alt={fnBuildLabelName(Col.Field)} src={srcImage[Col.Field] || "https://dummyimage.com/100x100/000000/ffffff.png&text=NoImage"} />
                                            </div>
                                        </div>
                                    :
                                    Col.Field.includes("clr")?
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <span>{`Default Color : ${Col.Comment}`||''}</span>                                            
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-inline">
                                                    <input type="text" id={Col.Field} style={{width:'100%'}} className="form-control pickerColor" value={items[Col.Field]||Col.Comment} name={Col.Field} readOnly={true}/>
                                                    {/* <button type="button" className="btn" style={{backgroundColor:items[Col.Field]||Col.Comment,color:items[Col.Field]}}>Preview Color</button> */}
                                                    {/* <button type="button" className="btn btn-primary" data-toggle="modal" name={Col.Field} onClick={()=>{setColorSketchPicker({color:items[Col.Field]||Col.Comment,field:Col.Field});setTypeColorPicker('clr')}} data-target="#myModal">Pick Color</button> */}
                                                </div>
                                            </div>
                                        </div>

                                    :
                                    Col.Field.includes("grd")?
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <span>{`Default Gradient : ${Col.Comment}`||''}</span>
                                            </div>
                                            <div className="col-sm-6">                                            
                                                <div className="form-inline">
                                                    <input type="text" id={Col.Field} style={{width:'100%'}} className="form-control pickerColor" value={items[Col.Field]||Col.Comment} name={Col.Field} readOnly={true}/>
                                                    {/* <button type="button" className="btn" style={{backgroundImage:items[Col.Field]||Col.Comment,color:items[Col.Field]}}>Preview Color</button> */}
                                                    {/* <button type="button" className="btn btn-primary" data-toggle="modal" name={Col.Field} onClick={()=>{setTypeColorPicker('grd');splitColorGradient(items[Col.Field]||Col.Comment)}} data-target="#myModal">Pick Gradient</button> */}
                                                </div>
                                            </div>
                                        </div>
                                    :
                                        null
                                    }
                                    <div className="help-block"></div>
                                </div>
                            )}
                            
                        </div>
                    </div>
                    <div style={{textAlign:"center"}}>
                        <Pagination
                        activePage={activePage}
                        itemsCountPerPage={limit}
                        totalItemsCount={totalData}
                        pageRangeDisplayed={pageRangeDisplayed}
                        onChange={handlePageChange.bind(this)}
                        />
                    </div>

                    <input type="hidden" name="hdnkey" value={items.id||''}/>    
                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                    {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}       

                </form>
                {/* POPUP */}
                    {/* <div id="myModal" className="modal fade" role="dialog">
                        <div className="modal-dialog" style={{maxWidth:typeColorPicker==='clr'?"260px":"500px"}}>
                            <div className="modal-content" >
                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal">&times;</button>
                                    <h4 className="modal-title">Pick a {typeColorPicker==='clr'? "Color" : "Linear Gradient Color"} </h4>
                                </div>
                                <div className="modal-body">
                                    {typeColorPicker==='clr'?
                                    <SketchPicker
                                        color={ colorSketchPicker.color }
                                        onChange={(e) => setColorSketchPicker({color:e.hex||'#fff',field:colorSketchPicker.field}) }
                                    />
                                    :
                                    <>
                                        {gradientSketchPicker.length > 3 ?
                                            gradientSketchPicker.map()
                                        :
                                        }
                                    </>
                                    }
                                    
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={handleChangeComplete.bind(this)}>OK</button>
                                    <button type="button" className="btn btn-info" data-dismiss="modal">CLOSE</button>
                                </div>
                            </div>
                        
                        </div>
                    </div> */}
                {/* END POPUP */}
        </div>
        </div>
    </div>
    )
}

export default ThemeDetail;