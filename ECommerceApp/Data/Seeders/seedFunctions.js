


// Bu kısımda Datas altındaki ürünleri txt alarak kendi kullanıcımız olarak yayınlayağız.


const fs=require('fs').promises;
const Product=require('../../Models/Product');
const path=require('path');


const categoryRepository=require('../../Data/Repositories/categoryRepository');

//====================================================
// txt dosyasını okuma
async function ReadFile(fileTxt){
    try{
        // her bir veriyi okuyup satır satır alıyoruz.
        const data=await fs.readFile(fileTxt,'utf8');
        return data.split('\n').filter(line=>line.trim());
    }
    catch(error){
        console.error('Dosya okuma hatasi: ',error);
    }
}
//====================================================
// verilen string fortatını json formatına çevirme

// Veri satırını işleyen fonksiyon
async function ConvertDataToProduct(dataString,idNumber,leadUserId){
    // '|' karakterlerine göre veriyi bölelim.
    const parts=dataString.split('|').map(part=>part.trim());
    // price düzenleme
    // 31.498,95 TL , 27.499 TL 2 farklı string fiyat bilgisi var
    // bunları : 31498.95 ve 27499 çevirip eklemem lazım 
    // ilk önce noktaları kaldırma
    // daha sonra virgül nokta yapma
    const prc=parts[3].split('TL')[0].trim();
    const prc1=prc.replace('.','');
    const prc2=prc1.replace(',','.');

    //---------------------------------------------------------
    // şimdi ilk önce database içine kategoriler ekleniyor.
    // Bu kısımda database kategorilerin id'lerini alıp
    // ürünlerin kategoriler kısmına ekleyeceğiz.
    const dbCategories=await categoryRepository.findAll();
    for(let i=0;i<dbCategories.length;i++){
        // eğer kategori adı satırdaki kategori ile eşleşiyorsa

        if(parts[6].trim().toLowerCase().replace(/\s/g, '')===dbCategories[i].name.trim().toLowerCase().replace(/\s/g, '')){
            // kategori id'sini alalım
            parts[6]=dbCategories[i]._id.toString();
        }
        else if(parts[7].trim().toLowerCase().replace(/\s/g, '')===dbCategories[i].name.trim().toLowerCase().replace(/\s/g, '')){
            // kategori id'sini alalım
            parts[7]=dbCategories[i]._id.toString();
        }
    }
    //---------------------------------------------------------
    // şimdi tanımladığım (lead_developer) repository bulup burada seed yaptığım

    // parçaları ayarlama
    const id=idNumber;
    const name=parts[1];
    const brand=parts[2];
    const price=prc2;
    const description=parts[4];
    const imageUrl=parts[5];
    const categories=[parts[6],parts[7]];
    const isActive=true;
    // tags verisi boş ise boş dizi olarak ayarlama
    // eğer boş değilse virgülle ayrılmış etiketleri diziye çevirme
    const tags=parts[8] ? parts[8].split(',').map(tag=>tag.trim()) : ['cihaz'];
    //const userId = leadUserId && (leadUserId.id || leadUserId._id) ? (leadUserId.id || leadUserId._id): null;
    const userId= leadUserId ? leadUserId : null;
    //---------------------------------------------------------
    // product nesnesini oluşturalım
    const product=new Product(id,name,
                                brand,price,
                                description,imageUrl,
                                categories,isActive,
                                tags,userId);
    //---------------------------------------------------------
    return product.toJSON();
    //---------------------------------------------------------
}
//====================================================
// verilen dosya yol dizilerini alıp tek txt yapan metot
async function mergeTextFiles(inputFiles,outputFile){
    try{
        // tüm dosyaları okuma
        const fileContents=await Promise.all(
            inputFiles.map(file=>fs.readFile(file,'utf8'))
        );
        // içerikleri birleştirme
        const mergedContent=fileContents.join('\n');
        // Birleştirilmiş içeriği yeni dosyaya yazma
        await fs.writeFile(outputFile,mergedContent);
        console.log(`Dosyalar başarıyla birleştirildi: ${outputFile}`);
    }
    catch(error){
        console.error('Dosya birleştirilme hatası: ',error);
    }
}

//====================================================
async function UpgradeTextData(textData){
    const datasDir=path.join(__dirname,'Datas');
    for(row of textData){
        // new files name
        const newFilePath1=path.join(datasDir,'computer_modified.txt');
        const newFilePath2=path.join(datasDir,'fridge_modified.txt');
        const newFilePath3=path.join(datasDir,'phone_modified.txt');
        const newFilePath4=path.join(datasDir,'soundsystem_modified.txt');
        const newFilePath5=path.join(datasDir,'tablet_modified.txt');     
        
        const path1='|bilgisayar|elektronik';
        const path2='|buzdolabı|elektronik';
        const path3='|telefon|elektronik';
        const path4='|ses sistemi|elektronik';
        const path5='|tablet|elektronik';
        // dosya yolundan dosya ismini alma
        const len=row.split('\\').length;
        filename=row.split('\\')[len-1];
        //=========================================================
        const data=await fs.readFile(row,'utf8');
        //console.log(data.split('\n'));
        // satırları ayırma
        const lines=data.split('\n');
        //=========================================================
        if(`${filename.trim()}`=='computer.txt'){

            //---------------------------------------
            const modifiedLines=lines.map(line=>{
                // satır sonundaki '\r' temizleme
                if (line.length>0){
                    const cleanLine=line.replace(/\r$/,'');
                    // satır sonuna text ekleme
                    return cleanLine+path1;
                }
            });
            // Değiştirilmiş içeriği birleştir
            const modifiedContent=modifiedLines.join('\n');
            // Yeni dosya oluştur
            await fs.writeFile(newFilePath1,modifiedContent,'utf8');
            console.log(`Yeni dosya oluşturuldu: ${newFilePath1}`);     
            //---------------------------------------
        }
        //=========================================================
        else if(`${filename.trim()}`=='fridge.txt'){

            //---------------------------------------
            const modifiedLines=lines.map(line=>{
                // satır sonundaki '\r' temizleme
                if (line.length>0){
                    const cleanLine=line.replace(/\r$/,'');
                    // satır sonuna text ekleme
                    return cleanLine+path2;
                }
            });

            // Değiştirilmiş içeriği birleştir
            const modifiedContent=modifiedLines.join('\n');
            // Yeni dosya oluştur
            await fs.writeFile(newFilePath2,modifiedContent,'utf8');
            console.log(`Yeni dosya oluşturuldu: ${newFilePath2}`);
            //---------------------------------------

        }
        //=========================================================
        else if(`${filename.trim()}`=='phone.txt'){

            //---------------------------------------
            const modifiedLines=lines.map(line=>{
                // satır sonundaki '\r' temizleme
                if (line.length>0){
                    const cleanLine=line.replace(/\r$/,'');
                    // satır sonuna text ekleme
                    return cleanLine+path3;
                }
            });

            // Değiştirilmiş içeriği birleştir
            const modifiedContent=modifiedLines.join('\n');
            // Yeni dosya oluştur
            await fs.writeFile(newFilePath3,modifiedContent,'utf8');
            console.log(`Yeni dosya oluşturuldu: ${newFilePath3}`);
            //---------------------------------------   

        }
        //=========================================================
        else if(`${filename.trim()}`=='soundsystem.txt'){

            //---------------------------------------
            const modifiedLines=lines.map(line=>{
                // satır sonundaki '\r' temizleme
                if (line.length>0){
                    const cleanLine=line.replace(/\r$/,'');
                    // satır sonuna text ekleme
                    return cleanLine+path4;
                }
            });


            // Değiştirilmiş içeriği birleştir
            const modifiedContent=modifiedLines.join('\n');
            // Yeni dosya oluştur
            await fs.writeFile(newFilePath4,modifiedContent,'utf8');
            console.log(`Yeni dosya oluşturuldu: ${newFilePath4}`);
            //---------------------------------------  

        }
        //=========================================================
        else if(`${filename.trim()}`=='tablet.txt'){

            //---------------------------------------

            const modifiedLines=lines.map(line=>{
                // satır sonundaki '\r' temizleme
                if (line.length>0){
                    const cleanLine=line.replace(/\r$/,'');
                    // satır sonuna text ekleme
                    return cleanLine+path5;
                }
            });

            // Değiştirilmiş içeriği birleştir
            const modifiedContent=modifiedLines.join('\n');
            // Yeni dosya oluştur
            await fs.writeFile(newFilePath5,modifiedContent,'utf8');
            console.log(`Yeni dosya oluşturuldu: ${newFilePath5}`);
            //---------------------------------------            
        }
        //=========================================================
    }
}
//====================================================


module.exports={
    ReadFile,
    ConvertDataToProduct,
    mergeTextFiles,
    UpgradeTextData
};

