using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
namespace MapConfig.Models
{
    public class MapInstance
    {
        [Key]
        public long MapId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public ICollection<LayerGroup> LayerGroups { get; set; }
    }

    public class LayerGroup
    {
        [Key]
        public long LayerGroupId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        //public MapInstance MapId { get; set; }
        public ICollection<Layer> Layers { get; set; }
    }

    public class Layer {
        [Key]
        public long LayerId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public long Order { get; set; }
        public string Type { get; set; }
        public string Src { get; set; }
        public Boolean Visible { get; set; }
        public Byte Opacity { get; set; }
        public string FilterDefinition { get; set; }

        //public LayerGroup LayerGroupId { get; set; }
        public ICollection<Filter> Filters { get; set; }     
    }

    public class Filter {
        [Key]
        public long FilterId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Type { get; set; } //can be one of 'Lookup' (as in select box),'LookupMulti' (multi select box),'Date','Boolean','text'
        public string Property { get; set; } // name of the property to lookup
        public string LookupSrc { get; set; } //url of lookup endpoint

        //public Layer LayerId { get; set; } 
    }
}