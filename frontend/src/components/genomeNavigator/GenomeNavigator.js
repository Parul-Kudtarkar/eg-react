import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSearchMinus, faSearchPlus } from '@fortawesome/fontawesome-free-solid';
import { MIN_VIEW_REGION_SIZE } from '../../AppState';

import MainPane from './MainPane';
import TrackRegionController from './TrackRegionController';
import GeneSearchBox from './GeneSearchBox';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import eglogo from '../../images/eglogo.jpg';

/**
 * A navigator that allows users to scroll around the genome and select what region for tracks to display.
 * 
 * @author Silas Hsu
 */
class GenomeNavigator extends React.Component {
    static propTypes = {
        /**
         * The region that the tracks are displaying.
         */
        selectedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,

        /**
         * Called when the user selects a new region to display.  Has the signature
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the selected interval
         *         `newEnd`: the absolute base number of the end of the selected interval
         */
        onRegionSelected: PropTypes.func
    };

    static defaultProps = {
        onRegionSelected: () => undefined
    };

    /**
     * Binds functions, and also forks that view region that was passed via props.
     */
    constructor(props) {
        super(props);
        this.state = {
            viewRegion: new DisplayedRegionModel(this.props.selectedRegion.getNavigationContext())
        };

        this.zoom = this.zoom.bind(this);
        this.setNewView = this.setNewView.bind(this);
        this.zoomSliderDragged = this.zoomSliderDragged.bind(this);
    }

    /**
     * Resets the view region if a new one is received.
     * 
     * @param {any} nextProps - new props that this component will receive
     * @override
     */
    componentWillReceiveProps(nextProps) {
        const thisNavContext = this.state.viewRegion.getNavigationContext();
        const nextNavContext = nextProps.selectedRegion.getNavigationContext();
        if (thisNavContext !== nextNavContext) {
            this.setState({viewRegion: new DisplayedRegionModel(nextNavContext)});
        }
    }

    /**
     * Copies this.state.viewRegion, mutates it by calling `methodName` with `args`, and then calls this.setState().
     * 
     * @param {string} methodName - the method to call on the model
     * @param {any[]} args - arguments to provide to the method
     */
    _setModelState(methodName, args) {
        let regionCopy = this.state.viewRegion.clone();
        regionCopy[methodName].apply(regionCopy, args);
        if (regionCopy.getWidth() < MIN_VIEW_REGION_SIZE) {
            return;
        }
        this.setState({viewRegion: regionCopy});
    }

    /**
     * Wrapper for calling zoom() on the view model.
     * 
     * @param {number} amount - amount to zoom
     * @param {number} [focusPoint] - focal point of the zoom
     * @see DisplayedRegionModel#zoom
     */
    zoom(amount, focusPoint) {
        this._setModelState("zoom", [amount, focusPoint]);
    }

    /**
     * Wrapper for calling setRegion() on the view model
     * 
     * @param {number} newStart - start absolute base number
     * @param {number} newEnd - end absolute base number
     * @see DisplayedRegionModel#setRegion
     */
    setNewView(newStart, newEnd) {
        this._setModelState("setRegion", [newStart, newEnd]);
    }

    /**
     * Zooms the view to the right level when the zoom slider is dragged.
     * 
     * @param {React.SyntheticEvent} event - the event that react fired when the zoom slider was changed
     */
    zoomSliderDragged(event) {
        let targetRegionSize = Math.exp(event.target.value);
        let proportion = targetRegionSize / this.state.viewRegion.getWidth();
        this._setModelState("zoom", [proportion]);
    }

    /**
     * @inheritdoc
     */
    render() {
        return (
            <div className="container-fluid">
                <nav className="navbar">
                    <div className="row">
                        <div className="col-sm">
                            <img src={eglogo} width="400px" alt="eg logo"/>
                        </div>
                       
                        <div className="col-md">
                            <TrackRegionController
                                selectedRegion={this.props.selectedRegion}
                                onRegionSelected={this.props.onRegionSelected}
                            />
                        </div>
                        <div className="col-md">
                            <GeneSearchBox
                                navContext={this.props.selectedRegion.getNavigationContext()}
                                onRegionSelected={this.props.onRegionSelected}
                            />
                        </div>
                         <div className="col-sm">
                            <ZoomControls
                                viewRegion={this.state.viewRegion}
                                onSliderDragged={this.zoomSliderDragged}
                                onZoomIn={() => this.zoom(0.5)}
                                onZoomOut={() => this.zoom(2)}
                            />
                        </div>
                    </div>
                </nav>
                <MainPane
                    viewRegion={this.state.viewRegion}
                    selectedRegion={this.props.selectedRegion}
                    onRegionSelected={this.props.onRegionSelected}
                    onNewViewRequested={this.setNewView}
                    onZoom={this.zoom}
                />
            </div>
        );
    }
}

function ZoomControls(props) {
    return (
    <label>
        Zoom:
        <div className="btn-group"> 
            <button className="btn" onClick={props.onZoomIn} >
                <FontAwesomeIcon icon={faSearchPlus} />
            </button>
            <input
                type="range"
                min={Math.log(MIN_VIEW_REGION_SIZE)}
                max={Math.log(props.viewRegion.getNavigationContext().getTotalBases())}
                step="any"
                value={Math.log(props.viewRegion.getWidth())}
                onChange={props.onSliderDragged}
            />
            <button className="btn" onClick={props.onZoomOut} >
                <FontAwesomeIcon icon={faSearchMinus} />
            </button>
        </div>
    </label>
    );
}

export default GenomeNavigator;