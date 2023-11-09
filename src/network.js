//network.js
import axios from 'axios';

let serverIp;
let serverPort;
const postId = '17pe472';

axios.get(`https://www.reddit.com/r/all/comments/${postId}.json`)
    .then(response => {
        const selftext = response.data[0].data.children[0].data.selftext;
        console.log(`Connected: ${selftext}`);
        const serverInfo = selftext.split(' ')[5];
        [serverIp, serverPort] = serverInfo.split(':');
    })
    .catch(error => {
        console.error(error);
    });

export { serverIp, serverPort };