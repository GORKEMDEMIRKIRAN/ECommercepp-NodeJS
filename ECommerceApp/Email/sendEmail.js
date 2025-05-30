





// sendgrid/email için fonksiyon oluşturacağız.

const dotenv=require('dotenv');
dotenv.config();


const sgMail=require('@sendgrid/mail');
sgMail.setApiKey(process.env.MAIL_API_KEY);

//==============================================================
async function CreateLoginMessage(email,subject,htmlText){
    const message={
        to:email,
        from:process.env.EMAIL_USER,
        subject:subject,
        html:htmlText
    };
    
    try {
        const response = await sgMail.send(message);
        console.log('Email sent successfully:', response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error('Error details:', error.response.body);
        }
        return false;
    }
}
//==============================================================

module.exports={CreateLoginMessage};







//==============================================================
const nodemailer=require('nodemailer');

// Transporter oluşturma
// e-posta göndermek için bir transporter oluşturuyoruz.
// Bu örnekte Gmail SMTP sunucusunu kullanıyoruz.
const transporter=nodemailer.createTransport({
    service:'gmail',  // hazır servis kullanımı(gmail,outlook,yahoo vb.)
    auth:{
        user:process.env.EMAIL_USER, // Gönderici e posta adresi
        pass:process.env.EMAIL_APP_PASSWORD  // E-posta işresi veya uygulama şifresi
    }
});

// e-posta gönderme fonksiyonu
// async function sendEmail(email,subject,text,html){
//     try{
//         // e-posta seçeneklerini tanımlıyoruz
//         const mailOptions={
//             from:`E-COMMERCE WEB SITE <${process.env.EMAIL_APP_PASSWORD}>`, // gönderici adı ve e-posta adresi
//             to:email, // alıcı e-posta adresi
//             subject:subject,  // e-posta konusu
//             text:text, // düz metin içeriği
//             html:html  // html içeriği
//         };

//         // e-postayı gönderme
//         const info=await transporter.sendMail(mailOptions);
//         console.log('E-posta başarıyla gönderildi!');
//         console.log('Mesaj ID: ',info.messageId);
//         return info;
//     }catch(error){
//         console.error('E-posta gödnerilirken hata oluştu: ',error);
//         throw error;
//     }
// }

//==============================================================
// RASSWORD RESET FUNCTION
async function ResetPasswordSendEmail(email,verificationUrl,userName){
    const subject="Parola Sıfırlama";
    const text=`Hesabınızı doğrulamak için lütfen bağlatıya tıklayın: ${verificationUrl}`;
    const html=
        `
        <h1>Hoş Geldiniz!</h1>
        <p>Merhaba ${userName},</p>
        <p>Parola Resetleme için lütfen buraya tıklayın:</p>
        <p>
            <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
            Parola Sıfırlama
            </a>
        </p>
        <p>Eğer bu sıfırlama işlemini siz yapamadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        `
    try{

        const mailOptions={
            from:`E-COMMERCE WEB SITE <${process.env.EMAIL_USER}>`, // gönderici adı ve e-posta adresi
            to:email, // alıcı e-posta adresi
            subject:subject,  // e-posta konusu
            text:text, // düz metin içeriği
            html:html  // html içeriği 
        };
        // e posta gönderme
        const info=await transporter.sendMail(mailOptions);
        console.log('E-posta başarıyla gönderildi!');
        console.log('Mesaj ID: ',info.messageId);
        return info;

    }catch(error){
        console.error('E-posta gönderilirken hata oluştu: ',error);
        throw error;  
    }

}
//==============================================================
// MAIL VERIFICATION FUNCTION
async function VerificationSendEmail(email,verificationUrl,userName){
    //_____________________________________________________________
    const subject="E-posta Adresinizi Doğrulama";
    const text=`Hesabınızı doğrulamak için lütfen bağlatıya tıklayın: ${verificationUrl}`;
    const html=
        `
        <h1>Hoş Geldiniz!</h1>
        <p>Merhaba ${userName},</p>
        <p>Hesabınızı doğrulamak için lütfen aşağıdaki butona tıklayın:</p>
        <p>
            <a href="${verificationUrl}" style="padding: 10px 20px; background-color:blue; color: white; text-decoration: none; border-radius: 5px;">
                E-posta Adresimi Doğrula
            </a>
        </p>
        <p>Bu bağlantı 24 saat boyunca geçerlidir.</p>
        <p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        `
    //_____________________________________________________________
    try{
        const mailOptions={
            from:`E-COMMERCE WEB SITE <${process.env.EMAIL_USER}>`, // gönderici adı ve e-posta adresi
            to:email, // alıcı e-posta adresi
            subject:subject,  // e-posta konusu
            text:text, // düz metin içeriği
            html:html  // html içeriği 
        };

        // e posta gönderme
        const info=await transporter.sendMail(mailOptions);
        console.log('E-posta başarıyla gönderildi!');
        console.log('Mesaj ID: ',info.messageId);
        return info;

    }catch(error){
        console.error('E-posta gödnerilirken hata oluştu: ',error);
        throw error;  
    }
}

//==============================================================
module.exports={ResetPasswordSendEmail,VerificationSendEmail};

