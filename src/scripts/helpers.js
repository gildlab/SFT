import {ethers} from "ethers";
import {IPFS_GETWAY, MAGIC_NUMBERS, ONE, ROLES, ROUTE_LABEL_MAP} from "./consts.js";
import axios from "axios";
import pako from "pako"
import {encodeCanonical, decodeAllSync} from "cbor-web";
import {arrayify, isBytesLike} from "ethers/lib/utils.js";
import {
    account,
    breadCrumbs, navigationButtonClicked,
    promptBottomText, promptCloseAction, promptErrorText, promptNoBottom, promptSuccessText,
    promptTopText, transactionError,
    transactionHash,
    transactionInProgress,
    transactionInProgressShow,
    transactionSuccess
} from "./store.js";
import {ACCOUNT_PINS_QUERY, VAULT_INFORMATION_QUERY} from "./queries.js";
import {navigateTo} from 'yrv';


export async function getEventArgs(tx, eventName, contract) {
    return contract.interface.decodeEventLog(eventName, (
            await getEvent(tx, eventName, contract)
        ).data
    );
}

export async function getEvent(tx, eventName, contract) {
    const events = (await tx.wait()).events || [];
    const filter = (contract.filters[eventName]().topics || [])[0];
    const eventObj = events.find(
        (x) => x.topics[0] === filter && x.address.toLowerCase() === contract.address.toLowerCase())

    if (!eventObj) {
        throw new Error(`Could not find event with name ${eventName}`);
    }

    return eventObj;
}

export async function getContract(network, address, abi, signerOrProvider) {
    let contract;
    if (network) {
        if (address) {
            contract = new ethers.Contract(
                address,
                abi,
                signerOrProvider
            );
        }
    }
    return contract
}

export function toSentenceCase(text) {
    text = text.toLowerCase()
    let txtArr = text.split(/[,._\s]/)
    let firstWord = txtArr[0]
    let firstLetter = firstWord.charAt(0).toUpperCase()
    firstWord = firstLetter + firstWord.slice(1)
    txtArr = txtArr.slice(1)
    txtArr.unshift(firstWord)
    return (txtArr.join(' '))
}

export async function fetchSubgraphData(activeNetwork, variables, query) {
    if (activeNetwork && activeNetwork.id) {
        try {
            let req = await fetch(activeNetwork.subgraph_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query,
                    variables
                })
            })
            return await req.json()

        } catch (e) {
            console.log(e.message)
            return null
        }
    }
}

export function getSubgraphDataNoInterval(activeNetwork, variables, query) {
    return new Promise(async (resolve) => {
        async function fetchData() {
            return await fetchSubgraphData(activeNetwork, variables, query)
        }

        let data = await fetchData()
        if (data && data.errors) {
            console.log(data.errors)
        }
        return resolve(data)
    })
}

export function getSubgraphData(activeNetwork, variables, query, param) {
    return new Promise(async (resolve) => {
        async function fetchData() {
            return await fetchSubgraphData(activeNetwork, variables, query)
        }

        let interval = setInterval(fetchData, 2000)
        let data = await fetchData()
        if (data && data.errors) {
            clearInterval(interval)
            console.log(data.errors)
        }
        if (!data || data.data[param] || (data && data.data && data.data[param] === null)) {
            clearInterval(interval)
            return resolve(data)
        }
    })
}

export function fixedPointMul(a, b) {
    return a.mul(b).div(ONE);
}

export function fixedPointDiv(a, b) {
    return a.mul(ONE).div(b);
}

export function filterArray(arr1, arr2) {
    return arr1.filter(a => {
        return arr2.indexOf(a.account.address) === -1
    })
}

export function tierReport(report) {

    let parsedReport = [];
    const arrStatus = [0, 1, 2, 3, 4, 5, 6, 7]
        .map((i) =>
            BigInt(report)
                .toString(16)
                .padStart(64, "0")
                .slice(i * 8, i * 8 + 8)
        )
        .reverse();
    //arrStatus = arrStatus.reverse();

    for (const i in arrStatus) {
        parsedReport.push(parseInt("0x" + arrStatus[i]));
    }

    return parsedReport;
}

export function timeStampToDate(timeStamp, format) {
    let value;
    let {year, month, day, hour, min} = getDateValues(new Date(timeStamp * 1000))

    if (format === "mm-dd-yyyy") {
        value = [month, day, year].join('-');
    } else if (format === "yyyy-mm-dd") {
        value = [year, month, day].join('-');
    } else if (format === "yy-mm-dd tt:tt") {
        let date = [year, month, day].join('-');
        let time = [hour, min].join(":")
        value = date + " " + time;
    } else if (format === "yy-mm-dd/tt:tt") {
        let date = [year, month, day].join('-');
        let time = [hour, min].join(":")
        value = date + " / " + time;
    } else {
        value = [day, month, year].join('-');
    }
    return value
}

export function toIsoDate(timeStamp) {
    let date = new Date(timeStamp * 1000)
    return date.toISOString().slice(0, date.toISOString().length - 5)
}

export function formatDate(date) {
    let {year, month, day} = getDateValues(date)
    return [year, month, day].join('-');
}

function getDateValues(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        min = '' + d.getMinutes(),
        hour = '' + d.getHours();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    if (min.length < 2)
        min = '0' + min;
    if (hour.length < 2)
        hour = '0' + hour;

    return {day, month, year, hour, min};
}

export function accessControlError(msg) {
    let hash = msg.slice(-66)
    let error = msg.slice(20, msg.length - 66)
    let role = ROLES.find(r => r.roleHash === hash)
    return error + " " + role?.roleName
}

export function toBytes(string) {
    const encoder = new TextEncoder('UTF-8');
    return encoder.encode(string);
}

export function hexToString(s) {
    let r = [];
    for (let i = 0; i < s.length - 1; i += 2) {
        r.push(String.fromCharCode(parseInt(s.charAt(i) + s.charAt(i + 1), 16)));
    }
    return r.join("");
}

export function isUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

export async function getReceiptBalance(activeNetwork, vault, receipt) {
    let query = `
          query($id: ID!) {
           receiptBalance(id: $id)
           {
              id,
              value,
              valueExact
           }
        }
         `
    let variables = {id: `${vault.address.toLowerCase()}-${receipt}`}
    let receiptBalance

    let res = await getSubgraphData(activeNetwork, variables, query, 'receiptBalance')
    if (res && res.data && res.data.receiptBalance) {
        receiptBalance = res.data.receiptBalance.valueExact
    }
    return ethers.BigNumber.from(receiptBalance)
}

export async function hasRole(vault, account, role) {
    let resp = await vault.hasRole(
        await vault[role](),
        account
    );
    if (resp) {
        return resp
    } else {
        return {error: `Account ${account.toLowerCase()} is missing role ${role}`}
    }
}

export async function getIpfsGetWay(hash) {
    try {
        //Todo Check hash is valid Ipfs hash
        const response = await axios.get(`${IPFS_GETWAY}${hash}`);
        if (response) {
            return response?.config.url
        }
    } catch (err) {
        console.log(err)
    }
}

export function formatAddress(address) {
    if (address) {
        return address.replace(/(.{6}).*(.{5})/, "$1…$2")
    } else
        return ''
}

export function formatHash(hash) {
    if (hash) {
        return hash.replace(/(.{17}).*/, "$1…")
    } else
        return ''
}


export function deflateJson(data_) {
    const bytes = Uint8Array.from(pako.deflate(data_, {to: 'string'}));
    let hex = "0x";
    for (let i = 0; i < bytes.length; i++) {
        hex = hex + bytes[i].toString(16).padStart(2, "0");
    }
    return hex;
}

export function cborEncode(
    payload_,
    magicNumber_,
    contentType_,
    options_
) {
    const m = new Map();
    m.set(0, payload_); // Payload
    m.set(1, magicNumber_); // Magic number
    if (contentType_) {
        m.set(2, contentType_); // Content-Type
    }

    if (options_) {
        if (options_.contentEncoding) {
            m.set(3, options_.contentEncoding); // Content-Encoding
        }

        if (options_.contentLanguage) {
            m.set(4, options_.contentLanguage); // Content-Language
        }

        if (options_.schema) {
            m.set(MAGIC_NUMBERS.OA_SCHEMA, options_.schema)
        }
    }
    return encodeCanonical(m).toString("hex").toLowerCase();
}

export function cborDecode(dataEncoded_) {
    return decodeAllSync(dataEncoded_);
}

export function encodeCBOR(data, magicNumber) {
    // -- Encoding with CBOR
    // Obtain (Deflated JSON) and parse it to an ArrayBuffer
    if (typeof data === 'object') {
        data = JSON.stringify(data)
    }
    const deflatedData = arrayify(deflateJson(data)).buffer;
    return cborEncode(
        deflatedData,
        magicNumber,
        "application/json",
        {
            contentEncoding: "deflate",
        }
    );
}

export function encodeCBORStructure(structure, schemaHash) {
    // -- Encoding with CBOR
    // Obtain (Deflated JSON) and parse it to an ArrayBuffer
    if (typeof structure === 'object') {
        structure = JSON.stringify(structure)
    }
    const deflatedData = arrayify(deflateJson(structure)).buffer;
    return cborEncode(
        deflatedData,
        MAGIC_NUMBERS.OA_STRUCTURE,
        "application/json",
        {
            contentEncoding: "deflate",
            schema: schemaHash
        }
    );
}

export function bytesToMeta(bytes, type) {
    if (isBytesLike(bytes)) {
        const _bytesArr = arrayify(bytes, {allowMissingPrefix: true});
        let _meta;
        if (type === "json") {
            _meta = pako.inflate(_bytesArr, {to: 'string'})
        } else {
            _meta = new TextDecoder().decode(bytes).slice(3)
        }
        let res;
        try {
            res = JSON.parse(_meta)
        } catch {
            res = _meta
        }
        return res
    } else throw new Error("invalid meta");
}

export async function showPrompt(transaction, options) {
    //clear store
    transactionError.set(false)
    transactionSuccess.set(false)
    promptTopText.set("")
    promptErrorText.set("Transaction failed")
    promptSuccessText.set("Transaction successful!")
    promptNoBottom.set(false)
    promptBottomText.set("")
    promptCloseAction.set(() => {
    })
    transactionHash.set("false")

    //show prompt
    transactionInProgressShow.set(true)
    transactionInProgress.set(true)
    if (options && options.topText) {
        promptTopText.set(options.topText)
    }
    if (options && options.noBottomText) {
        promptNoBottom.set(options.noBottomText)
    }
    if (options && options.bottomText) {
        promptBottomText.set(options.bottomText)
    }
    if (options && options.closeAction) {
        promptCloseAction.set(options.closeAction)
    }
    if (options && options.errorText) {
        promptErrorText.set(options.errorText)
    }
    if (options && options.successText) {
        promptSuccessText.set(options.successText)
    }
    if (transaction) {

        if (transaction.hash) {
            transactionHash.set(transaction.hash)
        }
        let wait = await transaction.wait()
        if (wait.status === 1) {
            transactionSuccess.set(true)
            transactionInProgress.set(false)
        } else {
            transactionError.set(true)
        }
    }
}

export async function showPromptSFTCreate(transaction, options) {
    //clear store
    transactionError.set(false)
    transactionSuccess.set(false)
    promptTopText.set("")
    promptErrorText.set("Transaction failed")
    promptSuccessText.set("Transaction successful!")
    promptNoBottom.set(false)
    promptBottomText.set("")
    promptCloseAction.set(() => {
    })
    transactionHash.set("false")

    //show prompt
    transactionInProgressShow.set(true)
    transactionInProgress.set(true)
    if (options && options.topText) {
        promptTopText.set(options.topText)
    }
    if (options && options.noBottomText) {
        promptNoBottom.set(options.noBottomText)
    }
    if (options && options.bottomText) {
        promptBottomText.set(options.bottomText)
    }
    if (options && options.closeAction) {
        promptCloseAction.set(options.closeAction)
    }
    if (options && options.errorText) {
        promptErrorText.set(options.errorText)
    }
    if (options && options.successText) {
        promptSuccessText.set(options.successText)
    }
    if (transaction) {
        if (transaction.hash) {
            transactionHash.set(transaction.hash)
        }
    }
}

export async function addMissingHashesToSubGraph(hashes, vault, signer) {
    let schemaInformation = {}

    let encodedSchema = encodeCBOR(schemaInformation, MAGIC_NUMBERS.OA_SCHEMA)

    try {
        let encodedHashList = cborEncode(
            hashes.toString(),
            MAGIC_NUMBERS.OA_HASH_LIST
        );
        const meta = "0x" + MAGIC_NUMBERS.RAIN_META_DOCUMENT.toString(16).toLowerCase() + encodedSchema +
            encodedHashList
        await vault.connect(signer).receiptVaultInformation(arrayify(meta))

    } catch (err) {
        console.log(err)
    }
}

export function mapOrder(array, order, key) {

    array.sort(function (a, b) {
        let A = a[key], B = b[key];

        if (order.indexOf(A) > order.indexOf(B)) {
            return 1;
        } else {
            return -1;
        }

    });

    return array;
}

export async function getSchemas(activeNetwork, vault, deposits) {
    let tempSchema = []

    let variables = {id: vault.address.toLowerCase()}
    if (vault.address) {

        try {
            let resp = await getSubgraphData(activeNetwork, variables, VAULT_INFORMATION_QUERY, 'offchainAssetReceiptVault')
            let receiptVaultInformations = []
            if (resp && resp.data && resp.data.offchainAssetReceiptVault) {
                receiptVaultInformations = resp.data.offchainAssetReceiptVault.receiptVaultInformations
                if (receiptVaultInformations.length) {
                    for (let i = 0; i < receiptVaultInformations.length; i++) {
                        let cborDecodedInformation = cborDecode(receiptVaultInformations[i].information.slice(18))
                        let schemaHash = cborDecodedInformation[1].get(0)
                        let structure = bytesToMeta(cborDecodedInformation[0].get(0), "json")
                        let assetCount = getAssetCount(schemaHash, deposits)
                        tempSchema = [...tempSchema, {
                            ...structure,
                            timestamp: receiptVaultInformations[i].timestamp,
                            id: receiptVaultInformations[i].id,
                            hash: schemaHash,
                            assetCount,
                        }]
                        tempSchema = tempSchema.filter(d => d.displayName)
                    }
                    return tempSchema
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
}

function getAssetCount(hash, deposits) {
    let depositsWithSchema = deposits.filter(d => d.receipt.receiptInformations[0]?.schema === hash)
    let depositAmounts = depositsWithSchema.map(d => d.amount);
    let assetCount = depositAmounts.reduce(
        (accumulator, currentValue) => ethers.BigNumber.from(accumulator).add(ethers.BigNumber.from(currentValue)),
        0
    );
    return ethers.utils.formatUnits(assetCount, 18)
}

export async function setAccountRoles(roles, account) {
    let accountRoles = []
    for (let i = 0; i < ROLES.length; i++) {
        let role = roles.find(r => r.roleHash === ROLES[i].roleHash);
        if (role) {
            accountRoles[ROLES[i].roleName] = role.roleHolders.some(h => h.account.address.toLowerCase() ===
                account.toLowerCase());
        }
    }
    return accountRoles

}

export function navigate(path, options) {
    let bcId = path.split("/")[0]
    let label = ROUTE_LABEL_MAP.get(bcId)
    navigationButtonClicked.update(() => false)
    if (options && options.clear) {
        if (path === "#list") {
            breadCrumbs.update(() => [])
        } else {
            breadCrumbs.update(() => [{path: "#list", label: "Home", id: 'home'}, {path, label, id: bcId}])
        }
    } else {
        breadCrumbs.update(bc => {
            if (!bc.find(b => b.id === bcId)) {
                return [...bc, {path, label, id: bcId}]
            } else {
                let indexOfPage = bc.findIndex(b => b.id === bcId)
                return bc.splice(0, indexOfPage + 1)
            }
        })
    }
    navigateTo(path)
}

export function downloadIpfsHashes(hashes) {
    if (hashes.length) {
        const content = hashes.filter(h => !!h).join("\n");
        const blob = new Blob([content], {type: "text/plain"});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Ipfs_pin_list.txt";
        a.click();
        window.URL.revokeObjectURL(url);
    }

}

export async function getAccountPins(network, address) {
    let resp = await getSubgraphData(network, {address}, ACCOUNT_PINS_QUERY, 'accounts')
    if (resp && resp.data && resp.data.accounts) {

        let pins = resp.data.accounts.map(a => a.hashes)

        if (pins.length) {
            pins = pins.flat()
        }
        return pins
    }
}

export async function connectAccount() {
    try {
        const accounts = await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [{
                eth_accounts: {}
            }]
        }).then(() => window.ethereum.request({
            method: "eth_requestAccounts"
        }));
        let connectedAccount = accounts[0];
        localStorage.setItem("account", connectedAccount);

        return connectedAccount
    } catch (error) {
        console.log(error);
    }
}