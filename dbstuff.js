var mysql = require('mysql');
const _ = require('lodash');

const USERS_TABLE_NAME = 'posters';
const DEMERIT_TABLE_NAME = 'demerits';

function getConnection() {
  return mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'discorddb'
  });
}
function listPosters() {
  var connection = getConnection();
  connection.connect(function(err) {
    if (err) throw err;
    console.log('Connected!');
    connection.query(`SELECT * FROM ${USERS_TABLE_NAME}`, function(err, result, fields) {
      if (err) throw err;
      console.log('get Users result', result);
      connection.end(function(err) {
        if (err) throw err;
        console.log('ended');
      });
    });
  });
};

// adds if its not there
function getUser(userObj) {
  var userId = userObj.id;
  return new Promise((resolve, reject) => {
    var connection = getConnection();
    connection.connect(function(err) {
      if (err) handleErr(reject, connection, err);
      console.log('Connected!');
      connection.query(`SELECT * from ${USERS_TABLE_NAME} where snowflake='${userId}';`, function(err, result, fields) {
        if (err) handleErr(reject, connection, err);
        else {
          connection.end();
          resolve(_.first(result));
        }
      });
    });
  });
}

function createUser(userObj) {
  return new Promise((resolve, reject) => {
    var query = '';
    query += `insert into ${USERS_TABLE_NAME} (username, snowflake) VALUES (${mysql.escape(userObj.username)}, ${mysql.escape(userObj.id)});`;
    var connection = getConnection();
    connection.connect(function(err) {
      if (err) handleErr(reject, connection, err);
      connection.query(query, function(err, result, fields) {
        if (err) handleErr(reject, connection, err);
        else {
          connection.end();
          getUser(userObj).then(function(getUserResult) {
            resolve(getUserResult);
          });
        }
      });
    });
  });
};

function getUserOrCreate(userObj) {
  return new Promise((resolve, reject) => {
    getUser(userObj).then(function(getUserResult) {
      if (getUserResult) resolve(getUserResult);
      else {
        createUser(userObj).then(function(createUserResult) {
          resolve(createUserResult);
        });
      }
    });
  });
}
function updateDemeritsGiven(snowflake, newDemeritCount) {
  return new Promise((resolve, reject) => {
    const connection = getConnection();
    connection.connect(function(err) {
      if (err) handleErr(reject, connection, err);
      var query = `update ${USERS_TABLE_NAME} set demeritgivencount = ${newDemeritCount} where snowflake = '${snowflake}';`;
      console.log(query);
      connection.query(query, function(err, result, fields) {
        if (err) handleErr(reject, connection, err);
        else {
          connection.end();
          result.count = newDemeritCount;
          resolve(result);
        }
      });
    });
  });
}
function applyDemerit(userResultObj) {
  return new Promise((resolve, reject) => {
    const connection = getConnection();
    connection.connect(function(err) {
      if (err) handleErr(reject, connection, err);
      var newDemeritCount = userResultObj.demeritcount + 1;
      var userSnowflake = userResultObj.snowflake;
      var query = `update ${USERS_TABLE_NAME} set demeritcount = ${newDemeritCount} where snowflake = '${userSnowflake}';`;
      console.log(query);
      connection.query(query, function(err, result, fields) {
        if (err) handleErr(reject, connection, err);
        else {
          connection.end();
          result.count = newDemeritCount;
          result.username = userResultObj.username;
          resolve(result);
        }
      });
    });
  });
}

function handleErr(rejectFunction, connection, err) {
  console.log('handle err called');
  connection.end();
  rejectFunction(err);
}

exports.applyDemerit = applyDemerit;
exports.listPosters = listPosters;
exports.getUser = getUser;
exports.createUser = createUser;
exports.getUserOrCreate = getUserOrCreate;
exports.updateDemeritsGiven = updateDemeritsGiven;

// con.connect(function(err) {
//     if (err) throw err;

//   });

// test connection
// ensure that tables exist
/*
    users
        username
        snowflake
        enforcer
        demeritcount
        active
    demerits
        source
        target
        time
        comment text

        create database discorddb;

        CREATE TABLE IF NOT EXISTS posters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255),
            snowflake VARCHAR(255),
            enforcer BOOLEAN DEFAULT FALSE,
            demeritcount INT DEFAULT 0,
            active BOOLEAN DEFAULT TRUE
        );
        CREATE TABLE IF NOT EXISTS demerits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            source varchar(255),
            target varchar(255),
            time TIMESTAMP,
            commentbody TEXT,
            debug BOOLEAN default false
        );
        ALTER TABLE posters add column demeritgivencount INT DEFAULT 0;


*/
