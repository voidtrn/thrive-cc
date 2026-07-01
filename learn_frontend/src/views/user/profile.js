import React, { useEffect, useState, useContext, useRef } from 'react';
import { securityData, env } from '../../helpers/globalHelper';
import axiosLibrary from '../../helpers/axiosLibrary';
import defaultLang from '../../helpers/lang';
import { Modal } from 'react-bootstrap';
import { cssTarget, LoadingData } from '../../components/Loading';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import GlobalState from '../../helpers/globalState';
import '../../assets/css/profile.scss';
import { ProfileMyLearningPlan } from '../../components/profileMyLearning';
import { Leaderboard } from '../../components/profileLeaderBoard';
import { LevelProgress } from '../../components/profileLevelProgress';

function usePrevious(value){
    const ref = useRef();
    useEffect(()=>{
        ref.current = value
    })
    return ref.current
}


function profile(props){
    

    const [global, setGlobal] = useContext(GlobalState)

    const history = useHistory()
    const [teams, setTeams] = useState([])

    const [courses, setCourses] = useState([])
    const [coursesClaimed, setCoursesClaimed] = useState([])
    
    const [courseLimit, setCourseLimit] = useState(0)

    const [raCourse, setRaCourse] = useState([])
    const [idCourse, setidCourse] = useState("")
    
    const [pointsHistory, setPointsHistory] = useState([])
    const [topics, setTopics] = useState([])
    const [contents, setContents] = useState([])
    const [referrals, setReferrals] = useState([])

    const [badges, setBadges] = useState([])
    const [totalBadgesArchieve, settotalBadgesArchieve] = useState(0)
    
    const [listRewardFaq, setListRewardFaq] = useState([])
    const [listPreferredTopic, setListPreferredTopic] = useState([])
    const [readPreferredTopic,setReadPreferredTopic] = useState([])
    
    const [listRewards, setListRewards] = useState([])
    const [ListUserLevels, setListUserLevels] = useState([])
    const [listTerms, setListTerms] = useState([])

    // const [readLeaderboard, setReadLeaderboard] = useState([])
    // const [readLeaderboardId, setReadLeaderboardId] = useState([])

    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const user_account = securityData.Security_UserAccount()
    
    const [tab, setTab] = useState("LevelProgress")
    // const [level, setLevel] = useState(1)

    const file_path = env.userDocument
    const file_assets= env.assets
    const [file, setFile] = useState(null)
    const [invalidImage, setInvalidImage] = useState(false)
    const reader = new FileReader()

    const [scrollerRight, setScrollerRight] = useState("block")
    const [scrollerLeft, setScrollerLeft] = useState("none")
    const [scrollerMargin, setScrollerMargin] = useState("0")

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)

    const fileInput = React.createRef()

    const [tab1, setTab1] = useState(null);
    const [tab2, setTab2] = useState(null);
    const [tab3, setTab3] = useState(null);

    const [redeemStatus, setRedeemStatus] = useState(false)
    const [modalRedeem, setModalRedeem] = useState(false)
    const [modalCourse, setModalCourse] = useState(false)
    const [txtModalCourse, setTxtModalCourse] = useState("")

    // const photos= securityData.Security_UserProfilePicture()
    const [addDefaultSrcImg] =  useState("https://dummyimage.com/600%20x%20200/6b686b/911616.png&text=No+Image+")

    // const date = new Date()
    // const currYear = date.getFullYear()
    // const currMonth = date.toLocaleString('default', { month: 'long' });

    // const [imageCurrentLevel, setimageCurrentLevel] = useState("")
    // eslint-disable-next-line
    const [idReward, setIdReward] = useState(0)

    const [countsAttend, setCountsAttend] = useState([])
    const [trainingData, setTrainingData] = useState([])

    const [limitPoint, setLimitPointsHistory] = useState(20)
    const [limitContent, setLimitContent] = useState(20)

    const [configReferralPoint, setconfigReferralPoint] = useState([])

    const [profile, setProfile] = useState([])

    const [md5PlatformId, setMd5PlatformId] = useState("");

    const prevData = usePrevious(profile)

    const servicesProfilesBadges = async () => {
        const param = {
            platform_id:securityData.Security_getPlatformId(),
            currentLoginStreak:profile.Cz_awb_streak_login_current,
            currentLevelIdx: profile.Cz_awb_level_idx,
            flag_subscription: profile.Cz_awb_email_subscribe
        }
        await axiosLibrary.postData('awbProfile/ServicesProfilesBadges',param)

    }

    const getconfigReferralPoint = (async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id
        };
        let isi = await axiosLibrary.postData('awbWebConfig/configReferralPoint',credentials);
        setconfigReferralPoint(isi.data.data);
        setLoading(false)
    })

    const getAccount = async () => {
        setLoading(true)
        const data = {
            account: user_account,
            platform_id:platform_id
        }
        if(data.account!== null){
            let response = await axiosLibrary.postData('awbUser/SelectDataByAccount',data);
            if(response.status === 200){
                setProfile(response.data.data)
            }else{
                alert(response);
            }
        }
        setLoading(false)
    }

    const getProfileTeam =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/RsProfileTeam',credentials);
        setTeams(isi.data.data)
        
        setLoading(false)
    }
    
    const getDetail=(account)=>{
        history.push({
            pathname: routeAll.routesUser.profileDetail.path,
            search: "?" + new URLSearchParams({uac: account}).toString()// your data array of objects
        })
        
    }

    const cekCountStatus = async(param) => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:param,
            status:'attended',
            category: 'COUNT'
        };
        let isi = await axiosLibrary.postData('awbTraining/ListTrainingStatus',credentials);
        const countData = isi.data.data
            const courseAttend = {
                id:param,total:countData
            }
            setCountsAttend(state =>([...state,courseAttend]))
            // countsAttend.push(
            //     {
            //         id: param,
            //         total: countData
            //     }
            // )
        if(trainingData.length >0){
            trainingData.push(countData)
        }else{
            setTrainingData(countData)
        }
        setLoading(false)
    }

    const getCourseAttended =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/RsProfileCourseAttended',credentials);
        setCourses(isi.data.data);
        setLoading(false)
    }

    const getCourseClaimed = async () => {
        setLoading(true)
        const credentials = {
            platform_id: platform_id,
            user_id: user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/RsCourseClaimed', credentials);
        setCoursesClaimed(isi.data.data);
        
        setCourseLimit(isi.data.course_limit);
        setLoading(false)
    }


    const getCourseDetail = async(param) =>{
        const idParam = param;
        let md5 = await axiosLibrary.getmd5FromBackend(idParam)
        const credentials = {
            _md5ID:md5
        };
        let isi = await axiosLibrary.postData('awbProfile/SelectCourseDetail',credentials);
        if (isi.status===200){
            setRaCourse(isi.data.data[0])
            
        }else{
            alert("edit gagal")
        }
    }

    const getRsProfilePointHistory = async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/RsProfilePointHistory',credentials);
        setPointsHistory(isi.data.data);
        setLoading(false)
    }

    const getMostViewedTopic =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/RsProfileMostViewedTopic',credentials);
        setTopics(isi.data.data);
        setLoading(false)
    }

    const getContentViewed =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/RsProfileContentViewed',credentials);
        setContents(isi.data.data);
        setLoading(false)
    }

    const getBadgesAchieved =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id,
            showPublishOnly: 1
        };

        let isi = await axiosLibrary.postData('awbProfile/RsProfileBadgesAchieved',credentials);
        setBadges(isi.data.data);
        setLoading(false)
    }

    const getTotalBadges=  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id,
            showPublishOnly: 1
        };
        
        let isi = await axiosLibrary.postData('awbProfile/RsProfileBadgesAchieved',credentials);
        const count = isi.data.data.filter((item) => item.flag_achieved == 1)
        settotalBadgesArchieve(count.length)
        setLoading(false)
    }


    const getReferral =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/RsProfileReferral',credentials);
        setReferrals(isi.data.data);
        setLoading(false)
    }

    const getListReward = async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id: user_id,
            directorate: profile.directorate
        };

        let isi = await axiosLibrary.postData('awbRedeem/ListReward',credentials);
        setListRewards(isi.data.data);
        setLoading(false)
        // props.loading(false)
    }

    const getListUserLevel =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbRedeem/ListUserLevel',credentials);
        setListUserLevels(isi.data.data);
        // isi.data.data.map(
        //     (itemListLevel) => 
        //         itemListLevel.id == profile.Cz_awb_level_idx ?
        //         setimageCurrentLevel(itemListLevel.level_image) : null
                
        // )
        setLoading(false)
        // props.loading(false)
    }
    /*
    const getCurrentImage =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbRedeem/ListUserLevel',credentials);
        
        setLoading(false)
        props.loading(false)
    }
    */

    const getListTerms =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbProfile/ListTerms',credentials);
        setListTerms(isi.data.data);
        setLoading(false)
    }
    
    const getListRewardFaq =  async () =>{
        setLoading(true)
        const credentials = {
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbRedeem/ListRewardFaq',credentials);
        setListRewardFaq(isi.data.data);
        setLoading(false)
    }

    // const getReadLeaderboard =  async () =>{
    //     setLoading(true)
    //     const credentials = {
    //         platform_id:platform_id
    //     };

    //     let isi = await axiosLibrary.postData('awbProfile/readLeaderboard',credentials);
    //     setReadLeaderboard(isi.data.data);
    //     let currentUserLeaderboard = isi.data.data.filter(v=>v.user_modified === securityData.Security_UserId())
    //     const currentIndexUserLeaderboard = isi.data.data.findIndex(v=>v.user_modified === securityData.Security_UserId())
    //     if(currentUserLeaderboard.length > 0){
    //         currentUserLeaderboard[0].iterator = currentIndexUserLeaderboard + 1
    //         setReadLeaderboardId(currentUserLeaderboard)
    //     }
    //     setLoading(false)
    // }

    // const getReadLeaderboardFromId =  async () =>{
    //     setLoading(true)
    //     // const credentials = {
    //     //     platform_id:platform_id,
    //     //     user_id:user_id
    //     // };

    //     // let isi = await axiosLibrary.postData('awbProfile/readLeaderboard',credentials);
    //     // setReadLeaderboardId(isi.data.data);
    //     setLoading(false)
    // }

    const getListPreferredTopic =  async ()=>{
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
        };

        let isi = await axiosLibrary.postData('awbProfile/listPreferredTopic',credentials);
        setListPreferredTopic(isi.data.data);
        setLoading(false)
    }

    const getReadPreferredTopic =  async ()=>{
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/readPreferredTopic',credentials);
        if(isi.status == 200){
            let userPrefTopic = []
            isi.data.data.map(v=>userPrefTopic = [...userPrefTopic, v.topicid])
            setReadPreferredTopic(userPrefTopic);
            setLoading(false)
        }
    }
    
    // let changeLevel = (param)=>{
    //     setLevel(param)
    //     listLevel()
    // }

    // let listLevel =() => {
    //     const name = level
    //     return(
    //         ListUserLevels.map(
    //             (itemListLevel) =>
    //             itemListLevel.id== name ?
    //                 <div key={itemListLevel.id}  className={"tab-pane "+itemListLevel.id == '1' ? 'fade active show' :''  } id={"level"+itemListLevel.id} 
    //                 role="level-tab" aria-labelledby="level-tab">
    //                     <div  className="row">
    //                         <div  className="col-md-5">
    //                             <h4  className="level-descr-title">Your privilege</h4>
    //                             <p  className="level-descr-copytext" dangerouslySetInnerHTML={{__html: securityData.Security_lang() == "ENG" ? itemListLevel.descr_your_previlege : itemListLevel.descr_your_previlege_ind }}>
                                        
    //                             </p>
    //                         </div>
    //                         <div  className="col-md-5" style={{borderLeft: "1px solid #e5e5e5", padding: "0px 0 10px 60px", lineHeight: "29px"}}>
    //                             <h4   className="level-descr-title">How to get there</h4>
    //                             <p  className="level-descr-copytext" dangerouslySetInnerHTML={{__html: securityData.Security_lang() == "ENG" ? itemListLevel.descr_how_to_get_there : itemListLevel.descr_how_to_get_there_ind }}>
                                    
    //                             </p>
    //                         </div>
    //                     </div>
    //                 </div>
    //                 : null
    //         )
    //     )
    // }

    const changeTab = (param)=>{
        const name = param;
        setTab(param)
        if(name != "MyTeams"){
            setTrainingData([])
            setCountsAttend([])
        }
        if(name=="MyLearningPlan"){
            setGlobal(state=>({...state,loadLearningPlan:true}))
        }else{
            setGlobal(state=>({...state,loadLearningPlan:false}))
        }
    }

    const loadMoreData = (param) =>{
        switch (param) {
            case "PointHistory":
                    setLimitPointsHistory(limitPoint+20)
                    getRsProfilePointHistory()
                break;
            case "ContentViewed":
                    setLimitContent(limitContent+20)
                    getContentViewed()
                break;
            default:
                break;
        }
    }

    const ChangeScroll = (param) =>{
        if (param=="left"){
            setScrollerRight("block")
            setScrollerLeft("none")
            setScrollerMargin("0")
        }else{
            setScrollerRight("none")
            setScrollerLeft("block")
            setScrollerMargin("-400px")
        }
    }

    // const ShowPopUp = (param) =>{
    //     setModalRedeem(true)
    //     setIdReward(param)
    // }

    const handleInputChange = (event) => {
        event.preventDefault();
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, raCourse);
        stateCopy[key] = value;
        setRaCourse(stateCopy)
    }

    const handleInputChangeTopic = (event) => {
        setLoading(true)
        const target = event.target;
        const values = parseInt(target.value);
        let isi = []
        if(readPreferredTopic.includes(values)){
            isi = readPreferredTopic.filter(v=>v!=values)
        }else{
            isi = [...readPreferredTopic,values]
        }

        setReadPreferredTopic(isi)
        setLoading(false)
    }

    const validateImage = (e) => {
        e.preventDefault();
        if(invalidImage){
            alert("ERROR IN THE UPLOAD IMAGE SECTION, PLEASE USE A VALID IMAGE");
            return false
        }else{
            submitCourse();
            return true
        }
    }

    const setStateImage = (stateFile,invalidImage) => {

        setFile(stateFile)
        setInvalidImage(invalidImage)
    }

    const ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png/i;
        var filename = upload_field.target.value;
        if (filename.search(re_text) === -1) 
        {
            alert("File must be an image");
            upload_field.target.form.reset();
            return 0;
        }
        var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 3) {
            alert('File size exceeds 3 MB');
            upload_field.target.form.reset();
            return 0;
        }

        if(upload_field.target.files[0]!== undefined){
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setStateImage(URL.createObjectURL(upload_field.target.files[0]),false)
                }
                img.onerror = () => {
                    setStateImage(null,true)
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(upload_field.target.files[0]);
        }
        
        return 1;       
    }

    const courseDelete=  (param)=>{
        
        if (confirm("Are you sure to delete this data?") == 1) 
        {
            setDeleteData(true)
            setidCourse(param)
        } 
        else
        {
            setCancelDelete(true)
        } 
    }


    const courseEdit=  (param)=>{
        setEditData(true)
        setidCourse(param)
        getCourseDetail(param)
    }

    useEffect(()=>{
        if(global.loadRewardContent){
            getListReward()
            getAccount()
        }
    },[global.loadRewardContent])

    const redeemConfirm = async(param) =>{
        setRedeemStatus(true)
        let id = await axiosLibrary.postData('GetMd5',{id:param});
        const idClaim = id.data.data;
        const credentials = {
            platform_id:platform_id,
            user_id:user_id,
            productId: idClaim
        };

        let isi = await axiosLibrary.postData('awbRedeem/ClaimReward',credentials);
        if(isi.status ==200){
            setModalRedeem(false)
            setRedeemStatus(false)
            getListReward()
            getAccount()
        }
    }

    const validateForm = ()=>{
        let formIsValid = true;
        if (raCourse.expired_date < raCourse.issued_date){
            formIsValid = false;
            alert(defaultLang.lang.errorDate);
        }
        return formIsValid;
    }
    
    const submitTopic= async(e) => {
        e.preventDefault();
                
        if(readPreferredTopic.length < 3){
            alert("Please choose 3 topic or more.")
        }else{
            const credentials = {
                platform_id:platform_id,
                user_id:user_id
            };

            let response = await axiosLibrary.postData('awbProfile/deletePreferredTopic',credentials);
            if(response.status === 200){
                
                readPreferredTopic.map(
                    (itemCategory) =>
                    {
                        if(itemCategory != null || itemCategory != undefined){
                            const credentials2 = {
                                platform_id:platform_id,
                                userid:user_id,
                                topicid: itemCategory
                            };
                            let responseJson =  axiosLibrary.postData("awbProfile/createPreferredTopic", credentials2)
                                if(responseJson.status === 200){
                                    setLoading(false)
                                    alert("Data saved")
                                    getListPreferredTopic()
                                    getReadPreferredTopic()
                                }
                        }
                    }
                )
                setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: defaultLang.lang.alertChooseTopic, needSubtitle:false, messageSubtitlePopup:""}}))
            
            }else{
                alert("Failed to delete data")
            }
        }
    }

    const submitCourse= async () =>{
        if(validateForm()){
            if(!cancelDelete){
                if(!deleteData){
                    
                    const fd = new FormData();
                    fd.append("name", raCourse.name);
                    fd.append("field", raCourse.field)
                    fd.append("organization", raCourse.organization);
                    fd.append("issued_date", raCourse.issued_date);
                    fd.append("expired_date", raCourse.expired_date); 
                    fd.append("platform_id", platform_id);
                    fd.append("user_id", user_id)
                    fd.append("user_account", user_account)

                    const IsFileAttached = fileInput.current.files.length > 0;
                    if(IsFileAttached){
                        fd.append("course_file", fileInput.current.files[0]);
                    } 

                    if(editData){
                        fd.append("id",idCourse);
                        let responseJson = await axiosLibrary.postData("awbProfile/UpdateCourseAttended", fd);
                        if(responseJson.status === 200){
                            setTxtModalCourse(securityData.Security_lang == "ENG" ? "Data has been updated" : "Data berhasil diubah")
                            setEditData(false)
                            setidCourse("")
                            setFile(null)
                            setRaCourse([])
                            setModalCourse(true)
                            getCourseAttended()
                        }else{
                            alert(responseJson);
                        }
                    }else{
                        fd.append("user_created", user_id);
                        let responseJson = await axiosLibrary.postData("awbProfile/InsertCourseAttended", fd);
                        if(responseJson.status === 200){
                            setLoading(false)
                            setTxtModalCourse(defaultLang.lang.submit_course_confirm)
                            setModalCourse(true)
                            getCourseAttended()
                        }else{
                            alert(responseJson);
                        }
                    }
                }else{
                    const parameter = {
                        id:idCourse
                    }
                    let responseJson = await axiosLibrary.postData("awbProfile/DeleteCourseAttended", parameter);
                    if(responseJson.status === 200){
                        setDeleteData(false)
                        setTxtModalCourse(securityData.Security_lang == "ENG" ? "Data has been deleted" : "Data berhasil dihapus")
                        setidCourse("")
                        setFile(null)
                        setRaCourse([])
                        setModalCourse(true)
                        getCourseAttended()
                    }else{
                        alert(responseJson);
                    }
                }
            }
            setCancelDelete(false)
        }
    }

    const updateNotifierStatus = async () =>{
        const param = {
            platform_id: securityData.Security_getPlatformId(),
            statusCode: securityData.Security_NotifierStatus()
        }

        let dataUser = axiosLibrary.getUserInfo();

        let response = await axiosLibrary.postData("awbProfile/UpdateNotifierStatus", param);
        if(response.status===200){
            let notifier_status = {
                notifier_status:response.data.notifier_status
            }
            dataUser = {...dataUser, ...notifier_status}
            localStorage.setItem('userinfo',JSON.stringify(dataUser));
        }
    }

    const getMd5PlatformId = async () =>{
        if(securityData.Security_getPlatformId()){
            const md5PlatformId = await axiosLibrary.getmd5FromBackend(securityData.Security_getPlatformId())
            setMd5PlatformId(md5PlatformId)
        }
    }



    useEffect(()=>{
        if (props.location.hash) {
            setTab(props.location.hash.replace('#',''))
        }
        
    }, [props.location.hash])

    useEffect(() => {
        if(securityData.Security_getPlatformId()){
                    
            const load_all_data = [
                getAccount(),
                getconfigReferralPoint(),
                getTotalBadges(),
                getCourseClaimed(),
                getCourseAttended(),
                getContentViewed(),
                getListRewardFaq(),
            ]
            if(securityData.Security_NotifierStatus().substr(0,1)==='0'){
                updateNotifierStatus()
            }
            if(securityData.Security_getPlatformId()){
                getMd5PlatformId()
            }

            Promise.allSettled(load_all_data).then(()=>setGlobal(global=>({...global, loading:false})))
            
        }

    }, []);

    useEffect(()=>{
        if(prevData && prevData.Cz_awb_level_idx != profile.Cz_awb_level_idx && profile && profile.Cz_awb_level_idx){
            servicesProfilesBadges()
            getListUserLevel()
        }
    },[profile])

    useEffect(()=>{
        teams.map(
            (itemTeam) =>
            cekCountStatus(itemTeam.id)
        )
    }, [teams])

    useEffect(() =>{
        listRewardFaq.map(
            (itemListRewardFaq) =>
            {
                switch (itemListRewardFaq.id) {
                    case 4:
                        setTab1 (itemListRewardFaq);
                        break;
                    case 5:
                        setTab2 (itemListRewardFaq);
                        break;
                    case 6:
                        setTab3 (itemListRewardFaq);
                        break;
                    default:
                        break;
                }
            }
        )
    }, [listRewardFaq])
    
    useEffect(() => {
        if(deleteData == true){
            submitCourse()
        }

        setidCourse("")
        setFile(null)
        setRaCourse([])
    }, [deleteData]);

    useEffect(() => {

        if (tab == "LevelProgress"){
            ChangeScroll("left")
            // getListUserLevel()
        }
        // else if (tab == "Leaderboard"){
        //     ChangeScroll("left")
        //     getReadLeaderboard()
        //     getReadLeaderboardFromId()
        // }
        else if (tab == "RedeemPoints"){
            ChangeScroll("left")
            getListTerms()
            getListUserLevel()
            getListReward()
        }
        else if (tab == "BadgesArchieved"){
            ChangeScroll("left")
            getBadgesAchieved()
        }
        else if (tab == "CourseAttended"){
            ChangeScroll("left")
            getCourseAttended()
            getCourseClaimed()
        }
        else if (tab == "MyTeams"){
            ChangeScroll("right")
            getProfileTeam()
        }
        else if (tab == "MyLearningPlan"){
            ChangeScroll("right")
        }
        else if (tab == "PointHistory"){
            ChangeScroll("right")
            getRsProfilePointHistory()
        }
        else if (tab == "ContentViewed"){
            ChangeScroll("right")
            getContentViewed()
            getMostViewedTopic()
        }
        else if (tab == "PreferredTopic"){
            ChangeScroll("right")
            getListPreferredTopic()
            getReadPreferredTopic()
        }else if (tab == "Referral"){
            ChangeScroll("right")
            getReferral()
        }
    }, [tab]);

    const querystring = axiosLibrary.getParamString(props.location.search)

    useEffect(() =>{
        if(securityData.Security_getPlatformId()){
            if(querystring){
                if(querystring.tabs==='learning'){
                    const isiData = axiosLibrary.decodeEncodeUri(querystring.data,'decode')
                    if(isiData.id !== securityData.Security_UserId()){
                        changeTab("MyLearningPlan")
                    }else{
                        window.location.href=routeAll.routesUser.profile.path
                    }
                }
            }
        }
    },[querystring])


        return(
        <>
        
        
        <style>
            {
            `body {
                background: #fafafa none repeat scroll 0 0;
            }


            .absolute-right{
                position: absolute;
                right: 50px;
            }

            .profile-tabs-containter{
                max-width: 1180px;
                margin: 0 auto;
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






                .banner_slide_content {
                    max-width: 1180px;
                    margin: 0 auto;
                }

                .banner_content {
                    padding-top: 100px;
                    max-width: 400px;
                }


            /* topic */

            .item .home_topic_box,.item .redeem_box, {
            -webkit-border-radius: 5px; 
                -moz-border-radius: 5px; 
                border-radius: 5px; 
            }

            .home_topic_box {
                height: 458px;
                font-family: 'poppinssemibold';
                color: #fff;
                text-align: left;
            }

            .home_topic_box:hover{
                border-bottom:0px !important;
            }

            .home_topic_title {
                position: relative;
                top: 30%;
                padding: 15px 30px;
                height:70%;
            }

            .home_topic_title h5{
                color: #fff;
                font-family: 'poppinsregular';
                font-size: 26px;
                margin-top:100px;
            }


            .home_topic_title span{
                color: #fff;
                font-family: 'poppinsbold_italic';
                font-size: 16px;
            }



            .article-descr{
                display:none;
            }

            .article-category {
                position: absolute;
                bottom: 50px;
                font-family: 'poppinsbold_italic';
                font-size: 13px;
                color: #fff;

            }

            .item:hover .home_topic_box{
                border-bottom: 0px solid #6252bd ;
                border-image: linear-gradient(to left, #6252bd 0%, #59b7d2 100%);
                border-image-slice: 1;
                border-width: 15px;   
            }

            .item:hover .article-descr{
                display:inline;
            }

            .item:hover .home_topic_title h5{
                margin-top:0px;

            }

            /* function */

            .containter-redeem{
                margin: 0 auto;
                width: 1080px;
            }


            .section-redeem{

                /* background-repeat: no-repeat;
                background-image: url('/_assets/img/background-bottom.png');
                background-position: top 450px center;
                background-size: contain; */
                padding: 0px 0 0 0;
            }




            .redeem_box {
                background-color:#f2f2f2;
                height: 450px;
                font-family: 'poppinssemibold';
                color: #fff;
                text-align: left;
                margin: 0 0px;;
                border-radius:5px;
            }

            .div-list-reward .col-md-3.item {
                padding: 7px;
            }

            .team_img {
                height:200px;
            }


            .team_img img{
                height:220px;
                border-radius: 5px 5px 0 0;
            }

            .redeem_box:hover{
                border-bottom:0px;
            }
            .team_img img{
                height: 200px;
            }





            /* footer*/

                @media (min-width:1200px){
                    .container{
                        max-width:1366px
                    }
                
                }

            .navbar-expand-lg .navbar-nav > li > .nav-link {
                font-size: 13.5px;
                letter-spacing: 1px;
                letter-spacing: 0px;
            }


            .banner_content.text_white p {
                color: #fff;
                font-family: 'poppinslight';
                font-size: 15px;
                top: -20px;
                position: relative;
            }

            .full_screen, .full_screen .carousel-item {
                height: 100vh;
                max-height: 450px;
            }

            /* 
            .ion-ios-search-strong:before {
                content: "\f4a4";
                color: #656669;
                top: -3px;
            } */

            .paging-label {
                float: right;
                font-weight: 500;
                font-family: 'poppinsregular';
                /* font-family: 'poppinssemibold'; */
                font-size: 16px;
            }

            .tab-function{
                width:1080px;
                margin: 0 auto;
            }
            .tab-function .owl-theme .owl-nav .owl-prev {
                left: -30px;
            }

            .tab-function .owl-theme .owl-nav .owl-next {
                right: -30px;
            }

            .navbar-nav .dropdown-menu {
                background-color: rgba(51, 51, 51, .8);
            }

            .navbar-expand-lg .navbar-nav > li > .nav-link::before {
                background-color: #5aaed0;
                bottom: 15px;
                content: "";
                height: 2px;
                position: absolute;
                right: 50%;
                transition: all 0.5s ease 0s;
            }

            .btn-view-more{
                /* padding: 7px 22px;
                font-size: 13px; */
                padding: 5px 20px;
                font-size: 11px;
                background-color: transparent;
            }

            .scrollup:hover {
                background-color: #3255d6;
            }
            .light_skin.nav-fixed .logo_dark {
                display: block;
                width: 58px;
            }



            @media (-webkit-min-device-pixel-ratio:0) {
            .redeem-profile a.nav-link {
                background-color: skyBlue;
                background-image: -webkit-linear-gradient(left, #6252bd 0%,#59b7d2 100%);
                background-position: 100% 0;
                background-size: 200% 200%;
                color: transparent;
                -webkit-transition: .1s .2s;
                -webkit-background-clip: text;
            }
            .redeem-profile a.nav-link:hover {
                background-position: 0 0;
                color: transparent;
                transition: .4s 0;
            }
            }

            .carousel_slide4{
                margin: -5px 0;
            }



            /* redeem */

            .tab-style1.div-redeem-profile {
                
            }
            .div-redeem-profile .tab-content {
                padding: 20px;
                position: relative;
                top: 0;
                border: 0;
                z-index:0;
            }




            .required-point{
                background-color: #3a5fd0;
                border-radius: 100%;
                color: #fff;
                font-family: 'poppinssemibold';
                font-size: 12px;
                width: 60px;
                height: 60px;
                position: absolute;
                top: 15px;
                left: 15px;
                line-height: 15px;
                text-align: center;
                padding-top: 13px;
                font-style: italic;
            }





            /* .div-redeem-profile .col-md-4 span {
                    /* font-family: 'poppinssemibold'; */
                /* font-size: 15px; */
                font-family: 'poppinsregular';
                font-size: 17px;
                font-weight: 500;
                /* font-family: 'poppinssemibold'; */
                display: block;
                line-height: 30px;
            } */

            .div-list-reward .col-md-3{
                padding: 7px;
            }

            .redeem-reward-title{
                padding:50px 0 20px;
            }


            .your-current-level-and-points{
                // padding-top: 25px;
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
            .user-progress{
                padding-top:10px
            }


            .progress {
                display: -ms-flexbox;
                display: flex;
                height: 1rem;
                overflow: hidden;
                font-size: .75rem;
                background-color: #333333;
                border-radius: 15px;
            }


            .bg-progress{
                background: #6252bd;
                background: -moz-linear-gradient(left, #6252bd 0%, #59b7d2 100%);
                background: -webkit-linear-gradient(left, #6252bd 0%,#59b7d2 100%);
                background: linear-gradient(to right, #6252bd 0%,#59b7d2 100%);
            }
            .tab-content.div-how-to-play {
                padding: 0;
                border: 0;
                top: 0;
            }

            .modal-header img {
                // position: absolute;
                left: 0;
                top:0;
                width: 100%;
            }

            .redeem_box:hover{
                border-bottom:0 !important;
            }


            .btn-refer {
                padding: 3px 15px !important;
                color: #fff;
                border: 1px solid #fff;
                margin-top: 10px !important;
                font-style: normal;
                font-size: 11px;
                text-transform: none;
                font-family: 'poppinssemibold', sans-serif;
                background-color: #8275dc;
            }
            .span-refer{
                display: inline-block;
                color: #3159ce;
                font-size: 12px;
                /* margin: 10px; */
                position: relative;
                top: 6px;
                font-family: 'poppinssemibold', sans-serif;
                left: 10px;
                font-style: italic;
            }







            .content-my-teams {
                margin: 20px auto;
                width: 1080px;
                min-height:300px;
                
            }
            .content-my-teams .my-team-item{
                border-radius: 30px;
                border: 1px solid #cccdd4;
                margin:10px 0;
                // background: #e8e7f5;
            }

            .content-my-teams .profile-img {
                width: 70px;
                height: 70px;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                margin: 0 auto;
                border-radius: 50%;
                border: 1px solid #e6e6e6;
                box-shadow: 0 0 0 5px #fff inset;
                margin: 25px 55px;
                background-color: #ccc;
            }
            .content-my-teams .user-identity {
                /* margin-top: 35px; */
                position: relative;
                margin: 0;
                top: 38px;
                left: -35px;
            }

            .content-my-teams .user-identity:hover h3 {
                color: #007bff;
            }

            .content-my-teams .user-identity h3 {
                font-size: 20px;
                margin: 0;
            }

            .content-my-teams .point-profile {
                padding-top: 20px;
            }

            .content-my-teams .point-profile .user-points {
                font-size: 28px;
                display: block;
                margin: 0;
                color: #666;
                font-family: 'poppinssemibold', sans-serif;
            }


            .content-my-teams .point-profile .user-status {
                font-size: 12px;
                display: block;
                color: #666;
                margin: -5px 0;
                font-family: 'poppinsmedium', sans-serif;
            }

            .data-not-found{
                text-align: center;
                color: #666;
                font-size: 15px;
                margin: 10%;
                font-family: 'poppinsmedium', sans-serif;
            }

            .content-badges-achieved  {
                margin: 20px auto;
                width: 1080px;

            }

            .badges-achieved-item{
                /* border: 1px solid #cccdd4; */
                margin: 10px 0;
                text-align: center;
            }



            .content-badges-achieved .leveling-caption {
                color: #3255d5;
                text-align: center;
                margin: 40px;
            }

            .content-badges-achieved img.badge-img {
                margin: 25px 55px;
                -webkit-filter: grayscale(100%);
                filter: grayscale(100%);
            }

            .content-badges-achieved img.badge-img.achieved{
                -webkit-filter: grayscale(0%);
                filter: grayscale(0%);
            }


            .content-viewed{
                margin: 30px auto;
                width: 1050px;
            }
            .content-viewed .content-viewed-item{
                border-radius: 0;
                border-bottom: 2px solid #cccdd4;
                margin:10px 0;
            }
            .content-viewed-item .viewed-title {
                margin: 7px 0;
                font-size: 14px;
                color: inherit;
                font-family: 'poppinssemibold', sans-serif;
                color: #666;
            }
            .content-viewed-item .viewed-date {
                text-align: right;
                margin: 7px;
                color: inherit;
                margin: 7px 0;
                font-size: 13px;
                color: inherit;
                font-family: 'poppinsmedium', sans-serif;
                color: #666;
            }

            .content-viewed h3.leveling-caption {
                color: #3255d5;
                margin: 30px;
                margin-top: 30px;
                margin-right: 30px;
                margin-bottom: 30px;
                margin-left: 0px;
            }
            .content-viewed .col-md-3, .content-viewed .col-md-9{
                padding:0
            }


            .content-point-history{
                margin: 30px auto;
                width: 1080px;
            }


            .content-point-history .point-history-item{
                border-radius: 30px;
                border: 1px solid #cccdd4;
                margin:10px 0;
            }

            .point-history-item .point-descr {
                margin: 7px;
                color:inherit;
            }


            .point-history-item .point-info {
                float:right;
            }


            .point-history-item .point-info span{
                /* margin: 10px 0; */
                position: relative;
                top: 7px;
                right: 7px;
                font-family: 'poppinssemibold', sans-serif;
                font-size: 17px;
            }

            .point-history-item img {
                width: 27px;
                margin-top: 5px;
            }
            .point-theme-minus{
                color: #e5555f !important;
                border-color: #e5555f !important;
            }
            .point-theme-plus{
                color: #3255d7 !important;
                border-color: #3255d7 !important;
            }


            // .content-level-progress{
            //     margin: 30px auto;
            //     width: 1080px;
            //     min-height:300px;
            // }



            .progress-tier-point, .progress-streak-login{
            position: relative;
            margin: 4px;
            text-align: center;
            margin-top: 30px;
            }
            .barOverflow{ /* Wraps the rotating .bar */
            position: relative;
            overflow: hidden; /* Comment this line to understand the trick */
            width: 240px; height: 120px; /* Half circle (overflow) */
            margin-bottom: -14px; /* bring the numbers up */
            }
            .bar{
            position: absolute;
            top: 0; left: 0;
            width: 240px; height: 240px; /* full circle! */
            border-radius: 50%;
            box-sizing: border-box;
            border: 50px solid #cccccc;     /* half gray, */
            border-bottom-color: #3255d5;  /* half azure */
            border-right-color: #3255d5;
            }

            span.progress-status {
                font-size: 18px;
                color: #cacaca;
                position: relative;
                top: -10px;
                font-family: 'poppinssemibold', sans-serif;
            }
            h4.progress-caption {
                color: #3255d5;
                font-size: 16px;
                text-align: center;
            }

            .level-progress-image {
                height: 200px;
                width: 200px;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                margin: 0 auto;
            }

            .user-level{
                font-size: 35px;
                position: relative;
                top: 50px;
                font-family: 'poppinslight';
                font-style: italic;
                max-width: 80%;
                color: #3255d5;
            }


            .nav.nav-tabs.nav-level-description {
                margin-bottom:35px !important;
            }

            img.level-icon  {
                max-width: 120px;
                max-height: 120px;
                margin: 0 auto;
                display: block;
                -webkit-filter: grayscale(40%);
                filter: grayscale(40%);
            }
            .nav-level-description li {
                padding: 20px 30px;
                text-align: center;
                /* color: #3356d4; */
                /* font-family: 'poppinssemibold', sans-serif; */
            }
            .nav-level-description li a {
                height: 130px;
                display: block;
                position: relative;
            }
            .nav-level-description li span {
                color: #666;
                width: 95%;
                display: block;
                font-size: 16px;
                position: relative;
                font-family: 'poppinssemibold', sans-serif;
            }
            .nav-level-description li.active span {
                color: #3356d4;
            }

            .nav-level-description li.active img.level-icon  {
                -webkit-filter: grayscale(0%);
                filter: grayscale(0%);
            }


            h4.level-descr-title {
                font-family: 'poppinssemibold', sans-serif;
                color: #666;
                margin-bottom: 30px;
                /* margin-right: 30px; */
            }
            p.level-descr-copytext {
                padding-right: 30px;
                font-size: 15px;
                line-height: 26px;
                color: #888888;
                font-family: 'poppinsmedium', sans-serif;
            }

            .content-level-progress h3.leveling-caption {
                color: #3255d5;
                margin: 30px;
                margin-top: 30px;
                margin-right: 30px;
                margin-bottom: 0px;
                margin-left: 20px;
            }

            .nav-level-description li:first-child, .nav-level-description li:first-child a img{
                padding-left: 0;
            }

            .referral-link{
                text-align:center;
                padding-bottom: 40px;
                
            }
            .referral-leveling-caption{
                text-align:center;
                padding-top:20px;
                color:#5277dd;
            }
            .referral-link input {
                width: 60%;
                border-radius: 25px;
                padding: 11px 40px 9px 20px;
                border: 0;
                box-shadow: none;
                height: auto;
                background-color: #e6e6e6;
                font-family: 'poppinsmedium', sans-serif;
                color: #4d4d4d;
                font-size: 13px;
                text-align: left;
            }

            .btn-copy-link {
                background-color: transparent;
                padding: 0px 15px !important;
                color: #5277dd !important;
                border: 0;
                margin-top: -5px !important;
                font-style: normal;
                font-size: 14px;
                text-transform: none;
                font-family: 'poppinsmedium', sans-serif;
            }
            .btn-copy-link:hover{
                background-color: transparent;
                font-family: 'poppinssemibold', sans-serif;
            }

            .content-course-attended{
                margin: 30px auto;
                width: 1050px;
            }

            .course-attended-item .item-preview {
                margin: 10px 0;
            }



            .content-course-attended h3.leveling-caption {
                color: #3255d5;
                margin:0;
                margin-top: 30px;
                margin-right: 30px;
                margin-bottom: 40px;
                margin-left: 0;
                /* margin: 0; */
            }
            .content-course-attended .item-detail {
                position: relative;
                top: 10px;
                left: -20px;
            }
            .content-course-attended .item-detail h4 {
                font-size: 14px;
            }
            .content-course-attended .item-action {
                position: relative;
                top: 30px;
                left: -20px;
                color: #3255d5;
            }
            .content-course-attended .item-action a {
                font-family: 'poppinsmedium', sans-serif;
                color: #3255d5;
                padding:0 3px;
            }
            .content-course-attended span {
                display: block;
                font-size: 13px;
            }
            .course-attended-form p.idea-intro {
                padding: 0;
                margin: 0;
                font-size: 14px;
            }
            .course-attended-form img{
                cursor: pointer;
                width: 85px;
                float: right;
            }

            .course-attended-form .form-action{
                float:right;
            }

            .course-attended-form input {
                background: transparent;
                padding: 0px 20px 0px 0px;
                margin: 10px 0 0;
                width: 100%;
                border: 0;
                font-size: 19px;
                resize: none;
                overflow: hidden;
                border-bottom: 1px solid #000000;
                margin-bottom: 20px;
            }

            .image-upload > input
            {
                display: none;
            }

            .image-upload img
            {
                width: 100px;
                cursor: pointer;
            }

            .ContentViewed-hidden,.PointHistory-hidden{display:none}

            .btn-load-more {
                padding: 5px 25px !important;
                color: #5277dd !important;
                border: 1px solid #5277dd;
                margin-top: 10px !important;
                font-style: normal;
                font-size: 12px;
                text-transform: none;
                font-family: 'poppinssemibold', sans-serif;
                background-color: #fafafa;
            }

            #popupRedeemCode .modal-title {
                text-align: center;
                margin: 30px 15px 20px;
                line-height: 1.5;
                font-size: 19px;
                font-family: 'poppinsmedium', sans-serif;
            }

            .btn-redeem-code {
                padding: 5px 15px 5px 20px;
                color: #5277dd !important;
                border: 1px solid #5277dd;
                font-style: normal;
                font-size: 12px;
                text-transform: none;
                font-family: 'poppinssemibold', sans-serif;
                background-color: #fafafa;
                border-radius: 25px 0 0 25px;
                border-right-width: 4px;
            }

            .btn-redeem-code:hover {
                background-color: #1083c8;
                color: #fff !important;
            }

            i.fa.fa-ticket {
                font-size: 16px;
                position: relative;
                top: -2px;
            }

            #formRedeemCode{
                margin:10px 0;
                text-align: center;
            }
            #formRedeemCode input {
                margin: 0 auto;
                text-align: center;
                line-height: 40px;
                font-size: 30px;
                border: solid 1px #ccc;
                box-shadow: 0 0 5px #ccc inset;
                outline: none;
                width: 50px;
                transition: all .2s ease-in-out;
                border-radius: 3px;
                }

            #formRedeemCode input:focus {
                border-color: purple;
                box-shadow: 0 0 5px purple inset;
            }

            #formRedeemCode input::selection {
                background: transparent;
            }


            #formRedeemCode button{
                color: #fff;
                background: #411ada;
                padding: 10px 30px;
                -webkit-border-radius: 25px;
                -moz-border-radius: 25px;
                border-radius: 25px;
                padding: 4px 30px;
                font-size: 12px;
                /* position: absolute; */
                bottom: 20px;
                left: 30px;
                font-family: 'poppinssemibold';
                text-transform: none;
                margin: 30px auto;
                width: 80%;
                /* text-align: center; */
                padding: 6px;
                /* background-color: #B85FC6; */
                border: none;
                display: inline-grid;
                }
                
            .containerTopic {	
                display: flex;	
                flex-direction: row;	
                flex-wrap: wrap;	
            }	
            .itemTopic {	
            flex-basis: 33%;	
            }	
            .itemLeaderboard {	
                vertical-align: middle !important;
                align-self: center;	
            } 	
            .itemPicName {	
                display:flex; 	
                flex-wrap: nowrap; 	
                align-items: center;	
            }	
            #itemPic {	
                width: 40px;	
                height: 40px;	
                box-shadow: none;	
                margin: 0;
                border-radius: 10px;
                border: 2px solid #ffff;	
            }
            #poin {	
                width: 40px;	
                height: 40px;	
                
                margin: 0;	
            }
            .rowleaderboard{
                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); /* this adds the "card" effect */
                padding: 5px;
                text-align: center;
                background-color: #f1f1f1;
                border-radius: 20px;
                margin-bottom: 10px;
                font-weight: 800;
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
            /* !importanté */
            border-radius: inherit;
            /* !importanté */
            background: -webkit-gradient(linear, left top, right top, from(red), to(orange));
            background: linear-gradient(to right, red, orange);
            }

            #LevelProgress{
                padding:30px 48px 0px;
            }
            #profile{
                background:#fff;
            }
            `
            }
        </style>
        <div id="profile">
{/**start*/}

    <div className="add-background">
        <div  className="container" style={{padding: "40px 80px 20px"}}> 
            <div  className="col-md-12">

                <div  className="tab-style1 div-redeem-profile">

                    <div  className="tab-content">

                        <div  className="tab-pane fade active show" id="home" role="tabpanel" aria-labelledby="home-tab">
                            
                            <div  className="row col-md-12" style={{top: "-10px", position: "relative"}}>

                                {/* <div  className="col-md-2">
                                    
                                    <div  className="profile-img" title={securityData.Security_UserName()}
                                        style={{backgroundImage: `url(${photos})`
                                        // photos===null ? "url('"+file_path+"images/icon-avatar-big.png')" : "url('"+file_path+"images/"+photos+"')"
                                        }}>
                                        
                                    </div>

                                </div> */}

                                <div  className="col-md-4">
                                    <div  className="user-identity">
                                        <h3>Hi, {securityData.Security_UserName()}!</h3>
                                        <span>  {defaultLang.lang.profile_what_do_you_wanna_learn_today}  </span>
                                                <a tabIndex={0} role="button" onClick={changeTab.bind(this, "Referral")}  
                                                className="btn btn-outline-white btn-refer">refer now</a><span  className="span-refer">
                                                    refer a friend & get {configReferralPoint.map( (item)=> item.value)}  points !</span>      
                                    </div>
                                
                                </div>

                                <div className="col-md-1">

                                </div>

                                <div  className="col-md-7" >
                                    <div className="d-flex flex-row current-level justify-content-between align-items-center">
                                        <div  className="your-current-level-and-points">
                                            <a onClick={changeTab.bind(this, "RedeemPoints")} style={{cursor:"pointer"}}>
                                                <span  className="user-points"> {profile.redeem_point} </span>
                                                <span  className="user-status">Redeemable <br/>Point</span>                                    
                                            </a>
                                        </div>
                                        <div  className="your-current-level-and-points">
                                            <a onClick={changeTab.bind(this, "ContentViewed")} style={{cursor:"pointer"}}>
                                                <span  className="user-points">    {contents.length}  </span>
                                                <span  className="user-status">Content <br/>Viewed</span>                                    
                                            </a>
                                        </div>
                                        <div  className="your-current-level-and-points">
                                            <a onClick={changeTab.bind(this, "BadgesArchieved")}style={{cursor:"pointer"}}>
                                                <span  className="user-points">  {totalBadgesArchieve}  </span>
                                                <span  className="user-status">Badges <br/>Achieved</span>    
                                            </a>                                
                                        </div>
                                        <div  className="your-current-level-and-points">
                                            <a onClick={changeTab.bind(this, "CourseAttended")} style={{cursor:"pointer"}}>
                                                <span  className="user-points">    {courses.length}  </span>
                                                <span  className="user-status">Workshop <br/>Attended</span>                                    
                                            </a>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                        <div  className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">

                            <div  className="row col-md-12" style={{top: "-10px", position: "relative"}}>

                                
                                <div  className="col-md-4">
                                    <h5>   {defaultLang.lang.redeem_play}  </h5>
                                    <br/>
                                        <ul  className="nav nav-tabs" style={{marginBottom:"0"}} role="tablist">
                                            <li >
                                                <a  className="active show" id="home-tab6" data-toggle="tab" href="#home6" role="tab" aria-controls="home6" aria-selected="true">  {tab1 !=null ? securityData.Security_lang() == "ENG" ? tab1.title : tab1.title_ind : '' } </a>
                                            </li>
                                            <li >
                                                <a id="profile-tab6" data-toggle="tab" href="#profile6" role="tab" aria-controls="profile6" aria-selected="false">  {tab2 !=null ? securityData.Security_lang() == "ENG" ? tab2.title : tab2.title_ind : ''  } </a>
                                            </li>
                                            <li >
                                                <a id="contact-tab6" data-toggle="tab" href="#contact6" role="tab" aria-controls="contact6" aria-selected="false">  {tab3 != null ? securityData.Security_lang() == "ENG" ? tab3.title : tab3.title_ind : ''  }  </a>
                                            </li>
                                        </ul>

                                    <br/>

                                </div>

                                <div  className="col-md-8" style={{borderLeft: "2px solid #d3ddea", padding: "0px 0 10px 60px", lineHeight: "29px"}}>
                            
                                    <div  className="tab-content div-how-to-play">
                                            <div  className="tab-pane fade active show" id="home6" role="tabpanel" aria-labelledby="home-tab6">
                                                <p>   {tab1 !=null ? securityData.Security_lang() == "ENG" ? tab1.page_content : tab1.page_content_ind : ''}  </p>
                                            </div>
                                            <div  className="tab-pane fade" id="profile6" role="tabpanel" aria-labelledby="profile-tab6">
                                            <p>    {tab2 !=null ? securityData.Security_lang() == "ENG" ? tab2.page_content : tab2.page_content_ind : '' }  </p>
                                            </div>
                                            <div  className="tab-pane fade" id="contact6" role="tabpanel" aria-labelledby="contact-tab6">
                                            <p>    {tab3 !=null ? securityData.Security_lang() == "ENG" ? tab3.page_content : tab3.page_content_ind : ''}  </p>
                                            </div>
                                    </div>
                                </div>


                            </div>
                            
                        </div>

                    </div>

                </div>

            </div>
        </div>

        <div  className="container profile-container">
            <div  className="slider-card-button-nav-prev slider-card-button-nav" style={{display: scrollerLeft}}>
                <img onClick={ChangeScroll.bind(this, "left")} src={env.assets + "img/button-next-prev.svg"} width="35"/>
                {/* <i onClick={ChangeScroll.bind(this, "left")} className="glyphicon glyphicon-chevron-left"></i> */}
            </div>

            <div  className="slider-card-button-nav-next slider-card-button-nav" style={{display: scrollerRight}}>
                <img onClick={ChangeScroll.bind(this, "right")} src={env.assets + "img/button-next-prev.svg"} width="35"/>
                {/* <i onClick={ChangeScroll.bind(this, "right")}   className="glyphicon glyphicon-chevron-right" ></i> */}
            </div>


            <div  className="wrapper profile-wrapper">
                <ul  className="nav nav-tabs profile-tabs list " id="myProfileTab" style={{left: scrollerMargin, transition: "ease-in 1s"}}>
                    <li id="tabLevelProgress"   className={tab == "LevelProgress" ? "active": ""}>
                        <a onClick={changeTab.bind(this, "LevelProgress")}>
                            <i className="fa fa-circle circle-notif" aria-hidden="true" style={{display:tab == "LevelProgress" ? "none": "none"}}></i>
                            <br/>
                            {`Level & Progress`}
                        </a>
                    </li>
                    {/* <li id="tabLeaderboard"   className={tab == "Leaderboard" ? "active": ""}>
                        <a onClick={changeTab.bind(this, "Leaderboard")}>
                            <i className="fa fa-circle circle-notif" aria-hidden="true" style={{display:tab == "Leaderboard" ? "none": "none"}}></i>
                            <br/>
                            Leaderboard
                        </a>
                    </li> */}
                    <li id="tabRedeemPoints"   className={tab == "RedeemPoints" ? "active": ""}>
                        <a onClick={changeTab.bind(this, "RedeemPoints")}>
                            <i className="fa fa-circle circle-notif" aria-hidden="true" style={{display:tab == "RedeemPoints" ? "none": "none"}}></i>
                            <br/>
                            Redeem Points
                        </a>
                    </li>   
                    <li id="tabBadgesArchieved"   className={tab == "BadgesArchieved" ? "active": ""}>
                        <a onClick={changeTab.bind(this, "BadgesArchieved")}>
                            <i className="fa fa-circle circle-notif" aria-hidden="true" style={{display:tab == "BadgesArchieved" ? "none": "none"}}></i>
                            <br/>
                            Badges Achieved
                        </a>
                    </li>
                    <li id="tabCourseAttended"   className={tab == "CourseAttended" ? "active": ""}>
                        <a onClick={changeTab.bind(this, "CourseAttended")}>
                            <i className="fa fa-circle circle-notif" aria-hidden="true" style={{display:tab == "CourseAttended" ? "none": "none"}}></i>
                            <br/>
                            Course Attended
                        </a>
                    </li>
                    <li id="tabMyTeams"  className={tab == "MyTeams" ? "active": ""}>
                        <a onClick={changeTab.bind(this, "MyTeams")}>
                            <i className="fa fa-circle circle-notif" aria-hidden="true" style={{display:tab == "MyTeams" ? "none": "none"}}></i>
                            <br/>
                            My Teams
                        </a>
                    </li>
                    <li id="tabMyLearningPlan"  className={tab == "MyLearningPlan" ? "active": ""}>
                        <a onClick={changeTab.bind(this, "MyLearningPlan")}>
                            <i className="fa fa-circle circle-notif" aria-hidden="true" style={{display:tab == "MyLearningPlan" ? "none": "none"}}></i>
                            <br/>
                            My Learning Plan
                        </a>
                    </li>
                    <li id="tabPointHistory"  className={tab == "PointHistory" ? "active": ""}>
                        <a onClick={changeTab.bind(this, "PointHistory")}>
                            <i className="fa fa-circle circle-notif" aria-hidden="true" style={{display:tab == "PointHistory" ? "none": "none"}}></i>
                            <br/>
                            Point History
                        </a>
                    </li>
                    <li id="tabContentViewed"   className={tab == "ContentViewed" ? "active": ""}>
                        <a onClick={changeTab.bind(this, "ContentViewed")}>
                            <i className="fa fa-circle circle-notif" aria-hidden="true" style={{display:tab == "ContentViewed" ? "none": "none"}}></i>
                            <br/>
                            Content Viewed
                        </a>
                    </li>
                    <li id="tabPreferredTopic"   className={tab == "PreferredTopic" ? "active": ""}>
                        <a onClick={changeTab.bind(this, "PreferredTopic")}>
                            <i className="fa fa-circle circle-notif" aria-hidden="true" style={{display:tab == "PreferredTopic" ? "none": "none"}}></i>
                            <br/>
                            Preferred Topic
                        </a>
                    </li>	
                    <li id="tabReferral"   className={tab == "Referral" ? "active": ""}>
                        <a onClick={changeTab.bind(this, "Referral")}>
                            <i className="fa fa-circle circle-notif" aria-hidden="true" style={{display:tab == "Referral" ? "none": "none"}}></i>
                            <br/>
                            Referral
                        </a>
                    </li>
                </ul>
            </div>

        </div>
    </div>


    <div  className="tab-content profile-tabs-containter">
        <div id="LevelProgress"  className={tab == "LevelProgress" ? "tab-pane active show": "tab-pane"}>
            <div  className="content-level-progress">
                <div className="row">
                    <div className="col-md-6">
                        <LevelProgress currentTab={tab}/>
                    </div>
                    <div className="col-md-6">
                        <Leaderboard currentTab={tab}/>
                    </div>
                </div>

                {/* <div  className="row">
                    <div  className="col-md-3">
                        <div  className="level-progress-image" title={profile.user_level}
                            style={{backgroundImage: "url('"+file_path+"level/"+imageCurrentLevel+"')"}}>
                                
                        </div>
                    </div>

                    <div  className="col-md-3">
                        <h1  className="user-level">{profile.user_level}</h1>
                    </div>

                    <div  className="col-md-3">
                    
                            <div  className="progress-tier-point">
                                <div  className="barOverflow">
                                    <div  className="bar" style={{
                                        // 100%=180° so: ° = % * 1.8
                                        // 45 is to add the needed rotation to have the green borders at the bottom
                                        transform:`rotate(${(45+(parseInt( profile.progressLevel > 100? 100:profile.progressLevel, 10)*1.8))}deg)`,
                                        transitionDuration: '1s',
                                        transitionProperty:'transform'
                                    }}></div>
                                </div>
                                <span  className="progress-percent" style={{display:"none", 
                                transform: "rotate("+ (45+( profile.target_point <= profile.tier_point ? 100 : profile.progressLevel *1.8)) +"deg)"}}>  
                                    {  

                                            profile.progressLevel
                                    }
                                </span>
                                <span  className="progress-status">
                                    <span style={{color:"#3255d5"}}>   
                                        {profile.tier_point} 
                                    </span>
                                    /    
                                    {profile.targetPoint}
                                </span>
                            </div>
                            <h4  className="progress-caption">tier points to the next level</h4>

                    </div>

                    <div  className="col-md-3">
                        <div  className="progress-streak-login">
                            <div  className="barOverflow">
                                <div  className="bar" style={{
                                        // 100%=180° so: ° = % * 1.8
                                        // 45 is to add the needed rotation to have the green borders at the bottom
                                        transform:`rotate(${(45+(parseInt( profile.progressStreakLogin > 100? 100:profile.progressStreakLogin, 10)*1.8))}deg)`,
                                        transitionDuration: '1s',
                                        transitionProperty:'transform'
                                }}></div>
                            </div>
                            <span  className="progress-percent" style={{display:"none"}}>  
                                        {profile.progressStreakLogin}
                            </span>
                            <span  className="progress-status">
                                <span style={{color:"#3255d5"}}>
                                    {profile.Cz_awb_streak_login_current}  
                                    </span>
                                    /
                                    {profile.Cz_awb_streak_login_target}  
                            </span>
                        </div>
                        <h4  className="progress-caption">days logged in (daily streak)</h4>
                    </div>

                </div>
                {loading?
                    <div className="col-md-12" style={{margin: "auto 0"}}>
                        <LoadingData loading={loading}/>
                    </div>
                    :
                
                        <div  className="row" style={{paddingTop:"50px"}}>
                            <div  className="col-md-12">
                                <h3  className="leveling-caption">Leveling</h3>
                                <br/>

                                <ul  className="nav nav-tabs level-tabs nav-level-description" style={{marginBottom:"0"}} role="tablist">
                                    
                                {
                                    ListUserLevels.map(
                                    (itemListLevel) => 
                                            <li key={itemListLevel.id}  className="active">
                                                <>
                                                <a onClick={changeLevel.bind(this, itemListLevel.id)}  className="active" data-toggle="tab" href={"#level"+itemListLevel.id} role="level-tab" aria-controls="level-tab" aria-selected="true">
                                                    <img  className="level-icon" 
                                                    src={itemListLevel.level_image ? file_path+"level/"+itemListLevel.level_image : addDefaultSrcImg}
                                                    alt={itemListLevel.level_image} title={itemListLevel.title.replace(/\b(\w)/g, s => s.toUpperCase())} />
                                                    
                                                </a>
                                                {level == itemListLevel.id ? 
                                                    <span> {itemListLevel.title.replace(/\b(\w)/g, s => s.toUpperCase())} </span> : itemListLevel.title.replace(/\b(\w)/g, s => s.toUpperCase())
                                                }
                                                </>
                                            </li>
                                    )
                                }
                                    
                                    
                                </ul>
                            </div>

                            <div  className="col-md-12">
                                <div  className="tab-content content-level-description" style={{marginLeft: "20px"}}>
                                {listLevel()}
                                </div>
                            </div>
                        </div>
                } */}

            </div>
        </div>

        <div id="PointHistory"  className={tab == "PointHistory" ? "tab-pane active show": "tab-pane"}>
            <div  className="content-point-history">
            {loading?
                    <div className="col-md-12" style={{margin: "auto 0", padding:"20px"}}>
                        <LoadingData loading={loading}/>
                    </div>
                :
                pointsHistory.map(
                    (itemPointsHistory, index) =>
                    
                    <div key={itemPointsHistory.id}  
                    className={
                        index >limitPoint ?
                            "PointHistory-hidden"
                        :
                        itemPointsHistory.point > 0 ? 
                        'row point-history-item point-theme-plus' 
                        : 'row point-history-item point-theme-minus'
                        
                    }
                    >
                        <div  className="col-md-10">
                            <p  className="point-descr">{ itemPointsHistory.title}</p>
                        </div>
                        <div  className="col-md-2" >
                            <div  className="point-info">
                                <span>{itemPointsHistory.point > 0 ? "+"+ itemPointsHistory.point : itemPointsHistory.point }</span>
                                <img src={file_assets+"img/poin.png"}/>

                            </div>
                        </div>
                    </div>
                )}

                {loading? "" : pointsHistory.length >limitPoint ?
                        <div  className="text-center" style={{marginTop:"30px"}}>
                            <a  className="btn btn-outline-white btn-load-more" onClick={loadMoreData.bind(this, tab)}> {defaultLang.lang.general_load_more_text} </a>
                            
                        </div>
                        :
                        ""
                }

                    {loading?
                        ""
                        :
                        pointsHistory.length <=0 ?
                        <div  className="row">
                            <div  className="col-md-12">
                                <h4  className="data-not-found"> {defaultLang.lang.general_no_data_available} </h4>
                            </div>
                        </div>
                        :
                        ""
                }

            </div>
        </div>

        <div id="ContentViewed"  className={tab == "ContentViewed" ? "tab-pane active show": "tab-pane"}>
                <div  className="content-viewed">
                    <h3  className="leveling-caption">Most Viewed Topic</h3>
                    {loading?
                            <div className="col-md-12" style={{margin: "auto 0"}}>
                                <LoadingData loading={loading}/>
                            </div>
                                                    :
                                                    topics.map(
                        (itemTopic) =>
                        <>
                            <div key={itemTopic.id}  className="row content-viewed-item">
                                <div  className="col-md-9">
                                    <p  className="viewed-title"> { itemTopic.title } </p>
                                </div>
                                <div  className="col-md-3" >
                                    <div  className="viewed-date"> 
                                        
                                        <span>  
                                            { 
                                                securityData.Security_lang() == "ENG" ?
                                                `${itemTopic.total} content${itemTopic.total  > 1 ? `s`:``} viewed`  
                                                :  
                                                `${itemTopic.total} konten yang dilihat`
                                                }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {loading?
                        ""
                        :
                        topics.length <=0 ?
                        <div  className="row">
                            <div  className="col-md-12">
                                <h4  className="data-not-found">  {defaultLang.lang.general_no_data_available} </h4>
                            </div>
                        </div>
                        : null
                    }

                </div>

                <div  className="content-viewed">
                    <h3  className="leveling-caption">Your Learning History</h3>

                    {loading?
                            <div className="col-md-12" style={{float:"left", margin: "auto 0", padding:"20px"}}>
                                <LoadingData loading={loading}/>
                            </div>
                                                    :contents.map(
                        (itemContent, index) =>
                        <>
                            <div key={itemContent.id}  className={index> limitContent ? 'row content-viewed-item ContentViewed-hidden' :'row content-viewed-item'}>
                                <div  className="col-md-9">
                                    <p  className="viewed-title">  { securityData.Security_lang() == "ENG" ? itemContent.title : itemContent.title_ind}</p>
                                </div>
                                <div  className="col-md-3" >
                                    <div  className="viewed-date">
                                        <span>  {itemContent.date_read}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                )}
                    {loading? "" : contents.length > limitContent ?
                        <div  className="text-center" style={{marginTop:"30px"}}>
                            <a  className="btn btn-outline-white btn-load-more" onClick={loadMoreData.bind(this, tab)}>  {defaultLang.lang.general_load_more_text} </a>
                        </div>
                        : null
                    }
                        
                        {loading?
                            ""
                            :contents.length <=0 ?
                            <div  className="row">
                                <div  className="col-md-12">
                                    <h4  className="data-not-found">  {defaultLang.lang.general_no_data_available} </h4>
                                </div>
                            </div>
                            :null
                    }

                </div>
                </div>
                
        <div id="Referral"  className={tab == "Referral" ? "tab-pane active show": "tab-pane"}>
            <div  className="content-viewed">
                <h5  className="referral-leveling-caption">Share your referral link</h5>
                <div  className="referral-link">
                    <input type="text"
                    
                        value={window.location.origin+routeAll.routesUser.profile.path+"?refer="+securityData.Security_UserAccount()+"&platform="+md5PlatformId} id="txtReferralLink" readOnly={true}/>
                        
                    <button   className="btn btn-outline-white btn-copy-link" onClick={() => {navigator.clipboard.writeText(window.location.origin+routeAll.routesUser.profile.path+"?refer="+securityData.Security_UserAccount()+"&platform="+md5PlatformId)}}>copy link</button>
                </div>


                <h3  className="leveling-caption">Referral List</h3>

                {loading?
                    <div className="col-md-12" style={{float:"left", margin: "auto 0", padding:"20px"}}>
                        <LoadingData loading={loading}/>
                    </div>
                                            :
                referrals.map(
                    (itemReferral) =>
                
                    <div key={itemReferral.id} className="row content-viewed-item">
                        <div  className="col-md-9">
                            <p  className="viewed-title"> { itemReferral.name } </p>
                        </div>
                        <div  className="col-md-3" >
                            <div  className="viewed-date">
                                <span>  { itemReferral.refer_date } </span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>

        <div id="CourseAttended"  className={tab == "CourseAttended" ? "tab-pane active show": "tab-pane"}>
            <div  className="content-course-attended">
            <h4 className="leveling-caption  mb-3 mt-5">Your Course Limit : <b className="leveling-caption">IDR {courseLimit}</b></h4>


                <h3 className="leveling-caption">Course Claimed</h3>
                    {coursesClaimed.map(
                        (itemCourse) =>
                    <div className="col-md-3 p-1">
                        <div class="card border-0"  key={itemCourse.id} >
                            <img class="card-img-top" src={file_path + 'course/' + itemCourse.course_image}/>
                            <div class="card-footer">
                                <b class="card-title slider-content-title">{itemCourse.title}</b>
                            </div>
                        </div>
                    </div>
                    )}

                {
                    coursesClaimed.length <= 0 ?
                        <div className="col-md-12">
                            <h4 className="data-not-found">  {defaultLang.lang.general_no_data_available} </h4>
                        </div>
                        : null
                }
                <h3  className="leveling-caption">Course Attended</h3>
                <div  className="row course-attended-item">
                {loading?
                    <div className="col-md-12" style={{float:"left", margin: "auto 0", padding:"20px"}}>
                        <LoadingData loading={loading}/>
                    </div>
                                            :courses.map(
                    (itemCourse) =>
                
                    <div key={itemCourse.id} className="col-md-6">
                        <div  className="row">
                            <div  className="col-md-3">
                                <div  className="item-preview">
                                    <a href={file_path+"course/"+itemCourse.course_attachment} target="_blank" rel="noreferrer">
                                        <img src={itemCourse.course_attachment ? file_path+"course/"+itemCourse.course_attachment : addDefaultSrcImg} id="upfile1"style={{cursor:"pointer"}} /></a>
                                </div> 
                            </div>
                            <div  className="col-md-6">
                                <div  className="item-detail">
                                    <h4> { itemCourse.name }</h4>
                                    <span> { itemCourse.organization } </span>
                                    <span> { itemCourse.field } </span>
                                </div>
                            </div>
                            <div  className="col-md-3">
                                <div  className="item-action">
                                        <a onClick={courseEdit.bind(this, itemCourse.id)} style={{cursor:'pointer'}}>Edit</a>
                                        |
                                        <a onClick={courseDelete.bind(this, itemCourse.id)} style={{cursor:'pointer'}}>Delete</a>
                                </div>                            
                            </div>

                        </div>
                    </div>
                )}

                {loading?
                    ""
                        :courses.length <=0 ? 
                        <div  className="col-md-12">
                            <h4  className="data-not-found">  {defaultLang.lang.general_no_data_available} </h4>
                        </div>
                        : null
                }
                    

                </div>

                {loading?
                    ""
                    :     
                <form id="formCourseAttended" key={raCourse.id} autoComplete="off" encType='multipart/form-data' acceptCharset="UTF-8"  
                    className="course-attended-form">
                    <div  className="row">
                        <div  className="col-md-10">
                            <h3  className="leveling-caption">Add Licenses & Certifications</h3>
                        </div>
                        <div  className="col-md-2" style={{textAlign:"right"}}>
                            <div style={{fontSize: "9px", fontStyle: "italic", marginBottom: "5px"}}>*pdf / jpg / png format</div>
                            <div  className="image-upload">
                                <label htmlFor="courseUpload">
                                    <img src={file ? file : raCourse.course_attachment ? file_path+"course/"+raCourse.course_attachment : file_assets+"img/course-attended-upload.png"}
                                    
                                    />
                                </label>
                                <input id="courseUpload" type="file"  name="course_file" accept="image/jpg,image/png,image/jpeg,image/pdf" ref={fileInput} 
                                onChange={ajaxFileUploadImage.bind(this)} required={editData===false?true:false} />
                            </div>

                        </div>
                    </div>
                    <div  className="row">
                        <div  className="col-md-6">
                            <p  className="idea-intro"> { securityData.Security_lang() == "ENG" ? "Workshop Name" : "Nama Workshop" }</p>
                            <input type="text" name="name" value={raCourse.name} onChange={handleInputChange}   aria-required="true" aria-invalid="false"/>
                        </div>
                        <div  className="col-md-6">
                            <p  className="idea-intro"> { securityData.Security_lang() == "ENG" ? "Field" : "Bidang" }</p>
                            <input type="text" name="field" value={raCourse.field} onChange={handleInputChange}/>
                        </div> 
                    </div>
                    <div  className="row">
                    <div  className="col-md-6">
                            <p  className="idea-intro"> { securityData.Security_lang() == "ENG" ? "Issuing Organization" : "Organisasi Penerbit" }</p>
                            <input type="text" name="organization" value={raCourse.organization} onChange={handleInputChange}/>
                        </div>
                        <div  className="col-md-3">
                            <p  className="idea-intro"> { securityData.Security_lang() == "ENG" ? "Issue Date" : "Tanggal Terbit" }</p>
                            <input type="date"  className="datepicker" name="issued_date" placeholder="{dd/mm/yyyy}" value={raCourse.issued_date} onChange={handleInputChange}/>
                        </div>
                        <div  className="col-md-3">
                            <p  className="idea-intro"> { securityData.Security_lang() == "ENG" ? "Expiring Date" : "Berlaku sampai" }</p>
                            <input type="date"  className="datepicker" name="expired_date" placeholder="{dd/mm/yyyy}" value={raCourse.expired_date} onChange={handleInputChange}/>
                        </div>
                </div>
                <div  className="row">
                        <div  className="col-md-12">
                            <div  className="form-action" > 
                            <input type="hidden" id="hdnCourseAttendedId" name="hdnCourseAttendedId" value={raCourse.id||''}/>
                                
                            {
                            editData===false ? 
                                <>
                                    <button onClick={validateImage} type="submit" id="btncourseSaveAndMore" name="btncourseSaveAndMore"  className="btn btn-outline-white btn-refer" value="save_more">save & add another</button>
                                    <button onClick={validateImage} type="submit" id="btncourseSave" name="btncourseSave"  className="btn btn-outline-white btn-refer" value="save">save</button>
                                </>
                                :  
                                <button onClick={validateImage} type="submit" id="btncourseUpdate" name="btncourseUpdate"  className="btn btn-outline-white btn-refer" value="update">update</button>
                            }
                            
                            </div>
                        </div>
                </div>
                </form>
    }

            </div>
        </div>

        <div id="MyTeams"   className={tab == "MyTeams" ? "tab-pane active show": "tab-pane"}>
            <div  className="content-my-teams">
            {loading?
                    <div className="col-md-12" style={{margin: "auto 0"}}>
                        <LoadingData loading={loading}/>
                    </div>
                                            :teams.map(
                    (itemTeams) =>
                    {
                        return(
                        <div key={itemTeams.id}  className="row my-team-item">
                            <div  className="col-md-2">
                                <a onClick={getDetail.bind(this, itemTeams.account)}>
                                    <div  className="profile-img" title={itemTeams.name}
                                        style={{backgroundImage: `url(${itemTeams.profile_picture})`}}>
                                    </div>
                                </a>
                            </div>
                            <div  className="col-md-4">
                                <div  className="user-identity">
                                    <a onClick={getDetail.bind(this, itemTeams.account )}>
                                        <h3> { itemTeams.name }</h3>
                                        <span> { itemTeams.title } </span>
                                    </a>
                                </div>
                            
                            </div>
                            
                            <div  className="col-md-6" >
                                <div className="d-flex flex-row justify-content-between align-items-center">
                                    <div  className="point-profile">
                                        <span  className="user-points">   { itemTeams.total_content_viewed } </span>
                                        <span  className="user-status">Content <br/>Viewed</span>                                    
                                    </div>
                                    <div  className="point-profile">
                                        <span  className="user-points">   { itemTeams.total_badges_archieved } </span>
                                        <span  className="user-status">Badges <br/>Achieved</span>                                    
                                    </div>
                                    <div  className="point-profile">
                                        <span  className="user-points">   { itemTeams.total_course_attended } </span>
                                        <span  className="user-status">Course <br/>Attended</span>                                    
                                    </div>
                                    <div  className="point-profile" >
                                        <a href={`${routeAll.routeTrainingTeam.trainingTeams.parentPath}/${axiosLibrary.decodeEncodeUri('?id='+itemTeams.id,'encode')}`}  
                                        
                                        >
                                                {

                                                    countsAttend.filter(v=>v.id===itemTeams.id).map(
                                                        (itemAttend,idx) =>
                                                        <span  key={idx} className="user-points"> 
                                                            {itemAttend.total}
                                                        </span>
                                                    )
                                                }
                                                
                                        <span  className="user-status" style={{cursor:"pointer", textDecoration:"underline"}}>Total <br/>Training</span>
                                        </a>                                    
                                    </div>
                                    <div  className="point-profile">
                                        <a href={`${routeAll.routesUser.profileDetail.path}?uac=${itemTeams.account}&data=${axiosLibrary.decodeEncodeUri('?id='+itemTeams.id+'&account='+itemTeams.account,'encode')}`}>
                                            <span  className="user-points">   { itemTeams.total_learning_plan } </span>
                                            <span  className="user-status">Learning <br/>Plan</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    }
                )}

                {loading?
                    ""
                    :
                    teams.length <=0 ?
                    <div  className="row">
                        <div  className="col-md-12">
                            <h4  className="data-not-found"> {defaultLang.lang.general_no_data_available} </h4>
                        </div>
                    </div>
                    : null
                }
                
            </div>
        </div>

        <div id="MyLearningPlan"   className={tab == "MyLearningPlan" ? "tab-pane active show": "tab-pane"}>
            <div className="col-md-12">
                <LoadingData loading={global.loadLearningPlan}/>
            </div>
            <div style={cssTarget(global.loadLearningPlan)}>
                <ProfileMyLearningPlan tab={tab}/>
            </div>
        </div>

        <div id="BadgesArchieved"  className={tab == "BadgesArchieved" ? "tab-pane active show": "tab-pane"}>
            <div  className="content-badges-achieved">
                <h3  className="leveling-caption">Your Badge Achievement</h3>
                <div  className="row badges-achieved-item">
                {loading?
                    <div className="col-md-12" style={{float:"left", margin: "auto 0", padding:"20px"}}>
                        <LoadingData loading={loading}/>
                    </div>
                                            :
                    badges.map(
                        (itemBadge) =>
                
                    <div key={itemBadge.id} className="col-md-4">
                        
                        <img className= {itemBadge.flag_achieved ==1 ? 'badge-img achieved' : 'badge-img'}
                        src={file_path+"badge/"+itemBadge.badge_image} alt= { itemBadge.title } title= { itemBadge.short_descr} />
                    </div>
                )}
                
                {loading?
                    ""
                                            :
                    badges.length <= 0 ?
                    <div  className="row">
                        <div  className="col-md-12">
                            <h4  className="data-not-found">   {defaultLang.lang.general_no_data_available}  </h4>
                        </div>
                    </div>
                    : null
                }

                </div>
                </div>	
        </div>

        <div id="PreferredTopic"  className={tab == "PreferredTopic" ? "tab-pane active show": "tab-pane"}>	
            <div  className="content-badges-achieved">	
                <h3  className="leveling-caption">Your Preferred Topic</h3>	
                <form  id="formPreferredTopic" encType="multipart/form-data" acceptCharset="UTF-8" style={{paddingLeft:"10%"}}>	
                <div  className="containerTopic">	
                {loading?
                    <div className="col-md-12" style={{float:"left", margin: "auto 0", padding:"20px"}}>
                        <LoadingData loading={loading}/>
                    </div>
                                            :
                    listPreferredTopic.map(
                            (itemListTopic, index) =>
                            // {
                            //     // const filterTopic = readPreferredTopic.filter((item) => item.topicid == itemListTopic.id)
                            //     return(
                            <label key={itemListTopic.id}  className="itemTopic" >	
                                <input type="checkbox" name={index} value={itemListTopic.id} 
                                onChange={handleInputChangeTopic} 
                                checked={readPreferredTopic.includes(itemListTopic.id) ? true : false}
                                />
                                &nbsp; <span dangerouslySetInnerHTML={{__html: itemListTopic.title}	} ></span>
                            </label>
                            //     )
                            // }
                    )
                }
                </div>	
                    {loading? "" : listPreferredTopic.length >0 ?
                        <div  className="row">	
                                <div  className="col-md-12">	
                                    <div  className="form-action" >	
                                        <button onClick={submitTopic} type="submit" id="btnSave" name="btnSave"  className="btn btn-outline-white btn-refer" value="save">save</button>	
                                    </div>	
                                </div>	
                        </div>	
                        :
                        null
                    }
                </form>	
                {loading?
                    ""
                    :
                    listPreferredTopic.length <=0 ?
                    <h4  className="data-not-found">   {defaultLang.lang.general_no_data_available}  </h4>
                    : null
                }
                <p>
    </p>
            </div>	
        </div>	

        {/* <div id="Leaderboard"  className={tab == "Leaderboard" ? "tab-pane active show": "tab-pane"}>	
            <div  className="content-badges-achieved">	
                <h3  className="leveling-caption" style={{textAlign: "left", fontSize: "xxx-large", margin: "0px 0px 20px 0px"}}>
                    Leaderboard - { currMonth+" "+currYear }
                </h3>	
                
                {loading?
                    <div  className="row">	
                        <div className="col-md-12" style={{float:"left", margin: "auto 0", padding:"20px"}}>
                            <LoadingData loading={loading}/>
                        </div>
                    </div>
                                            :
                    readLeaderboard.length<=0 ? 
                    <div  className="row">	
                        <div  className="col-md-12">	
                            <h4  className="data-not-found">   {defaultLang.lang.general_no_data_available}  </h4>	
                        </div>	
                    </div>	
                    :
                    <>
                        {
                            readLeaderboard.map(
                                (itemReadLeaderboard, index)=>
                                {
                                    if(index< 10){
                                        return(
                                        <div key={itemReadLeaderboard.id} className={ itemReadLeaderboard.user_modified == securityData.Security_UserId() ? "row rowleaderboardFromId" : "row rowleaderboard" }>
                                            <div  className='col-sm-1 itemLeaderboard'>
                                                { index+1 }
                                            </div>
                                            <div  className='col-sm-8 itemPicName'>
                                                <div  className="profile-img" id="itemPic" title={itemReadLeaderboard.name}
                                                        
                                                            style={{backgroundImage: `url(${itemReadLeaderboard.profile_picture})`}}>
                                                            
                                                        
                                                </div><div>&nbsp;   {itemReadLeaderboard.user_modified == securityData.Security_UserId() ? "You" : itemReadLeaderboard.name }</div>
                                            
                                            </div>
                                            <div  className='col-sm-3 itemLeaderboard' style={{display: "flex"}}>
                                                <div  className="profile-img" id="poin" title={itemReadLeaderboard.name}
                                                        style={{backgroundImage: "url('"+file_assets+"img/poin.png')"}}>	
                                                </div>
                                                <div style={{alignSelf: "center"}}>&nbsp;   {itemReadLeaderboard.historypoint == null ? 0 : itemReadLeaderboard.historypoint}   &nbsp;Pts</div>
                                            </div>
                                        </div>
                                        );
                                    }
                                }
                            )
                        }
                            {loading?
                                <div className="col-md-12" style={{margin: "auto 0"}}>
                                    <LoadingData loading={loading}/>
                                </div>
                                            :
                                readLeaderboardId.length <=0 ?
                                    <div  className="row data-not-found" style={{margin:"10px",fontSize:"15px"}}>
                                            <div  className='col-sm-12 itemPicName'>
                                        {defaultLang.lang.general_no_data_available}
                                            </div>
                                    </div>		
                                    
                                    :
                                
                                    readLeaderboardId.map(
                                    (itemReadLeaderboardId) =>
                                        {
                                            if(itemReadLeaderboardId.iterator > 10){
                                                return(
                                                    <>
                                                        <div  key={itemReadLeaderboardId.id} className="row data-not-found" style={{margin:"10px",fontSize:"30px"}}>
                                                                <div  className='col-sm-12 itemPicName'>
                                                                .....
                                                                </div>
                                                        </div>	
                                                        <div  className="row rowleaderboardFromId ">
                                                            <div  className='col-sm-1 itemLeaderboard'>
                                                            {         itemReadLeaderboardId.iterator  }
                                                            </div>
                                                            <div  className='col-sm-8 itemPicName'>
                                                                <div  className="profile-img" id="itemPic" title="   duser name  "	
                                                                        style={{backgroundImage: file_path+"profile_pictures/"+itemReadLeaderboardId.account+'.jpg'}}>
                                                                </div><div>&nbsp;   { itemReadLeaderboardId.name }   &nbsp;( You )</div>
                                                            
                                                            </div>
                                                            <div  className='col-sm-3 itemLeaderboard' style={{display: "flex"}}>
                                                                <div  className="profile-img" id="poin" title="   duser name  "	
                                                                        style={{backgroundImage: "url('"+file_assets+"img/poin.png')"}}>	
                                                                </div>
                                                                <div style={{alignSelf: "center"}}>&nbsp;  {itemReadLeaderboardId.historypoint}   &nbsp;Pts</div>
                                                            </div>
                                                        </div>
                                                        </>
                                                )
                                            }
                                        }
                                    )
                            }
                    </>
                }
                                
                        
                    
            </div>
        </div> */}
            
        <div id="RedeemPoints"  className={tab == "RedeemPoints" ? "tab-pane active show": "tab-pane"}>
            <div  className="row">
                <div  className="col-lg-12 col-md-12">
                    <section id="function"  className="section-redeem" >
                        <div  className="row justify-content-center redeem-reward-title">
                            
                            <div  className="container containter-redeem">
                                <div  className="row div-list-reward">
                                    <div  className="col-md-12" style={{backgroundImage: "linear-gradient(to right, #27bfff, #8078f1)", minHeight: "100%", borderRadius:"20px", padding:"0", margin:"0", zIndex:"10"}}>
                                    
                                        
                                        <div  className="col-md-12" style={{float:"left", padding:"15px 0px 0px 0px"}}>
                                            <h3 style={{textAlign:"center", color:"white"}}>
                                                    {defaultLang.lang.redeem_redeem_your_points}
                                            </h3>
                                        </div>

                                        

                                    </div>
                                
                                    <div id="list"  className="col-md-12 collapse show text-white" style={{background: "rgb(0,0,0,0.7)", borderRadius:"0px 0px 20px 20px", padding:"20px", marginTop:"-20px"}}>
                                    {loading?
                                        <div className="col-md-12" style={{float:"left", margin: "auto 0", padding:"20px"}}>
                                            <LoadingData loading={loading}/>
                                        </div>
                                        :
                                        <>
                                            <div  className="col-md-3 text-white" style={{float:"left", borderRadius:"0px 0px 0px 20px", padding:"20px", marginTop:"-20px"}}>
                                                <div className="row" style={{height: "100%"}}>
                                                    <div className="col-md-12" style={{margin: "auto 0", textDecoration: "underline", lineHeight: "200px"}}>
                                                    <div className="text-center text-white"> {defaultLang.lang.redeem_terms_conditions} </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div  className="col-md-9 text-white" style={{float:"left", borderRadius:"0px 0px 20px 0px", padding:"20px", marginTop:"-20px"}}>
                                                <ul style={{padding:"20px"}}>
                                                <br/>
                                                { 
                                                listTerms.map(
                                                    (itemTerms) =>
                                                    <li key={itemTerms.id}
                                                    dangerouslySetInnerHTML={{
                                                        __html: securityData.Security_lang() == "ENG"  ? itemTerms.page_content : itemTerms.page_content_ind
                                                    }}
                                                    >  
                                                    </li>
                                                )}
                                                </ul>
                                            </div>
                                        </>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div style={{padding:"20px", minHeight:"100%", width:"100%"}}>
                            </div>
                            
                            <div  className="container containter-redeem">
                                    <div  className="row div-list-reward">
                                {       
                                    loading?
                                        ""
                                        :
                                
                                        ListUserLevels.map(
                                            (itemListUserLevel) => 
                                            {
                                                return(
                                                    <>
                                                        <div key={itemListUserLevel.id}  className="col-md-12 row" style={{margin: "20px 0px"}}>
                                                            <div  className="col-md-3" style={{margin: "0", padding:"0"}}>
                                                                <h4>
                                                                    {  profile.tier_point < itemListUserLevel.points_needed  ? 
                                                                        <i  className="fa fa-lock" aria-hidden="true"></i>
                                                                        : null
                                                                    } 
                                                                    {itemListUserLevel.title.replace(/\b(\w)/g, s => s.toUpperCase())}
                                                                </h4>
                                                            </div>

                                                            {  profile.tier_point < itemListUserLevel.points_needed  ? 
                                                                <>
                                                                    <div  className="col-md-3" style={{margin: "0", padding:"0"}}>
                                                                        <hr style={{background: "#3255ca", width:"100%"}}/>
                                                                    </div>

                                                                    <div  className="col-md-6" >
                                                                        <div  className="text-white" style={{backgroundImage: "linear-gradient(to right, #27bfff, #8078f1)", minHeight: "100%", borderRadius:"20px", padding:"5px 20px", margin:"0"}}>
                                                                            {defaultLang.lang.redeem_unlock_level}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            : null
                                                            }

                                                        </div>
                                        
                                            
                                                        {
                                                            listRewards.map(
                                                                (itemListReward) =>{
                                                                    return(
                                                                
                                                                    itemListReward.minimum_claim_level == itemListUserLevel.points_needed ?
                                                                
                                                                        <div key={itemListReward.id}  className="col-md-4 item" style={{marginBottom:"20px"}}>
                                                                            
                                                                            <div  className="redeem_box white_bg team_hover_style2 social_white" style={{padding:"0px", background:"transparent", height:"100%"}}>
                                                                                <div  className="redeem_box" style={{borderRadius:"20px", height:"100%",  boxShadow: "5px 5px rgb(0,0,0, 0.1)"
                                                                                    , background: 
                                                                                        itemListReward.flag_claim == 0 && itemListReward.user_claim >0 ? 
                                                                                            "url('"+file_path+"reward/redeem_page_tick.png" 
                                                                                        :
                                                                                        profile.Cz_awb_level_idx < itemListUserLevel.id ?
                                                                                            "#e7e7e7"
                                                                                        :
                                                                                        ( 
                                                                                            (itemListReward.qty_available > 0 && itemListReward.user_claim < 1) 
                                                                                        || 
                                                                                            ( profile.tier_point <  itemListReward.claim_point )
                                                                                        || 
                                                                                            (profile.tier_point >= itemListReward.minimum_claim_level )
                                                                                        )
                                                                                        ?
                                                                                        "white"
                                                                                        :"transparent"


                                                                                    ,backgroundRepeat:
                                                                                        itemListReward.flag_claim == 0 && itemListReward.user_claim >0 ? 
                                                                                            "round" :"none"

                                                                                    ,opacity:  
                                                                                        itemListReward.flag_claim == 0 && itemListReward.user_claim >0 ? 
                                                                                            "100%" 
                                                                                        :
                                                                                        profile.Cz_awb_level_idx < itemListUserLevel.id ?
                                                                                            "50%"
                                                                                        :
                                                                                        ( 
                                                                                            (itemListReward.qty_available > 0 && itemListReward.user_claim < 1) 
                                                                                        || 
                                                                                            ( profile.tier_point <  itemListReward.claim_point )
                                                                                        || 
                                                                                            (profile.tier_point >= itemListReward.minimum_claim_level )
                                                                                        )
                                                                                        ?
                                                                                        "100%"
                                                                                        :"0%"
                                                                                    
                                                                                }}>

                                                                                <div  className="team_img">
                                                                                    <img src={file_path+"reward/"+itemListReward.reward_image} alt={itemListReward.reward_image}/>
                                                                                    
                                                                                        {profile.redeem_point <   itemListReward.claim_point ?  
                                                                                            <span  className="required-point" style={{background: "#3255ca", opacity: "70%"}}>   
                                                                                                {itemListReward.claim_point} 
                                                                                                    <br/>   
                                                                                                {defaultLang.lang.redeem_points}  
                                                                                            </span>
                                                                                        :
                                                                                            <span  className="required-point" style={{background: "rgb(#3255ca"}}>  
                                                                                                {itemListReward.claim_point}
                                                                                                    <br/>   
                                                                                                {defaultLang.lang.redeem_points}  
                                                                                            </span>
                                                                                        }
                                                                                    
                                                                                </div>
                                                                        
                                                                                <div  className="redeem_title" style={{height:"100%", padding:"20px"}}>
                                                                                    <h4 style={{height:"auto", position:"relative", fontSize:"20px"}}>  { securityData.Security_lang() == "ENG"  ? itemListReward.title : itemListReward.title_ind }</h4>
                                                                                    <span  className="description" style={{height:"30px"}}>  {securityData.Security_lang() == "ENG"  ? itemListReward.short_descr : itemListReward.short_descr_ind }</span>
                                                                                    
                                                                                    {itemListReward.promo_point > 0 ?
                                                                                        <p  className="description promo" style={{color: "#e01919", height:"auto", fontSize:"11px"}}>
                                                                                            <br/>
                                                                                            <span style={{textDecoration: "line-through"}}>
                                                                                                {itemListReward.promo_point }
                                                                                                {defaultLang.lang.redeem_points}
                                                                                            </span>
                                                                                            &nbsp;
                                                                                            {">"}&nbsp;
                                                                                            { itemListReward.claim_point } &nbsp;
                                                                                            {defaultLang.lang.redeem_points} &nbsp;
                                                                                            ({defaultLang.lang.redeem_limited}) 
                                                                                        </p>
                                                                                        : 
                                                                                        null
                                                                                    }                            

                                                                                    {   profile.Cz_awb_level_idx >= itemListUserLevel.id ?
                                                                                            itemListReward.flag_claim == 0 &&  itemListReward.user_claim>0  ?

                                                                                            <a   className="btn btn-outline-white popup-btn-cta redeem-disabled">
                                                                                                {defaultLang.lang.redeem_redeemed}
                                                                                            </a>
                                                                                            :

                                                                                                itemListReward.qty_available>0 ? 
                                                                                                profile.redeem_point< itemListReward.claim_point  ?
                                                                                                        <>
                                                                                                            <a   className="btn btn-outline-white popup-btn-cta redeem-enabled">
                                                                                                                {"- "+(itemListReward.claim_point - profile.redeem_point) + "poin"}
                                                                                                            </a>
                                                                                                            <span className="redeem-available-qty">
                                                                                                                { defaultLang.lang.redeem_stock_left_param_qty.replace('{qty}', itemListReward.qty_available) }
                                                                                                            </span>
                                                                                                        </>
                                                                                                        
                                                                                                    : 
                                                                                                        <>
                                                                                                            {/* <a onClick={ShowPopUp.bind(this, itemListReward.id)}   className="btn btn-outline-white popup-btn-cta redeem-enabled"> */}
                                                                                                            <a onClick={()=>setGlobal(state=>({...state,modalProp:{modalShow:true, id:itemListReward.id, type: 'profileRedeemPoints',points:itemListReward.claim_point, title:securityData.Security_lang()==="ENG"?itemListReward.title:itemListReward.title_ind}}))}   className="btn btn-outline-white popup-btn-cta redeem-enabled">
                                                                                                                {defaultLang.lang.redeem_button}
                                                                                                            </a>
                                                                                                            <span className="redeem-available-qty">
                                                                                                                { defaultLang.lang.redeem_stock_left_param_qty.replace('{qty}', itemListReward.qty_available) }
                                                                                                            </span>
                                                                                                        </>
                                                                                                :
                                                                                                <span  className="redeem-out-stock-qty" >   
                                                                                                    {defaultLang.lang.redeem_out_of_stock}
                                                                                                </span>
                                                                                        :

                                                                                        <a className="btn btn-outline-white popup-btn-cta redeem-disabled">
                                                                                            {defaultLang.lang.redeem_insufficient_level}
                                                                                        </a>
                                                                                            
                                                                                    }        

                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div> 
                                                                    : null
                                                                    );
                                                                    
                                                                }
                                                            )
                                                        }
                                                    </>
                                                );
                                            }
                                        )
                                }
                                    </div>
                            </div>
                            
                        </div>
                    </section>
                </div>
            </div>
        </div>

    </div>

</div>

            <Modal show={modalRedeem} 
                onHide={()=>setModalRedeem(false)}
                onExited={()=>setModalRedeem(false)}
                keyboard={false}
                >
                <br/>
                <br/>
                <Modal.Header>
                    <button type="button" className="close" style={{top: "17px !important", position:"absolute"}} data-dismiss="modal" aria-hidden="true" onClick={()=>setModalRedeem(false)}>
                        <img src={file_assets+"img/close-btn.png"}/>
                    </button>
                    <br/>
                    <img src={file_assets+"img/redeem-popup.png"}/>
                    
                </Modal.Header>
                <Modal.Body style={{marginTop: "25%"}}>
                    <div  className="tab-content">
                        <div  className="tab-pane active" data-tab-index="0" id="tab-0">
                            {  
                                listRewards.map( (itemModal) =>
                                
                                itemModal.id != idReward ? null :
                                                <div key={itemModal.id}>
                                                    { redeemStatus == false ?
                                                            <>
                                                                <h5  id="modalMessage"  className=" modal-titlepopup-description">
                                                                    Do you want to redeem 
                                                                    <br/>{itemModal.claim_point} points for { securityData.Security_lang() == "ENG"  ? itemModal.title : itemModal.title_ind }
                                                                </h5> 
                                                                
                                                                <input type="hidden" id="hdnProductId" name="hdnProductId"/>
                                                                <a style={{color: "white"}} id="btnRedeemConfirm" name="btnRedeemConfirm" onClick={redeemConfirm.bind(this, itemModal.id)}  className="btn popup-btn-message">
                                                                    {defaultLang.lang.general_confirm}
                                                                </a>
                                                            </>

                                                        :
                                                            <>
                                                                <h5  id="modalMessageSuccess"  className="modal-title claim-success">
                                                                    Thank you for redeeming your points. our friendly team will contact you
                                                                    <br/>for item delivery.
                                                                </h5> 
                                                            </>
                                                    }
                                                </div> 
                                )
                            }
                        </div>
                    </div>
                </Modal.Body>
            </Modal>



            <Modal show={modalCourse} 
                onHide={()=>setModalCourse(false)}
                onExited={()=>setModalCourse(false)}
                keyboard={false}
                >
                <br/>
                <br/>
                <Modal.Header>
                    <button type="button" className="close" style={{top: "17px !important", position:"absolute"}} data-dismiss="modal" aria-hidden="true" onClick={()=>setModalCourse(false)}>
                        <img src={file_assets+"img/close-btn.png"}/>
                    </button>
                    <br/>
                    <img src={file_assets+"img/redeem-popup.png"}/>
                    
                </Modal.Header>
                <Modal.Body style={{marginTop: "25%"}}>
                    <div  className="tab-content">
                        <div  className="tab-pane active" data-tab-index="0" id="tab-0">
                        <h5 className="modal-title" dangerouslySetInnerHTML={{__html: txtModalCourse}	}  ></h5> 
                            <a onClick={()=>setModalCourse(false)} data-dismiss="modal" className="btn popup-btn-message" style={{color:"white"}} >
                                { defaultLang.lang.submit_course_send_another_ideas } 
                            </a> 
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

        
    
    {/**end*/}
        </>
        )
}

export default profile;