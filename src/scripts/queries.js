export const QUERY = `
          query($id: ID!) {
            offchainAssetReceiptVault(id: $id) {
                id
                totalShares
                address
                deployer
                admin
                name
                certifiedUntil
                symbol
                deployTimestamp
                receiptContractAddress
                shareHolders{
                    address
                }
                roleHolders {
                    role {
                      roleName
                      roleHash
                    }
                    account {
                      address
                    }
                }
                tokenHolders {
                    address
                    balance
                }
                roles(orderBy: roleName){
                    roleName
                    roleHolders{
                      account{
                        address
                      }
                    }
                    roleHash
                },
                roleRevokes{
                    role{
                        roleName
                    }
                    roleHolder{
                        account{
                          address
                        }
                    }
                },
                receiptVaultInformations(orderBy: timestamp, orderDirection: desc) {
                 information
                 id
               }
            }
          }
         `;

export const AUDIT_HISTORY_DATA_QUERY = `
        query($id: ID!) {
          offchainAssetReceiptVault(id: $id) {
            id,
            address,
            totalShares,
            certifiedUntil
            receiptContractAddress
            certifications(orderBy: timestamp, orderDirection: desc)
            {
              timestamp,
              certifier
              {
                address
              },
              id
              data
              certifiedUntil,
              totalShares
                transaction {
                  blockNumber
                }
            },
            deposits(orderBy: timestamp orderDirection:desc) 
            {
              receipt
              {
                id,
                receiptId,
                  receiptInformations(orderDirection: desc, orderBy: timestamp){
                    information
                    id
                    timestamp       
                    emitter {
                     address
                    }        
                    receipt {
                      deposits {
                        amount
                      }
                    }
                  }
                  deposits{
                     amount
                     timestamp
                     id
                  }
              },
              timestamp,
              amount
            }
          }
        }
    `;


export const RECEIPTS_QUERY = `
          query($id: ID!) {
              account(id: $id) {
                address
                id
                receiptBalances {
                    receipt {
                        id
                        receiptId
                        balances {
                          valueExact
                          value
                        }
                        deposits{
                            timestamp
                        }
                        receiptInformations(orderDirection: desc, orderBy: timestamp){
                          information
                          id
                        }
                    }
                }
              }
          }
         `;
export const DEPLOYER_QUERY = `
          query($id: ID!) {
            offchainAssetReceiptVault(id: $id) {
                deployer,
                totalShares
            }
          }
         `;
export const RECEIPT_INFORMATIONS_QUERY = `
          query($id: ID!) {
            receipt(id: $id) {
              id,
              offchainAssetReceiptVault {
                name
                address
                hashes {
                   hash
                }
                roleHolders {
                    role {
                      roleName
                      roleHash
                    }
                    account {
                      address
                    }
                }
              }
              receiptId,
              receiptInformations(orderDirection: desc, orderBy: timestamp){
                information
                id
                transaction {
                  blockNumber
                  id
                }
                timestamp 
                emitter {
                  address
                }        
                receipt {
                  deposits {
                    amount
                  }
                }
              }
              deposits{
                 amount
                 timestamp
                 id
              }
            }
          }
         `;

export const RECEIPT_INFORMATION_QUERY = `
          query($id: ID!) {
            receiptInformation(id: $id){
              information
              id
              transaction {
                blockNumber
                id
              }
              timestamp 
              emitter {
                address
              }        
              receipt {
                deposits {
                  amount
                }
              }
            }
          }
         `;
export const RECEIPT_VAULT_INFORMATION_QUERY = `
          query {
             receiptVaultInformations(orderBy: timestamp, orderDirection: desc) {
               transaction {
                 blockNumber
               }
            }
          }
         `;
export const VAULT_INFORMATION_QUERY = `
          query($id: ID!) {
            offchainAssetReceiptVault(id: $id) {
              id,
              receiptContractAddress
               receiptVaultInformations(orderBy: timestamp, orderDirection: desc) {
                 information
                 id
                 timestamp
                 transaction{
                   blockNumber
                 }
               }
            }
          }
         `;

export const VAULTS_QUERY = `
        query {
          offchainAssetReceiptVaults(orderBy:deployTimestamp orderDirection:desc first:200){
            deployer
            name
            address
            symbol
            deployBlock
            deployTimestamp
            totalShares
            receiptContractAddress
            tokenHolders {
                address
                balance
            }
            roleHolders {
              role {
                roleName
                roleHash
              }
              account {
                address
              }
            }
            receiptVaultInformations(orderBy: timestamp, orderDirection: desc) {
              information
              id
              timestamp
            }
          }
        }`;

export const DEPOSITS_QUERY = `
          query($id: ID!) {
            offchainAssetReceiptVault(id: $id) {
              deposits(orderBy: timestamp, orderDirection: desc) {
                amount
                transaction {
                 blockNumber
                }
                receipt {
                  receiptInformations(orderDirection: desc, orderBy: timestamp){
                    id
                    schema
                    timestamp
                    emitter {
                     address
                    }
                    receipt {
                      deposits {
                        amount
                      }
                    }
                  }
                }
              }
            }
          }
         `;
export const ADDRESS_OVERVIEW_QUERY = `
              query($address: String!) {
                offchainAssetReceiptVaults(orderDirection: desc, orderBy: deployTimestamp, first: 200) {
                  certifications(
                      where: {certifier_: {address: $address}}
                      orderDirection: desc
                      orderBy: timestamp
                    ) 
                    {
                      id
                      totalShares
                      emitter {
                        address
                      }
                      transaction{
                        id
                      }
                      timestamp
                  }
                  shareConfiscations(
                    where: {confiscator_: {address: $address}}
                    orderBy: timestamp
                    orderDirection: desc
                    ) 
                    {
                    confiscated
                    confiscatee {
                      address
                    }
                    confiscator {
                      address
                    }
                    id
                    timestamp
                    transaction {
                      id
                    }
                    offchainAssetReceiptVault{
                      name
                    }
                  } 
                  receiptConfiscations(
                    where: {confiscator_: {address: $address}}
                    orderBy: timestamp
                    orderDirection: desc
                    ) 
                    {
                    confiscated
                    confiscatee {
                      address
                    }
                    confiscator {
                      address
                    }
                    id
                    timestamp
                    transaction {
                      id
                    }
                    offchainAssetReceiptVault{
                      name
                    }
                    receipt{
                      receiptId
                      id
                      receiptInformations(orderBy: timestamp, orderDirection: desc first:1) {
                        information
                        id
                        transaction{
                            id
                        }
                      }
                    }
                  }
                }
              }
             `;

export const VAULTS_BY_DEPLOYER_QUERY = `
        query($address: String!) {
            offchainAssetReceiptVaults(
              orderDirection: desc
              orderBy: deployTimestamp
              first: 200
              where: {deployer: $address}
            ) 
            {
              id
              name
              totalShares
              address
            }
        }
       `

export const ACCOUNT_PINS_QUERY = `
    query($address: String!) {
      accounts(where: {address: $address}) {
          address
          hashes {
            hash
          }
        }
 }`
export const REVISIONS_DATA_QUERY =
    `query($address: String!) {
       depositWithReceipts(
           where: {caller_: {address: $address}}
       orderBy: timestamp
       orderDirection: desc
       first: 200
       )
       {
           offchainAssetReceiptVault {
           id
           name
           address
       }
           id
           caller {
           address
       }
           transaction{
           id
       }
           amount
           timestamp
           receipt {
           id
           receiptId
           receiptInformations(orderBy: timestamp, orderDirection: asc) {
               information
               id
               transaction{
                   id
               }
           }
       }
      }
      withdrawWithReceipts(
        where: {caller_: {address: $address}}
        orderBy: timestamp
        orderDirection: desc
        first: 200
        )
        {
            offchainAssetReceiptVault {
             id
             name
             address
            }
            id
            caller {
             address
            }
            transaction{
             id
            }
            amount
            timestamp
            receipt {
              id
              receiptId
              receiptInformations(orderBy: timestamp, orderDirection: asc) {
                information
                id
                transaction{
                    id
                }
              }
            }
        }
        receiptInformations(
                where: {caller_: {address: $address}}
                first: 200
                orderBy: timestamp
                orderDirection: desc
              ) {
                information
                id
                caller {
                  address
                }
                timestamp
                transaction{
                 id
                }
                receipt {
                  id
                  receiptId
                }
                offchainAssetReceiptVault {
                  id
                  name
                }
            }
}`
export const CERTIFICATION_QUERY = `
          query($id: ID!, $certifyId: ID!) {
            offchainAssetReceiptVault(id: $id) 
            {
              certifications(where:{id:$certifyId}) 
              {
                id
                information
                timestamp
              }
            }
          }   
         `;
export const CURRENT_CERTIFICATION_QUERY = `
          query($id: ID!, $certifiedUntil: String!) {
            offchainAssetReceiptVault(id: $id) 
            {
              certifications(orderBy: timestamp orderDirection: desc where:{certifiedUntil:$certifiedUntil}) 
              {
                id
                information
                timestamp
              }
            }
          }   
         `;