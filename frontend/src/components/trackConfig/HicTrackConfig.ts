import { TrackConfig } from './TrackConfig';

import InteractionTrack, { DEFAULT_OPTIONS } from '../trackVis/interactionTrack/InteractionTrack';

import { HicSource } from '../../dataSources/HicSource';
import { TrackModel, TrackOptions } from '../../model/TrackModel';
import { BinSize, NormalizationMode } from 'src/model/HicDataModes';

import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import { InteractionDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import ScoreConfig from '../trackContextMenu/ScoreConfig';
import { BinSizeConfig, HicNormalizationConfig } from '../trackContextMenu/HicDataConfig';

export class HicTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions({
            ...DEFAULT_OPTIONS,
            binSize: BinSize.AUTO,
            normalization: NormalizationMode.NONE
        });
    }

    initDataSource() {
        if(this.trackModel.fileObj) {
            return new HicSource(this.trackModel.fileObj);
        } else {
            return new HicSource(this.trackModel.url);
        }
    }

    /**
     * @override
     */
    shouldFetchBecauseOptionChange(oldOptions: TrackOptions, newOptions: TrackOptions): boolean {
        return oldOptions.normalization !== newOptions.normalization || oldOptions.binSize !== newOptions.binSize;
    }

    getComponent() {
        return InteractionTrack;
    }

    getMenuComponents() {
        return [HicNormalizationConfig, InteractionDisplayModeConfig, ScoreConfig, BinSizeConfig,
            PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig];
    }
}
