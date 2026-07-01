import React, { useCallback, useEffect, useState } from 'react';
import { css } from "@emotion/react";
import BeatLoader from "react-spinners/BeatLoader";
import { env, securityData } from '../helpers/globalHelper';
import axiosLibrary from '../helpers/axiosLibrary';
import { isMobile } from 'react-device-detect';
import { useHistory } from 'react-router';

import routeAll from '../helpers/route';


export function NotAnswer(questId, quarterId, questNumber, textQuest, totalPoint ,questType, textPoint) {

    //const history = useHistory();
    const toAnswerQuiz = useCallback(async (questId, quarterId) => {
        const md5QuestId = await axiosLibrary.getmd5FromBackend(questId)
        const md5QuarterId = await axiosLibrary.getmd5FromBackend(quarterId)
        window.open("quest?questId="+md5QuestId+"&quarterId="+md5QuarterId,"_self");
    })
    return (
      
            <div className="col m-2 text-center " onClick={() => toAnswerQuiz(questId, quarterId)}>
            <div className="frame1-menit1-hari-landing-page-cell header-card-growth border-white-dark  cursor-pointer-transparent">
                <span className="frame1-menit1-hari-landing-page-text031 title1color2 mt-3">
                    {textQuest}
                </span>
                <span className="frame1-menit1-hari-landing-page-text032  title1color2 mt-2 mb-2">
                    {questNumber}
                </span>
            </div>
            </div>

    );
}

export function Answer(questId, quarterId, questNumber, textQuest, totalPoint ,questType, textPoint)  {

    //const history = useHistory();
    const toAnswerQuiz = useCallback(async (questId, quarterId) => {
        const md5QuestId = await axiosLibrary.getmd5FromBackend(questId)
        const md5QuarterId = await axiosLibrary.getmd5FromBackend(quarterId)
        window.open("quest-answered?questId="+md5QuestId+"&quarterId="+md5QuarterId,"_self");
    
    })
    
    return (


        <div className="col m-2 text-center " onClick={() => toAnswerQuiz(questId, quarterId)}>
            <div className="frame1-menit1-hari-landing-page-cell header-card-growth-done   cursor-pointer-transparent">
            <span className="frame1-menit1-hari-landing-page-text031 color-white mt-3">
                    {textQuest}
                </span>
                <span className="frame1-menit1-hari-landing-page-text032  color-white mt-2 mb-2">
                    {questNumber}
                </span>
                <div className="frame1-menit1-hari-landing-page-label1">
                    <span className="frame1-menit1-hari-landing-page-text033 pointColor">
                        {totalPoint} {textPoint}
                    </span>
                </div>
            </div>
        </div>

    );
}


export function QuestNotOpen(questId, quarterId, questNumber, textQuest, totalPoint ,questType, textPoint) {

    //const history = useHistory();
    const toAnswerQuiz = useCallback(async (questId, quarterId) => {
        const md5QuestId = await axiosLibrary.getmd5FromBackend(questId)
        const md5QuarterId = await axiosLibrary.getmd5FromBackend(quarterId)
        window.open("quest?questId="+md5QuestId+"&quarterId="+md5QuarterId,"_self");
    })
    return (

        <div className="col m-2 text-center " onClick={() => toAnswerQuiz(questId, quarterId)}>
            <div className="frame1-menit1-hari-landing-page-cell border-white-dark  cursor-pointer-transparent">
                <span className="frame1-menit1-hari-landing-page-text031 color-white-dark mt-3">
                    {textQuest}
                </span>
                <span className="frame1-menit1-hari-landing-page-text032   mt-2 mb-2">
                    {questNumber}
                </span>
            </div>
        </div>

    );
}




export function questListAvailable(questId, quarterId, questNumber, questTitle, activeShow) {

    const toQuest = useCallback(async (questIdLink, quarterIdLink) => {
        const md5Id = await axiosLibrary.getmd5FromBackend(questIdLink)
        const md5IdQuarter = await axiosLibrary.getmd5FromBackend(quarterIdLink)

        history.push(routeAll.routesUser.Quest.path + "?questId=" + md5Id + "&quarterId=" + md5IdQuarter);

    })

    return (
    

            <div className="card card-white mb-4 " style={{ padding: "5px", cursor: "pointer" }} onClick={() => toQuest(questId, quarterId)}>
                <div className="card-body ">
                    <div className="row d-flex ">
                        <div className="col-lg-1  ">
                            <img src={env.assets + "growth/images/icon/note-blue.png"} className="" />
                        </div>
                        <div className="col-lg-7 ">
                            <div className="row d-flex">
                                {questNumber}
                            </div>
                            <div className="row d-flex fw-bold">
                                {questTitle}
                            </div>
                        </div>
                        <div className="col-lg-3  text-end " style={{ paddingTop: "10px" }}>
                            <span className="titleTabQuarter">
                                Available
                            </span>
                        </div>
                        <div className="col-lg-1  text-end " style={{ paddingTop: "10px" }}>
                            <img src={env.assets + "growth/images/icon/arrow-right-white.png"} className="" />
                        </div>
                    </div>
                </div>
            </div>
      
    )
}
