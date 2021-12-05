const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
    const waveContract = await waveContractFactory.deploy({
      value: hre.ethers.utils.parseEther('0.001'),
    });
    await waveContract.deployed();
  
    console.log("Contract deployed to:", waveContract.address);
    console.log("Contract deployed by:", owner.address);

    let waveTxn = await waveContract.wave("first wave");
    await waveTxn.wait();
    waveTxn = await waveContract.wave("second wave");
    await waveTxn.wait();
    waveTxn = await waveContract.wave("third wave");
    await waveTxn.wait();

    /*
    let contractBalance = await hre.ethers.provider.getBalance(
      waveContract.address
    );
    console.log(
      'Contract balance:',
      hre.ethers.utils.formatEther(contractBalance)
    );

    let waveCount;
    waveCount = await waveContract.getTotalWaves();
    
    let waveTxn = await waveContract.wave("test");
    await waveTxn.wait();

    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log(
      'Contract balance:',
      hre.ethers.utils.formatEther(contractBalance)
    );

    let lastWave = await waveContract.getMyLastWave();
    if (lastWave!=="test") {
      throw new Error("My last wave is not test !")
    }

    waveCount = await waveContract.getTotalWaves();

    waveTxn = await waveContract.connect(randomPerson).wave("can't");
    await waveTxn.wait();

    waveTxn = await waveContract.unwaveLast();
    await waveTxn.wait();

    waveTxn = await waveContract.connect(randomPerson).unwaveLast();
    await waveTxn.wait();

    waveCount = await waveContract.getTotalWaves();

    let waves = await waveContract.getAllWaves();
    console.log("WAVES: ", waves)

    waveTxn = await waveContract.wave("wave random 1");
    await waveTxn.wait();
    waveTxn = await waveContract.wave("wave random 2");
    await waveTxn.wait();
    waveTxn = await waveContract.wave("wave random 3");
    await waveTxn.wait();

    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log(
      'Contract balance:',
      hre.ethers.utils.formatEther(contractBalance)
    );
*/
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();