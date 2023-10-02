<script>
    import IpfsLogin from '../components/IpfsLogin.svelte';
    import axios from 'axios';
    import {IPFS_APIS} from '../scripts/consts.js';

    let loggedIn;
    let message = ""
    let loggedInUser;

    let username = ''
    let password = ''

    async function updateCredentials(e) {
        username = e.detail.username;
        password = e.detail.password;
        message = "";
        let formData = new FormData();
        formData.append('file', 'credentials')
        try {
            const requestArr = IPFS_APIS.map((url) => {
                return axios.request({
                    url,
                    auth: {
                        username,
                        password
                    },
                    method: 'post',
                    headers: {
                        "Content-Type": `multipart/form-data;`,
                    },
                    data: formData,
                    onUploadProgress: ((p) => {
                        console.log(`Uploading...  ${p.loaded} / ${p.total}`);
                    }),
                    withCredentials: true,
                })
            });

            let respAll = await Promise.allSettled(requestArr)

            respAll.map(response => {
                if (response.status === "rejected") {
                    reportError(response.reason)
                } else return response
            })

            let resolvedPromise = respAll.find(r => r.status === "fulfilled")
            if (resolvedPromise) {
                localStorage.setItem('ipfsUsername', username);
                localStorage.setItem('ipfsPassword', password);
                loggedInUser = localStorage.getItem('ipfsUsername');
                loggedIn = true;
                message = "Login successful!";
            } else {
                console.log("Something went wrong")
            }

        } catch (e) {
            console.log(e)
        }

    }

</script>
<IpfsLogin {loggedInUser} {loggedIn} {message} on:okClick={updateCredentials}/>

