import React, { 
    // useState 
  } from 'react';
  
function Style(){
    return(
        <style>
        {`
            // header halaman training
            body {
                background: #fafafa none repeat scroll 0 0;
            }
            .div-redeem-profile .tab-content {
                padding: 20px;
                position: relative;
                top: 0;
                border: 0;
                z-index:0;
            }
            .profile-img {
                width: 140px;
                height: 140px;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                margin: 0 auto;
                border-radius: 50%;
                border: 1px solid #e6e6e6;
                box-shadow: 0 0 0 5px #fff inset;
                margin: 15px 0;
                background-color: #ccc;
            }
            .user-identity {
                margin-top: 33px;
                color:#666;
            }
            .your-current-level-and-points{
                padding-top: 25px;
            }
            .user-points{
                font-size: 30px;
                display: block;
                color: #3255d5;
                font-family: 'poppinssemibold', sans-serif;
            }
            .user-status{
                font-size: 15px;
                display: block;
                color: #7189e2;
                font-family: 'poppinsmedium', sans-serif;
            }
            // end header halaman training

            @media (min-width:1200px){
                .container{
                    max-width:1366px
                }
            
            }

            // list data halaman training
            .profile-tabs-containter{
                max-width: 1180px;
                margin: 0 auto;
            }
            .content-badges-achieved  {
                margin: 20px auto;
                width: 1080px;
            
            }
            .inputSearch {
                #width: 60%;
                border-radius: 25px;
                padding: 11px 40px 9px 20px;
                border: 0;
                box-shadow: none;
                height: auto;
                font-family: 'poppinsmedium', sans-serif;
                color: #4d4d4d;
                font-size: 13px;
                text-align: left;
                background-color: #e6e6e6;
            }
            .search_icon2 {
                font-size: 30px;
                position: absolute;
                right: 25px;
                top: 5px;
                border: 0;
                background-color: transparent;
                cursor: pointer;
                padding: 0;
            }
            .rowleaderboardFromId{
                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); /* this adds the "card" effect */
                padding: 5px;
                text-align: center;
                background-color: #f1f1f1;
                border-radius: 20px;
                margin-bottom: 10px;
                font-weight: 800;
                border:3px solid #50a4c7;
            }
            .rowleaderboardFromId:before{
              content: '';
              /* !important� */
              border-radius: inherit;
              /* !important� */
              background: -webkit-gradient(linear, left top, right top, from(red), to(orange));
              background: linear-gradient(to right, red, orange);
            }
            .itemLeaderboard {	
                vertical-align: middle !important;
                align-self: center;	
            } 
            .btn-refer {
                padding: 3px 15px !important;
                color: #5277dd !important;
                border: 1px solid #5277dd;
                margin-top: 10px !important;
                font-style: normal;
                font-size: 11px;
                text-transform: none;
                font-family: 'poppinssemibold', sans-serif;
                background-color: #fafafa;
            }
            .btn-refser{
                background-color:green;
                font-color:white; 
                padding: 3px 15px !important;    
                font-style: normal; 
                font-size: 11px;
                margin-top:10px;
            }
            // end list data halaman training
        `}
    </style>
    )
}

export default Style;