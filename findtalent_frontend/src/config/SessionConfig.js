// hljs
// src/config/SessionConfig.js
export default {
    uuid: "ENTER UUID HERE", // replace with your own uuid, for example using https://www.uuidgenerator.net
    timeoutInMinutes: import.meta.env.VITE_EXP_SESSION,
    cacheLocation: 'localStorage',
    debugMode: true // boolean to show or hide console log statements, useful while developing
  }