export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 

    <title>Welcome to the Voting System</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
               line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; 
               padding: 20px; background-color: #f5f5f5;">
    
    <div style="background: linear-gradient(to right, #4CAF50, #2E7D32); 
                padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="https://cdn-icons-png.flaticon.com/512/1087/1087815.png" 
           alt="Voting Logo" 
           style="width: 80px; height: 80px; margin-bottom: 20px; 
           border-radius: 50%; background-color: white; padding: 10px;">
      
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">
        Welcome to the Voting System!
      </h1>
    </div>

    <div style="background-color: #ffffff; padding: 35px; 
                border-radius: 0 0 12px 12px; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);">

      <p style="font-size: 18px; color: #2E7D32;"><strong>Hello ${name},</strong></p>

      <p>
        Thank you for registering in our secure electronic voting system.  
        Your account has been successfully created, and you are now ready to participate
        in upcoming elections.
      </p>

      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; 
                  margin: 25px 0; border-left: 4px solid #4CAF50;">
        <p style="font-size: 16px; margin: 0 0 15px 0;"><strong>Here's what you can do next:</strong></p>
        <ul style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 10px;">Verify your personal information</li>
          <li style="margin-bottom: 10px;">View upcoming elections and candidates</li>
          <li style="margin-bottom: 10px;">Check your voting status</li>
          <li style="margin-bottom: 0;">Cast your vote when the election opens</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href=${clientURL} 
           style="background: linear-gradient(to right, #4CAF50, #2E7D32); 
                  color: white; text-decoration: none; padding: 12px 30px; 
                  border-radius: 50px; font-weight: 500; display: inline-block;">
          Access Voting Portal
        </a>
      </div>

      <p>If you have any questions or need support, feel free to reach out to us.</p>

      <p style="margin-top: 25px; margin-bottom: 0;">
        Best regards,<br>
        The Voting System Team
      </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 Voting System. All rights reserved.</p>
      <p>
        <a href="#" style="color: #2E7D32; text-decoration: none; margin: 0 10px;">
          Privacy Policy
        </a>
        <a href="#" style="color: #2E7D32; text-decoration: none; margin: 0 10px;">
          Terms of Service
        </a>
        <a href="#" style="color: #2E7D32; text-decoration: none; margin: 0 10px;">
          Contact Us
        </a>
      </p>
    </div>
  </body>
  </html>
  `;
}