require('dotenv').config();
const fs = require("fs");
const AWS = require("aws-sdk");
const axios = require("axios");

const { BUCKET_NAME, IAM_USER_KEY, IAM_USER_SECRET, IMAGE_PATH } = process.env;
AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
})

const dynamodb = new AWS.DynamoDB();
const s3bucket = new AWS.S3();
const url = 'https://dog.ceo/api/breeds/image/random';
const urlToObject = async () => {
    try {
        const img = await axios.get(url);
        const response = await axios.get(img.data.message, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data, "utf-8")

        return new Promise((resolve, reject) => {
            fs.writeFile(IMAGE_PATH, buffer, (err, data) => {
                if (err) {
                    return reject(err);
                }

                return resolve(data);
            });
        });
    } catch (error) {
        console.log(error);
    }
}
const uploadToS3 = async () => {
    try {
        await urlToObject();
        const readStream = fs.createReadStream(IMAGE_PATH);
        const params = {
            Bucket: BUCKET_NAME,
            Key: `image${Math.random()}.jpg`,
            Body: readStream
        };
        console.log("##################MID################");

        return new Promise((resolve, reject) => {
            s3bucket.upload(params, function (err, data) {
                readStream.destroy();

                if (err) {
                    return reject(err);
                }

                return resolve(data);
            });
        });
    } catch (error) {
        console.log(error);
        urlToObject();
    }
}

// exports.handler = async (event) => {
const fn = async () => {
    const data = await uploadToS3();
    console.log({ data });
    const params = {
        Item: {
            "id": { S: data.Location },
        },
        TableName: "imageGallery"
    }
    dynamodb.putItem(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });

    const docClient = new AWS.DynamoDB.DocumentClient({
        // optional tuning - 50% faster(cold) / 20% faster(hot)
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


    console.log({ scanResults });
    console.log("#######################done####################");

};

fn();