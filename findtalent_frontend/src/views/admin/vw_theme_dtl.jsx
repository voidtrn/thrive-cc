import React, { Component, useState } from 'react';
import { SketchPicker, PhotoshopPicker } from 'react-color';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AuthHelpers from '../../helpers/AuthHelpers';
import {Tabs, Tab, Modal, Button} from 'react-bootstrap';
import moment from 'moment/min/moment-with-locales';
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;
const fd = new FormData();
const ListFieldIgnored = ['id','user_modified', 'date_modified', 'default_flag', 'is_deleted', 'platform_id'];
const ListFieldImage = [
    { FieldName: 'image_logo', ImageFile: null, src: null, message: "(*) max upload file size : 300 KB, image resolution : (182  px * 50 px)" },
    { FieldName: 'image_home', ImageFile: null, src: null, message: "(*) max upload file size : 300 KB, image resolution : (60 px * 43 px)" },    
    { FieldName: 'image_report', ImageFile: null, src: null, message: "(*) max upload file size : 300 KB, image resolution : (60 px * 43 px)" },
    { FieldName: 'image_admin', ImageFile: null, src: null, message: "(*) max upload file size : 300 KB, image resolution : (60 px * 43 px)" },
    { FieldName: 'image_menu_available', ImageFile: null, src: null, message: "(*) max upload file size : 300 KB, image resolution : (300 px * 300 px)" },
    { FieldName: 'image_menu_hover', ImageFile: null, src: null, message: "(*) max upload file size : 300 KB, image resolution : (300 px * 300 px)" },
    
    { FieldName: 'background_profile', ImageFile: null, src: null, message: "(*) max upload file size : 300 KB, image resolution : (457 px * 219 px)", invalidImage: false },

]
const ListFieldDropdown = [
    //{ FieldName: 'lang', Options: [{ label: '... Select this ...', value: ''}, { label: 'Ind', value: 'ind'}, { label: 'Eng', value: 'eng'}] },
    { FieldName: 'status_active', Options: [{ label: 'Active', value: '1'}, { label: 'Inactive', value: '0'}] },
    // { FieldName: "txt_post_time", Options: []}
]
const ListFieldColorPicker = [
    {FieldName: 'top_menu_color', Hex:'#ffffff'},
    {FieldName: 'module_title', Hex:'#690d3a'},
    {FieldName: 'text_footer_color', Hex:'#690d3a'},
    {FieldName: 'background_top_button', Hex:'#690d3a'},
    {FieldName: 'text_color_top_button', Hex:'#690d3a'},
    {FieldName: 'text_color_btn_submit', Hex:'#ffffff'},
];
const ListFieldTextarea = [
    {FieldName: 'text_email_body_publish', message:'<ul><li><span>&nbsp;insert Project Title using : &lt;project_title&gt;</span></li> <li><span>&nbsp;insert Recipient Name using : &lt;full_name&gt;</span></li> <li><span>&nbsp;insert Project Description using : &lt;description&gt;</span></li> <li><span>&nbsp;insert Start Date using : &lt;start_date&gt;</span></li> <li><span>&nbsp;insert Project Period Length using : &lt;duration_length&gt;</span></li> <li><span>&nbsp;insert roject Period Type using : &lt;duration_period_type&gt;</span></li> <li><span>&nbsp;insert Average Time Needed using : &lt;avg_time_needed&gt;</span></li> <li><span>&nbsp;insert Registration Closed using : &lt;registation_closed_by&gt;</span></li> <li><span>&nbsp;insert Project Manager using : &lt;project_manager&gt;</span></li></ul>'},
    {FieldName: 'text_email_body_rejected', message:'<ul><li><span>&nbsp;insert Project Title using : &lt;project_title&gt;</span></li> <li><span>&nbsp;insert Recipient Name using : &lt;full_name&gt;</span></li> <li><span>&nbsp;insert Project Manager using : &lt;project_manager&gt;</span></li></ul>'},
    {FieldName: 'text_email_body_approved', message:'<ul><li><span>&nbsp;insert Project Title using : &lt;project_title&gt;</span></li> <li><span>&nbsp;insert Recipient Name using : &lt;full_name&gt;</span></li> <li><span>&nbsp;insert Project Manager using : &lt;project_manager&gt;</span></li> <li><span>&nbsp;insert Start Date using : &lt;start_date&gt;</span></li></ul>'},
];
const ListFieldGradientPicker = [
    {FieldName: 'top_menu_background', value:'linear-gradient(to right, #f58220 0%, #e45053 50%, #d31d85 100%)', picker:[{id:'1',hex:'#f58220', offset:''},{id:'2',hex:'#e45053', offset:''},{id:'3',hex:'#d31d85', offset:''}]},
    {FieldName: 'top_menu_border', value:'linear-gradient(to right, #f58220 0%, #e45053 50%, #d31d85 100%)', picker:[{id:'1',hex:'#f58220', offset:''},{id:'2',hex:'#e45053', offset:''},{id:'3',hex:'#d31d85', offset:''}]},
    {FieldName: 'background_btn_submit', value:'linear-gradient(to right, #f58220 0%, #e45053 50%, #d31d85 100%)',  picker:[{id:'1',hex:'#f58220', offset:''},{id:'2',hex:'#e45053', offset:''},{id:'3',hex:'#d31d85', offset:''}]},
    {FieldName: 'footer_background', value:'linear-gradient(to right, #f88a18, #ffcb05, #f236a1)', picker:[{id:'1',hex:'#f88a18', offset:''},{id:'2',hex:'#ffcb05', offset:''},{id:'3',hex:'#f236a1', offset:''}]},
]

class vw_theme_dtl extends Component{
    constructor(props){
        super(props)
        this.state = {
            background: '#fff',
            activeColorPicker:'',
            items:{},
            loadData:true,
            file: null,
            user_id:null,
            editData:false,
            isDelete:false,
            file_path: env.userDocument,
            user_account:null,
            ListColumns:[],
            srcImage:ListFieldImage,
            showPopup: true,
            offset:100,
            platform_id: LoginData.Security_getPlatformId(),
            Loading:true,
            cancelDelete:false,
            showModal:false
        };
        this.fileInput = React.createRef();
        this.handleChangeText = this.handleChangeText.bind(this);
        LoginData.Security_IsLogin().then((response)=>{
            if(response){
                LoginData.Security_RedirectAdmin();
            }
        });
    }
    
    componentDidMount(){
        this.getListColumns();
    }

    handleClose(e){
        this.setState({showModal:false})
    }

    validateMaxTheme= async ()=>{
        if(this.state.editData==false){
            const credentials ={
                category:"COUNT",
                platform_id:this.state.platform_id
            }
            let isi = await AuthHelpers.postData('findTalentTheme/ListData',credentials);
            if(isi.status==200){
                if(isi.data.data >= 2){
                    alert("you have reached the maximum limit in creating the theme, maximum limit: 2")
                    this.props.history.push({
                        pathname: AllRoute.adminTheme,
                    })
                }
            }
        }
    }

    getListColumns=async()=>{
        let responseJson = await AuthHelpers.postData('findTalentTheme/ListData',{category:"COLUMNS"});
        if (responseJson.status != 200){
            alert(responseJson);
            return;
        }

        this.setState({
            ListColumns: responseJson.data.data,
        },
        ()=> {
            this.getDetail();
        });
        
    }
    getDetail=async()=>{
        const { data } = this.props.location;

        if(data!== undefined){
            this.setState({editData:true});
            let responseJson = await AuthHelpers.postData("findTalentTheme/SelectData",data);
            // console.log(responseJson.data);
            if(responseJson.status == 200){
               this.setState({
                   items:responseJson.data.data
                });
            }else{
                alert(responseJson);
            }
        }
        this.validateMaxTheme();
        this.storeEditData();
    }

    storeEditData(){
        var IsEdit = this.state.editData;
        const {ListColumns, srcImage, items, file_path} = this.state;
        for(var i = 0; i < ListColumns.length; i++){
            var Field = ListColumns[i].Field;

            if(IsEdit){
                ListColumns[i].Default = items[Field];
            }
            var IsImage = ListFieldImage.filter(v => v.FieldName == Field).length > 0;
            var IsDropdown = ListFieldDropdown.filter(v => v.FieldName == Field).length > 0;
            var IsColorPick = ListFieldColorPicker.filter(v => v.FieldName == Field).length > 0; 
            var IsTextarea = ListFieldTextarea.filter(v => v.FieldName == Field).length > 0; 
            var IsGradient = ListFieldGradientPicker.filter(v => v.FieldName == Field).length > 0;
            if(IsImage){
                var idx_image = ListFieldImage.findIndex(x=> x.FieldName == Field);
                srcImage[idx_image].src = file_path + "theme/"+items[Field];
            }
            else if (IsColorPick){
                var idx = ListFieldColorPicker.findIndex(v=>v.FieldName==Field);
                ListFieldColorPicker[idx].Hex = items[Field];
            }
            else if (IsTextarea){
                var idx = ListFieldTextarea.findIndex(v=>v.FieldName==Field);
                ListFieldTextarea[idx].Hex = items[Field];
            }
            else if(IsGradient){
                var idx = ListFieldGradientPicker.findIndex(v=>v.FieldName==Field);
                var bg = ListFieldGradientPicker[idx];
                //bg.value = items[Field];
                var arrColor = this.loadEachGradientColor(items[Field]);

                bg.picker[0].hex = arrColor[0];
                bg.picker[1].hex = arrColor[1];
                bg.picker[2].hex = arrColor[2];

                bg.value = generateStringGradient(idx);
            }
        }
        this.setState({Loading: false});
    }
    loadEachGradientColor(str){
        if(str){
            var sub0 = str.replace(' 0 0 100% 0/0 0 3px 0 stretch','');
            var sub1 = sub0.replace('linear-gradient(to right,','');
            var sub2 = sub1.replace(' ','');
            var sub3 = sub2.replace(')','');
    
            return sub3.split(',');
        }
        else{
            return ['#f50e0e','#F8E71C', '#BD10E0']
        }
        
    }
    renderOptions(Field){
        var renderOptions = [];
        var idx = ListFieldDropdown.findIndex(v => v.FieldName == Field);
        var optionDropdown = ListFieldDropdown[idx].Options;
        for(var x = 0; x < optionDropdown.length; x++){
            var opt = optionDropdown[x];
            renderOptions.push(
                <option value={opt.value}>{opt.label}</option>
            )
        }
        return renderOptions;
    }
    
    renderAllFields(){
        if(this.state.Loading){
            return null;
        }
        var renderAllFields = [];
        var IsEdit = this.state.editData;
        const {ListColumns, srcImage, items, file_path, firstLoad} = this.state;
        for(var i = 0; i < ListColumns.length; i++){
            var Field = ListColumns[i].Field;
            var defaultValueField = ListColumns[i].Comment;
            var typeColumn = ListColumns[i].Type;
            var defaultValue = items[Field];
            var IsIgnore = ListFieldIgnored.filter(v => v == Field).length > 0;
            if(IsIgnore){
                continue;
            }
            var IsImage = ListFieldImage.filter(v => v.FieldName == Field).length > 0;
            var IsDropdown = ListFieldDropdown.filter(v => v.FieldName == Field).length > 0;
            var IsColorPick = ListFieldColorPicker.filter(v => v.FieldName == Field).length > 0; 
            var IsFieldTextarea = ListFieldTextarea.filter(v => v.FieldName == Field).length > 0; 
            var IsGradient = ListFieldGradientPicker.filter(v => v.FieldName == Field).length > 0;

            if(IsImage){
                var idx_image = ListFieldImage.findIndex(x=> x.FieldName == Field);
                renderAllFields.push(
                    <div className="form-group field-useredit form-email required">
                        <label className="control-label">&nbsp; {fnBuildLabelName(Field)}<span style={{color:"#ff0404"}}>{ListFieldImage[idx_image].message}</span></label>
                        <input type="file" class="form-control-file" ref={this.fileInput} onChange={this.ajaxFileUploadImage.bind(this)} name={Field} id={Field} size="40"/>
                        <img style={{width:"160px",height:"auto"}}  required src={srcImage[idx_image].src} alt="" />
                        
                        <div className="help-block"></div>
                    </div>
                )
            }
            else if(IsFieldTextarea){
                
                var idx_textarea = ListFieldTextarea.findIndex(x=> x.FieldName == Field);
                renderAllFields.push(
                    <div className="form-group field-useredit form-email required">
                        <label className="control-label">&nbsp; {fnBuildLabelName(Field)}                     
                            <span style={{color:"#ff0404"}}>
                            <div dangerouslySetInnerHTML={ {__html:ListFieldTextarea[idx_textarea].message} } />
                            </span>                         
                        </label>
                        <textarea id={Field} style={{width:"100%"}} required className="form-control" rows="5" defaultValue={defaultValue} name={Field} onChange={this.handleChangeText} placeholder={defaultValue==null? "default : "+defaultValueField:""} />
                        <div className="help-block"></div>
                    </div>
                )
            }
            else if(IsDropdown){
                renderAllFields.push(
                    <div className="form-group field-useredit form-email required">
                        <label className="control-label">&nbsp; {fnBuildLabelName(Field)}<span style={{color:"#ff0404"}}>(*)</span></label>
                        <select id="profile-country" style={{width:"150px"}} className="form-control" value={defaultValue} name={Field} onChange={this.handleChangeDropdown.bind(this)} required>
                            {this.renderOptions(Field)}
                        </select>
                        <div className="help-block"></div>
                    </div>
                )
            }
            else if(IsColorPick){
                renderAllFields.push(
                    <div className="form-group field-useredit form-email required">
                        <label className="control-label">&nbsp; {fnBuildLabelName(Field)}</label>
                        <div className="form-inline">
                            <input type="text" id={Field} style={{width:"20%"}} className="form-control" defaultValue={defaultValue} name={Field} onKeyDown={this.handleReadOnly.bind(this)} placeholder={defaultValue==null? "default : "+defaultValueField:""}/>
                            <button type="button" className="btn btn-primary" required data-toggle="modal" onClick={this.handlePickColor.bind(this)} name={Field} data-target="#myModal">Pick Color</button>
                        </div>
                        <div className="help-block"></div>
                    </div>
                )
            }
            else if(IsGradient){
                var idx = ListFieldGradientPicker.findIndex(v=>v.FieldName==Field);
                var bg = ListFieldGradientPicker[idx];
                var preview = bg.value;
                renderAllFields.push(
                    <div className="form-group field-useredit form-email required">
                        <label className="control-label">&nbsp; {fnBuildLabelName(Field)}</label>
                        <div className="form-inline">
                            <button  className="btn btn-primary" style={{width:"20%", height:"35px", backgroundImage: preview,}} disabled></button>
                            <input type="text" id={Field} required style={{width:"55%"}} defaultValue={defaultValue} className="form-control" name={Field} onKeyDown={this.handleReadOnly.bind(this)} placeholder={defaultValue==null? "default : "+defaultValueField:""} />
                        </div>
                        <div className="form-inline">
                            <button type="button" className="btn" data-toggle="modal" onClick={this.handlePickColor.bind(this)} name={Field+"|1"} data-target="#myModal" style={{backgroundColor: bg.picker[0].hex, border:'solid'}}></button>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <button type="button" className="btn" data-toggle="modal" onClick={this.handlePickColor.bind(this)} name={Field+"|2"} data-target="#myModal" style={{backgroundColor: bg.picker[1].hex, border:'solid'}}></button>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <button type="button" className="btn" data-toggle="modal" onClick={this.handlePickColor.bind(this)} name={Field+"|3"} data-target="#myModal" style={{backgroundColor: bg.picker[2].hex, border:'solid'}}></button>
                        </div>
                        <div className="help-block"></div>
                    </div>
                )
            }
            // else if (Field == 'txt_post_time'){
            //     renderAllFields.push(
            //         <div className="form-group field-usereditform-email required">
            //             <label className="control-label">&nbsp; {fnBuildLabelName(Field)}<span style={{color:"#ff0404"}}>(*) format pengisian: sec-min-hour-day-week-month-years-decade #ago</span></label>
            //             <input type="text" id={Field} style={{width:"75%"}} className="form-control" defaultValue={defaultValue} name={Field} onChange={this.handleChangeText.bind(this)} pattern="[a-z].{1,}-[a-z].{1,}-[a-z].{1,}-[a-z].{1,}-[a-z].{1,}-[a-z].{1,}-[a-z].{1,}-[a-z].{1,}#[a-z].{1,}" title="Txt Post Time" required title="Txt Post Time"/>
            //             <div className="help-block"></div>
            //         </div>
            //     )
            // }
            
            else{
                
                renderAllFields.push(
                    <div className="form-group field-useredit form-email required">
                        <label className="control-label">&nbsp; {fnBuildLabelName(Field)} {typeColumn=="text"? null : <span style={{color:"#ff0404"}}>(*)</span>}</label>
                        <input type="textarea" id={Field} style={{width:"100%"}} className="form-control" defaultValue={defaultValue} name={Field} onChange={this.handleChangeText} placeholder={defaultValue==null? "default : "+defaultValueField:""} required/>
                        <div className="help-block"></div>
                    </div>
                )
            }
        }
        return renderAllFields;
    }
    ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png/i;
        var filename = upload_field.target.value;
        var imagename = filename==null? "": filename.replace("C:\\fakepath\\","");

        var name = upload_field.target.name;
        if (filename.search(re_text) == -1) 
        {
            alert("File must be an image");
            upload_field.target.form.reset();
            return 0;
        }
        
        var FileSize = upload_field.target.files[0].size / 1024 / 1024 / 1024; // in KB
        if (FileSize > 300) {
            alert('File size exceeds 300 KB');
            upload_field.target.form.reset();
            return 0;
        }
        
        var idx = ListFieldImage.findIndex(x=> x.FieldName == name);

        ListFieldImage[idx].ImageFile = upload_field.target.files[0];
        ListFieldImage[idx].src = URL.createObjectURL(upload_field.target.files[0]);

        this.setState({     
            srcImage: ListFieldImage
        })
        return 1;
    }

    submit=async(event)=>{
        event.preventDefault();
        const {ListColumns, srcImage} = this.state;
        //console.log(this.state.ListColumns);

        var IsEdit = this.state.editData;
        var IsDelete = this.state.isDelete;
        if(IsDelete){
            var i = ListColumns.findIndex(v => v.Field == 'id');
            fd.append("id", ListColumns[i].Default);
            let responseJson = await AuthHelpers.postData("findTalentTheme/DeleteData", fd);
            if(responseJson.status == 200){
                alert("DATA HAS BEEN DELETED");
                window.location.href = AllRoute.adminTheme;
            }else{
                alert(responseJson);
            }
            return;
        }

        
        for(var i = 0; i < ListColumns.length; i++){
            var Field = ListColumns[i].Field;
            var IsIgnored = ListFieldIgnored.filter(v => v == Field).length > 0;

            if(Field == 'lang'){
                var val = ListColumns[i].Default;
                if(val == 'null' || val == undefined || val == null){
                    alert("Please Fill Out this Field: 'Lang' ");
                    return;
                }
            }

            if(IsIgnored){
                if(IsEdit && Field == 'id'){
                    fd.append("id", ListColumns[i].Default);
                }
                continue;
            }

            var IsImage = ListFieldImage.filter(v => v.FieldName == Field).length > 0;
            if(IsImage){
                var idx_image = ListFieldImage.findIndex(x=> x.FieldName == Field);
                var FileImage = ListFieldImage[idx_image].ImageFile;
                if (!IsEdit && FileImage == null){
                    alert("Please Select a File for this field : " + Field);
                    return;
                }
                if(FileImage!=null){
                    fd.append(Field, FileImage);
                }
            }
            else{
                var val = ListColumns[i].Default;
                if(val == 'null' || val == undefined || val == null){
                    val = ListColumns[i].Comment
                }
                // var strAppend = " 0 0 100% 0/0 0 3px 0 stretch"
                // if(Field != "border_menu" || ListColumns[i].Default.includes(strAppend)){
                //     strAppend = "";
                // }
                fd.append(Field, val);

            }
        }
        var dataUser = AuthHelpers.getUserInfo();
        fd.append("user_account", dataUser.account);
        fd.append("user_modified", dataUser.id);
        fd.append("platform_id", this.state.platform_id);

        if(!this.state.cancelDelete){
            if(!this.state.deleteData){
                if(IsEdit){
                    let responseJson = await AuthHelpers.postData("findTalentTheme/UpdateData", fd);
                    if(responseJson.status == 200){
                        alert("DATA HAS BEEN UPDATED");
                        window.location.href = AllRoute.adminTheme;
                    }else{
                        alert(responseJson);
                    }
                }
                else{
                    let responseJson = await AuthHelpers.postData("findTalentTheme/InsertData", fd);
                    if(responseJson.status == 200){
                        alert("DATA HAS BEEN CREATED");
                        window.location.href = AllRoute.adminTheme;
                    }else{
                        alert(responseJson);
                    }
                }
            }
        }
        this.setState({cancelDelete:false})
    }
    render(){
        const { editData, ListColumns, showModal } = this.state;
        const ListDataLength = ListColumns.length;
        return(
            <>
                            <style>{
                                `.control-label{
                                    top: unset;
                                }
                                .form-control-file{
                                    margin-bottom: 1%;
                                }
                                .widthMaxModal{
                                    max-width: 260px;
                                }
                                .modal-content{
                                    align-items: center;
                                }

                                `
                                }
                            </style>
                            <div className="col-md-9">
                                <div className="panel panel-default">
                                    <div className="panel-heading">
                                        <strong>Theme</strong> administration 
                                    </div>
                                    <div className="clearfix">
                                        <div className="panel-body">
                                            <a className="fa-pull-right btn btn-default" href={AllRoute.adminTheme} label="Back to overview" data-ui-loader="">
                                                <i className="fa fa-arrow-left aria-hidden="></i> Back to overview</a>        
                                                <h4 className="pull-left"></h4>
                                        </div>
                                    </div>
                                    <div className="panel-body">
                                        <Tabs
                                            id="controlled-tab-example"
                                            activeKey='edit'
                                            >
                                            <Tab eventKey="edit" 
                                                title={this.state.editData ? 'Edit : Theme': 'New Data' }  >
                                            </Tab>
                                        </Tabs> 
                                        <form id="czfrom" onSubmit={this.submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                            <div className="tab-content">
                                                <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                                    {this.renderAllFields()}                                                    
                                                </div>
                                            </div>
                                            <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                                           
                                        </form>
                                    </div>
                                    {/* POPUP */}
                                    <Modal 
                                        show={showModal} 
                                        onHide={this.handleClose.bind(this)}
                                        dialogClassName='widthMaxModal'
                                    >
                                        <Modal.Header>
                                            <Modal.Title>Pick a Color</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <SketchPicker  
                                                color={ this.state.background }
                                                onChangeComplete={ this.handleChangeColor.bind(this) }
                                            />
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={this.handleClose.bind(this)}>
                                                Close
                                            </Button>
                                            <Button variant="primary" onClick={this.handleChangeComplete.bind(this)}>
                                                Save Changes
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>
                                    {/* END POPUP */}
                                </div>
                            </div>
        </>
        );
    }
    handleChangeDropdown(event){
        const {ListColumns, items} = this.state;

        var tampung = ListColumns;
        var tampung2 = items;
        var idx = tampung.findIndex(v => v.Field == event.target.name);
        tampung[idx].Default = event.target.value;
        tampung2[event.target.name] = event.target.value;
        this.setState({ListColumns: tampung, items: tampung2});
    }
    handleChangeText(event){
        const {ListColumns} = this.state;

        var tampung = ListColumns;
        
        var idx = tampung.findIndex(v => v.Field == event.target.name);
        tampung[idx].Default = event.target.value;
        this.setState({ListColumns: tampung});
        // console.log(ListColumns);
    }
    handleChangeColor = (color) => {
        this.setState({ background: color.hex });
        var Field = this.state.activeColorPicker;
        var IsColorPick = ListFieldColorPicker.filter(v => v.FieldName == Field).length > 0;

        if (IsColorPick){
            var i = ListFieldColorPicker.findIndex(v => v.FieldName == Field);
            ListFieldColorPicker[i].Hex = color.hex;
        }else{
            var FieldGradient = SplitIdPickerGradient(Field, 0);
            var IdPickerGradient = SplitIdPickerGradient(Field, 1);
            var ItemGradient = ListFieldGradientPicker.filter(v=>v.FieldName == FieldGradient);
            var i = ListFieldGradientPicker.findIndex(v => v.FieldName == FieldGradient);
            var x = ItemGradient[0].picker.findIndex(v => v.id == IdPickerGradient);
            ListFieldGradientPicker[i].picker[x].hex = color.hex;
            ListFieldGradientPicker[i].value = generateStringGradient(i);
        }
    }
    handlePickColor(e){
        var Field = e.target.name;
        var FieldGradient = SplitIdPickerGradient(Field, 0);
        
        var ItemGradient = ListFieldGradientPicker.filter(v=>v.FieldName == FieldGradient);
        var IsGradient = ItemGradient.length > 0;
        if(IsGradient){
            var i = ListFieldGradientPicker.findIndex(v => v.FieldName == FieldGradient);
            var IdPickerGradient = SplitIdPickerGradient(Field, 1);
            var x = ItemGradient[0].picker.findIndex(v => v.id == IdPickerGradient)
            //document.getElementById("offset").value = ListFieldGradientPicker[i].picker[x].offset;
            this.setState({
                activeColorPicker: e.target.name, 
                background: ListFieldGradientPicker[i].picker[x].hex, 
                //offset: ListFieldGradientPicker[i].picker[x].offset
            })
        }else{
            var i = ListFieldColorPicker.findIndex(v => v.FieldName == Field);
            this.setState({activeColorPicker: e.target.name, background: ListFieldColorPicker[i].Hex})
        }
        this.setState({showModal:true})
    }
    handleChangeComplete = () => {
        var color = this.state.background;
        var Field = this.state.activeColorPicker;
        var IsColorPick = ListFieldColorPicker.filter(v => v.FieldName == Field).length > 0;
        const {ListColumns} = this.state;
        var tampung = ListColumns;
        if (IsColorPick){
            document.getElementById(Field).value = color;
            var idx = tampung.findIndex(v => v.Field == Field);
            tampung[idx].Default = color;
        }else{
            var FieldGradient = SplitIdPickerGradient(Field, 0);
            var i = ListFieldGradientPicker.findIndex(v => v.FieldName == FieldGradient);
            var value = generateStringGradient(i);
            document.getElementById(FieldGradient).value = value;
            var idx = tampung.findIndex(v => v.Field == FieldGradient);
            tampung[idx].Default = value;
        }
        
        this.setState({ListColumns: tampung, showModal:false});
    };
    handleDelete=async(e)=>{
        if (window.confirm("Are you sure to delete this data?")) 
        {
            this.setState({
                isDelete: true,
                cancelDelete:false
            })
        } 
        else
        {
          this.setState({cancelDelete:true})
        } 
    }
    handleReadOnly(e){
        e.preventDefault();
    }
}
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
function SplitIdPickerGradient(strId, idx){
    var arr = strId.split('|');
    return arr[idx];
}

function generateStringGradient(idx){
    var hex1 = ListFieldGradientPicker[idx].picker[0].hex;
    var hex2 = ListFieldGradientPicker[idx].picker[1].hex;
    var hex3 = ListFieldGradientPicker[idx].picker[2].hex;

    var offset1 = ListFieldGradientPicker[idx].picker[0].offset + "%";
    var offset2 = ListFieldGradientPicker[idx].picker[1].offset + "%";
    var offset3 = ListFieldGradientPicker[idx].picker[2].offset + "%";
    // console.log(offset1)

    // console.log(offset2)

    // console.log(offset3)

    var strAppend = " 0 0 100% 0/0 0 3px 0 stretch"
    //return "linear-gradient(to right, " + hex1 + " " + offset1 + ", " + hex2+ " " + offset1 + ", " + hex3+ " " + offset3 + ")"
    return "linear-gradient(to right, " + hex1 + ", " + hex2 + ", " + hex3 + ")";
}
    
export default withRouter(vw_theme_dtl);