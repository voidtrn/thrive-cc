import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../../helpers/axiosLibrary';
import routeAll from '../../../helpers/route';
import { useHistory } from '../../../helpers/useHistory';
import { env, securityData } from '../../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../../components/Loading';
import NavMenu from '../shared/navMenu.js';
import SideBarMenuAdmin from './adminMenu.js';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

import BadgeMember from './../badgeMember';

function AdminGrowthQuestionDetail(props) {

    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [items, setItems] = useState({ 
        id: null,
        question_type: 3,
        awb_growth_quest_id: "",
        question_order: "",
        question: "",
        question_eng: "",
        correct_answer: "",
        correct_answer_eng: "",
        correct_answer_old: "",
        correct_answer_old_eng: "",
        answer_1: "",
        answer_1_eng: "",
        answer_1_old: "",
        answer_1_old_eng: "",
        answer_2: "",
        answer_2_eng: "",
        answer_2_old: "",
        answer_2_old_eng: "",
        answer_3: "",
        answer_3_eng: "",
        answer_3_old: "",
        answer_3_old_eng: "",
        correct_point: "",
        user_created: "",
    })

    const [itemsDetail, setItemsDetail] = useState([])
    
    const [listQuarter, setListQuarterQUest] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const fileInput = React.createRef()
    const reader = new FileReader()
    const [file, setFile] = useState(null)
    const [invalidImage, setInvalidImage] = useState(false)
    const file_path = env.userDocument
    const [loading, setLoading] = useState(true)


    const limit     = 10000
    const offset    = 0
    const routeAdmin = routeAll.routesAdmin

    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const user_account = securityData.Security_UserAccount()

    
    const getQuarterQuestList = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset: offset,
            category: "",
            platform_id: securityData.Security_getPlatformId()
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbGrowthQuest/ListData',credentials);
        setListQuarterQUest(isi.data.data)
        // setLoading(false)
    })

    const getDetail = useCallback(async () => {
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if (data.md5ID !== null) {
            setEditData(true)
            let response = await axiosLibrary.postData('awbGrowthQuestion/SelectData', data);
            if (response.status === 200) {
                setItems(response.data.data)
                setItemsDetail(response.data.data)
                setLoading(false)
            } else {
                alert(response);
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }, [props.location.search])

    const validateImage = (e) => {
        e.preventDefault();
        if (invalidImage) {
            alert("ERROR IN THE UPLOAD IMAGE SECTION, PLEASE USE A VALID IMAGE");
            return false
        } else {
            submit();
            return true
        }
    }

    const DeleteConfirm = async () => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Are you sure to delete this data?")) {
            setDeleteData(true)
            setCancelDelete(false)
        }
        else {
            setCancelDelete(true)
        }
    }



    const submit = async () => {
        // e.preventDefault();
        if (!cancelDelete) {
            if (!deleteData) {

                const fd = new FormData();

                if(items.id !=undefined || items.id !=null){
                    fd.append("id", items.id);           
                    fd.append("awb_growth_quest_id", items.awb_growth_quest_id);
                    fd.append("question_type", items.question_type);
                    fd.append("min_character_answer", 0);

                    fd.append("question_order", items.question_order);
                    fd.append("question", items.question);
                    fd.append("question_eng", items.question_eng);
                    fd.append("correct_answer", items.correct_answer);
                    fd.append("correct_answer_eng", items.correct_answer_eng);
                    fd.append("correct_answer_old", itemsDetail.correct_answer);
                    fd.append("correct_answer_old_eng", itemsDetail.correct_answer_eng);
                    fd.append("correct_point", items.correct_point);
                    fd.append("user_created", user_id);
        
                    let responseJson = await axiosLibrary.postData("awbGrowthQuestion/UpdateData", fd);
                
                    if (responseJson.status === 200) {
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.AdminGrowthQuestion.path)
                    } else {
                        alert(responseJson);
                    }
                            
                }
                else{
                    fd.append("awb_growth_quest_id", items.awb_growth_quest_id);
                    fd.append("question_type", items.question_type);
                    fd.append("question_order", items.question_order);
                    fd.append("correct_point", items.correct_point);
    
                    fd.append("min_character_answer", 0);
                    fd.append("question", items.question);
                    fd.append("question_eng", items.question_eng);
    
                    fd.append("correct_answer", items.correct_answer);
                    fd.append("correct_answer_eng", items.correct_answer_eng);
    
                    
                    fd.append("status_active", items.status_active);

                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbGrowthQuestion/InsertData", fd);
                    if (responseJson.status === 200) {
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.AdminGrowthQuestion.path)
                    } else {
                        alert(responseJson);
                    }
                }

               
            } else {
                //for delete data
                const parameter = {
                    id: items.id
                }
                let responseJson = await axiosLibrary.postData("awbGrowthQuestion/DeleteData", parameter);
                if (responseJson.status === 200) {
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.AdminGrowthQuestion.path)
                } else {
                    alert(responseJson);
                }
            }
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

    useEffect(() => {
        getDetail()
        getQuarterQuestList()
    }, [Columns])

    useEffect(() => {
        if (!editData) {
            setItems(items => ({ ...items, category: 'Custom' }))
        }
    }, [editData])

    const setStateImage = (HtmlElement, stateFile, invalidImage) => {
        document.getElementById("upload-name").innerHTML = HtmlElement

        setFile(stateFile)
        setInvalidImage(invalidImage)
    }

    const formatSizeUnits = (bytes) => {

        if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + ' GB'; }
        else if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + ' MB'; }
        else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + ' KB'; }
        else if (bytes > 1) { bytes = bytes + ' bytes'; }
        else if (bytes === 1) { bytes = bytes + ' byte'; }
        else { bytes = '0 byte'; }
        return bytes;
    }

    const addDefaultSrc = (ev) => {
        // ev.target.src =  file_path+"profile/resized/default.jpg";
        ev.target.src = "";
    }

    const ajaxFileUploadImage = (upload_field) => {
        var re_text = /\.jpg|\.gif|\.jpeg|\.png/i;
        var filename = upload_field.target.value;
        var imagename = filename == null ? "" : filename.replace("C:\\fakepath\\", "");
        if (filename.search(re_text) === -1) {
            alert("File must be an image");
            upload_field.target.form.reset();
            return 0;
        }
        var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 1) {
            alert('File size exceeds 1 MB');
            upload_field.target.form.reset();
            return 0;
        }

        if (upload_field.target.files[0] !== undefined) {
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setStateImage(imagename + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')', URL.createObjectURL(upload_field.target.files[0]), false)
                }
                img.onerror = () => {
                    setStateImage('Invalid image content', null, true)
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(upload_field.target.files[0]);
        }

        return 1;
    }

    return (
        <>
            <NavMenu adminLevel={props.adminLevel} {...props} />


            <header className="masthead">
                <div className="overlay">
                    <div className=" container ">
                        <div className="row d-flex ">
                            <div className="col-md-12  d-flex justify-content-center title-nav-page-text" style={{ paddingTop: "5px", paddingBottom: "5px" }} >
                                Admin Page
                            </div>
                        </div>
                    </div>
                </div>
            </header>


            <section className="page-section"></section>

            <div className="container page-section" style={{ marginTop: "-50px" }} id="access-idp">
                <div className="row d-flex ">
                    <div className="col-lg-3">
                        <SideBarMenuAdmin adminLevel={props.adminLevel} {...props} />
                    </div>
                    <div className="col-lg-9">
                        <div className="container page-section" style={{ marginTop: "-50px" }} id="access-idp">
                            <div className="card card-white">
                                <div className="card-header ">
                                    <div className="row d-flex ">
                                        <span className="text-blue">
                                            Quest (Text with Answer) - Admin
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body ">

                                    

                                    <form id="czfrom" onSubmit={validateImage} method="post" style={{ display: "block" }} encType='multipart/form-data'>
                                       
                                    <input type="hidden" name="question_type" id="inputEmail3"   value={items.question_type}  />
                                    <input type="hidden" name="id" id="inputEmail3"   value={items.id}  />

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Quater - Quest</label>
                                            <div className="col-sm-10">                                          
                                                <select value={items.awb_growth_quest_id}
                                                    onChange={handleInputChange.bind(this)} id="awb_growth_quest_id" name="awb_growth_quest_id" style={{width:"100%"}} className="form-control">
                                                    <option value="">-select one-</option>
                                                    {listQuarter.map(
                                                        (items) =>
                                                        <option key={items.id} value={items.id}>
                                                            {items.quarterName} - Quest {items.number} - {items.title}
                                                        </option>
                                                    )
                                                    }
                                                </select>
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Question Order</label>
                                            <div className="col-sm-2">
                                                <input type="number"  min="0" required className="form-control" name="question_order" id="inputEmail3"   value={items.question_order}   onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Question</label>
                                            <div className="col-sm-10">
                                                <textarea placeholder="Bahasa Indonesia"   type="text" required className="form-control" name="question" id="inputEmail3"  onChange={handleInputChange}  value={items.question}  />
                                            </div>
                                            <label for="inputEmail3" className="col-sm-2 col-form-label"></label>
                                            <div className="col-sm-10">
                                                <textarea type="text"  placeholder="English" required className="form-control mt-2" name="question_eng" id="inputEmail3"  onChange={handleInputChange}  value={items.question_eng}  />
                                            </div>
                                        </div>

                                        
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Correct Point</label>
                                            <div className="col-sm-2">
                                                <input type="number" min="0" required className="form-control" name="correct_point" id="inputEmail3"   value={items.correct_point}   onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Correct Answer</label>
                                            <div className="col-sm-10">
                                                <input type="text" placeholder="Bahasa Indonesia"  required className="form-control" name="correct_answer" id="inputEmail3"  onChange={handleInputChange}  value={items.correct_answer}  />
                                            </div>
                                            <label for="inputEmail3" className="col-sm-2 col-form-label"></label>
                                            <div className="col-sm-10">
                                                <input type="text"   placeholder="English" required className="form-control mt-2" name="correct_answer_eng" id="inputEmail3"  onChange={handleInputChange}  value={items.correct_answer_eng}  />
                                            </div>
                                        </div>
                                        
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Status Active</label>
                                            <div className="col-sm-5">
                                                <select  className="form-control" 
                                                    value={items.status_active}  onChange={handleInputChange.bind(this)} required name="status_active" aria-invalid="false">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    <option value="1">Active</option>
                                                    <option value="0">No Active</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label"></label>
                                            <div className="col-sm-7">
                                                <a className="btn btn-warning" name="btnSubmit" href={routeAdmin.AdminGrowthQuestion.path}>Back</a>
                                                &nbsp;&nbsp;
                                                <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>
                                            </div>

                                            
                                            <div className="col-sm-3 text-sm-end">
                                               
                                                {(editData === false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button>)}
                                            </div>
                                        </div>

                                        
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminGrowthQuestionDetail;