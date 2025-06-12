


// DATABASE CONNECTION

//===========================================================
const mongoose=require('mongoose');
const dotenv=require('dotenv');

const {seedCategories,seedProducts}=require('../Data/Seeders/seedData');
const {seedUsers}=require('../Data/Seeders/seedUser');

// Load environment variables
dotenv.config();


const connectDB=async()=>{
    try{
        //----------------------------
        // MongoDB bağlantı seçenekleri
        const options={
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true
        };
        //----------------------------
        // Bağlantı Url'si
        const uri=process.env.MONGODB_URI;
        //----------------------------
        // Bağlantı kur
        await mongoose.connect(uri)
            .then(async()=>{
            // seed metotları
            // bu kısımda seed kategoriye ekledikten sonra veri tabanında oluşan
            // kategori id'lerini kullanarak ürünleri ekleyeceğiz
            // Bu sayede ürünler kategorilere göre ayrılmış olacak


            // ilk önce kategorileri ve users ekleyelim
            // daha sonra user ve categori id'yi ürümlere ekleyelim.
            await seedCategories();
            await seedUsers();
            await seedProducts();
            console.log('Connected to mongodb'); 
            })
            .catch(err=>{
                console.log('Database connection error',err);
            });
        //----------------------------
    }catch(error){
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
}


module.exports=connectDB;
//===========================================================