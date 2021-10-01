import path from "path";
import { ethers } from "hardhat";

const main = async () => {
  const [deployer] = await ethers.getSigners();
  const IPanacakeSwapFactory = await ethers.getContractFactory("Swapper");
  const iPanacakeSwap = await IPanacakeSwapFactory.deploy();

  let data = {
    address: iPanacakeSwap.address,
    abi: JSON.parse(JSON.stringify(iPanacakeSwap.interface.format("json"))),
  };

  console.log(data)

};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
