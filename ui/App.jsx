import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from '../artifacts/contracts/WavePortal.sol/WavePortal.json'

const contractAddress = "0xeb64FAb389cF819C62b82876B4818C2640b9c5F2"
const contractABI = abi.abi
export default function App() {

  const [status, setStatus] = React.useState("loading");
  const [currentAccount, setCurrentAccount] = React.useState()
  const [waveCount, setWaveCount] = React.useState()
  const [waves, setWaves] = React.useState()
  const [message, setMessage] = React.useState("")
  const [lastEvent, setLastEvent] = React.useState()
  
  React.useEffect(()=>{
    const { ethereum } = window;

    if (!ethereum) {
      setStatus("error")
    } else {
      if (status==="loading") {
        setStatus("checking")
      } else
      if (status=="checking") {
        ethereum.request({ method: 'eth_accounts' }).
        then(accounts => {
          if (accounts.length !== 0) {
            const account = accounts[0];
            setCurrentAccount(account)
            setStatus("ready")
          } else {
            setStatus("no_account")
          }
        }).catch(err=>{
          console.error(err)
          setStatus("error")
        })
      } else {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        if (status==="get_wave_count") {
          wavePortalContract.getTotalWaves().then(setWaveCount).finally(()=>setStatus("ready"))
        } else
        if (status==="get_waves") {
          wavePortalContract.getAllWaves().then(setWaves).finally(()=>setStatus("ready"))
        } else
        if (status==="unwaving") {
          wavePortalContract.unwaveLast( { gasLimit: 300000 } ).then(tx => tx.wait()).then(()=>setStatus("get_wave_count")).catch(err => {
            console.log(err);
            setStatus("error")
          })
        } else
        if (status==="waving") {
          wavePortalContract.wave(message,  { gasLimit: 300000 }).then(tx => tx.wait()).then(()=>setStatus("get_wave_count")).catch(err => {
            console.log(err);
            setStatus("error")
          })
        }  
      }
    }
  }, [status])
  React.useEffect(()=>{
    if (currentAccount) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const listener = (...args)=>{
        setLastEvent({
          name: args[args.length-1].event,
          arguments: args
        })
      }
      wavePortalContract.on("NewWave", listener)
      return ()=>{
        wavePortalContract.off("NewWave", listener)
      }
    }
  }, [currentAccount])

  const getWaveCount = () => {
    setStatus("get_wave_count")
  }
  const getWaves = () => {
    setStatus("get_waves")
  }
  const wave = () => {
    setStatus("waving")
  }
  const unwave = () => {
    setStatus("unwaving")
  }
  const retry = () => {
    setStatus("loading")
  }
  const connect = ()=>{
    const { ethereum } = window;
    const accounts = ethereum.request({ method: "eth_requestAccounts" }).then(()=>setStatus("loading"));
  }
  
  return (
    <>
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">
          The Waving Company
          </div>

          <div className="info">
            Status : {status}
            {status==="no_account" && <span>
              &nbsp;<button onClick={connect}>Connect</button>
            </span>}
          </div>

          {currentAccount && status!=="error" && (
            <>
              <div className="info">
                Account : {currentAccount}
              </div>
              <button disabled={status!=="ready"} className="waveButton" onClick={getWaveCount}>
                Count {typeof waveCount === "undefined" ? "???":waveCount.toString()}
              </button>
              <button disabled={status!=="ready"} className="waveButton" onClick={getWaves}>
                Get waves
              </button>
              <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16}}>
                <textarea style={{flex: 1, marginRight: 5}} onChange={e => setMessage(e.target.value)} value={message}/>
                <button disabled={status!=="ready" || message.length<5} style={{marginTop: 0}} className="waveButton" onClick={wave}>
                  Wave !
                </button>
              </div>
              <button disabled={status!=="ready"} className="waveButton" onClick={unwave}>
                UnWave !
              </button>
            </>
          )}
          {status==="error" && <button className="waveButton" onClick={retry}>
              RETRY
          </button>}

          {waves && (
            <>
              <hr/>
              {waves.filter(w => w.message).map(w => (
                <div>{w.message}</div>
              ))}
            </>
          )}
          {lastEvent && (
            <>
              <hr/>
              <pre>
                {JSON.stringify(lastEvent, undefined, 4)}
              </pre>
            </>
          )}
        </div>
      </div>
      {status!=="ready" && status!=="error" && status!=="no_account" &&
        <div style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "#00000080", display: "flex", alignItems: "center", justifyContent: "center"}}>
          <div className="lds-facebook"><div></div><div></div><div></div></div>
        </div>
      }
    </>
  );
}

