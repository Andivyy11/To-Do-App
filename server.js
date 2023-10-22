const express=require("express")
const ejs=require("ejs")
const bodyParser=require("body-parser")
const mongoose=require("mongoose")

const app=express();
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended : true }))


mongoose.connect("mongodb://localhost:27017/toDoListDB" , { useNewUrlParser:true })
const itemSchema = mongoose.Schema({
    name:String
})

const categorySchema=mongoose.Schema({
    name:String,
    content:[itemSchema]
})

const item=mongoose.model("item" , itemSchema);
const category=mongoose.model("category" , categorySchema)

const item1=new item({
    name:"Welcome to ToDo List"
})
const item2=new item({
    name:"Click on + icon to Add a new item"
})
const item3=new item({
    name:"<--- Click on this button to remove an item"
})

const defaultList=[item1 , item2 , item3]
const mon=["January" , "February" , "March","April","May","June","July","August","September","October","November","December"];
const d=new Date();
const date=d.getDate();
const m=mon[d.getMonth()];
console.log(m);
const y=d.getFullYear();
const tt=date+" "+m+" "+y;

app.get('/' ,(req,res)=>{

        item.find({}).then(function(foundItems){
            if(foundItems.length==0)
            {
                item.insertMany(defaultList)  
            }
            res.render("home.ejs" , {title:"Today" , list:foundItems });
        }).catch(function(err){
            console.log(err)
        })
    })

app.get('/:customlist' , (req,res)=>{
    const customlist=(req.params.customlist);
    category.findOne({name:customlist}).then(function(foundItems){
        if(!foundItems)
        { 
            const ctg=new category({
                name:customlist,
                content:defaultList
            })
            ctg.save();
            res.render("home.ejs", {
                title:customlist,
                list:defaultList
            })
        }
        else 
        {
            res.render("home.ejs" , {
            title:foundItems.name,
            list:foundItems.content
            })
        }
    })
})

app.post('/' , (req,res)=>{
    const x=req.body.newTask;
    const itm=new item({
        name: x 
    });
    const listName=req.body.listName;
    console.log("listName"+listName)
    if(listName=="Today")
    {
        itm.save();
        res.redirect('/');
    }
    else 
    {
        category.findOne({name:listName}).then(function(foundItems){
            console.log("found  "+foundItems)
            console.log(typeof(foundItems.content))
                foundItems.content.push(itm)
                foundItems.save();
        })
        res.redirect("/"+listName)
    }
})

app.post('/delete' ,(req,res)=>{
    const x= req.body.checked;
    const listtype=req.body.listtype
    console.log("tist is "+listtype)
    if(listtype==="Today")
    {
        console.log("inside today")
        item.deleteOne({  _id :x }).then(function(err){
            if(err)
              console.log("try more")
            else 
              console.log("success")
        })
        res.redirect('/')
    }
    else{
        category.updateOne({ name: listtype} , { $pull :{ content :{ _id :x}}}).then(function(err){
            if(err)
             console.log("try more")
            else
             console.log("successfully deleted")
        } )
        res.redirect('/'+listtype)
    }
})

app.listen(3000, ()=>{
    console.log("server is running")
})