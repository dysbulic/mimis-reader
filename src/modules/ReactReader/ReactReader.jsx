import React, { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import {
  Box, Button, Icon, Stack, Flex, Drawer,
  DrawerOverlay, DrawerHeader, DrawerBody, DrawerFooter,
  DrawerContent, DrawerCloseButton, useDisclosure,
} from '@chakra-ui/react'
import { BiCollection, BiDockLeft } from 'react-icons/bi'
import { EpubView } from '..'

const Swipeable = ({children, ...props}) => {
  const handlers = useSwipeable(props)
  return (<Box {...handlers}>{children}</Box>)
}

const ToCItem = ({
  label, setLocation, href, ...props
}) => (
  <Button
    onClick={() => setLocation(href)}
    {...props}
  >
    {label}
  </Button>
)

const ReactReader = ({
  title, showToC, loadingView, locationChanged,
  swipeable, ...props

}) => {
  const readerRef = React.createRef()
  const [toc, setToC] = useState()
  const {
    isOpen, onOpen, onClose, onToggle,
  } = useDisclosure()
  const next = () => {
    readerRef.current?.nextPage?.()
  }
  const prev = () => {
    readerRef.current?.prevPage?.()
  }
  const onToCChange = ({ toc }) => (
    setToC(toc)
  )
  const setLocation = ({ location }) => (
    onClose()
    //locationChanged(location)
  )
  const ToCToggle = () => (
    <Button position="absolute" left={25} onClick={onToggle}>
      <Icon as={isOpen ? BiDockLeft : BiCollection}/>
    </Button>
  )
  const btnRef = React.useRef()
  const ToC = ({
    toc, setLocation, isOpen, onClose,
  }) => (
    <Drawer
      {...{ isOpen, onClose }}
      placement="left"
      finalFocusRef={btnRef}
    >
      <DrawerOverlay>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Table of Contents</DrawerHeader>

          <DrawerBody><Stack>
            {toc.map((item) => (
              ((() => {
              return [item, ...item.subitems].map((child, i) => (
                <ToCItem
                  key={i} {...child}
                  justify="flex-start"
                  fontSize={20} fontWeight="normal"
                  {...{ setLocation }}
                />
              ))
              })())
            ))}
          </Stack></DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  )

  return (
    <Flex h="100%">
      {showToC && toc && <ToC/>}
      <Flex
        height="100%" width="100%"
        backgroundColor="#FFF"
      >
        {showToC && <ToCToggle/>}
        <Box
          position="absolute"
          top={1} left="50vw"
          transform="translateX(-50%)"
          textAlign="center"
          color="#999"
        >{title}</Box>
        {/* <Swipeable
          onSwipedRight={prev}
          onSwipedLeft={next}
          trackMouse
          id="swipeable"
          style={{ width: '100%' }}
        > */}
          <EpubView
            ref={readerRef}
            {...props}
            tocChanged={onToCChange}
            {...{ locationChanged, loadingView }}
          />
          {/* {swipeable && (
            <Flex
              position="absolute"
              top={0} left={0} bottom={0} right={0}
              zIndex={200}
            />
          )} */}
        {/* </Swipeable> */}
        <Button
          position="absolute" left={0} top="5vh"
          h="80%" fontSize={100} opacity={0.75} onClick={prev}
        >‹</Button>
        <Button
          position="absolute" right={0} top="5vh"
          h="80%" fontSize={100} opacity={0.75} onClick={next}
        >›</Button>
      </Flex>
    </Flex>
  )
}

export default ReactReader
