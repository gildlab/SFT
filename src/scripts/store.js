import {writable} from 'svelte/store';

export const vault = writable({});
export const activeNetwork = writable({});
export const data = writable({});
export const roles = writable([])
export const account = writable("")
export const tokens = writable([])
export const ethersData = writable([])
export const auditHistory = writable({})
export const fileHash = writable("")
export const fileDropped = writable(File)
export const uploadBtnLoading = writable(false)
export const selectedReceipt = writable({})
export const tokenName = writable('')
