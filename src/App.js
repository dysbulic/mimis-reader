import React, { Component } from 'react'
import FileReaderInput from 'react-file-reader-input'
import { ReactReader } from './modules'
import {
  Container,
  ReaderContainer,
  Bar,
  LogoWrapper,
  Logo,
  GenericButton,
  CloseIcon,
  FontSizeButton,
  ButtonWrapper
} from './Components'

const storage = global.localStorage || null

const DEMO_URL = '/react-reader/RLT/opf.opf'
const DEMO_NAME = 'M. Scott Peck – The Road Less Traveled'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fullscreen: false,
      location: storage?.getItem('epub-location') ?? 2,
      localFile: null,
      localName: null,
      largeText: false,
    }
    this.rendition = null
  }

  toggleFullscreen = () => {
    this.setState(
      {
        fullscreen: !this.state.fullscreen
      },
      () => {
        setTimeout(() => {
          const evt = document.createEvent('UIEvents')
          evt.initUIEvent('resize', true, false, global, 0)
        }, 1000)
      }
    )
  }

  onLocationChanged = (location) => {
    this.setState(
      {
        location
      },
      () => {
        storage && storage.setItem('epub-location', location)
      }
    )
  }

  onToggleFontSize = () => {
    const nextState = !this.state.largeText
    this.setState(
      {
        largeText: nextState
      },
      () => {
        this.rendition.themes.fontSize(nextState ? '140%' : '100%')
      }
    )
  }

  getRendition = (rendition) => {
    console.log('getRendition callback', rendition)
    // Set inital font-size, and add a pointer to rendition for later updates
    const { largeText } = this.state
    this.rendition = rendition
    rendition.themes.fontSize(largeText ? '140%' : '100%')
  }

  handleChangeFile = (event, results) => {
    if (results.length > 0) {
      const [e, file] = results[0]
      if (file.type !== 'application/epub+zip') {
        return alert('Unsupported type')
      }
      this.setState({
        localFile: e.target.result,
        localName: file.name,
        location: null
      })
    }
  }

  render() {
    const {
      fullscreen, location, localFile, localName
    } = this.state
    return (
      <Container>
        <Bar>
          <LogoWrapper href="https://github.com/gerhardsletten/react-reader">
            <Logo
              src="https://gerhardsletten.github.io/react-reader/files/react-reader.svg"
              alt="React-reader - powered by epubjs"
            />
          </LogoWrapper>
          <ButtonWrapper>
            <FileReaderInput as="buffer" onChange={this.handleChangeFile}>
              <GenericButton>Upload local epub</GenericButton>
            </FileReaderInput>
            <GenericButton onClick={this.toggleFullscreen}>
              Use full browser window
              <CloseIcon />
            </GenericButton>
          </ButtonWrapper>
        </Bar>
        <ReaderContainer fullscreen={fullscreen}>
          <ReactReader
            url={localFile || DEMO_URL}
            title={localName || DEMO_NAME}
            location={location}
            locationChanged={this.onLocationChanged}
            getRendition={this.getRendition}
          />
          <FontSizeButton onClick={this.onToggleFontSize}>
            Toggle font-size
          </FontSizeButton>
        </ReaderContainer>
      </Container>
    )
  }
}