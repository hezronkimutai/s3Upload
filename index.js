require('dotenv').config();
const fs = require("fs");
const AWS = require("aws-sdk");
const axios = require("axios");

const { BUCKET_NAME, IAM_USER_KEY, IAM_USER_SECRET } = process.env;

const s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
});
const url = 'https://dog.ceo/api/breeds/image/random';
const urlToObject = async () => {
    try {
        const img = await axios.get(url);
        const response = await axios.get(img.data.message, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data, "utf-8")
        await fs.writeFile("image.jpg", buffer, () => { });
    } catch (error) {
        console.log(error);
    }
}
const uploadToS3 = async () => {
    try {
        await urlToObject();
        const readStream = fs.createReadStream('image.jpg');
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
    }
}

// exports.handler = async (event) => {
//     await uploadToS3();
//     console.log("#######################done####################");

// };

uploadToS3()