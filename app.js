const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const _ = require("lodash")

const app = express()



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-abd:yAStDrwXhYoL2AaYAbd97@cluster0.xbvs8vx.mongodb.net/todolistDB", { useNewUrlParser: true })


const itemsSchema = {
    name : {
        type : String,
    },

}


const Item = mongoose.model("Item", itemsSchema)


const item1 = new Item({
    name : "Welcome"
})
const item2 = new Item({
    name : "you can add your tasks"
})


const defaultItems = [item1, item2]


const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get('/', function (_req, res) {

    Item.find({}, function (_err, foundItems) {
       
        if (foundItems.length === 0) {
           Item.insertMany(defaultItems, function (err) {
                if (err) {
                console.log(err);
                } else {
                console.log("Successfully saved")
                }
           }) 
            res.redirect("/")
        } else {
            res.render("list" , {kindofDay: "Today" , newListItems:foundItems})
        }

        
    })
/* let today = new Date()

    let options = {
        weekday : "long",
        day : "numeric",
        month: "long"
    }
    let day = today.toLocaleDateString("en-US" , options)  */
    
})

app.get("/:customListName", function (req, res) {
    const customListName =_.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save()
                res.redirect("/" + customListName)
            } else {
                //Show an existing list
                res.render("list" , {kindofDay: customListName , newListItems: foundList.items})
            }
        }
    })
})

app.post("/", function (req, res) {
    
    
    const itemName = req.body.mytasks
    const listName = req.body.list;

    if (itemName.length === 0) {
        return 1
    } else {
        const item = new Item({
            name: itemName
        })
        if (listName === "Today") {
            item.save();
            res.redirect("/")
    } else {
            List.findOne({ name: listName }, function (_err, foundList) {
                foundList.items.push(item);
                foundList.save()
                res.redirect("/" + listName)
            })
        }
    }

/*     if(item.length === 0){
        return 1
    }else{
        foundItems.push(item)
        res.redirect("/")
    }
     */
    
})


app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log("Successfuly Delete");
                res.redirect("/");
            }
        })
        } else {
        List.findOneAndUpdate({ name: listName}, {$pull: {items: { _id: checkedItemId } } }, function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port , function(){
    console.log("Server has Started Success");
})