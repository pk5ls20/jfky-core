import COS from 'cos-js-sdk-v5';
const cos = new COS({
    SecretId: process.env.VUE_APP_COS_SECRET_ID,
    SecretKey: process.env.VUE_APP_COS_SECRET_KEY,
});

export default cos;
