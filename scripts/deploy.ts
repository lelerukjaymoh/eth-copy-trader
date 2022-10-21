import { ethers } from "hardhat";

const main = async () => {
  const factory = await ethers.getContractFactory("CopyV2");
  const deployedSwapper = await factory.deploy();

  let data = {
    address: deployedSwapper.address,
    abi: JSON.parse(JSON.stringify(deployedSwapper.interface.format("json"))),
  };

  console.log(data);
  //   const abiBuildPath = path.resolve(__dirname, '../', "src", "abi");
  //   fs.removeSync(abiBuildPath);
  //   fs.outputJSONSync(path.resolve(abiBuildPath, `IPanacakeSwap.json`), data);
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
