// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_FIREBASE_APIKEY,
    authDomain: process.env.NEXT_FIREBASE_AUTHDOMAIN,
    projectId: process.env.NEXT_FIREBASE_PROJECTID,
    storageBucket: process.env.NEXT_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_FIREBASE_SENDERID,
    appId: process.env.NEXT_FIREBASE_APPID,
}

// Initialize Firebase
const firebase = getApps().length ? getApp() : initializeApp(firebaseConfig)
const firebaseAuth = getAuth(firebase)

export { firebase, firebaseAuth }