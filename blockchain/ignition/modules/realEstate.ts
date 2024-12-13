import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RealEstateMarketplaceModule = buildModule("RealEstateMarketplaceModule", (m) => {
  // Deploy the RealEstateMarketplace contract
  const realEstateMarketplace = m.contract("RealEstateMarketplace", [], {
    // Optional: you can pass custom deploy arguments or override settings here
  });

  // You can add additional deployment logic or dependencies if needed
  return { realEstateMarketplace };
});

export default RealEstateMarketplaceModule;