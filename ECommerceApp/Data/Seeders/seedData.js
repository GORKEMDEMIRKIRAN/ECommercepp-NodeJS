





// seeddatabase içinde uygulamanın doğru çalışıp çalışmadığını kontrol etmek için ekliyoruz.
// categorylist eklerken database oluşan ObjectId alıp ürünlerin categoryId kısmına verdik.



//--------------------------------------------------------
const {ReadFile,ConvertDataToProduct,mergeTextFiles,UpgradeTextData}=require('./seedFunctions');
const path=require('path');
//--------------------------------------------------------
// Birleştirilecek dosya yolu ve dosya ismi
const outputPath=path.join(__dirname,'/Datas','merged.txt');
//--------------------------------------------------------
// Kaynak dosya yolları
const files = [
    path.join(__dirname, 'Datas', 'computer.txt'),
    path.join(__dirname, 'Datas', 'fridge.txt'),
    path.join(__dirname, 'Datas', 'phone.txt'),
    path.join(__dirname, 'Datas', 'soundsystem.txt'),
    path.join(__dirname, 'Datas', 'tablet.txt'),
];

// Güncellenmiş dosya yolları - hepsi datas klasöründe
const updateFiles = [
    path.join(__dirname, 'Datas', 'computer_modified.txt'),
    path.join(__dirname, 'Datas', 'fridge_modified.txt'),
    path.join(__dirname, 'Datas', 'phone_modified.txt'),
    path.join(__dirname, 'Datas', 'soundsystem_modified.txt'),
    path.join(__dirname, 'Datas', 'tablet_modified.txt'),
];




async function DataSeed(){
    // 1- dosya birleştirme
    // 2- dosyayı okuma
    // 3- dosyadaki verileri product json formatına çevirme
    //----------------------------
    // ilk önce verileri güncelleme
    await UpgradeTextData(files);
    // toplu dosya yolu dizisi, birleşecek dosya yolu
    await mergeTextFiles(updateFiles,outputPath);
    // dosya yolu ile dosyayı okuyup alma
    const data=await ReadFile(outputPath);
    //console.log('Okunan ilk ürün: ',data[0]);
    //console.log('Okunan veri satır sayısı: ',data.length);
    const convertedData=[];
    let count=1;
    for(const row of data){
        const convertedRow=await ConvertDataToProduct(row,count);
        convertedData.push(convertedRow);
        count++;
    }
    // await asyncForEach(data,async(row)=>{
    //     await ConvertDataToProduct(row,count);
    //     count++;
    // });
    console.log(convertedData[0]);
    //console.log(convertedData[232]);
    //console.log('Dönüştürülmüş ürün sayısı: ',convertedData.length);
    return convertedData;
}


const categoryList=[
    {name:'Telefon',description:'telefon kategorisi'},
    {name:'Bilgisayar',description:'bilgisayar kategorisi'},
    {name:'Beyaz Eşya',description:'Beyaz Eşya Kategorisi'},
    {name:'Buzdolabı',description:'Buzdolabı  Kategorisi'},
    {name:'Ses Sistemi',description:'Ses sistemi Kategorisi'},
    {name:'tablet',description:'tablet Kategorisi'},
    {name:'Elektronik',description:'Elektronik Kategorisi'}
    
];

const categoryService=require('../../services/categoryService');
const productService=require('../../services/productService');
//========================================================
// VERİ TABANINA TOPLU ÜRÜN EKLEME
async function seedProducts(){
    try{
        const count=await productService.getCountProducts();
        if(count === 0){
            const convertedData=await DataSeed();
            await productService.getInsertManyProducts(convertedData);
            console.log('Ürün tablosu boştu,hazır veri eklendi');
        }else{
            console.log('Ürün tablosunda zaten veri var,seed işlemi atlandı');
        }
    }catch(err){
        console.log('Hazır Product verisi eklenirken sorun oluştur:',err);
    }
}
//========================================================
// VERİ TABANINA TOPLU KATEGORİ EKLEME
async function seedCategories() {
    try {
        const count = await categoryService.getCountCategories();
        if (count === 0) {
            await categoryService.getInsertManyCategories(categoryList);
            console.log('Kategori tablosu boştu, hazır veriler eklendi.');
        } else {
            console.log('Kategori tablosunda zaten veri var, seed işlemi atlandı.');
        }
    } catch (err) {
        console.error('Hazır veri eklenirken hata oluştu:', err);
    }
}
//========================================================
module.exports = {seedCategories,seedProducts};
