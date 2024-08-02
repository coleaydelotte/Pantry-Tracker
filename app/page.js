'use client'

import { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Box, Modal, Stack, Typography, TextField, Button, Input } from "@mui/material";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemNum, setItemNum] = useState(null);

  const addItem = async (item, numberOf) => {
    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);

    if (numberOf === null) {
      numberOf = 1;
    }

    if (numberOf === "e") {
      return;
    }

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + numberOf });
    } else {
      await setDoc(docRef, { quantity: numberOf });
    }
    await updateInventory();
  };

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
  };

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
        background: "#ffffff",
      }}
    >
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
            borderRadius: 4
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
                addItem(itemName, null)
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
        width={"800px"}
        border="2px solid #999"
        bgcolor={"#f4f4f4"}
        sx={{ borderRadius: 4, padding: 2 }}
      >
        <Box
          width={"100%"}
          height={"100px"}
          bgcolor={"#f4f4f4"}
          sx={{ borderRadius: '4px 4px 0 0', padding: 1 }}
        >
          <Typography 
            variant="h2"
            alignItems={"center"}
            justifyContent={"center"}
            verticalAlign={"middle"}
            display={"flex"}
            color={"#000000"}
          >
            Inventory
          </Typography>
        </Box>
        <Stack
          width={"100%"}
          height={"300px"}
          spacing={2}
          overflow={"auto"}
          sx={{ borderRadius: '0 0 4px 4px' }}
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
              sx={{ borderRadius: 4, border: '1px solid #999' }}
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
                  onClick={() => addItem(id, itemNum)}
                >
                  Add
                </Button>

                <Input
                  type="number"
                  placeholder="Quantity"
                  sx={{ width: 80 }}
                  onChange={(e) => setItemNum(parseInt(e.target.value))}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
