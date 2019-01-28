import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// TODO: remove unneeded imports
import Map from 'ol/map';
import View from 'ol/view';
import Tile from 'ol/layer/tile';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/tilewms';
import Image from 'ol/layer/image';
import ImageWMS from 'ol/source/imagewms';
import GeoJSON from 'ol/format/GeoJSON';
import proj from 'ol/proj';
import Style from 'ol/style/style';
import Icon from 'ol/style/icon';
import Select from 'ol/interaction/select';
import condition from 'ol/events/condition';
import OverviewMap from 'ol/control/OverviewMap';
import ImageLayer from 'ol/layer/image';
import DragZoom from 'ol/interaction/dragzoom';

import { MapService } from '../map.service';
import { ILayerConfig } from '../models/layer-config.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  map: Map;
  private zoomExtentSubscription: Subscription;

  mapExtent = proj.transformExtent([-4, 50, 1, 60], 'EPSG:4326', 'EPSG:3857');

  constructor(private mapService: MapService) {
  }

  ngOnInit() {
    this.mapService.mapConfig.subscribe((data) => {
      if (data.mapInstances.length) {
        this.updateLayers(data.mapInstances[0].layers);
      }
    });

    this.setupMap();
  }

  private updateLayers(layersConfig: ILayerConfig[]): void {
    layersConfig.forEach( (layerConfig) => {
      this.map.addLayer(layerConfig.layer);
    });
    // console.log(this.map.getLayers());
  }

  private setupMap() {
    const view = new View({
      center: proj.fromLonLat([0, 50]),
      zoom: 4,
      maxZoom: 17,
      minZoom: 3
  });

  const baseLayer = new Tile({
    source: new OSM()
  });

    this.map = new Map({
      target: 'map',
      controls: [],
      layers: [
        baseLayer
      ],
      view: view
    });
    this.map.getView().fit(this.mapExtent);

    this.map.addInteraction(new DragZoom());

    this.mapService.mapReady(this.map);

    this.map.on('click', () => {
      this.mapService.getFeatureInfo();
    });

    this.zoomExtentSubscription = this.mapService.zoomExtent.subscribe(() =>
      this.map.getView().fit(this.mapExtent)
    );
  }

  ngOnDestroy() {
    if (this.zoomExtentSubscription) {
      this.zoomExtentSubscription.unsubscribe();
    }
  }
}
