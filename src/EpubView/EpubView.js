import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Epub from '@gerhardsletten/epubjs/lib/index.js'
import defaultStyles from './style'

global.ePub = Epub // Fix for v3 branch of epub.js -> needs ePub to by a global var

class EpubView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isLoaded: false,
      toc: []
    }
    this.book = this.rendition = this.prevPage = this.nextPage = null
  }

  componentDidMount () {
    const {url, tocChanged} = this.props
    this.book = new Epub(url)
    this.book.loaded.navigation.then(({toc}) => {
      this.setState({
        isLoaded: true,
        toc: toc
      }, () => {
        tocChanged && tocChanged(toc)
        this.initReader()
      })
    })
    document.addEventListener('keydown', this.handleKeyPress, false)
  }

  componentWillUnmount () {
    this.book = this.rendition = this.prevPage = this.nextPage = null
    document.removeEventListener('keydown', this.handleKeyPress, false)
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !this.state.isLoaded || nextProps.location !== this.state.location
  }

  initReader () {
    const {viewer} = this.refs
    const {toc} = this.state
    const {location, locationChanged, epubOptions, getRendition} = this.props
    this.rendition = this.book.renderTo(viewer, {
      contained: true,
      width: '100%',
      height: '100%',
      ...epubOptions
    })
    this.rendition.display(location === undefined ? toc[0].href : location)

    this.prevPage = () => {
      this.rendition.prev()
    }
    this.nextPage = () => {
      this.rendition.next()
    }
    this.rendition.on('locationChanged', (loc) => {
      loc && loc.start && locationChanged && locationChanged(loc.start)
    })
    getRendition && getRendition(this.rendition)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.location !== this.props.location) {
      this.rendition.display(this.props.location)
    }
  }

  renderBook () {
    const {styles} = this.props
    return (
      <div ref='viewer' style={styles.view} />
    )
  }

  handleKeyPress = ({key}) => {
    key && key === 'ArrowRight' && this.nextPage()
    key && key === 'ArrowLeft' && this.prevPage()
  }

  render () {
    const {isLoaded} = this.state
    const {loadingView, styles} = this.props
    return (
      <div style={styles.viewHolder}>
        {(isLoaded && this.renderBook()) || loadingView}
      </div>
    )
  }
}

EpubView.defaultProps = {
  loadingView: null,
  locationChanged: null,
  tocChanged: null,
  styles: defaultStyles,
  epubOptions: {}
}

EpubView.propTypes = {
  url: PropTypes.string,
  loadingView: PropTypes.element,
  location: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  locationChanged: PropTypes.func,
  tocChanged: PropTypes.func,
  styles: PropTypes.object,
  epubOptions: PropTypes.object,
  getRendition: PropTypes.func
}

export default EpubView
