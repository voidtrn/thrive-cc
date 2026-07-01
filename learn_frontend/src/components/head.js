import React, { 
    // useState 
  } from 'react';
import {Helmet} from "react-helmet";
import { env, securityData } from '../helpers/globalHelper';
import routeAll from '../helpers/route';

function HeadAdmin(){

    return(
        <Helmet>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
                {/* <title>Ada Waktunya Belajar</title> */}
                <title>Admin</title>
                <link rel="shortcut icon" href={routeAll.routesUser.home.path+"favicon.png"} type="image/x-icon"/>
                {/* <link href={env.assets+"admin/humhub/bootstrap.css"} rel="stylesheet"/> */}
                {/* <link rel="stylesheet" href={env.assets+"dialogue/dialogue.css"} /> */}
        </Helmet>
    );
}

function HeadUser(){
    return(
        <Helmet>
            <title>Ada Waktunya Belajar</title>
            <link rel="stylesheet" href={env.assets+"css/animate.css"}/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        </Helmet>

    )
}

const head ={
    HeadAdmin,
    HeadUser
}

export default head;