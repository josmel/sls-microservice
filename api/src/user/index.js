/*jshint esversion: 9 */
const log4js = require('log4js');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const moment = require('moment');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const usersTable = process.env.usersTable;
const logLevel = process.env.logLevel;

const app = express();

const logger = log4js.getLogger('logger');
log4js.configure({
  appenders: { logger: { type: 'console' }},
  categories: { default: { appenders: ['logger'], level: logLevel }}
});

app.use(cors({
  allowedHeaders: ['Accept', 'Authorization', 'Content-Type', 'X-Amz-Date,', 'X-Amz-Security-Token', 'X-Api-Key'],
  maxAge: 600
}));
app.use(bodyParser.json({ strict: false }));

// table - Table name
// fe - Filter Expression
// eav - ExpressionAttributeValues
// ean - ExpressionAttributeNames
// pe - Projection Expression
async function scanTable({ table, fe, eav, ean, pe}) {
  let response = {};
  let data = [];
  let ExclusiveStartKey;
  try {
    do {
      response = await docClient.scan({
        TableName: table,
        ProjectionExpression: pe,
        FilterExpression: fe,
        ExpressionAttributeValues: eav,
        ExpressionAttributeNames: ean,
        ExclusiveStartKey
      }).promise();
      data = data.concat(response.Items);
      ExclusiveStartKey = response.LastEvaluatedKey;
    } while (response.LastEvaluatedKey);
    return data;
  }
  catch (err) {
    logger.error('Scan Table Error: ', err);
    throw err;
  }
}

// table - Table Namme
// item - Json object being added to table
//other
async function putTable({ table, item}) {
  try {
    return await docClient.put({ TableName: table, Item: item}).promise();
  }
  catch (err) {
    logger.error('Put Table Error: ', err);
    throw err;
  }
}

// table - Table Namme
// pe - Projection Expression
// key - key of item
async function getTable({ table, pe, key}) {
  try {
    return await docClient.get({ TableName: table,
      ProjectionExpression: pe,
      Key: key}).promise();
  }
  catch (err) {
    logger.error('Get Table Error: ', err);
    throw err;
  }
}

// ROUTES
app.post('/user', async (req, res) => {
  try {
    // put item to create new user
    res.status(200).json({body: `User was successfully created`});
  }
  catch (err) {
    res.status(504).json({body: 'Create User error.'});
  }
});

app.get('/user', async (req, res) => {
  try {
    // scan to get a list of users
    res.status(200).json({body: `User was successfully created`});
  }
  catch (err) {
    res.status(504).json({body: 'List users error.'});
  }
});

app.get('/user/:userid', async (req, res) => {
  try {
    // get to get a user
    res.status(200).json({body: `User was successfully created`});
  }
  catch (err) {
    res.status(504).json({body: 'Get user error.'});
  }
});

const handler = serverless(app);
exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
};
