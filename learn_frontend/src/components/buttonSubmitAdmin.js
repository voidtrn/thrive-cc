import React, { useEffect, useState } from 'react';
import defaultLang from '../helpers/lang';

export function ButtonSubmitAdmin(props){
    const { txt, loading} = props
    const [txtButton, setTxtButton] = useState(txt);

    useEffect(()=>{
        if(loading){
            setTxtButton(defaultLang.lang.loading)
        }else{
            setTxtButton(txt)
        }
    },[loading])

    return(
        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save" disabled={loading}>{txtButton}</button>
    )
}