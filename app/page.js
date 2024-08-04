'use client';

import { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Box, Modal, Stack, Typography, TextField, Button, Input, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";
import { ArrowDropUp, ArrowDropDown, Search, Sort, Download, Upload } from '@mui/icons-material';
import { styled } from '@mui/system';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';

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

const ScrollBox = styled(Box)(({ theme, isExpanded }) => ({
  overflowY: 'auto',
  transition: 'max-height 0.5s ease',
  maxHeight: isExpanded ? 'calc(100vh - 80px - 60px)' : 'calc(100% - 60px)',
  position: 'relative',
  marginTop: '40px',
}));

const ToggleButton = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#e0e0e0',
  padding: '8px',
  borderRadius: '2px',
  cursor: 'pointer',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [lowInventory, setLowInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemNum, setItemNum] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("id");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);

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
      if (quantity < numberOf) {
        toast.error("Not enough inventory");
        return;
      }
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

  useEffect(() => {
    checkLowInventory(setLowInventory);
  }, []);

  const filteredInventory = inventory.filter(({ id }) =>
    id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortBy === "quantity") {
      return sortOrder === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity;
    } else {
      return sortOrder === "asc" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    }
  });
  
  const handleSortChange = (sortBy) => {
    setSortOrder(prevSortOrder => prevSortOrder === "asc" ? "desc" : "asc");
    setSortBy(sortBy);
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(inventory);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "inventory.csv";
    link.click();
  };

  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: async (result) => {
          const data = result.data;
  
          for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (!item.id) {
              console.error("Missing 'id' in row: ", item);
              continue;
            }

            const docRef = doc(firestore, 'inventory', item.id);
  
            try {
              await setDoc(docRef, item);
            } catch (error) {
              console.error("Error setting document: ", error);
            }
          }
        },
        header: true,
        skipEmptyLines: true,
        error: (error) => {
          console.error("Error parsing CSV: ", error);
        }
      });
    }
  };

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
        alignItems={"center"}
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
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            gap={2}
          >
            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{
                transform: "translate(-50%, 0%)"
              }}
            >
              Add New Item
            </Button>
            <Stack
              direction={"row"}
              spacing={2}
              justifyContent={"center"}
              alignItems={"center"}
            >
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={importFromCSV}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<Upload />}
              >
                Import
              </Button>
            </label>
            <Button
              variant="contained"
              onClick={exportToCSV}
              startIcon={<Download />}
            >
              Export
            </Button>
            </Stack>
          </Box>
          <Box>
            <Typography
              variant="h2"
              color={"#ffffff"}
              fontSize={64}
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
          height={"90vh"}
          marginTop={"80px"}
          sx={{ borderRadius: 4, padding: 2 }}
        >
          <Stack
            width={"100%"}
            height={"85vh"}
            spacing={2}
            overflow={"auto"}
            sx={{
              borderRadius: "0 0 4px 4px"
            }}
          >
            <Box padding={2} marginTop={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: <Search />,
                }}
              />
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Stack direction="row" alignItems="center">
                        Item Name
                        <IconButton onClick={() => handleSortChange("id")}>
                          <Sort />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" alignItems="center">
                        Quantity
                        <IconButton onClick={() => handleSortChange("quantity")}>
                          <Sort />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedInventory.map(({ id, quantity }) => (
                    <TableRow key={id}>
                      <TableCell component="th" scope="row">
                        {id.charAt(0).toUpperCase() + id.slice(1)}
                      </TableCell>
                      <TableCell align="right">{quantity}</TableCell>
                      <TableCell align="right">
                        <Stack direction={"row"} spacing={1}>
                          <Button
                            variant="contained"
                            onClick={() => removeItem(id, itemNum)}
                            color="error"
                          >
                            Remove
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => addItem(id, itemNum)}
                            color="success"
                          >
                            Add
                          </Button>
                          <Input
                            type="number"
                            placeholder="#"
                            sx={{ width: 60 }}
                            onChange={(e) => setItemNum(parseInt(e.target.value) || 0)}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Box>
      </Box>
      {/* Low Inventory List */}
      <Box
        width={"300px"}
        bgcolor={"#f4f4f4"}
        padding={2}
        position={"fixed"} // Ensure it's fixed to the viewport
        right={0}
        top={"80px"} // Position it right below the header
        overflow={"hidden"}
        height={isExpanded ? 'calc(100vh - 80px)' : '240px'}
        sx={{
          borderLeft: "4px solid #ADD8E6",
          borderRadius: 4,
        }}
      >
        <ToggleButton
          onClick={toggleExpand}
          sx={{
            position: 'absolute', // Position the button absolutely within the Box
            top: 0,
            right: 0,
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
          }}
        >
          {isExpanded ? <ArrowDropUp /> : <ArrowDropDown />}
        </ToggleButton>
        <ScrollBox
          isExpanded={isExpanded}
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
        </ScrollBox>
        <ToastContainer />
      </Box>
    </Box>
  );  
}
