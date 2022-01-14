import Onboard from "bnc-onboard";
import Web3 from "web3";
import { useState} from "react";
import ABI from "./contractABI.json";
import RangeSlider from "react-bootstrap-range-slider";
const { ethers } = require("ethers");



const contractAddress = "0x8A8a0Ade2cdEbdeE95914B55c0C7D51884b81457";

    const wallets = [
        { walletName: "metamask", preferred: true }
    ]

    var web3;
    var myContract;
    var notifier = false;

    const onboard = Onboard({
        dappId: "d86c8312-381b-48e7-8a3b-dcacb5f6d89b",//blocknative
        networkId: 4, //4 Rinkeby
        walletSelect: {
            wallets: wallets
        },
        subscriptions: {
            wallet: (wallet) => {
                window.localStorage.setItem("selectedWallet", wallet.name)
                web3 = new Web3(wallet.provider)
                myContract = new web3.eth.Contract(ABI, contractAddress)
            }
        }
    })


const ConnectWallet = () => {
    

    

    const [walletAddress,setWalletAddress] = useState("Not connected");

    async function login() {
        const walletSelected = await onboard.walletSelect();
        if (walletSelected !== false) {
            await onboard.walletCheck();
            setWalletAddress(onboard.getState().address);
            notifier = true;
        }
    }

    return (
        <div>
            <button onClick={login}>Connect Wallet</button>
            <p>{walletAddress}</p>
        </div>
    )
}
const Mint = () => {
    
   
    var [price,setPrice] = useState(40);
    var [amount,setAmount] = useState(1);
    var [totalMinted,setTotalMinted] = useState("");

    async function getPrice () {
        myContract.methods.getPrice()
            .call()
            .then((res) => {
                setPrice(ethers.utils.formatEther(res));
            })
            .catch((err) => {
                console.error(err);
            });
    }

    async function getTotalMinted(){
        myContract.methods.totalMinted()
            .call()
            .then((res) => {
                setTotalMinted(res);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    


    const buyNFT = async () => {
        
        const currentState = onboard.getState();
        let totalPrice = ethers.utils.parseEther((amount * price).toString());
        myContract.methods.mint(amount)
            .send({ from: currentState.address, value: totalPrice })
            .on("transactionHash", (hash) => {
                console.log(hash);
            })
            .on("confirmation", (confirmationNumber, reciept) => {
                console.log(confirmationNumber);
            })
            .on("reciept", (reciept) => {
                console.log(reciept);
            })
            .on("error", (err) => {
                console.error(err);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    return (
        <div>
            <p>{amount * price} Matic</p>
            <p>{totalMinted}/10000</p>
            <RangeSlider
                value={amount}
                onChange={changeEvent => {
                    setAmount(changeEvent.target.value);
                    if(notifier){
                        getPrice();
                        getTotalMinted();
                    }
                }}
                min={1}
                max={10}
                step={1}
            />
            <button onClick={buyNFT}>Mint NFT</button>
        </div>
    )
}

export{ConnectWallet,Mint};