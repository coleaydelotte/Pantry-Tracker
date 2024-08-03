'use client'

import { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Box, Modal, Stack, Typography, TextField, Button, Input } from "@mui/material";
import Link from 'next/link';

async function checkLowInventory(setLowInventory) {
  const inventoryCollection = collection(firestore, 'inventory');
  const snapshot = await getDocs(inventoryCollection);
  const inventoryList = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const lowInventoryItems = inventoryList.filter(item => item.quantity < 5);
  setLowInventory(lowInventoryItems);
}

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [lowInventory, setLowInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemNum, setItemNum] = useState(0);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const addItem = async (item, numberOf) => {
    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);

    if (!numberOf) {
      numberOf = 1;
    }

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + numberOf });
    } else {
      await setDoc(docRef, { quantity: numberOf });
    }
  };

  const removeItem = async (item, numberOf) => {
    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);
  
    if (!numberOf) {
      numberOf = 1;
    }
  
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      const newQuantity = quantity - numberOf;
  
      if (newQuantity <= 0) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: newQuantity });
      }
    }
  };
  

  useEffect(() => {
    const inventoryCollection = collection(firestore, 'inventory');
    
    const unsubscribe = onSnapshot(inventoryCollection, (snapshot) => {
      const inventoryList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(inventoryList);

      const lowInventoryItems = inventoryList.filter(item => item.quantity < 5);
      setLowInventory(lowInventoryItems);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box
      width={"100vw"}
      height={"100vh"}
      display={"flex"}
      flexDirection={"row"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={2}
      sx={{
        background: "#3b3b3b",
      }}
    >
      {/* Main Content */}
      <Box
        flex={1}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"left"}
        gap={2}
      >
        {/* Header */}
        <Box
          width={"100%"}
          height={"80px"}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          padding={"0 20px"}
          bgcolor={"#141414"}
          position={"fixed"}
          top={0}
        >
          <Typography
            variant="h5"
            color={"#f9f9f9"}
            fontStyle={{
              fontFamily: "Arial, sans-serif"
            }}
          >
            Inventory Management
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpen}
          >
            Add New Item
          </Button>
          <Box>
            <Typography
              variant="h2"
              fontStyle={{
                fontFamily: "Arial, sans-serif"
              }}
            >
                C^2
            </Typography>
          </Box>
        </Box>

        <Modal open={open} onClose={handleClose}>
          <Box
            position={"absolute"}
            top={"50%"}
            left={"50%"}
            width={400}
            bgcolor={"#f4f4f4"}
            border={"2px solid #999"}
            boxShadow={24}
            padding={4}
            display={"flex"}
            flexDirection={"column"}
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)",
              borderRadius: 4,
            }}
          >
            <Typography variant="h6">Add Item</Typography>
            <Stack width={"100%"} direction={"row"} spacing={2}>
              <TextField
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Item Name"
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName, null);
                  setItemName("");
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Box
          width={"800px"}
          border="4px solid #ADD8E6"
          bgcolor={"#f4f4f4"}
          height={"80vh"}
          sx={{ borderRadius: 4, padding: 2 }}
        >
          <Stack
            width={"100%"}
            height={"80vh"}
            spacing={2}
            overflow={"auto"}
            sx={{
              borderRadius: "0 0 4px 4px"
            }}
          >
            {inventory.map(({ id, quantity }) => (
              <Box
                key={id}
                width={"100%"}
                height={"100px"}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                bgcolor={"#ffffff"}
                padding={3}
                sx={{
                  borderRadius: 4,
                  border: "4px solid #000000" 
                }}
              >
                <Typography
                  variant="h5"
                  color={"#333"}
                  textAlign={"center"}
                  width={"25%"}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </Typography>
                <Typography
                  variant="h5"
                  color={"#333"}
                  textAlign={"center"}
                >
                  {quantity}
                </Typography>
                <Stack
                  direction={"row"}
                  spacing={2}
                  height={"100%"}
                >
                  <Button
                    variant="contained"
                    onClick={() => removeItem(id, itemNum)}
                    color="error"
                  >
                    <Typography
                      variant="h6"
                    >
                      Remove
                    </Typography>
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => addItem(id, itemNum)}
                    color="success"
                  >
                    <Typography
                      variant="h6"
                    >
                      Add
                    </Typography>
                  </Button>
                  <Input
                    type="number"
                    placeholder="#"
                    sx={{ width: 60 }}
                    onChange={(e) => setItemNum(parseInt(e.target.value) || 0)}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
      {/* Low Inventory List */}
      <Box
        width={"300px"}
        height={"100vh"}
        bgcolor={"#f4f4f4"}
        padding={2}
        position={"fixed"}
        right={0}
        top={0}
        marginTop={80}
        overflow={"auto"}
        sx={{
          borderLeft: "4px solid #ADD8E6", 
          borderRadius: 4 
        }}
      >
        <Typography
          variant="h6"
          fontWeight={"bold"}
          marginBottom={2}
        >
          Low Inventory
        </Typography>
        {lowInventory.length === 0 ? (
          <Typography>No items are low in stock.</Typography>
        ) : (
          lowInventory.map(({ id }) => (
            <Box
              key={id}
              marginBottom={2}
              padding={2}
              bgcolor={"#ffffff"}
              border={"2px solid #999"}
              borderRadius={2}
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography>{id.charAt(0).toUpperCase() + id.slice(1)}</Typography>
              <Typography color={"#f00"}>Low</Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
