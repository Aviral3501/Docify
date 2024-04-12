import  { useCallback, useEffect, useState } from 'react'
import "quill/dist/quill.snow.css";
import Quill from "quill";
import {io} from "socket.io-client";
import { useParams } from 'react-router-dom';


const SAVE_INTERVAL_TIME=2000;
const TOOLBAR_OPTIONS = [
  [{header:[1,2,3,4,5,6,false]}],
  [{font:[]}],
  [{list:"ordered"},{list:"bullet"}],
  ["bold","italic","underline"],
  [{color:[]},{background:[]}],
  [{ script: "sub"} , {script:"super"}],
  [{align:[]}],
  ["image","blockquote","code-block"],
  ["clean"],
]


export default function TextEditor() {  
  const {id:documentId}=useParams();
  const [socket,setSocket]=useState();
  const [quill, setQuill]=useState();

  console.log(documentId);
  //only render the instance of quill once when the compoents mounts
useEffect(()=>{
  //connecting with socket
const s =io("http://localhost:3001");
setSocket(s);

  //disconnecting with socket
  return ()=>{
    s.disconnect();
  }
},[])

//putting the users in the same room 
useEffect(()=>{
  if(socket ==null || quill==null)return;

  socket.once("load-document",document =>{
    quill.setContents(document);
    quill.enable();
  });
  socket.emit('get-document', documentId);
},[socket,quill,documentId])

//to save the data
useEffect(()=>{
  if(socket ==null || quill==null)return;
  const interval = setInterval(()=>{
    socket.emit("save-document",quill.getContents())
  },SAVE_INTERVAL_TIME);

  return ()=>{
    clearInterval(interval);
  }

},[socket,quill])

  //detecting changes in quill
  useEffect(()=>{
    if(socket==null || quill==null)return;
    const handler = (delta, oldDelta, source) => {
      if (source !== 'user') return;
      socket.emit("send-changes", delta);
    }
    quill.on("text-change",handler);

    return () => {
      quill.off("text-change",handler)
    }
  }, [socket,quill]) 

//receive chnages
  useEffect(()=>{
    if(socket==null || quill==null)return;

    const handler = (delta) => {
    quill.updateContents(delta);
    }


    socket.on("receive-changes",handler);

    return () => {
      socket.off("receive-changes",handler)
    }
  }, [socket,quill]) 

 const wrapperRef=  useCallback((wrapper)=>{
  if(wrapper ==null)return;

    wrapper.innerHTML = "";
    const editor = document.createElement( 'div');
    wrapper.append(editor);
   const q= new Quill(editor, { theme: "snow", modules:{toolbar:TOOLBAR_OPTIONS}});
    q.disable();
    q.setText('Loading...');
   setQuill(q);
  },[])
  //wrap it inside the container else a toolbar keeps munting again and again
  return (
    <div className="container" ref={wrapperRef}>

    </div> 
  )
}



// ---------------------------------------------------------------------------->


//----------------------------------------------------------------------------->


// import { useCallback } from 'react';
// import "quill/dist/quill.snow.css"; // Import Quill styles
// import Quill from "quill";

// // Functional component for rendering a text editor using the Quill library
// export default function TextEditor() {
//   // useCallback to ensure that the function instance remains the same across renders
//   const wrapperRef = useCallback((wrapper) => {
//     // Clear the content of the wrapper element
//     wrapper.innerHTML = "";

//     // Check if the wrapper is null, if yes, return early
//     if (wrapper == null) return;

//     // Create a new div element to act as the editor
//     const editor = document.createElement('div');

//     // Append the editor to the wrapper
//     wrapper.append(editor);

//     // Initialize a new Quill instance with the created editor and set the theme to "snow"
//     new Quill(editor, { theme: "snow" });
//   }, []);

//   // Render the component with a div container and attach the ref to the wrapper
//   return (
//     <div id="container" ref={wrapperRef}>
//       {/* The Quill editor will be mounted inside this div */}
//     </div>
//   );
// }