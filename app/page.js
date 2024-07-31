'use client'

import { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Box, Modal, Stack, Typography, TextField, Button } from "@mui/material";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");

  const addItem = async (item) => {
    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  }

  const removeItem = async (item) => {
    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
      await updateInventory();
    }
  }

  const updateInventory = async () => {
    try {
      const inventoryCollection = collection(firestore, 'inventory');
      const snapshot = await getDocs(inventoryCollection);
      const inventoryList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(inventoryList);
      console.log(inventoryList);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width={"100vw"}
      height={"100vh"}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={2}
      sx={{
        background: "#000000"
      }}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position={"absolute"}
          top={"50%"}
          left={"50%"}
          width={400}
          bgcolor={"white"}
          border={"2px solid #ffffff"}
          boxShadow={24}
          padding={4}
          display={"flex"}
          flexDirection={"column"}
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
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
                addItem(itemName)
                setItemName("")
                handleClose()
              }}>
                Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button 
        variant="contained"
        onClick={() => {
          handleOpen()
        }}
      >
        Add New Item
      </Button>
      <Box
        border="2px solid #999"
      >
        <Box
          width={"800px"}
          height={"100px"}
          bgcolor = {"#000000"}
        >
          <Typography 
            variant="h2"
            alignItems={"center"}
            justifyContent={"center"}
            verticalAlign={"middle"}
            display={"flex"}
            color={"#ffffff"}
          >
            Inventory
          </Typography>
        </Box>
        <Stack
          width={"800px"}
          height={"300px"}
          spacing={2}
          overflow={"auto"}
        >
          {inventory.map(({id, quantity}) => (
            <Box
              key={id}
              width={"100%"}
              minHeight={"150px"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"space-between"}
              bgcolor={"#ffffff"}
              padding={5}
            >
              <Typography
                variant="h3"
                color={"#333"}
                textAlign={"center"}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </Typography>
              <Typography
                variant="h3"
                color={"#333"}
                textAlign={"center"}
              >
                {quantity}
              </Typography>
              <Stack direction={"row"} spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => removeItem(id)}
                >
                  Remove
                </Button>
                <Button
                  variant="contained"
                  onClick={() => addItem(id)}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
