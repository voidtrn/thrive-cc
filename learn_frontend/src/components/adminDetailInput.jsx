import React, {  } from 'react';
import { Form } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

function AdminDetailInput(props){
    const animated = makeAnimated()
    const file_path = props.filePath
    const editData = props.editData

    const addDefaultSrc = (ev)=>{
        // ev.target.src =  file_path+"profile/resized/default.jpg";
        ev.target.src = "";
    }

    const renderColumn = (data)=>data.map((v,idx)=>
        {
            switch (v.inputType.toLowerCase()) {
                case 'textarea':
                    return(
                        <div className="form-group field-usereditform-email required" key={idx}>
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <textarea id={v.inputName} style={{width:v.inputWidth,height:v.inputHeight||"200px"}} className="form-control" name={v.inputName} onChange={(e)=>props.changeData(e)} aria-required="true" aria-invalid="false" defaultValue={v.inputValue} required={v.inputRequired} readOnly={v.inputReadOnly}></textarea>
                            <div className="help-block"></div>
                        </div>
                    )
                case 'select':
                    return(
                        <div className="form-group field-profile-country" key={idx}>
                            <label className="control-label" htmlFor="profile-country">&nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <select id={v.inputName} style={{width:v.inputWidth}} className="form-control" 
                                value={v.inputValue} onChange={(e)=>props.changeData(e)} name={v.inputName} aria-invalid="false" required={v.inputRequired} readOnly={v.inputReadOnly}>
                                {editData ? null: <option value="">... Select this ...</option> }
                                {v.inputSelect.map((x,idx_v)=><option value={x.value} key={idx_v}>{x.label}</option>)}
                            </select>

                            <div className="help-block"></div>
                        </div>
                    )
                case 'select_search':
                    return(
                        <div className="form-group field-usereditform-email required" key={idx}>
                            {v.label?<label className="control-label"> &nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>:null}
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                value={v.inputSelect.filter(x=>x.value==v.inputValue)}
                                isDisabled={v.inputReadOnly}
                                onChange={(e,action)=>props.changeData(e,action)}
                                name={v.inputName}
                                options={v.inputSelect}
                                components={animated}
                                isLoading={v.inputLoading}
                            />
                        </div>
                    )
                case 'select_async_search':
                    const loadOptions = (inputValue, callback) => {
                        // perform a request
                        const requestResults = v.inputSelect.filter(
                            x =>
                            x.label.toLocaleLowerCase().includes(inputValue)
                            ).slice(0,20)
                        //const requestResults = this.state.optionAdHoc.slice(0,10);
                        callback(requestResults)
                    }

                    return(
                        <div className="form-group field-usereditform-email required" key={idx}>
                            <label className="control-label"> &nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <AsyncSelect
                                className="basic-single"
                                classNamePrefix="select"
                                value={v.inputSelect.filter(x=>x.value==v.inputValue)}
                                isDisabled={v.inputReadOnly}
                                onChange={(e,action)=>props.changeData(e,action)}
                                name={v.inputName}
                                loadOptions={loadOptions.bind(this)}
                                components={animated}
                                isLoading={v.inputLoading}
                            />
                        </div>
                    )
                case 'select_multiple_search':
                    return(
                        <div className="form-group field-usereditform-email required" key={idx}>
                            <label className="control-label"> &nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>
                            <Select
                                className="basic-multi-select"
                                isMulti
                                classNamePrefix="select"
                                value={v.inputValue}
                                isDisabled={v.inputReadOnly}
                                onChange={(e,action)=>props.changeData(e,action)}
                                name={v.inputName}
                                options={v.inputSelect}
                                components={animated}
                                isLoading={v.inputLoading}
                            />
                        </div>
                    )
                case 'file':
                    return(
                        <div className="form-group field-usereditform-email required" key={idx}>
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}
                                <br/> 
                                <ul className="file-upload-requirement">
                                    {v.inputRuleImage.map((z,idx)=><li key={idx}>{z}</li>)}
                                </ul>
                            </label>
                            <br/>
                            <input type="file"  
                                name={v.inputName} id={v.inputName} size="40" accept={v.InputAcceptData}
                                onChange={(e)=>props.fileUpload(e)} />
                            <br/>
                            <br/>
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;{typeof v.inputValue!=='object' ?`Old`:`New`} Image</label><br/>
                            <img style={{width:"160px",height:"auto",margin:"1rem"}}  src={typeof v.inputValue!=='object' ? file_path+v.inputValue :v.srcInput}  onError={addDefaultSrc} />
                            <br/>
                            <span className='badge bg-primary' id={`${v.inputName}-span`} name={`${v.inputName}-span`}>{typeof v.inputValue!=='object' && v.inputValue}</span>
                            <div className="help-block"></div>
                        </div>
                    )
                case 'file_import':
                    return(
                        <div className="form-group field-usereditform-email required" key={idx}>
                            <label className="control-label" forhtml="usereditform-email">&nbsp;Template <span style={{color:"#ff0404"}}>(*)</span>
                                <br/>  
                                <ul className="file-upload-requirement">
                                    <li>
                                        <a href={file_path}>download</a>
                                    </li>
                                </ul>
                            </label>
                            <br/>
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}
                                <br/> 
                                <ul className="file-upload-requirement">
                                    {v.inputRuleImage.map((z,idx)=><li key={idx}>{z}</li>)}
                                </ul>
                            </label>
                            <br/>
                            <input type="file"  
                                name={v.inputName} id={v.inputName} size="10" accept={v.InputAcceptData}
                                onChange={(e)=>props.fileUpload(e)} />
                        </div>
                    )
                case 'radio-inline':
                    return(
                        <div className="form-group field-usereditform-email required" key={idx}>
                            <label className="control-label"> &nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label><br/>
                            {v.inputRadioData.map((x,idx_x)=>
                                <Form.Check 
                                    inline
                                    type={"radio"}
                                    id={x.inputId}
                                    name={v.inputName}
                                    label={x.inputLabel}
                                    key={idx_x}
                                    onChange={(e)=>props.changeData(e)}
                                    checked={x.inputId===v.inputValue? true:false}
                                    disabled={v.inputReadOnly}
                                />
                            )}
                        </div>
                    )
                default:
                    return(
                        <div className="form-group field-usereditform-email required" key={idx}>
                            {v.label?<label className="control-label"> &nbsp;{v.label} {v.inputRequired===true && <span style={{color:"#ff0404"}}>(*)</span>}</label>:null}
                            <input type={v.inputType.toLowerCase()} id="usereditform-email" style={{width:v.inputWidth}} className="form-control"
                                name={v.inputName} defaultValue={v.inputValue} onChange={(e)=>props.changeData(e)} aria-required="true" aria-invalid="false" required={v.inputRequired} readOnly={v.inputReadOnly} />
                            <div className="help-block"></div>
                        </div>
                    )
            }
        }
    )

    return renderColumn(props.data)
}

export default AdminDetailInput;