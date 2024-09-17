async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    // Triển khai contract Ownable
    const Ownable = await ethers.getContractFactory("Ownable");
    const ownable = await Ownable.deploy();
    await ownable.deployed();
    console.log("Ownable deployed to:", ownable.address);
  
    // Triển khai contract ItemManager
    const ItemManager = await ethers.getContractFactory("ItemManager");
    const itemManager = await ItemManager.deploy();
    await itemManager.deployed();
    console.log("ItemManager deployed to:", itemManager.address);
  
    // Triển khai contract Migrations
    const Migrations = await ethers.getContractFactory("Migrations");
    const migrations = await Migrations.deploy();
    await migrations.deployed();
    console.log("Migrations deployed to:", migrations.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  