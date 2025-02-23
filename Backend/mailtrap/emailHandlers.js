import { createWelcomeEmailTemplate ,createCommentNotificationEmailTemplate,createConnectionAcceptedEmailTemplate} from "./emailTemplates.js";
import { client,sender } from "./mailtrap.js";


export const sendWelcomeEmail=async (email,name,profileUrl)=>{
    const recipient=[{email}]
    try{
        const response=await client.send({
            from:sender,
            to:recipient,
            subject: "Welcome to UnLinked",
			html: createWelcomeEmailTemplate(name, profileUrl),
			category: "welcome",
        })
        console.log("Welcome Email sent successfully",response);
}catch(err)
{
    console.log("Error sending Welcome",err);
    throw new Error(`error sending Welcome email ${err}`)
}
}

export const sendCommentNotificationEmail=async (email,name,commenter,postUrl,commentContent)=>{
    const recipient=[{email}]
    try{
        const response=await client.send({
            from:sender,
            to:recipient,
            subject: "New Comment on Your Post",
            html: createCommentNotificationEmailTemplate(name, commenter, postUrl, commentContent),
            category: "comment",
        })
        console.log("Comment Notification Email sent successfully",response);
}catch(err)
{    
    console.log("Error sending Comment Notification",err);
    throw new Error(`error sending Comment Notification email ${err}`)
}
}

export const connectionAcceptedEmail=async (email,senderName,recipientName,profileUrl)=>{
    const recipient=[{email}]
    try{
        const response=await client.send({
            from:sender,
            to:recipient,
            subject: "Connection Request Accepted",
            html: createConnectionAcceptedEmailTemplate(senderName, recipientName, profileUrl),
            category: "connectionAccepted",
        })
        console.log("Connection Accepted Email sent successfully",response);
}catch(err)
{    
    console.log("Error sending Connection Accepted",err);
    throw new Error(`error sending Connection Accepted email ${err}`)
}
}