

// E-POSTA DOĞRULAMA TOKEN'I OLUŞTURMA

const crypto=require('crypto');

// Klullanıcı kaydı sırasında benzersiz bir doğrulama token'ı oluşturma

// Rastgele token oluşturma
// 32 byte token oluşturma
function generateVerificationToken(){
    return crypto.randomBytes(32).toString('hex');
}
// Token oluşturma ve kullanıcıya atama
async function createVerificationToken(user){
    // Random token oluşturma
    const verificationToken=generateVerificationToken();
    // Token'ı kullanıcıya atama

    // token ve geçerlilik süresini kullanıcıya atama
    user.emailVerificationToken=verificationToken;
    user.emailVerificationExpires=Date.now() + 24*60*60*1000; // 24 saat geçerli 

    return verificationToken;
}



module.exports={generateVerificationToken,createVerificationToken};

