import React,{useState,useRef,useEffect} from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import './App.css';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCK,
  messagingSenderId: process.env.REACT_APP_SEND_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEAUSUREMENT_ID
})

const auth = firebase.auth();
const firestore =  firebase.firestore();



function App() {
  const[user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut/>
      </header>
      <section>
        {user?<ChatRoom/>:<SignIn/>}
      </section>
    </div>
  );
}
function ChatRoom (){

  const dummy = useRef()
  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query,{idField:'id'});
  const[formValue,setFormValue] = useState('');
  
  const sendMessage = async(e)=>{
    e.preventDefault();
    const{uid,photoURL} = auth.currentUser;
    await messageRef.add({
      text:formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue(' ')

    dummy.current.scrollIntoView({behavior: 'smooth'});
  }
  
  return(
    <>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
      <span ref={dummy}></span>
    </main>
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e)=> setFormValue(e.target.value)}>
      </input>
      <button type="submit"  disabled={!formValue}>
        🕊️
      </button>
    </form>
    </>
  )
}

function SignIn(){
  const signInWithGoogle = ()=>{
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
  }
  return(
    <button className="sign-in" onClick={signInWithGoogle}>
      Sign In with Google
    </button>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button className="sign-out" onClick={()=> auth.signOut()}>Sign Out</button>
  )
}

function ChatMessage(props){
  const{text,uid,photoURL}=props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return(
    <div className={`message ${messageClass}`}> 
      <img src={photoURL}/>
      <p>{text}</p>
    </div>
    
  )
}

export default App;
