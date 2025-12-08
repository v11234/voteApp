import { Resend } from 'resend';
import { resendClient, sender } from '../lib/resend.js';
import { createWelcomeEmailTemplate } from './emailTemplate.js';

export const sendWelcomeEmail=async(email,name,clientURL)=>{
const {data,error}=await resendClient.emails.send({
from:`${sender.name} <${sender.email}>`,
  to: email,
  subject: 'Welcome to voting system',
  html:createWelcomeEmailTemplate(name,clientURL)
})
if(error){
  console.error("Error sending welcome email :",error)
  throw new Error("Failed to send welcome email");
}
console.log("welcome email sent successfully",data)
};





// import { Resend } from 'resend';

// const resend = new Resend('re_27j2mPjd_HWRh5tMbdq3oJ9f7ScBD9yR5');

// resend.emails.send({
//   from: 'onboarding@resend.dev',
//   to: 'nicolineeyong1@gmail.com',
//   subject: 'Hello World',
//   html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
// });