import { ethers } from "ethers";
import { useState } from "react";
import { ItemManager } from "./ItemManager.json"; // Đảm bảo bạn đã import ABI đúng cách

const createItem = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const itemManagerContract = new ethers.Contract(
      "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853", // Địa chỉ contract
      ItemManager.abi,
      signer
    );
    const tx = await itemManagerContract.createItem("Sample Item", ethers.utils.parseUnits("1", "ether"));
    await tx.wait();
    console.log("Item created successfully");
  } catch (error) {
    console.error("Error creating item:", error);
  }
};

function App() {
  return (
    <div>
      <button onClick={createItem}>Create Item</button>
    </div>
  );
}

export default App;
