import { ILayerConfig } from './layer-config.model';
import { ISubLayerGroupConfig } from './sub-layer-group-config';

export interface ILayerGroupConfig {
        layerGroupId: number;
        name: string;
        layers: ILayerConfig[];
        subLayerGroups: ISubLayerGroupConfig[];
}
