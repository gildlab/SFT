import {ethers} from "ethers";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const TEST_CONTRACT_ADDRESS = "0x1cf0ab6cf30a8aea01e82cd6d831845fec4363a3";

export const ONE = ethers.BigNumber.from("1000000000000000000");
export const ROLES = [
    {name: "DEPOSITOR", hash: "0xe16b3d8fc79140c62874442c8b523e98592b429e73c0db67686a5b378b29f336"},
    {name: "DEPOSITOR_ADMIN", hash: "0xc091f023e1c6780346fd5f1017395079a3ea0e07d94a4f9e7273a43e3fa2a7e8"},
    {name: "WITHDRAWER", hash: "0x779b9d7b1cefd23059ce3e2b194efb3183a6685dd830e8cbb723b0cbeb982b28"},
    {name: "WITHDRAWER_ADMIN", hash: "0xf2491dcc230f29376998d72c6c3ea4cc17d3791c66e46b32ea439c19610d51db"},
    {name: "CERTIFIER", hash: "0xd646ae07eb0d0f77457502a65e7407930dff4cd4fd99abc6aac87a753f4c8a42"},
    {name: "CERTIFIER_ADMIN", hash: "0x4bbeb6fd3e5222e55f2f8b0c35bc228e0a06a25d0da772fdb02c3b92fa004f88"},
    {name: "HANDLER", hash: "0xf40ec076ff2e3a403e1c18632267861d39085e7f359ca5665846f335632cf819"},
    {name: "HANDLER_ADMIN", hash: "0x4cbb985fecd7e86ede589f695f46f07d40afe7cb60f6049028c0b9a6bfaf649e"},
    {name: "ERC20TIERER", hash: "0x9f5e37ff3a64b04b72b5b1811abfcf4517dd143202c8aa61348ea257fa96a082"},
    {name: "ERC20TIERER_ADMIN", hash: "0xc1a04980ce16d8574a4108b9f0a95358068379059fe211b7eb60a9f805237e60"},
    {name: "ERC1155TIERER", hash: "0x4050867f5f2e7b09df27b54fd9dd2dc48115dba018cf621a03355f7966666ae0"},
    {name: "ERC1155TIERER_ADMIN", hash: "0xd461edcf12d14f5a18f27560fb18cfcb7df6fedb1d46c3664b9634623e9a172d"},
    {name: "ERC20SNAPSHOTTER", hash: "0x2c95f646d7033c5b1f0ff0b069bf367786555798c4a6d29fdd04e5009fe72543"},
    {name: "ERC20SNAPSHOTTER_ADMIN", hash: "0xda44ae5b31a7809c0f15e7306bdde44fffb60fdee235af40c70b73a6610de41e"},
    {name: "CONFISCATOR", hash: "0xa49d0f1c9ff1006cadfa9c5663622056113f1b69c0f273e4a1e170ee907cde94"},
    {name: "CONFISCATOR_ADMIN", hash: "0xc23bede8eabca44a15d0193051ac5429f3d014a7e297a4e78f67d06657d14269"}
]
export const IPFS_APIS = [
    "https://gildlab-ipfs-0.in.ngrok.io/api/v0/add?pin=true&to-files=", //Vishal
    "https://gildlab-ipfs-2.eu.ngrok.io/api/v0/add?pin=true&to-files=", //David A Box1
    "https://gildlab-ipfs-4.eu.ngrok.io/api/v0/add?pin=true&to-files=", //Nino
    "https://gildlab-ipfs-5.eu.ngrok.io/api/v0/add?pin=true&to-files=", //David A Box2
]
export const IPFS_GETWAY = "https://ipfs.io/ipfs/"
