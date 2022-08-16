import React, { Component, useEffect, useState } from 'react';
import DVideo from '../abis/DVideo.json'
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

const projectId = '2DDxh3LUe1hg9Uaf7IjdVBwu1QQ'
const projectSecret = '653db6383684e5d1c3c3c0ef822a60fd'
//Declare IPFS
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ 
  host: 'ipfs.infura.io', 
  port: '5001', 
  protocol: 'https',
  headers: {
    authorization: auth
  }
});

const App = () => {

  const [account, setAccount] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [contract, setContract] = useState({})
  const [videoBuffer, setVideoBuffer] = useState()
  const [videos, setVideos] = useState([])
  const [currentHash, setCurrentHash] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')

  useEffect(() => {
    const load = async () => {
      await loadWeb3()
      await loadBlockchainData()
    }
    load()
  }, [])

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  const loadBlockchainData = async () => {
    setIsLoading(true)
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])

    const networkId = await web3.eth.net.getId()
    const networkData = DVideo.networks[networkId]
    if (networkData) {
      const abi = DVideo.abi
      const address = networkData.address
      const dvideo = new web3.eth.Contract(abi, address)
      setContract(dvideo)
      const videoCount = await dvideo.methods.videoCount().call()
      
      for (var i = videoCount; i >= 1; i--) {
        const video = await dvideo.methods.videos(i).call()
        setVideos(videos => [...videos, video])
      }

      const latest = await dvideo.methods.videos(videoCount).call()
      setCurrentHash(latest.hash)
      setCurrentTitle(latest.title)

    } else {
      alert('Smart contract not deployed to detected network.');
    }
    setIsLoading(false)
  }

  //Get video
  const captureFile = buffer => {
    setVideoBuffer(buffer)
  }

  //Upload video
  const uploadVideo = title => {
    console.log("Submitting file to IPFS...")
    setIsLoading(true)
    ipfs.add(videoBuffer, (err, result) => {
      if (err) {
        console.error(err)
        return
      }
      contract.methods.uploadVideo(result[0].hash, title)
        .send({ from: account })
        .on('transactionHash', (hash) => {
          setIsLoading(false)
        })
    })
  }

  //Change Video
  const changeVideo = (hash, title) => {
    setCurrentHash(hash)
    setCurrentTitle(title)
  }

  return (
    <div>
      <Navbar 
        account={account}
      />
      { isLoading
        ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
        : <Main
            uploadVideo={uploadVideo}
            captureFile={captureFile}
            videos={videos}
            changeVideo={changeVideo}
            currentHash={currentHash}
            currentTitle={currentTitle}
          />
      }
    </div>
  );
}

export default App;