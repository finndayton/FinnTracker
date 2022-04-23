"use strict";
import Head from 'next/head'
import Link from 'next/link'
import { StrictMode, useState } from 'react'
import {checkBase58} from '../utils/validateBase58'
import {checkbech32} from '../utils/validateBECH32'

//there are three current formats for BTC wallet addresses: P2PKH, P2SH, and BECH32 (P2WPKH).  
// ADDR:
// 3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd (P2SH - BASE58) 0.01723052 BTC
// 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2 (P2PKH - BASE58) 4.46170156 BTC
// bc1q0sg9rdst255gtldsmcf8rk0764avqy2h2ksqs5 (BECH32 - P2WPKH) 0.00000000 BTC
// bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq (BECH32 - P2WPKH) 0.11350007 BTC

export default function Home() {

const [inputValue, setInputValue] = useState("");
const [wallets, setWallets] = useState([]);
const [balances, setBalances] = useState({});
const [value, setValue] = useState(0); //total USD value across all wallets


const addNewAddress = (event) => {
  event.preventDefault();
  const address = event.target.address.value;
  const valid = checkBase58(address) || checkbech32(address);
  console.log(`user just attempted to add wallet ${address}. This address is ${valid ? "valid" : "invalid"}`)
  
  if (address.length == 0){
    alert("Please enter a Bitcoin wallet address below.");
  } 
  else if (!isUnique(address)){
    alert("You have already entered that address");
  }
  else if (!valid) {
    //make a pop up
    //clear the content in the search bar 
    alert("The entered Bitcoin wallet address is not valid.");
  } else {

    //add new wallet to wallets list
    setWallets([...wallets, address]);


    //update balaces dictionary by adding (wallet: #BTC) pair
    fetchAddressInfo(address);
  }
  resetInputField();
}

const isUnique = (address) => {
  for (const ad of wallets) {
    if (ad === address) return false;
  }
  return true;
} 

  // Input Field handler
  const handleUserInput = (e) => {
    setInputValue(e.target.value);
  };

  // Reset Input Field handler
  const resetInputField = () => {
    setInputValue("");
  };


const fetchAddressInfo = (address) => {
  fetch("https://api.blockchair.com/bitcoin/addresses/balances", {
    body: `addresses=${address}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  }).then(response => response.json()).then(
      response => {
        const btc_amount = response.data[`${address}`] * 10e-9;
        if (isNaN(btc_amount)) btc_amount = 0;
        console.log(`Address ${address} currently holds ${btc_amount} BTC`)
        const new_balances = {...balances, [address]: btc_amount};
        setBalances(new_balances);     
      }
    );
}

const updateBalance = (event) => {
  console.log("balances = ", balances);
  console.log("event = ", event);
  fetch("https://api.blockchair.com/bitcoin/stats")
  .then(response => response.json())
  .then(response => {
    const btc_price = response.data.market_price_usd;
    console.log("btc_price = ", btc_price);
    updateValue(btc_price);
    }
   );
}

const updateValue = (btc_price) => {
  let new_value = 0;

  wallets.forEach(wallet => new_value += balances[wallet] * btc_price);
  // console.log("new value = ", new_value);
  setValue(new_value.toFixed(2));
  console.log(value);
}

const removeAddress = (address) => {
  //remove address
  console.log("attempting to remove address ", address);
  const new_wallets = wallets;  
  const index = new_wallets.indexOf(address);
  console.log(`index = ${index}`);
  new_wallets.splice(index, 1)
  console.log(`old wallets: ${wallets}, new wallets: ${new_wallets}`)
  setWallets([...new_wallets])
}

// https://api.blockchair.com/{:btc_chain}/addresses/balances?addresses={:comma_separated_list} (GET)

// CURL: curl -v --data "addresses=3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd" https://api.blockchair.com/bitcoin/addresses/

  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className = "header">
          <h1 className="title">
            FinnTracker
          </h1>
          <p className="description">
            All Your Crypto. One Place.
          </p>
        </div>

      <main>
        <div className = "wallet-panel">
          <form onSubmit={addNewAddress}>
            <label>
              Enter a BTC wallet address:
              <input name='address' type="text" value={inputValue} onChange={handleUserInput}/>
            </label>
            <input type="submit" value="Submit" />
          </form>

          <ul className = "saved-wallets">
            {wallets.map(address => (
              <div className = "saved-wallet"> 
                <button onClick={() => removeAddress(address)}>x</button>
                <p>{address}</p>
              </div>
            ))
            }
          </ul>
        </div>
        <div className = "balance-panel">
          <button onClick={updateBalance}>
            Refresh BTC Balance
          </button>
          <div className = "balance"> $ {value} </div>
        </div>
      </main>
      <div className = "footer"> 
          Made in 2022 in Palo Alto
      </div>
      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
