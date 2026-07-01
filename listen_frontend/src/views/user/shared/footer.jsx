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
        <footer id="footer" className="fixed-bottom">
            <div className="copyright">
            <p>{strFooter} HM Sampoerna © 2021. All rights reserved {strFooter}.</p>
            </div>
        </footer>
    )
}

export default Footer;