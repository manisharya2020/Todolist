//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
var _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://thetactics2020:Classten12@cluster0.7oswa.mongodb.net/todolistDB", {
  useNewUrlParser: true
});
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your to do list"
});
const item2 = new Item({
  name: "Make your to do list"
});
const item3 = new Item({
  name: "To delete check the item"
});
const defaultitem = [item1, item2, item3];
// custom made list
const listSchema = {
  name: String,
  item: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

// Home page
app.get("/", function(req, res) {
  Item.find({}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.length === 0) {
        Item.insertMany([item1, item2, item3], function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("successfully items added")
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: result
        });
      }

    }
  });
});

// home page-post req
app.post("/", function(req, res) {
  const listType = req.body.list;
  const item = req.body.newItem;
  const newItem = new Item({
    name: item
  });
  if (listType === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listType
    }, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        result.item.push(newItem);
        result.save();
        res.redirect("/" + listType);
      }
    });
  }
});

// to create aur find list
app.post("/create",function(req,res){
  const search = req.body.CAFI;
  res.redirect("/" + search);
});

// to delete items in list
app.post("/delete", function(req, res) {
  const listName = req.body.listNameToDelete;
  const deleteItem = req.body.delete;
  if (listName === "Today") {
    Item.findByIdAndRemove(deleteItem, function(err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log("sucessfull removes", docs);
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        item: {
          _id: deleteItem
        }
      }
    }, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
        // console.log(result);
      }
    });
  }
});

// custom made list
app.get("/:listName", function(req, res) {
  const customListName = _.upperFirst(req.params.listName);
  List.findOne({
    name: customListName
  }, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (!result) {
        const newList = new List({
          name: customListName,
          item: defaultitem
        });
        newList.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: result.name,
          newListItems: result.item
        });
      }
    }
  });
  res.render
});

// about section
app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
