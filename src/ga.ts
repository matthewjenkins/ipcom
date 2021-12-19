import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyByMzFFrvYXEwSr1rTybBmK2zbqxMYXuG8",
  authDomain: "ipcom-8a758.firebaseapp.com",
  projectId: "ipcom-8a758",
  storageBucket: "ipcom-8a758.appspot.com",
  messagingSenderId: "225786964540",
  appId: "1:225786964540:web:36fbb365bd03bd4f737139",
  measurementId: "G-E0JC0N56FJ",
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
