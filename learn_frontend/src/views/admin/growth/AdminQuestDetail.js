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

function AdminGrowthQuestDetail(props) {

    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [items, setItems] = useState({ 
        awb_growth_quarter_id: "",
        number: "",
        start_date: "",
        end_date: "",
        title: "",
        title_eng: "",
        description: "",
        description_eng: "",
        finished_text: "",
        finished_text_eng: "",
        article_url: "",
        status_active: "",
        quest_type: "",
        checkbox_score: "",
        upload_score: "",
        learning_material_text: "",
        learning_material_text_eng: "",
        checkbox_text: "",
        checkbox_text_eng: "",
        upload_text: "",
        upload_text_eng: "",
        question_text: "",
        question_text_eng: "",
        sameday_score: "",
    })


    const [listQuarter, setListQuarter] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const fileInput = React.createRef()
    const reader = new FileReader()
    const [file, setFile] = useState(null)
    const [invalidImage, setInvalidImage] = useState(false)
    const file_path = env.userDocument
    const [loading, setLoading] = useState(true)


    const limit = 10000
    const offset = 0
    const routeAdmin = routeAll.routesAdmin

    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const user_account = securityData.Security_UserAccount()


    const getQuarterList = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset: offset,
            category: "",
            platform_id: securityData.Security_getPlatformId()
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbGrowthQuarter/ListData', credentials);
        setListQuarter(isi.data.data)
        // setLoading(false)
    })

    const getDetail = useCallback(async () => {
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if (data.md5ID !== null) {
            setEditData(true)
            let response = await axiosLibrary.postData('awbGrowthQuest/SelectData', data);
            if (response.status === 200) {
                setItems(response.data.data)
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

                fd.append("awb_growth_quarter_id", items.awb_growth_quarter_id);
                fd.append("number", items.number);
                fd.append("start_date", items.start_date);
                fd.append("end_date", items.end_date);
                fd.append("title", items.title);
                fd.append("title_eng", items.title_eng);
                fd.append("description", items.description);
                fd.append("description_eng", items.description_eng);
                fd.append("finished_text", items.finished_text);
                fd.append("finished_text_eng", items.finished_text_eng);
                fd.append("article_url", items.article_url);
                fd.append("status_active", items.status_active);
                fd.append("quest_type", 1);
                fd.append("checkbox_score", items.checkbox_score);
                fd.append("upload_score", items.upload_score);

                fd.append("learning_material_text", items.learning_material_text);
                fd.append("learning_material_text_eng", items.learning_material_text_eng);
                fd.append("checkbox_text", items.checkbox_text);
                fd.append("checkbox_text_eng", items.checkbox_text_eng);
                fd.append("upload_text", items.upload_text);
                fd.append("upload_text_eng", items.upload_text_eng);
                fd.append("question_text", items.question_text);
                fd.append("question_text_eng", items.question_text_eng);
                fd.append("sameday_score", items.sameday_score);

                {/*
                const IsFileAttached = fileInput.current.files.length > 0;
                if (IsFileAttached) {
                    fd.append("badge_image", fileInput.current.files[0]);
                }
                */}
                if (editData) {
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbGrowthQuest/UpdateData", fd);
                    if (responseJson.status === 200) {
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.AdminGrowthQuest.path)
                    } else {
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbGrowthQuest/InsertData", fd);
                    if (responseJson.status === 200) {
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.AdminGrowthQuest.path)
                    } else {
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id: items.id
                }
                let responseJson = await axiosLibrary.postData("awbGrowthQuest/DeleteData", parameter);
                if (responseJson.status === 200) {
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.AdminGrowthQuest.path)
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
        getQuarterList()
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
                                            Quest - Admin
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body ">



                                    <form id="czfrom" onSubmit={validateImage} method="post" style={{ display: "block" }} encType='multipart/form-data'>


                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Stage</label>
                                            <div className="col-sm-8">
                                                <select value={items.awb_growth_quarter_id}
                                                    onChange={handleInputChange.bind(this)} id="awb_growth_quarter_id" name="awb_growth_quarter_id" style={{ width: "100%" }} className="form-control">
                                                    <option value="">-select one-</option>
                                                    {listQuarter.map(
                                                        (itemQuarter) =>
                                                            <option key={itemQuarter.id} value={itemQuarter.id}>
                                                                {itemQuarter.name}
                                                            </option>
                                                    )
                                                    }
                                                </select>
                                            </div>
                                        </div>

                                        {
                                            /***
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Type of Quest</label>
                                            <div className="col-sm-5">
                                                <select className="form-control"
                                                    value={items.quest_type} onChange={handleInputChange.bind(this)} required name="quest_type" aria-invalid="false">
                                                    {editData ? null : <option value="">... Select this ...</option>}
                                                    <option value="1">Normal Quest</option>
                                                    <option value="2">Special Quest</option>
                                                </select>
                                            </div>
                                        </div>                                      
                                        * 
                                        * 
                                        */


                                        }


                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Number of Quest</label>
                                            <div className="col-sm-2">
                                                <input type="number" required className="form-control" name="number" id="inputEmail3" value={items.number} onChange={handleInputChange} min="0"/>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Quest Title Eng</label>
                                            <div className="col-sm-9">
                                                <textarea type="text" required className="form-control" name="title_eng" id="inputEmail3" value={items.title_eng} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Quest Title Bahasa</label>
                                            <div className="col-sm-9">
                                                <textarea type="text" required className="form-control" name="title" id="inputEmail3" value={items.title} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Quest Description Eng</label>
                                            <div className="col-sm-10">
                                                <textarea type="text" required className="form-control" name="description_eng" id="inputEmail3" value={items.description_eng} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Quest Description Bahasa</label>
                                            <div className="col-sm-10">
                                                <textarea type="text" required className="form-control" name="description" id="inputEmail3" value={items.description} onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3finished_text_eng" className="col-sm-2 col-form-label">Finished Quest Text Eng</label>
                                            <div className="col-sm-9">
                                                <textarea type="text" required className="form-control" name="finished_text_eng" id="inputEmail3finished_text_eng" value={items.finished_text_eng} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3finished_text" className="col-sm-2 col-form-label">Finished Quest Text Bahasa</label>
                                            <div className="col-sm-9">
                                                <textarea type="text" required className="form-control" name="finished_text" id="inputEmail3finished_text" value={items.finished_text} onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Start Date</label>
                                            <div className="col-sm-3">
                                                <input type="date" required className="form-control" name="start_date" id="inputEmail3" value={items.start_date} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">End Date</label>
                                            <div className="col-sm-3">
                                                <input type="date" required className="form-control" name="end_date" id="inputEmail3" value={items.end_date} onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="row ">
                                            <div className="col-sm-12">
                                                <hr />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Learning Material Text Eng</label>
                                            <div className="col-sm-9">
                                                <input type="text"  className="form-control" name="learning_material_text_eng" id="inputEmail3" value={items.learning_material_text_eng} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Learning Material Text Bahasa</label>
                                            <div className="col-sm-9">
                                                <input type="text"  className="form-control" name="learning_material_text" id="inputEmail3" value={items.learning_material_text} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Learning Material URL</label>
                                            <div className="col-sm-9">
                                                <input type="url"  className="form-control" name="article_url" id="inputEmail3" value={items.article_url} onChange={handleInputChange} />
                                            </div>
                                        </div>


                                        <div className="row ">
                                            <div className="col-sm-12">
                                                <hr />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Checkbox Text Eng</label>
                                            <div className="col-sm-9">
                                                <input type="text"  className="form-control" name="checkbox_text_eng" id="inputEmail3" value={items.checkbox_text_eng} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Checkbox Text Bahasa</label>
                                            <div className="col-sm-9">
                                                <input type="text"  className="form-control" name="checkbox_text" id="inputEmail3" value={items.checkbox_text} onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Checbox Score</label>
                                            <div className="col-sm-2">
                                                <input type="number" required  min="0" className="form-control" name="checkbox_score" id="inputEmail3" value={items.checkbox_score} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row ">
                                            <div className="col-sm-12">
                                                <hr />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Upload Text Eng</label>
                                            <div className="col-sm-9">
                                                <input type="text"  className="form-control" name="upload_text_eng" id="inputEmail3" value={items.upload_text_eng} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Upload Text Bahasa</label>
                                            <div className="col-sm-9">
                                                <input type="text"  className="form-control" name="upload_text" id="inputEmail3" value={items.upload_text} onChange={handleInputChange} />
                                            </div>
                                        </div>


                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Upload Score</label>
                                            <div className="col-sm-2">
                                                <input type="number"  min="0" required className="form-control" name="upload_score" id="inputEmail3" value={items.upload_score} onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="row ">
                                            <div className="col-sm-12">
                                                <hr />
                                            </div>
                                        </div>
                                            <div className="row mb-3">
                                                <label for="inputEmail3" className="col-sm-3 col-form-label">Question Text Eng</label>
                                                <div className="col-sm-9">
                                                    <input type="text"  className="form-control" name="question_text_eng" id="inputEmail3" value={items.question_text_eng} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Question Text Bahasa</label>
                                            <div className="col-sm-9">
                                                <input type="text"  className="form-control" name="question_text" id="inputEmail3" value={items.question_text} onChange={handleInputChange} />
                                            </div>
                                        </div>


                                        <div className="row ">
                                            <div className="col-sm-12">
                                                <hr />
                                            </div>
                                        </div>


                                         <div className="row mb-3">
                                                <label for="inputEmail3" className="col-sm-2 col-form-label">Sameday Score</label>
                                                <div className="col-sm-2">
                                                    <input type="number"  className="form-control" name="sameday_score" required id="inputEmail3" value={items.sameday_score} onChange={handleInputChange} />
                                                </div>
                                            </div>

                                            
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Status Active</label>
                                            <div className="col-sm-5">
                                                <select className="form-control"
                                                    value={items.status_active} onChange={handleInputChange.bind(this)} required name="status_active" aria-invalid="false">
                                                    {editData ? null : <option value="">... Select this ...</option>}
                                                    <option value="1">Active</option>
                                                    <option value="0">No Active</option>
                                                </select>
                                            </div>
                                        </div>



                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label"></label>
                                            <div className="col-sm-7">
                                                <a className="btn btn-warning" name="btnSubmit" href={routeAdmin.AdminGrowthQuest.path}>Back</a>
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

export default AdminGrowthQuestDetail;