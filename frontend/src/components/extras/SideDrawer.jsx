import React, { useState } from 'react'
import { Box } from "@chakra-ui/layout"
import { useDisclosure, Avatar, Button, Drawer, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Tooltip, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, Toast, Spinner  } from "@chakra-ui/react"
import { Text } from '@chakra-ui/react'
import { BellIcon , ChevronDownIcon } from "@chakra-ui/icons"
import { ChatState } from '../../Context/ChatProvider'
import ProfileModal from './ProfileModal'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import ChatLoading from './ChatLoading'
import UserListItem from '../UserAvatar/UserListItem'
import axios from 'axios'
import { getSender } from '../../config/ChatLogics'
import { Effect } from 'react-notification-badge'
import  NotificationBadge  from 'react-notification-badge'



const SideDrawer = () => {
  const [search , setSearch] = useState("")
  const [searchResult , setSearchResult] = useState([])
  const [loading , setLoading ] = useState(false)
  const[loadingChat , setLoadingChat] = useState()
  const toast = useToast()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const navigate = useNavigate()

  const logoutHandler = () =>{
    localStorage.removeItem("userInfo");
    navigate('/')
  }


  
  const { user , setSelectedChat , chats , setChats ,notification , setNotification} = ChatState()

  const handleSearch = async () =>{
    if(!search){
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left"
      })
      return
    }

    try {
      setLoading(true)
      const config = {
        headers:{
          Authorization:`Bearer ${user.token}`
        }
      }

      const { data } = await axios.get(`/api/user?search=${search}`, config)
      setLoading(false)
      setSearchResult(data)
    } catch (error) {
      toast({
        title: "Error Occured",
        description: "Failed to load the search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      })

      console.log(error);
      return
    }
  }

  const accessChat = async (userId) =>{
     try {
      setLoadingChat(true)
       const config = {
        headers:{
          "Content-type":"application/json",
          Authorization:`Bearer ${user.token}`
        }
      }

      const { data } = await axios.post(`/api/chat`, {userId}, config) 

      if(!chats.find((c)=> c._id === data._id)) setChats([data, ...chats])
      setSelectedChat(data)
      setLoadingChat(false)
      onClose()      
     } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      })

      console.log(error);
      return
     }
  }
  return (
   <>
    <Box 
    display='flex'
    justifyContent='space-between'
    bg='white'
    w='100%'
    p='5px 10px 5px 10px'
    borderWidth='5px'
    >
      <Tooltip label='Search user to chat' hasArrow placement='bottom'>
        <Button variant="ghost" onClick={onOpen}>
          <i class="fas fa-search"></i>
           <Text display={{base: "none", md: "flex"}} px='4'>
             Search User
           </Text>
          </Button>
      </Tooltip>

      <Text fontSize='2xl' fontFamily='Work sans' fontWeight='600'>Conversa</Text>

      <div>
        <Menu>
           <MenuButton p={1}>
            <NotificationBadge 
            count={notification.length}
            effect={Effect.SCALE}
            />
            <BellIcon fontSize="2xl" m={1}/>
           </MenuButton>

           <MenuList pl={3}>
            { !notification.length && "No new messages"}
            {
              notification.map((notif)=>{
                return(
                  <MenuItem key={notif._id} onClick={()=> {
                    setSelectedChat(notif.chat)
                    setNotification(notification.filter((n)=> n !== notif))
                  }}>
                   { notif.chat.isGroupChat ?  `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user,notif.chat.users)}`}
                  </MenuItem>
                )
              })
            }
           </MenuList>
        </Menu>


        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
            <Avatar size='sm' cursor='pointer' name={user.name} src={user.pic}/>
          </MenuButton>

          <MenuList>
            <ProfileModal user={user}>
            <MenuItem>My Profile</MenuItem>
            </ProfileModal>
            <MenuDivider/>
            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </div>
    </Box>



    <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay/>
      <DrawerContent>
        <DrawerHeader borderBottomWidth='1px'>Search Users</DrawerHeader>

        <DrawerBody>
        <Box display='flex' pb={2}>
          <Input placeholder='Search By name or email' mr={2} value={search} onChange={(e)=> setSearch(e.target.value)}/>
          <Button onClick={handleSearch} > Go</Button>
        </Box>
        { loading ? (<ChatLoading/>) :(
          searchResult?.map((user)=>{
            return(
            <UserListItem
            user={user}
             key={user._id}
             handleFunction={()=> accessChat(user._id)}
            />)
          })
        )}
        { loadingChat && <Spinner ml="auto" display='flex'/>}
      </DrawerBody>
      </DrawerContent>

     
    </Drawer>
   </>
  )
}



export default SideDrawer
