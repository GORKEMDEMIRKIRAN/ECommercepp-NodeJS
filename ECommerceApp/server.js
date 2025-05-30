
// HTTP SUNUCUSU

//===========================================
const app=require('./app');
const connectDB=require('./db/connection');
//===========================================
const dotenv=require('dotenv');
const http=require('http');
//===========================================
// Load environment variables
dotenv.config();
//===========================================
// Create HTTP server
const server=http.createServer(app);
//===========================================
// SET PORT
const port=process.env.PORT || 4000;
//===========================================
// Start Server
const startServer=async()=>{
    try{
        //Connect to database
        await connectDB();
        // Start listening
        server.listen(port,()=>{
            console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
        });
    }
    catch(error){
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};
//===========================================
// Start the server
startServer();
//===========================================


