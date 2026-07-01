import React, { 
    // useState 
  } from 'react';
import {Helmet} from "react-helmet-async";
import { env } from '../helpers/globalHelper';
import routeAll from '../helpers/route';

function HeadAdmin(){

    return(
        <Helmet>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
                {/* <title>Thrive – Time to Listen</title> */}
                <title>Admin</title>
                <link rel="shortcut icon" href={routeAll.routesUser.home.path+"ttl-icon.png"} type="image/x-icon"/>
                {/* <link href={env.assets+"/_sila/humhub/bootstrap.css"} rel="stylesheet"/>
                <link href={env.assets+"/_sila/humhub/jquery-ui.css"} rel="stylesheet"/>
                <link href={env.assets+"/_sila/humhub/font-awesome.min.css"} rel="stylesheet"/> */}
                {/* <script src={env.assets+"/_sila/humhub/jquery.js"}></script>
                <script src={env.assets+"/_sila/humhub/bootstrap.js"}></script> */}

                <link href={env.assets+"_sila/humhub/theme.css"} rel="stylesheet"/>
                <link href={env.assets+"_sila/humhub/open-sans.css"} rel="stylesheet"/>
                <link href={env.assets+"_sila/humhub/navMenu.css"} rel="stylesheet"/>
                <link rel="stylesheet" href={env.assets+"dialogue/dialogue.css"} />
        </Helmet>
    );
}

function HeadUser(){
    return(
        <Helmet>
            <link rel="shortcut icon" href={routeAll.routesUser.home.path+"ttl-icon.png"} type="image/x-icon"/>
            {/* <link rel="stylesheet" href={env.assets+"css/bootstrap.css"} /> */}
            <link rel="stylesheet" href={env.assets+"_pca/style.css"} />
            {/* <link rel="stylesheet" href={env.assets+"css/font-awesome.min.css"} /> */}
        
            {/* <script src={env.assets+"js/jquery-3.1.1.min.js"}></script>
            <script src={env.assets+"js/bootstrap.min.js"}></script> */}
        
            <link href={env.assets+"_pca/limitless/css/icons/icomoon/styles.css"} rel="stylesheet" type="text/css"/>
            <link href={env.assets+"_pca/limitless/css/bootstrap.css"} rel="stylesheet" type="text/css"/>
            <link href={env.assets+"_pca/limitless/css/core.css"} rel="stylesheet" type="text/css"/>
            <link href={env.assets+"_pca/limitless/css/components.css"} rel="stylesheet" type="text/css"/>
            <link href={env.assets+"_pca/limitless/css/colors.css"} rel="stylesheet" type="text/css"/>
        
            <link rel="stylesheet" href={env.assets+"dialogue/dialogue.css"} />
            <link rel="stylesheet" href={env.assets+"fonts/fonts.css"} />
        </Helmet>

    )
}

const head ={
    HeadAdmin,
    HeadUser
}

export default head;