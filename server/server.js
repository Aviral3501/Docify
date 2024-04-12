const mongoose = require("mongoose");
const Document = require("./Document");

 mongoose.connect("mongodb+srv://Demo01:Xjtm4Ef6VQ0bacZV@cluster0.9bqikjb.mongodb.net/docify");



const io = require('socket.io')(3001 , {
    cors:{
        origin:"https://docify-q26v.vercel.app/",
        methods:["GET","POST"],
    }
});

const defaultValue ="";

io.on("connection", (socket) => {
    socket.on("get-document", async documentId => {
        const document = await fincdOrCreateDocument(documentId);//find the docId in db and  create if not exist 
        socket.join(documentId);
        socket.emit('load-document', document.data);
        socket.on('send-changes', (delta) => {
            // console.log(delta);
            socket.broadcast.to(documentId).emit("receive-changes", delta);//send the chaanges to everone except curr user
        });
        socket.on("save-document" , async data =>{
            await Document.findByIdAndUpdate(documentId,{data});
        });
    });
    console.log("connection made");
})   


async function fincdOrCreateDocument(id){
    if(id==null)return;

    const document = await Document.findById(id);
    if(document){
        return document;
    }else{
        return await Document.create({_id:id,data:defaultValue});
    }
}
