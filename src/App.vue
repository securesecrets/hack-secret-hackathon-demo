<script setup lang="ts">
import { 
  requestMetamaskAccounts$,
  getMetamaskSecretAddress$,
  getMetamaskSecretWalletSigner$
 } from '@/metamask';
import { ref } from 'vue';
import { SecretNetworkClient } from 'secretjs';
import { createEncryptionSeed } from './utils';
import { MsgExecuteContract } from 'secretjs';

const secretAddress = ref('')
const getBalanceResponse = ref()
const getPublicBalanceResponse = ref()
const txHash = ref('');
const txData = ref();

const secretQueryClient = new SecretNetworkClient({
    url: "https://lcd.testnet.secretsaturn.net/",
    chainId: "pulsar-3",
  })

async function queryBalance() {
  try{
  getBalanceResponse.value = await secretQueryClient.query.compute.queryContract({
    contract_address: "secret13w6n5u3kpvqdunkavgfy40d7ma85xuhxrcxd0a",
    code_hash: "31cbe386f9b8f04994a7f3fa097ce52b713527da235f22658aa2ba413138dc5f",
    query: {
        balance: {
          address: "secret1zezfylvuxkz3qz4qvz3c5yjj3g2xw7epwp06nf",
          key: "UNKOWN_KEY",
        },
      } 
  })

} catch(err) {
  console.log(err)
  }
}

async function getPublicBalances() {
  getPublicBalanceResponse.value = await secretQueryClient.query.bank.allBalances({address: "secret1zezfylvuxkz3qz4qvz3c5yjj3g2xw7epwp06nf"})
}

function approve() {
  requestMetamaskAccounts$().subscribe();
}

function getAddress() {
  getMetamaskSecretAddress$().subscribe({
    next: (address) => {
      secretAddress.value = address;

    }
  })
}

let metamaskSigner: any;

function createSigningClient() {
  getMetamaskSecretWalletSigner$().subscribe({
    next: ({signer}) => {
      metamaskSigner = signer;
    }
  })
}

async function createViewingKey() {

  const secretSigningClient = new SecretNetworkClient({
    url: "https://lcd.testnet.secretsaturn.net/",
    chainId: "pulsar-3",
    wallet: metamaskSigner,
    walletAddress: "secret1zezfylvuxkz3qz4qvz3c5yjj3g2xw7epwp06nf",
    encryptionSeed: createEncryptionSeed("RANDOM_STRING")
  })

  const viewingKeyMsg = { set_viewing_key: { key: "NEW_VEIWING_KEY" } }

  const msg = new MsgExecuteContract({
    sender: "secret1zezfylvuxkz3qz4qvz3c5yjj3g2xw7epwp06nf", 
    contract_address: "secret13w6n5u3kpvqdunkavgfy40d7ma85xuhxrcxd0a",
    code_hash: "31cbe386f9b8f04994a7f3fa097ce52b713527da235f22658aa2ba413138dc5f",
    msg: viewingKeyMsg,
  });

 const response = await secretSigningClient.tx.broadcast([msg], {
    gasLimit: 250000
  })
  console.log(response)

  txHash.value = response.transactionHash
}

async function getTxData() {


  const secretSigningClient = new SecretNetworkClient({
    url: "https://lcd.testnet.secretsaturn.net/",
    chainId: "pulsar-3",
    wallet: metamaskSigner,
    walletAddress: "secret1zezfylvuxkz3qz4qvz3c5yjj3g2xw7epwp06nf",
    encryptionSeed: createEncryptionSeed("RANDOM_STRING")
  })

 txData.value = await secretSigningClient.query.getTx(txHash.value);
}


</script>
<template>
<div class="container">
  <button @click="queryBalance" class="btn">
    query SHD Balance
  </button>
  {{ getBalanceResponse }}


  <!-- <button @click="approve" class="btn">
    approve metamask connection (1 time setup)
  </button> -->


  <!-- <button @click="getAddress" class="btn">
    getAddress
  </button>
  {{ secretAddress }} -->

<!-- 
  <button @click="getPublicBalances" class="btn">
    get public balances
  </button>
  {{ getPublicBalanceResponse }} -->


  <!-- <button @click="createSigningClient" class="btn">
    create Signing Client
  </button> -->


  <!-- <button @click="createViewingKey" class="btn">
    create Viewing Key
  </button>
  {{ txHash }} -->


  <!-- <button @click="getTxData" class="btn">
    get Tx Data
  </button>
  {{ txData }} -->
</div>
</template>
<style lang='scss'>
  .container {
    display: flex;
    flex-direction: column;
  }
  .btn {
    width: 200px;
    margin-bottom: 10px;
  }
</style>


