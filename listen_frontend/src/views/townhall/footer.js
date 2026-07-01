import React, { useEffect, useState } from 'react';

function Footer(){
    const currentUrl = window.location.href
    const [strFooter,setStrFooter] = useState('')
    useEffect(()=>{
        switch (true) {
            case currentUrl.includes('dev'):
                setStrFooter('DEV')
                break;
            case currentUrl.includes('qas'):
                setStrFooter('QAS')
                break;
            case currentUrl.includes('prd'):
                setStrFooter('')
                break;
            case currentUrl.includes('localhost'):
                setStrFooter('local')
                break;
            default:
                setStrFooter('')
                break;
        }
    },[])

    

    return (
        <div id="footer" className="fixed-bosttom">
            <div className="text-center">
            <hr className="subTitle"/>
            <p className="subTitle">{strFooter} HM Sampoerna © 2024. All rights reserved {strFooter}.</p>
            </div>
        </div>

    )
}

export default Footer;