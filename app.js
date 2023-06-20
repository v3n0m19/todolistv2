//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const e = require("express");
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name:"Welcome to your todo list !"
  })
const item2 = new Item({
  name:"Hit the + button to add a new item"
})
const item3 = new Item({
  name:"<--Hit this to delete an item"
})
const defaultItems = [item1,item2,item3]

const listSchema = {
  name:String,
  items : [itemsSchema]
}
const List = mongoose.model("List",listSchema)



app.get("/", function(req, res) {

  Item.find({},function(err,items){
    if(items.length===0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)
          console.log(err);
        else
          console.log("Default items added successfully !!")
      })
      res.redirect("/")
    }
    else
      res.render("list", {listTitle: "Today", newListItems: items});
  })


});

app.post("/", function(req, res){
  
  const itemName = req.body.newItem;
  const listName = _.trim(req.body.list)
  const item = new Item({
    name: itemName
  })

  if(listName === "Today")
  {
    item.save()
    res.redirect("/")
  }
  else
  {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+foundList.name)
    })
  }

});

app.post("/delete", function(req,res){
  const checkedItem = _.trim(req.body.checkbox);
  const listName = _.trim(req.body.listName)

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItem, function(err){
      if(err)
        console.log(err)
      else
        console.log("Successfully deleted Item")
    })
    res.redirect("/")
  }
  else
  {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id:checkedItem}}},function(err,foundList){
      if(err)
        console.log(err)
      else
        res.redirect("/"+listName)
    })
  }

  
})
app.get("/:newListName", function(req,res){
  const newListName = _.capitalize(req.params.newListName);
  List.findOne({name: newListName},function(err,foundList){
    if(err)
        console.log(err)
    else{
      if(!foundList)
        {//create a new list
          const list = new List({
            name: newListName,
            items: defaultItems
          })
          list.save()
          res.redirect("/"+newListName)
        }
      else
        {//show an existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
    }
  })


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
