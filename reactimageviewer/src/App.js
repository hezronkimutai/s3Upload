import './App.css';

import AWS from 'aws-sdk';
import React, { useEffect } from 'react'



const { REACT_APP_BUCKET_NAME, REACT_APP_IAM_USER_KEY, REACT_APP_IAM_USER_SECRET } = process.env;
console.log({ REACT_APP_BUCKET_NAME, process });
const s3bucket = new AWS.S3({
  region: 'ap-south-1',

  accessKeyId: REACT_APP_IAM_USER_KEY,
  secretAccessKey: REACT_APP_IAM_USER_SECRET
});
const uploadToS3 = async () => {
  try {
    const params = {
      // Delimiter: '/',
      Bucket: REACT_APP_BUCKET_NAME,
    };

    const data = await s3bucket.listObjects(params).promise();

    for (let index = 1; index < data['Contents'].length; index++) {
      console.log(data['Contents'][index]['Key'])
    }

    for (let index = 1; index < data['Contents'].length; index++) {
      console.log(data['Contents'][index]['Key'])
    }

  } catch (error) {
    console.log(error);

  }
}

function App() {
  useEffect(() => {
    uploadToS3();
  }, [])
  return (
    <div className="App">

    </div>
  );
}

export default App;
