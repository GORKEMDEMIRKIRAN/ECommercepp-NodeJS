


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
            await seedCategories();
            await seedProducts();
            await seedUsers();
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