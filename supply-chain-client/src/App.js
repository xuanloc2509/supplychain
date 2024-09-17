import React, { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import './App.css';
import ItemManagerABI from './artifacts/contracts/ItemManager.sol/ItemManager.json';

const itemManagerAddress = '0xB581C9264f59BF0289fA76D61B2D0746dCE3C30D'; // Địa chỉ contract ItemManager sau khi deploy

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [itemManagerContract, setItemManagerContract] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState(0);
  const [items, setItems] = useState([]);

  // Hàm kết nối với MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const itemManagerContract = new ethers.Contract(itemManagerAddress, ItemManagerABI.abi, signer);

        setProvider(provider);
        setSigner(signer);
        setItemManagerContract(itemManagerContract);
      } catch (err) {
        console.error('Error connecting to MetaMask:', err);
      }
    } else {
      console.log('MetaMask not detected');
    }
  };

  // Hàm tạo item
  const createItem = async () => {
    if (!itemName || !itemPrice) return;

    try {
      // Gửi giao dịch để tạo item
      const tx = await itemManagerContract.createItem(
        itemName,
        ethers.utils.parseEther(itemPrice.toString())
      );
      await tx.wait();
      console.log('Item created');
      setItemName('');
      setItemPrice(0);
      fetchItems(); // Cập nhật danh sách items
    } catch (err) {
      console.error('Error creating item:', err);
      if (err.data && err.data.message) {
        console.error('Error details:', err.data.message);
      }
      if (err.message) {
        console.error('Error message:', err.message);
      }
    }
  };

  // Hàm lấy danh sách items
  const fetchItems = useCallback(async () => {
    if (!itemManagerContract) return;

    try {
      const itemIndex = await itemManagerContract.itemIndex();
      const fetchedItems = [];

      for (let i = 0; i < itemIndex; i++) {
        const item = await itemManagerContract.items(i);
        fetchedItems.push({
          identifier: item._identifier,
          price: ethers.utils.formatEther(item._itemPrice),
          state: item._state,
        });
      }

      setItems(fetchedItems);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  }, [itemManagerContract]);

  // useEffect để gọi fetchItems khi itemManagerContract thay đổi
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Hàm chuyển đổi trạng thái item thành chuỗi mô tả
  const getItemState = (state) => {
    switch (state) {
      case 0:
        return "Created";
      case 1:
        return "Paid";
      case 2:
        return "Delivered";
      default:
        return "Unknown";
    }
  };

  // Hàm trigger thanh toán cho item
  const triggerPayment = async (index) => {
    try {
      const priceInWei = ethers.utils.parseEther(items[index].price);
      const tx = await itemManagerContract.triggerPayment(index, { value: priceInWei });
      await tx.wait();
      fetchItems();
    } catch (err) {
      console.error('Error triggering payment:', err);
    }
  };

  // Hàm trigger giao hàng cho item
  const triggerDelivery = async (index) => {
    try {
      const tx = await itemManagerContract.triggerDelivery(index);
      await tx.wait();
      fetchItems();
    } catch (err) {
      console.error('Error triggering delivery:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Supply Chain DApp</h1>

        {!provider || !signer ? (
          <button onClick={connectMetaMask}>Connect MetaMask</button>
        ) : (
          <>
            <div className="item-form">
              <input
                type="text"
                placeholder="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Item Price (ETH)"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              />
              <button onClick={createItem}>Create Item</button>
            </div>

            <h2>Items List</h2>
            <div className="items-list">
              {items.length === 0 ? (
                <p>No items available</p>
              ) : (
                items.map((item, index) => (
                  <div key={index} className="item">
                    <p>Identifier: {item.identifier}</p>
                    <p>Price: {item.price} ETH</p>
                    <p>State: {getItemState(item.state)}</p>
                    {item.state === 0 && (
                      <button onClick={() => triggerPayment(index)}>Pay</button>
                    )}
                    {item.state === 1 && (
                      <button onClick={() => triggerDelivery(index)}>Deliver</button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
