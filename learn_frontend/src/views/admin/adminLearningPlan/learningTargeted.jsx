import React, {  
    useEffect, 
    useState
} from 'react';
import { useHistory } from '../../../helpers/useHistory';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { env, securityData } from '../../../helpers/globalHelper';
import routeAll from '../../../helpers/route';
import AdminDetailInput from '../../../components/adminDetailInput';
import DataTable from 'react-data-table-component';
import { LoadingDatatable } from '../../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function TargetedPlan(props){
    const history = useHistory()
    const [targetedData, setTargetedData] = useState({
        targetedBy: "",
    });
    const [submitData, setSubmitData] = useState(false);
    const [optionFunction, setOptionFunction] = useState([]);
    const [columnSet, setColumnSet] = useState([]);
    const [columnFunction, setColumnFunction] = useState([]);
    const [columnIMDL, setColumnIMDL] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [file, setFile] = useState([])
    const config = axiosLibrary.getAuthHeader();
    const platform_id = securityData.Security_getPlatformId()
    const reader = new FileReader()
    const file_path = env.assets + 'template/' +'import_targeted_imdl.xlsx'

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

        var stateCopy = Object.assign({}, targetedData);
        stateCopy[key] = value;
        setTargetedData(stateCopy)
    }

    const ajaxFileUploadExcel=(upload_field)=>{
        var re_text = /\.xls|\.xlsx|\.csv/i;

        if(upload_field.target.files[0]!== undefined){
            var filename = upload_field.target.value;
            var name = upload_field.target.name;
            const targetElement = columnIMDL.filter(v=>v.inputName===name)
            var maxSize = targetElement[0].maxSizeFile
            reader.onload = () => {
                if (filename.search(re_text) == -1) 
                    {
                        alert("File must be a worksheet file (excel)");
                        upload_field.target.form.reset();
                        return 0;
                    }
                    var FileSize = upload_field.target.files[0].size / 1024 / 1024 ; // in MB
                    if (FileSize > maxSize) {
                        alert(`File size exceeds ${maxSize} MB`);
                        upload_field.target.form.reset();
                        return 0;
                    }
                    setTargetedData({...targetedData,
                        [name]:upload_field.target.files[0],
                    })
                    setFile({...file,
                        [name]:URL.createObjectURL(upload_field.target.files[0]),
                    })            
            };
            
            reader.readAsDataURL(upload_field.target.files[0]);
        }       
    }

    const getAllFunction = async ()=>{
        let responseJson = await axiosLibrary.getData("awbPlatform/GetAllFunction",config);
        if(responseJson.status === 200){
            var hasil = responseJson.data.data;
            var response = hasil.map(({directorate}) => {
                return {
                  value: directorate,
                  label: directorate
                }
              });
            setOptionFunction(response)
        }else{
            alert(responseJson);
        }
    }

    const submit = (e)=>{
        e.preventDefault()
        props.submitLearningPlan(true)
        setSubmitData(true)
        // console.log([...fd]);
    }

    const submitDetail = async()=>{
        const fd = new FormData();
        Object.keys(targetedData).map(key =>
            {
                if(targetedData[key]!=="null" || targetedData[key] || targetedData[key]!==''||targetedData[key]!== undefined){
                    fd.append(key,Array.isArray(targetedData[key])?JSON.stringify(targetedData[key]):targetedData[key])
                }
            }
        )
        Object.keys(props.data).map(key =>
            {
                if(props.data[key]!=="null" || props.data[key] || props.data[key]!==''||props.data[key]!== undefined){
                    fd.append(key,props.data[key])
                }
            }
        )
        switch (targetedData.targetedBy) {
            case "function":
                let responseJson = await axiosLibrary.postData("awbLearningMainFocus/InsertDataByDirectorate", fd);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN REGISTERED");
                    history.push(routeAdmin.learningMainFocus.path)
                }else{
                    // alert(responseJson);
                    alert("FAILED TO REGISTERED, PLEASE TRY AGAIN.");
                }
                break;
            case "imdl":
                let responseJsonImport = await axiosLibrary.postData("awbLearningMainFocus/InsertDataByImport", fd);
                if(responseJsonImport.status === 200){
                    alert("DATA HAS BEEN IMPORTED");
                    history.push(routeAdmin.learningMainFocus.path)
                }else{
                    // alert(responseJson);
                    alert("FAILED TO REGISTERED, PLEASE TRY AGAIN.");
                }
                break;
            default:
                break;
        }
        setSubmitData(false)
    }

    useEffect(()=>{
        if(targetedData){
            ColumnSet()
            ColumnFunction()
            ColumnIMDL()
        }
    },[targetedData, optionFunction])

    useEffect(()=>{
        if(props.data.lp_type){
            setTargetedData(targetedData=>({...targetedData,targetedBy:props.data.lp_type==1?"function":props.data.lp_type==2?"imdl":""}))
        }
    },[props.data.lp_type])

    useEffect(()=>{
        if(props.data.listDirectorate){
            let listDataDirectorate = props.data.listDirectorate.map(({directorate}) => directorate);
            let getFilterOptionFunction = optionFunction.filter(v=>listDataDirectorate.includes(v.value));
            setTargetedData(targetedData=>({...targetedData,
                directorate:getFilterOptionFunction
            }))
        }
    },[optionFunction,props.data.listDirectorate])

    useEffect(()=>{
        if(props.data.listImdl){
            setTargetedData(targetedData=>({...targetedData,
                imdl:props.data.listImdl||[]
            }))
        }
    },[props.data.listImdl])

    useEffect(()=>{
        if(submitData && props.data.id_main_focus){
            submitDetail()
        }
    },[props.data.id_main_focus,submitData])

    useEffect(()=>{
        if(platform_id){
            getAllFunction()
        }
    },[])

    const ColumnSet = ()=>{
        const columnSet = [
            {label:'Targeted By', inputName:'targetedBy', inputValue:targetedData.targetedBy, inputType:'radio-inline', inputWidth:'25%', inputRequired: true, inputReadOnly: true, inputRadioData:[
                {inputLabel:"Function", inputId:"function"},
                {inputLabel:"IMDL", inputId:"imdl"},
            ]},
        ]
        setColumnSet(columnSet)
    }

    const ColumnFunction = ()=>{
        const columnFunction =  [
            {label:'List Function', inputName:'directorate', inputValue:targetedData.directorate, inputType:'select_multiple_search', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputSelect:optionFunction, inputLoading:optionFunction.length>0?false:true},
        ]
        setColumnFunction(columnFunction)
    }

    const ColumnIMDL = ()=>{
        const columnIMDL = [
            {label:'Import File', inputName:'import_file', inputValue:targetedData.import_file, inputType:'file_import', inputWidth:'100%', inputRequired: true, inputReadOnly: false, inputRuleImage:[
                'one file only','10 MB limit','Allowed types for worksheet : xls, xlsx or csv'
            ], InputAcceptData:'.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel', maxSizeFile:`10`, srcInput:file['import_file'], inputSelect:[]},
        ]
        setColumnIMDL(columnIMDL)
    }

    //datatables
    const columns = [
        
        {
            name: 'imdl',
            selector: row => row.id,
            sortable: true
        },
        {
            name: 'name',
            selector: row => row.name,
            sortable: true
        },
    ];
    
    const filteredItems = targetedData.imdl && targetedData.imdl.length >0 ? targetedData.imdl.filter(
        item => (item.name && item.name.toLowerCase().includes(filterText.toLowerCase()) )
                || (item.id && item.id.includes(filterText) )
    ) : "";

    const subHeaderComponent = 
    <>
        
        <input type="text" id="name" style={{width:"25%"}} placeholder="Filter table data..." className="form-control" name="name" maxLength="100" value={filterText} onChange={(e)=>setFilterText(e.target.value)}/>
        <button className="btn btn-danger " onClick={()=>{setFilterText("");setResetPaginationToggle(!resetPaginationToggle);}}>X</button>
    </>

    const renderDetailTargeted = ()=>{
        switch (targetedData.targetedBy) {
            case 'function':
                return(
                    <div>
                        <AdminDetailInput
                            data={columnFunction} 
                            changeData={(e,action)=>handleInputChange(e,action)}  
                            fileUpload={""} 
                            filePath={""}
                            editData={true}
                        />
                        <br/>
                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">{submitData?`Please Wait`:`Register`}</button>
                    </div>
                )
            case 'imdl':
                return(
                    <div>
                        <AdminDetailInput
                            data={columnIMDL} 
                            changeData={(e,action)=>handleInputChange(e,action)}  
                            fileUpload={(e)=>ajaxFileUploadExcel(e)} 
                            filePath={file_path}
                            editData={true}
                        />
                        <br/>

                        {targetedData.imdl.length > 0 &&
                            <>
                            <hr/>
                            <DataTable
                                //title="Contact List"
                                columns={columns}
                                data={filteredItems}
                                progressComponent={<LoadingDatatable/>}
                                pagination
                                paginationResetDefaultPage={resetPaginationToggle}
                                subHeader
                                subHeaderComponent={subHeaderComponent}
                            />
                            <hr/>
                            </>
                        }
                        

                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">{submitData?`Please Wait`:`Register`}</button>
                    </div>
                )
            default:
                return(
                    <div className="text-center"> Please Choose Targeted by first</div>
                )
        }
    }
    return(
        <div>
            <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                <AdminDetailInput
                    data={columnSet} 
                    changeData={(e,action)=>handleInputChange(e,action)} 
                    fileUpload={""} 
                    filePath={""}
                    editData={true}
                />
                <hr/>
                {renderDetailTargeted()}
            </form>
        </div>
    )
}

export default TargetedPlan;