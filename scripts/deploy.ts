import { ethers } from "hardhat";
import { botParameters } from "../src/config/setup";

const main = async () => {
  const [deployer] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("Swapper");
  const deployedSwapper = await factory.deploy(botParameters.uniswapv2Router);

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
