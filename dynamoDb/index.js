require('dotenv').config();
const AWS = require("aws-sdk");

const { IAM_USER_KEY, IAM_USER_SECRET } = process.env;
AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
})

exports.handler = async (event) => {
    // const fn = async () => {
    const docClient = new AWS.DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        sslEnabled: false,
        paramValidation: false,
        convertResponseTypes: false
    });

    const tableName = 'imageGallery';


    let params1 = { TableName: tableName };

    let scanResults = [];
    let items;

    do {
        items = await docClient.scan(params1).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params1.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");


    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(scanResults),
    };
    return response;

};

// fn();