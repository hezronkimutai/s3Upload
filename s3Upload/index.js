require('dotenv').config();
const fs = require("fs");
const AWS = require("aws-sdk");
const axios = require("axios");

const { BUCKET_NAME, IAM_USER_KEY, IAM_USER_SECRET, IMAGE_PATH } = process.env;
AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
})

const dynamodb = new AWS.DynamoDB();
const s3bucket = new AWS.S3();
const url = 'https://dog.ceo/api/breeds/image/random';

const errorhandler = (e) => {
    throw new Error(e);
};

const urlToObject = async (cb) => {
    const img = await axios.get(url).catch(errorhandler);
    const response = await axios.get(img.data.message, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, "utf-8");
    cb(img.data.message.split('/')[4]);
    return new Promise((resolve, reject) => {
        fs.writeFile(IMAGE_PATH, buffer, (err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}
const uploadToS3 = async (cb) => {
    let fileName = "";
    await urlToObject((e) => { fileName = e; }).catch(errorhandler);
    const readStream = await fs.createReadStream(IMAGE_PATH);
    const params = {
        Bucket: BUCKET_NAME,
        Key: `${fileName}.jpg`,
        Body: readStream
    };
    cb(fileName);
    return new Promise((resolve, reject) => {
        s3bucket.upload(params, function (err, data) {
            readStream.destroy();
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

exports.handler = async (event) => {
    // const fn = async () => {
    console.info("START")
    let fileName = '';
    const data = await uploadToS3((e) => { fileName = e; }).catch(errorhandler);
    const params = {
        Item: {
            "url": { S: data.Location },
            "name": { S: fileName },
        },
        TableName: "imageGallery"
    }
    return new Promise((resolve, reject) => {
        dynamodb.putItem(params, function (err, data) {
            if (err) return reject(err);
            console.info("END")
            return resolve(data);
        });
    });
};

// fn();