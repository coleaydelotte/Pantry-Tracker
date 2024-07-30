import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/material";

const items = [
    'tomato',
    'fries',
    'pollo',
    'tartare',
    'spaghetti',
    'pizza',
    'hamburger',
    'sushi',
    'sashimi',
    'ramen',
    'tacos'
]

export default function Home() {
  return (
    <Box 
    width="100vw"
    height="100vh"
    display={"flex"}
    justifyContent={"center"}
    flexDirection={"column"}
    alignItems={"center"}
    >
      <Box width={"800px"} height={"100px"} bgcolor={"#CBC3E3"}>
        <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
          Pantry Items
        </Typography>
      </Box>
      <Stack width="800px" height="300px" spacing={2} overflow={"scroll"}>
        {
          items.map((i) => (
            <Box 
            key={i}
            width="100%"
            height="100px"
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            bgcolor={"#f0f0f0"}
            >
            <Typography
            variant="h3"
            color={"#333"}
            textAlign={"center"}
            // fontWeight={"bold"}
            >
              { //Capitalizing the first letter of the string
                i.charAt(0).toUpperCase() + i.slice(1)
              }
            </Typography>
            </Box>
          ))
        }
      </Stack>
    </Box>
  );
}
