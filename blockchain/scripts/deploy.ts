import { ethers } from "hardhat";

async function main() {
  const RealEstateMarketplace = await ethers.getContractFactory("RealEstateMarketplace");
  const marketplace = await RealEstateMarketplace.deploy();
  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log(`export const CONTRACT_ADDRESS = '${address}';`);
  return address;
}

main()
  .then((address) => {
    console.log("RealEstateMarketplace deployed to:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 