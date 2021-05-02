import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { useSwipeable } from 'react-swipeable'
import {
  Box, Button, Icon, Stack, Flex, Drawer,
  DrawerOverlay, DrawerHeader, DrawerBody, DrawerFooter,
  DrawerContent, DrawerCloseButton, useDisclosure,
} from '@chakra-ui/react'
import { BiCollection, BiDockLeft } from 'react-icons/bi'
import { EpubView } from '..'
import defaultStyles from './style'

const Swipeable = ({children, ...props}) => {
  const handlers = useSwipeable(props)
  return (<div { ...handlers }>{children}</div>)
}

const TocItem = ({
  label, setLocation, href, ...props
}) => (
  <Button
    onClick={() => setLocation(href)}
    {...props}
  >
    {label}
  </Button>
)

class ReactReader extends PureComponent {
  constructor(props) {
    super(props)
    this.readerRef = React.createRef()
    this.state = {
      expandedToc: false,
      toc: false,
    }
  }

  toggleToc = () => {
    this.setState({
      expandedToc: !this.state.expandedToc
    })
  }

  next = () => {
    const node = this.readerRef.current
    node?.nextPage?.()
  }

  prev = () => {
    const node = this.readerRef.current
    node?.prevPage?.()
  }

  onTocChange = (toc) => {
    const { tocChanged } = this.props
    this.setState(
      {
        toc: toc
      },
      () => tocChanged && tocChanged(toc)
    )
  }

  renderToc() {
    const { toc, expandedToc } = this.state
    //const { isOpen, onOpen, onClose } = useDisclosure()

    return (
      <Drawer
        isOpen={expandedToc}
        placement="left"
        //onClose={onClose}
        //finalFocusRef={btnRef}
      >
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Table of Contents</DrawerHeader>

            <DrawerBody>
              {toc.map((item) => (
                ((() => {
                return [item, ...item.subitems].map((child, i) => (
                  <TocItem
                    key={i} {...child}
                    justify="flex-start"
                    fontSize={20} fontWeight="normal"
                    setLocation={this.setLocation}
                  />
                ))
                })())
              ))}
            </DrawerBody>

            <DrawerFooter>
              <Button variant="outline" mr={3} onClick={null/*onClose*/}>
                Cancel
              </Button>
              <Button colorScheme="blue">Save</Button>
            </DrawerFooter>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    )
  }

  setLocation = (loc) => {
    const { locationChanged } = this.props
    this.setState(
      { expandedToc: false },
      () => locationChanged && locationChanged(loc)
    )
  }

  renderTocToggle() {
    const { expandedToc } = this.state
    return (
      <Button onClick={this.toggleToc}>
        <Icon as={expandedToc ? BiDockLeft : BiCollection}/>
      </Button>
    )
  }

  render() {
    const {
      title,
      showToc,
      loadingView,
      styles,
      locationChanged,
      swipeable,
      epubViewStyles,
      ...props
    } = this.props
    const { toc, expandedToc } = this.state
    return (
      <Flex h="100%">
        {showToc && toc && this.renderToc()}
        <Flex
          position="relative"
          zIndex={1}
          height="100%" width="100%"
          backgroundColor="#FFF"
          transition="all .3s ease"
        >
          {showToc && this.renderTocToggle()}
          <Box
            position="absolute"
            top={1} left="50vw"
            transform="translateX(-50%)"
            textAlign="center"
            color="#999"
          >{title}</Box>
          <Swipeable
            onSwipedRight={this.prev}
            onSwipedLeft={this.next}
            trackMouse
          >
            <div style={styles.reader}>
              <EpubView
                ref={this.readerRef}
                loadingView={loadingView}
                styles={epubViewStyles}
                {...props}
                tocChanged={this.onTocChange}
                locationChanged={locationChanged}
              />
              {swipeable && <div style={styles.swipeWrapper} />}
            </div>
          </Swipeable>
          <button
            style={Object.assign({}, styles.arrow, styles.prev)}
            onClick={this.prev}
          >
            ‹
          </button>
          <button
            style={Object.assign({}, styles.arrow, styles.next)}
            onClick={this.next}
          >
            ›
          </button>
        </Flex>
      </Flex>
    )
  }
}

ReactReader.defaultProps = {
  loadingView: <div style={defaultStyles.loadingView}>Loading…</div>,
  locationChanged: null,
  tocChanged: null,
  showToc: true,
  styles: defaultStyles
}

ReactReader.propTypes = {
  title: PropTypes.string,
  loadingView: PropTypes.element,
  showToc: PropTypes.bool,
  locationChanged: PropTypes.func,
  tocChanged: PropTypes.func,
  styles: PropTypes.object,
  epubViewStyles: PropTypes.object,
  swipeable: PropTypes.bool
}

export default ReactReader
