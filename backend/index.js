const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const mysql = require('mysql')
const bodyParser = require('body-parser');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'cs157a',
  dateStrings: true
})

connection.connect();
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded( {extended: true} ));
app.use(bodyParser.urlencoded( {extended: true} ));

const SELECT_ALL_QRY = 'SELECT * FROM '
const ITEM_DB = 'item(callNumber, purchasePrice, donated, type, status, genre, name, releaseDate, loanPeriod, lateFee'


// GET requests

// default
app.get('/', (req, res) => res.send('Hello World!'))

// get all items in inventory
app.get('/api/items', (req, res) => {
  connection.query(SELECT_ALL_QRY + 'item', (err, row, fields) => {
    // if there are items in the row array 
    if (Object.keys(row).length != 0) {
      return res.status(200).json(row);
    }
    return res.status(502).json({error: 'No items in inventory'});
  });
});

// get details of item in inventory
app.get('/api/item', (req, res) => {
  // let authUser = JSON.parse(req.query['authUser']);
  console.log(req.query['call-number']);
  console.log("hitting route");
  let book_query = `SELECT * from book, item  WHERE item.callNumber="${req.query['call-number']}" and item.callNumber=book.callNumber`;
  connection.query(book_query, (err, row, fields) => {
    console.log(row);
    // if there are items in the row array 
    if (row !== undefined && Object.keys(row).length != 0) {
      return res.status(200).json(row);
    } else {
      let movie_query = `SELECT * from movie, item  WHERE item.callNumber="${req.query['call-number']}" and item.callNumber=movie.callNumber`;
      connection.query(movie_query, (err, row, fields) => {
        console.log(row);
        // if there are items in the row array 
        if (row !== undefined && Object.keys(row).length != 0) {
          return res.status(200).json(row);
        } else {
          return res.status(502).json({error: 'Cannot find item'});
        }
      });
    }  
  });
});

// react test
app.get('/react-test', (req, res) => res.send('Hi React, I\'m express.'))

// full test returns the full table contents
app.get('/full-test/:table', (req, res) => {
  connection.query(SELECT_ALL_QRY + req.params.table, (err, rows, fields) => {
    if(err) {console.log(err)}
    res.send(rows)
  })
})

// search all searches items with name parameter from url
app.get('/search-all/:name', (req, res) => {
  connection.query(SELECT_ALL_QRY+ ' item WHERE name='+req.params.name, (err, row, fields) => {
    if (err) {console.log(err)}
    res.send(row)
  })
})

// remove item by call number from library
//TODO: test this
app.get('/remove-item/:callNum', (req, res) => {
  connection.query('DELETE FROM item WHERE callNumber='+ req.params.callNum, (err, row, fields) => {
    if (err) {console.log(err)}
    res.send(row)
  })
})

app.get("/api/user-info", (req, res) => {
  let authUser = JSON.parse(req.query['authUser']);

  let sql_query = `SELECT * FROM user
                    WHERE email="${authUser.email}"`;

  connection.query(sql_query, (err, row, fields) => {
    console.log(row);
    if (Object.keys(row).length != 0) {
      return res.status(200).json(row);
    }
    return res.status(502).json({error: 'No user found'});
  });
});

// TODO: confirm PK of wishlist, currently not listed in MySQL
app.get("/api/wish-list", (req, res) => {

  // get card number of given authUser
  let userInfo = JSON.parse(req.query['userInfo']);
  let sql_query = `SELECT *
                    FROM item Item, wishlist 
                    WHERE Item.callNumber = wishlist.callNumber AND
                          libraryCardNumber IN (SELECT libraryCardNumber 
                                                FROM user 
                                                WHERE email="${userInfo['email']}")`; 
  connection.query(sql_query, (err, row, fields) => {
    console.log(row);
    if (Object.keys(row).length != 0) {
      return res.status(200).json(row);
    }
    return res.status(502).json({error: 'No items in wishlist'});
  });
})

app.get("/api/holds", (req, res) => {
  let userInfo = JSON.parse(req.query['userInfo']);

  let sql_query = `SELECT Item.name, holdDate
                  FROM item Item, hold WHERE hold.libraryCardNumber="${userInfo['libraryCardNumber']}"
                  AND Item.callNumber = hold.callNumber
                  AND hold.holdDate > NOW()`;
  connection.query(sql_query, (err, row, fields) => {
      console.log(row);
      if (Object.keys(row).length != 0) {
        return res.status(200).json(row);
      }
      return res.status(502).json({error: 'No items in holds'});
    });
})

app.get("/api/checked-out", (req, res) => {
  let userInfo = JSON.parse(req.query['userInfo']);
  let sql_query = `SELECT *
                  FROM item, borrows 
                  WHERE borrows.libraryCardNumber="${userInfo['libraryCardNumber']}"
                  AND item.callNumber = borrows.callNumber
                  AND borrows.returnDate IS NULL`;
  connection.query(sql_query, (err, row, fields) => {
      console.log(row);
      if (Object.keys(row).length != 0) {
        return res.status(200).json(row);
      }
      return res.status(502).json({error: 'No items currently checked out!'});
    });
})

// app.get("/api/checked-out", (req, res) => {
//   console.log(req.query);
//   connection.query(SELECT_ALL_QRY + 
//       `hold WHERE libraryCardNumber="${req.query['card-number']}"`, (err, row, fields) => {
//       console.log(row);
//       if (Object.keys(row).length != 0) {
//         return res.status(200).json(row);
//       }
//       return res.status(502).json({error: 'No items in wishlist'});
//     });
// })

app.get("/api/reading-history", (req, res) => {
  let userInfo = JSON.parse(req.query['userInfo']);
  let sql_query = `SELECT Item.name, borrowDate, returnDate, numberRenewals, overdue 
                  FROM item Item, borrows WHERE libraryCardNumber="${userInfo['libraryCardNumber']}" 
                  AND returnDate < NOW()
                  AND Item.callNumber = borrows.callNumber`;
  connection.query(sql_query, (err, row, fields) => {
      console.log(row);
      if (Object.keys(row).length != 0) {
        return res.status(200).json(row);
      }
      return res.status(400).json({error: 'No items in reading history'});
    });
})

// POST requests
app.post("/api/holds", (req, res) => {
  console.log("begin route");
  let validation_query = `SELECT * FROM hold 
                          WHERE callNumber="${req.body['call-number']}" 
                          AND libraryCardNumber="${req.body['card-number']}"`;

  connection.query(validation_query, (err, row, fields) => {
    console.log("row",row);
    if (row === undefined || Object.keys(row).length === 0) {
      return insertToHolds(req, res);
    }
    return res.status(502).json({error: 'Item already in holds!'});
  });
})

insertToHolds = (req, res) => {
  debugger;
  console.log("begin inserting");
  let dueDate_query = `SELECT dueDate FROM borrows WHERE callNumber="${req.body['call-number']}"`;
  let dueDate;
  // get due date from borrows table
  connection.query(dueDate_query, (err, row, fields) => {
    console.log(row[0].dueDate);
    dueDate = row[0].dueDate;

    let sql_query = `INSERT INTO hold (holdDate, callNumber, libraryCardNumber) 
                    VALUES("${dueDate}", ${req.body['call-number']}, ${req.body['card-number']})`;
  
    // add to hold table with fetched dueDate attribute
    connection.query(sql_query, (err, row, fields) => {    
      if (Object.keys(row).length != 0) {
        let update_query = `UPDATE item SET status='on hold' WHERE callNumber="${req.body['call-number']}"`;
        connection.query(update_query, (err, row, fileds) => console.log(row));
        return res.status(200).json(row);
      }
      return res.status(502).json({error: 'No items posted to hold'});
    });
  });

}

// TODO: confirm PK of wishlist, currently not listed in MySQL
app.post("/api/wish-list", (req, res) => {
  let validation_query = `SELECT * FROM wishlist 
                          WHERE callNumber="${req.body['call-number']}" 
                          AND libraryCardNumber="${req.body['card-number']}"`;

  connection.query(validation_query, (err, row, fields) => {
    console.log(row);
    if (Object.keys(row).length === 0) {
      return insertToWishList(req, res);
    }
    return res.status(502).json({error: 'Item already in wishlist!'});
  });

})

insertToWishList = (req, res) => {
  let sql_query = `INSERT INTO wishlist VALUES(${req.body['call-number']}, ${req.body['card-number']})`;
  connection.query(sql_query, (err, row, fields) => {
      console.log(row);
      if (Object.keys(row).length !== 0) {
        return res.status(200).json(row);
      }
      return res.status(502).json({error: 'No items posted to wishlist'});
  });
}

app.post('/api/checked-out', (req, res) => {
  let item = req.body['item'];
  let today = new Date();
  let dueDate = new Date(item.dueDate);
  let oneDay = 24 * 60 * 60 * 1000; 

  console.log(item);
  // check if item is in holds
  if (item.status === 'on hold') {
    return res.status(502).json({error: 'Item cannot be renewed because it is placed on hold!'});
  } else if ( Math.round(Math.abs((dueDate - today) / oneDay)) <= 7) {
    return renewItem(req, res);
  } 
  return res.status(502).json({error: 'Too early to renew item!'});
})

renewItem = (req, res) => {
  let item = req.body['item'];
  // alter due date
  let dateString = getNewDate(item);
  // increment renewals
  // change overdue to false
  let sql_query = `UPDATE borrows SET 
                    dueDate="${dateString}",
                    numberRenewals="${item.numberRenewals + 1}", 
                    overdue=false
                    WHERE callNumber="${item.callNumber}"`;
  connection.query(sql_query, (err, row, fields) => {
    console.log(row);
    if (row !== undefined && Object.keys(row).length !== 0) {
      return res.status(200).json(row);
    }
    return res.status(502).json({error: 'No items renewed!'});
  });
}

getNewDate = (item) => {
  let dueDate = new Date(item.dueDate);
  // add loan period to current due date to update it
  dueDate.setDate(dueDate.getDate() + item.loanPeriod);
  // convert new date into string and return in this format: YYYY-MM-DD
  return dueDate.getUTCFullYear() + '-' + `${dueDate.getMonth() + 1}` + '-' + dueDate.getUTCDate();
}

// add an item to the system
//TODO: need to finish + test
app.post('/add-item', (req, res) => {
  let newItem = req.body

  console.log('---add-item not implemented---\n')
  // connection.query('INSERT INTO' + ITEM_DB + ' VALUE()')
})

// add a new user
app.post('/api/submit-new-user', (req, res) => {
  console.log(req.body);
  const newUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    libraryCardNumber: Math.floor(Math.random() * 10000)  //TODO: ONLY TEMPORARY
  }
  connection.query(SELECT_ALL_QRY + 'user WHERE email="' + `${newUser.email}"`, (err, row, fields) => {
    if (row[0]) {
      console.log("user already exists", row);
      return res.status(400).send({error: 'user already exists'});
    } else {
      connection.query('INSERT INTO user SET ?', newUser);
      return res.status(200).send({status: newUser.email + ' registered'});
    }
  });
})

// log in
// TODO use firebase to authenticate now!
app.post('/api/login', (req, res) => {
  console.log("inside login route")
  connection.query(SELECT_ALL_QRY + 'user WHERE email="' + `${req.body.email}"`, (err, row, fields) => {
    if (row[0]) {
      console.log(row[0])
      return res.status(200).json("valid user");
    } else {
      return res.status(400).json({error: 'Invalid User Credentials'});
    }
  });
})

app.listen(port, () => console.log(`Library Management app listening on port ${port}!`));
