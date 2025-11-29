import mongoose from 'mongoose';

const jobSchema= new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
        },
        company:{
            type:String,
            required:true,
        },
        location:{
            type:String,
            required:true,
        },
        link:{
            type: String,
            unique: true
        },
        datePosted: String,
        source: { type: String, default: 'LinkedIn' },
        scrapedAt: { type: Date, default: Date.now }
    },
    {
        timestamps:true
    }
)


export const Job=mongoose.model('Job',jobSchema);