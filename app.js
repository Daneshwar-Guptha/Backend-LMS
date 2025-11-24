const express = require('express');
const app = express();
const DBConnection = require('./config/DBConnection');
const User = require('./model/User');
const Course = require('./model/Course');
const Enrollment = require('./model/Enrollement');
const authRoutes = require('./Routes/authRoutes');
const cookieParser = require('cookie-parser');
const userRoutes = require('./Routes/UserRoutes');
const InstructorRoutes = require('./Routes/InstructorRoutes');
const cors = require('cors')


app.use(express.json());
app.use(cookieParser());
app.use(cors({
     origin:true,
    credentials: true  
}));

app.use('/auth',authRoutes);
app.use('/user',userRoutes);
app.use('/instructor',InstructorRoutes)


DBConnection()
.then(()=>{
    app.listen(2000,()=>{
    console.log("server was started")
})

})
.catch(error=>{
    console.log(error)
})
