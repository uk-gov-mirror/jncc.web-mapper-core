import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable, Subscription } from 'rxjs';
import { moveItemInArray } from '@angular/cdk/drag-drop';

import { ApiService } from './api.service';
import { IMapConfig } from './models/map-config.model';

// TODO: move to another service
import { ILayerConfig } from './models/layer-config.model';
import { ILayerGroupConfig } from './models/layer-group-config';
import { ISubLayerGroupConfig } from './models/sub-layer-group-config';
import { FeatureInfosComponent } from './feature-infos/feature-infos.component';
import WMSCapabilities from 'ol/format/wmscapabilities';
import { IFilterConfig } from './models/filter-config.model';
import { ILookup } from './models/lookup.model';
import { LayerService } from './layer.service';
import { PermalinkService } from './permalink.service';
import { IBaseLayerConfig } from './models/base-layer-config.model';
import { IActiveFilter } from './models/active-filter.model';


@Injectable({
  providedIn: 'root'
})
export class MapService implements OnDestroy {

  map: any;

  dragZoomInSubject = new Subject<void>();
  dragZoomOutSubject = new Subject<void>();
  zoomSubject = new Subject<{ center: number[], zoom: number }>();
  zoomToExtentSubject = new Subject<number[]>();

  showLegendSubject = new Subject<{ name: string, legendUrl: string }>();

  private dataStore: {
    mapConfig: IMapConfig;
    layerLookup: ILayerConfig[];
    visibleLayers: ILayerConfig[];
    baseLayers: IBaseLayerConfig[];
    featureInfos: any[];
    filterLookups: { [lookupCategory: string]: ILookup[]; };
    activeFilters: IActiveFilter[];
  };

  private _mapConfig: BehaviorSubject<IMapConfig>;
  get mapConfig() {
    return this._mapConfig.asObservable();
  }

  private _visibleLayers: BehaviorSubject<ILayerConfig[]>;
  get visibleLayers() {
    return this._visibleLayers.asObservable();
  }

  private _featureInfos: BehaviorSubject<any[]>;
  get featureInfos() {
    return this._featureInfos.asObservable();
  }
  private featureInfoSubscription: Subscription;

  private _filterLookups: BehaviorSubject<{ [lookupCategory: string]: ILookup[]; }>;
  get lookups() {
    return this._filterLookups.asObservable();
  }

  private _baseLayers: BehaviorSubject<IBaseLayerConfig[]>;
  get baseLayers() {
    return this._baseLayers.asObservable();
  }

  private _activeFilters: BehaviorSubject<IActiveFilter[]>;
  get activeFilters() {
    return this._activeFilters.asObservable();
  }

  constructor(private apiService: ApiService, private layerService: LayerService, private permalinkService: PermalinkService) {
    this.dataStore = {
      mapConfig: {
        mapInstances: [],
        mapInstance: {
          name: '',
          description: '',
          layerGroups: [],
          center: [],
          zoom: 0
        }
      },
      layerLookup: [],
      visibleLayers: [],
      baseLayers: [],
      featureInfos: [],
      filterLookups: {},
      activeFilters: []
    };
    this._mapConfig = <BehaviorSubject<IMapConfig>>new BehaviorSubject(this.dataStore.mapConfig);
    this._visibleLayers = <BehaviorSubject<ILayerConfig[]>>new BehaviorSubject(this.dataStore.visibleLayers);
    this._featureInfos = <BehaviorSubject<any[]>>new BehaviorSubject(this.dataStore.featureInfos);
    this._filterLookups = new BehaviorSubject({});
    this._baseLayers = new BehaviorSubject(this.dataStore.baseLayers);
    this._activeFilters = new BehaviorSubject(this.dataStore.activeFilters);
    this.subscribeToConfig();

    this.subscribeToMapInstanceConfig();
  }

  private subscribeToConfig() {
    this.apiService.getConfig().subscribe((data) => {
      this.dataStore.mapConfig.mapInstances = data;
      this._mapConfig.next(this.dataStore.mapConfig);
    }, error => console.log('Could not load map config.'));
  }

  private subscribeToMapInstanceConfig() {
    this.apiService.getMapInstanceConfig().subscribe((data) => {
      this.dataStore.mapConfig.mapInstance = data;
      console.log(this.dataStore.mapConfig.mapInstance);
      this.createMapInstanceConfig();
      // TODO: move to another service
      this.createLayersForConfig();
      this.createBaseLayers();
      this._mapConfig.next(this.dataStore.mapConfig);
      // console.log(this.dataStore.mapConfig);

      this.createFilterLookups();

      this.zoomToMapExtent();
    }, error => console.log('Could not load map instance config.'));
  }

  // transform map instance config received from api into hierarchy of layergroups, sublayergroups, layers
  private createMapInstanceConfig() {
    this.dataStore.mapConfig.mapInstance.layerGroups.forEach((layerGroupConfig: ILayerGroupConfig) => {
      const subLayerGroups: ISubLayerGroupConfig[] = layerGroupConfig.layers.
        map((layer) => layer.subLayerGroup).
        reduce((a: ISubLayerGroupConfig[], subLayerGroup, index) => {
          if (!a.find((slg) => subLayerGroup === slg.name)) {
            a.push({ name: subLayerGroup, layers: [], sublayerGroupId: index });
          }
          return a;
        }, []);
      layerGroupConfig.layers.forEach((layerConfig) => {
        const subLayerGroup = subLayerGroups.find((slg) => slg.name === layerConfig.subLayerGroup);
        subLayerGroup.layers.push(layerConfig);
      });
      layerGroupConfig.subLayerGroups = subLayerGroups;
    });
  }

  // TODO: move to another service
  private createLayersForConfig(): void {
    this.dataStore.mapConfig.mapInstance.layerGroups.forEach((layerGroupConfig) => {
      if (layerGroupConfig.layers.length) {
        layerGroupConfig.layers.forEach((layerConfig: ILayerConfig) => {
          // TODO: styles - this is just exploring styles in getcapabilities
          // const layerName = layerConfig.layerName;
          // const legendLayerName = layerConfig.legendLayerName;
          // this.getStyles(layerName, legendLayerName, layerConfig.url);
          layerConfig.layer = this.layerService.createLayer(layerConfig);
          layerConfig.layer.setOpacity(layerConfig.opacity);
          layerConfig.layer.setVisible(layerConfig.visible);

          if (layerConfig.visible) {
            this.dataStore.visibleLayers = [layerConfig, ...this.dataStore.visibleLayers];
          }
          this.dataStore.layerLookup.push(layerConfig);
        });
      }
    });
    this._visibleLayers.next(this.dataStore.visibleLayers);
  }

  private createBaseLayers(): void {
    this.dataStore.baseLayers = this.layerService.createBaseLayers();
    this._baseLayers.next(this.dataStore.baseLayers);
  }

  private createFilterLookups() {
    const filterLookups = this.dataStore.filterLookups;
    this.dataStore.layerLookup.forEach(layerConfig => {
      layerConfig.filters.forEach(filterConfig => {
        if (!Object.keys(filterLookups).includes(filterConfig.lookupCategory)) {
          filterLookups[filterConfig.lookupCategory] = [];
          this.apiService.getLookup(filterConfig.lookupCategory).subscribe( (data: ILookup[]) => {
            filterLookups[filterConfig.lookupCategory] = data;
            this._filterLookups.next(filterLookups);
          });
        }
      });
    });
  }

  filterLayer(layerId: number, paramName: string, filterString: string, activeFilters: IActiveFilter[]) {
    const layerConfig = this.getLayerConfig(layerId);
    const source = layerConfig.layer.getSource();
    const params = layerConfig.layer.getSource().getParams();
    params[paramName] = filterString;
    // console.log(paramName + ': ' + filterString);
    source.updateParams(params);

    this.dataStore.activeFilters = this.dataStore.activeFilters.filter(f => f.layerId !== layerId);
    this.dataStore.activeFilters = [...this.dataStore.activeFilters, ...activeFilters];
    this._activeFilters.next(this.dataStore.activeFilters);
  }

  clearFilterLayer(layerId: number, paramName: string) {
    const layerConfig = this.getLayerConfig(layerId);
    const source = layerConfig.layer.getSource();
    const params = layerConfig.layer.getSource().getParams();
    delete params[paramName];
    source.updateParams(params);

    this.dataStore.activeFilters = this.dataStore.activeFilters.filter(f => f.layerId !== layerId);
    this._activeFilters.next(this.dataStore.activeFilters);
  }

  private getStyles(layerName, legendLayerName, url) {
    const capabilitiesUrl = url + '?REQUEST=GetCapabilities&VERSION=1.3.0';
    this.apiService.getCapabilities(capabilitiesUrl).subscribe(data => {
      const parser = new WMSCapabilities();
      const result = parser.read(data);
      console.log(layerName);
      const layer = result.Capability.Layer.Layer.find(l => l.Name === layerName);
      if (layer.hasOwnProperty('Layer')) {
        console.log('I\'m a group layer');
        if (layer.Layer) {
          console.log(legendLayerName);
          console.log(layer.Layer);
          const layer2 = layer.Layer.find(l => l.Name === 'emodnet:' + legendLayerName);
          if (layer2.Style) {
            console.log(layer2.Style);
          }
          // console.log(layer2);
        }
      } else {
        console.log('I\'m just a layer');
      }
      // console.log(result.Capability.Layer.Layer.find(l => l.Name === layerName));
    });
  }

  mapReady(map: any) {
    this.map = map;
  }

  zoomIn() {
    this.map.getView().setZoom(this.map.getView().getZoom() + 1);
  }

  zoomOut() {
    this.map.getView().setZoom(this.map.getView().getZoom() - 1);
  }

  zoomToMapExtent() {
    const center = this.dataStore.mapConfig.mapInstance.center;
    const zoom = this.dataStore.mapConfig.mapInstance.zoom;
    this.zoomSubject.next({ center: center, zoom: zoom });
  }

  zoomToLayerExtent(layerId: number) {
    const layerConfig = this.getLayerConfig(layerId);
    this.zoomSubject.next({ center: layerConfig.center, zoom: layerConfig.zoom });
  }

  zoomToExtent(extent: number[]) {
    this.zoomToExtentSubject.next(extent);
  }

  dragZoomIn() {
    console.log("drag zoom in")
    this.dragZoomInSubject.next();
  }

  dragZoomOut() {
    console.log("drag zoom out")
    this.dragZoomOutSubject.next();
  }

  showFeatureInfo(urls: string[]) {
    if (this.featureInfoSubscription) {
      this.featureInfoSubscription.unsubscribe();
    }
    this.featureInfoSubscription = this.apiService.getFeatureInfoForUrls(urls).subscribe(data => {
      this.dataStore.featureInfos = data;
      this._featureInfos.next(this.dataStore.featureInfos);
    });
  }

  clearFeatureInfo() {
    this.dataStore.featureInfos = [];
    this._featureInfos.next(this.dataStore.featureInfos);
  }

  changeLayerVisibility(layerId: number, visible: boolean) {
    const layerConfig = this.getLayerConfig(layerId);
    layerConfig.layer.setVisible(visible);
    layerConfig.visible = visible;

    if (visible) {
      if (!this.dataStore.visibleLayers.some(visibleLayerConfig => visibleLayerConfig.layerId == layerId)) {
        this.dataStore.visibleLayers = [layerConfig, ...this.dataStore.visibleLayers];
      }
    } else {
      this.dataStore.visibleLayers = this.dataStore.visibleLayers.filter(visibleLayerConfig => visibleLayerConfig !== layerConfig);

      this.dataStore.activeFilters = this.dataStore.activeFilters.filter(f => f.layerId !== layerId);
      this._activeFilters.next(this.dataStore.activeFilters);
    }
    this._visibleLayers.next(this.dataStore.visibleLayers);
    this._mapConfig.next(this.dataStore.mapConfig);
  }

  changeLayerOpacity(layerId: number, opacity: number) {
    const layerConfig = this.getLayerConfig(layerId);
    layerConfig.layer.setOpacity(opacity);
    layerConfig.opacity = opacity;
  }

  reorderVisibleLayers(previousIndex: number, currentIndex: number) {
    moveItemInArray(this.dataStore.visibleLayers, previousIndex, currentIndex);
    this._visibleLayers.next(this.dataStore.visibleLayers);
  }

  ngOnDestroy() {
    if (this.featureInfoSubscription) {
      this.featureInfoSubscription.unsubscribe();
    }
  }

  showLegend(layerId: number) {
    const layerConfig = this.getLayerConfig(layerId);
    const legendLayerName = layerConfig.legendLayerName ? layerConfig.legendLayerName : layerConfig.layerName;
    const url = layerConfig.url +
      '?REQUEST=GetLegendGraphic&VERSION=1.3.0&FORMAT=image/png&WIDTH=20&HEIGHT=20' +
      '&LEGEND_OPTIONS=fontAntiAliasing:true;fontColor:0x5A5A5A' +
      '&LAYER=' + legendLayerName;

    this.showLegendSubject.next({ name: layerConfig.name, legendUrl: url });
  }

  hideLegend() {
    this.showLegendSubject.next(null);
  }

  private getLayerConfig(layerId: number): ILayerConfig {
    return this.dataStore.layerLookup.find((layerConfig) => layerConfig.layerId === layerId);
  }

  setBaseLayer(baseLayerId: number) {
    this.dataStore.baseLayers.forEach(baseLayer => {
      if (baseLayer.baseLayerId === baseLayerId) {
        baseLayer.layer.setVisible(true);
      } else {
        baseLayer.layer.setVisible(false);
      }
    });
  }

  onMapMoveEnd(zoom: number, center: number[]) {
    const layerIds = this.dataStore.visibleLayers.map(layer => layer.layerId);
    const baseLayerId = this.dataStore.baseLayers.find(baseLayer => baseLayer.layer.getVisible()).baseLayerId;
    this.permalinkService.updateUrl(zoom, center, layerIds, baseLayerId);
  }
}
